package com.webapp.holidate.service.auth;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.dto.request.auth.*;
import com.webapp.holidate.dto.response.auth.LogoutResponse;
import com.webapp.holidate.dto.response.auth.TokenResponse;
import com.webapp.holidate.dto.response.auth.RegisterResponse;
import com.webapp.holidate.dto.response.auth.VerificationResponse;
import com.webapp.holidate.entity.InvalidToken;
import com.webapp.holidate.entity.Role;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.entity.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.UserMapper;
import com.webapp.holidate.repository.InvalidTokenRepository;
import com.webapp.holidate.repository.RoleRepository;
import com.webapp.holidate.repository.UserAuthInfoRepository;
import com.webapp.holidate.repository.UserRepository;
import com.webapp.holidate.type.AuthProviderType;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.RoleType;
import com.webapp.holidate.utils.DateTimeUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthService {
  UserRepository userRepository;
  UserAuthInfoRepository authInfoRepository;
  InvalidTokenRepository invalidTokenRepository;
  RoleRepository roleRepository;
  UserMapper mapper;
  PasswordEncoder passwordEncoder;

  @NonFinal
  @Value(AppValues.SECRET_KEY)
  String SECRET_KEY;

  @NonFinal
  @Value(AppValues.ISSUER)
  String ISSUER;

  @NonFinal
  @Value(AppValues.TOKEN_EXPIRATION_MILLIS)
  long tokenExpirationMillis;

  public RegisterResponse register(RegisterRequest request) {
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(request.getEmail()).orElse(null);

    if (authInfo != null && authInfo.isActive()) {
      throw new AppException(ErrorType.USER_EXISTS);
    }

    User user;
    if (authInfo != null) {
      user = authInfo.getUser();
      user.setFullName(request.getFullName());

      String encodedPassword = passwordEncoder.encode(request.getPassword());
      user.setPassword(encodedPassword);

      authInfo.setEmailVerificationAttempts(0);
      authInfo.setEmailVerificationOtp(null);
      authInfo.setEmailVerificationOtpExpirationTime(null);
      authInfo.setEmailVerificationOtpBlockedUntil(null);
      authInfo.setActive(false);
    } else {
      user = mapper.toEntity(request);
      String encodedPassword = passwordEncoder.encode(request.getPassword());
      user.setPassword(encodedPassword);

      Role role = roleRepository.findByName(RoleType.USER.name());
      user.setRole(role);

      UserAuthInfo newAuthInfo = UserAuthInfo.builder()
        .authProvider(AuthProviderType.LOCAL.getValue())
        .emailVerificationAttempts(0)
        .active(false)
        .user(user)
        .build();
      user.setAuthInfo(newAuthInfo);
    }

    userRepository.save(user);
    return mapper.toRegisterResponse(user);
  }

  public TokenResponse login(LoginRequest loginRequest) throws JOSEException {
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(loginRequest.getEmail())
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    User user = authInfo.getUser();

    String authProvider = authInfo.getAuthProvider();
    boolean localAuth = AuthProviderType.LOCAL.getValue().equals(authProvider);
    if (!localAuth) {
      throw new AppException(ErrorType.ONLY_LOCAL_AUTH);
    }

    boolean active = authInfo.isActive();
    if (!active) {
      throw new AppException(ErrorType.UNAUTHENTICATED);
    }

    String rawPassword = loginRequest.getPassword();
    String encodedPassword = user.getPassword();
    boolean passwordMatches = isPasswordMatches(rawPassword, encodedPassword);
    if (!passwordMatches) {
      throw new AppException(ErrorType.UNAUTHENTICATED);
    }

    String token = generateToken(user, tokenExpirationMillis);
    LocalDateTime expiresAt = DateTimeUtils.millisToLocalDateTime(tokenExpirationMillis);

    return TokenResponse.builder()
      .token(token)
      .expiresAt(expiresAt)
      .build();
  }

  public VerificationResponse verifyToken(VerifyTokenRequest verifyTokenRequest) throws JOSEException, ParseException {
    String token = verifyTokenRequest.getToken();
    SignedJWT signedJWT = SignedJWT.parse(token);

    String id = signedJWT.getJWTClaimsSet().getJWTID();
    boolean tokenInvalid = invalidTokenRepository.findById(id).isPresent();
    if (tokenInvalid) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
    boolean expired = isVerificationTokenExpired(expirationTime);
    if (expired) {
      throw new AppException(ErrorType.TOKEN_EXPIRED);
    }

    String issuer = signedJWT.getJWTClaimsSet().getIssuer();
    boolean issuerInvalid = !ISSUER.equals(issuer);
    if (issuerInvalid) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    JWSVerifier verifier = new MACVerifier(SECRET_KEY.getBytes());
    boolean tokenVerified = signedJWT.verify(verifier);
    if (!tokenVerified) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    return VerificationResponse.builder()
      .verified(true)
      .build();
  }

  public TokenResponse refreshToken(RefreshTokenRequest refreshTokenRequest) throws JOSEException, ParseException {
    String token = refreshTokenRequest.getToken();
    SignedJWT signedJWT = SignedJWT.parse(token);

    String id = signedJWT.getJWTClaimsSet().getJWTID();
    boolean tokenInvalid = invalidTokenRepository.findById(id).isPresent();
    if (tokenInvalid) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    String issuer = signedJWT.getJWTClaimsSet().getIssuer();
    boolean issuerInvalid = !ISSUER.equals(issuer);
    if (issuerInvalid) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    JWSVerifier verifier = new MACVerifier(SECRET_KEY.getBytes());
    boolean tokenVerified = signedJWT.verify(verifier);
    if (!tokenVerified) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    createInvalidToken(id, token);

    String email = signedJWT.getJWTClaimsSet().getSubject();
    User user = userRepository.findByEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    String newToken = generateToken(user, tokenExpirationMillis);
    LocalDateTime expiresAt = DateTimeUtils.millisToLocalDateTime(tokenExpirationMillis);

    return TokenResponse.builder()
      .token(newToken)
      .expiresAt(expiresAt)
      .build();
  }

  public LogoutResponse logout(LogoutRequest logoutRequest) throws JOSEException, ParseException {
    String token = logoutRequest.getToken();
    SignedJWT signedJWT = SignedJWT.parse(token);

    String id = signedJWT.getJWTClaimsSet().getJWTID();
    boolean tokenInvalid = invalidTokenRepository.findById(id).isPresent();
    if (tokenInvalid) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    String issuer = signedJWT.getJWTClaimsSet().getIssuer();
    boolean issuerInvalid = !ISSUER.equals(issuer);
    if (issuerInvalid) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    JWSVerifier verifier = new MACVerifier(SECRET_KEY.getBytes());
    boolean tokenVerified = signedJWT.verify(verifier);
    if (!tokenVerified) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    createInvalidToken(id, token);

    return LogoutResponse.builder()
      .success(true)
      .build();
  }

  private void createInvalidToken(String id, String token) {
    InvalidToken invalidToken = InvalidToken.builder()
      .id(id)
      .token(token)
      .build();
    invalidTokenRepository.save(invalidToken);
  }

  public String generateToken(User user, long expirationMillis) throws JOSEException {
    Date now = new Date();
    Date expirationTime = new Date(now.getTime() + expirationMillis);

    JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
    JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
      .jwtID(UUID.randomUUID().toString())
      .subject(user.getEmail())
      .claim("fullName", user.getFullName())
      .claim("scope", user.getRole().getName())
      .issuer(ISSUER)
      .issueTime(now)
      .expirationTime(expirationTime)
      .build();
    Payload payload = new Payload(claimsSet.toJSONObject());
    JWSObject jwsObject = new JWSObject(jwsHeader, payload);

    MACSigner signer = new MACSigner(SECRET_KEY);
    jwsObject.sign(signer);
    return jwsObject.serialize();
  }

  private boolean isPasswordMatches(String rawPassword, String encodedPassword) {
    return passwordEncoder.matches(rawPassword, encodedPassword);
  }

  private boolean isVerificationTokenExpired(Date expirationTime) {
    return expirationTime == null || expirationTime.before(new Date());
  }
}
