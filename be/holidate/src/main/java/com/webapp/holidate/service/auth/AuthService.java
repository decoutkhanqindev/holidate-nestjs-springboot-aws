package com.webapp.holidate.service.auth;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.webapp.holidate.config.security.filter.CustomAuthenticationToken;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.dto.request.auth.LoginRequest;
import com.webapp.holidate.dto.request.auth.RegisterRequest;
import com.webapp.holidate.dto.request.auth.TokenRequest;
import com.webapp.holidate.dto.request.auth.VerifyTokenRequest;
import com.webapp.holidate.dto.response.auth.*;
import com.webapp.holidate.dto.response.user.RoleResponse;
import com.webapp.holidate.entity.InvalidToken;
import com.webapp.holidate.entity.Role;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.entity.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.RoleMapper;
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
  UserMapper userMapper;
  RoleMapper roleMapper;
  PasswordEncoder passwordEncoder;

  @NonFinal
  @Value(AppValues.JWT_SECRET_KEY)
  String SECRET_KEY;

  @NonFinal
  @Value(AppValues.JWT_ISSUER)
  String ISSUER;

  @NonFinal
  @Value(AppValues.JWT_ACCESS_TOKEN_EXPIRATION_MILLIS)
  long accessTokenExpirationMillis;

  @NonFinal
  @Value(AppValues.JWT_REFRESH_TOKEN_EXPIRATION_MILLIS)
  long refreshTokenExpirationMillis;

  public RegisterResponse register(RegisterRequest request) {
    String email = request.getEmail();
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(email).orElse(null);

    if (authInfo != null) {
      boolean active = authInfo.isActive();
      if (active) {
        throw new AppException(ErrorType.USER_EXISTS);
      }
    }

    User user;
    if (authInfo != null) {
      user = authInfo.getUser();
      user.setFullName(request.getFullName());

      String encodedPassword = passwordEncoder.encode(request.getPassword());
      user.setPassword(encodedPassword);

      authInfo.setEmailVerificationOtp(null);
      authInfo.setEmailVerificationAttempts(0);
      authInfo.setEmailVerificationOtpExpirationTime(null);
      authInfo.setEmailVerificationOtpBlockedUntil(null);
      authInfo.setRefreshToken(null);
      authInfo.setActive(false);
    } else {
      user = userMapper.toEntity(request);
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
    return userMapper.toRegisterResponse(user);
  }

  public TokenResponse login(LoginRequest loginRequest) throws JOSEException {
    String email = loginRequest.getEmail();
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    User user = authInfo.getUser();

    String authProvider = authInfo.getAuthProvider();
    boolean localAuth = AuthProviderType.LOCAL.getValue().equals(authProvider);
    if (!localAuth) {
      throw new AppException(ErrorType.UNAUTHORIZED);
    }

    boolean active = authInfo.isActive();
    if (!active) {
      throw new AppException(ErrorType.UNAUTHORIZED);
    }

    String rawPassword = loginRequest.getPassword();
    String encodedPassword = user.getPassword();
    boolean passwordMatches = isPasswordMatches(rawPassword, encodedPassword);
    if (!passwordMatches) {
      throw new AppException(ErrorType.UNAUTHORIZED);
    }

    String id = user.getId();
    String fullName = user.getFullName();
    Role roleEntity = user.getRole();
    RoleResponse roleResponse = roleMapper.toResponse(roleEntity);

    String accessToken = generateToken(user, accessTokenExpirationMillis);
    LocalDateTime expiresAt = DateTimeUtils.millisToLocalDateTime(accessTokenExpirationMillis);

    String refreshToken = generateToken(user, refreshTokenExpirationMillis);
    authInfo.setRefreshToken(refreshToken);
    authInfoRepository.save(authInfo);

    return TokenResponse.builder()
      .id(id)
      .email(email)
      .fullName(fullName)
      .role(roleResponse)
      .accessToken(accessToken)
      .expiresAt(expiresAt)
      .refreshToken(refreshToken)
      .build();
  }

  public VerificationResponse verifyToken(VerifyTokenRequest verifyTokenRequest) throws JOSEException, ParseException {
    String token = verifyTokenRequest.getToken();
    getSignedJWT(token);
    return VerificationResponse.builder()
      .verified(true)
      .build();
  }

  public TokenResponse refreshToken(TokenRequest tokenRequest) throws JOSEException, ParseException {
    String token = tokenRequest.getToken();
    SignedJWT signedJWT = getSignedJWT(token);
    String email = signedJWT.getJWTClaimsSet().getSubject();
    User user = userRepository.findByEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    UserAuthInfo authInfo = user.getAuthInfo();

    String storedRefreshToken = authInfo.getRefreshToken();
    boolean tokenMatches = token.equals(storedRefreshToken);
    if (!tokenMatches) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    String tokenId = signedJWT.getJWTClaimsSet().getJWTID();
    createInvalidToken(tokenId, token);

    String userId = user.getId();
    String fullName = user.getFullName();
    Role roleEntity = user.getRole();
    RoleResponse roleResponse = roleMapper.toResponse(roleEntity);

    String accessToken = generateToken(user, accessTokenExpirationMillis);
    LocalDateTime expiresAt = DateTimeUtils.millisToLocalDateTime(accessTokenExpirationMillis);

    String refreshToken = generateToken(user, refreshTokenExpirationMillis);
    authInfo.setRefreshToken(refreshToken);
    authInfoRepository.save(authInfo);

    return TokenResponse.builder()
      .id(userId)
      .email(email)
      .fullName(fullName)
      .role(roleResponse)
      .accessToken(accessToken)
      .expiresAt(expiresAt)
      .refreshToken(refreshToken)
      .build();
  }

  public LogoutResponse logout(TokenRequest request) throws JOSEException, ParseException {
    String token = request.getToken();
    SignedJWT signedJWT = getSignedJWT(token);

    String id = signedJWT.getJWTClaimsSet().getJWTID();
    createInvalidToken(id, token);

    String email = signedJWT.getJWTClaimsSet().getSubject();
    User user = userRepository.findByEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    UserAuthInfo authInfo = user.getAuthInfo();

    String refreshToken = authInfo.getRefreshToken();
    if (refreshToken != null) {
      SignedJWT refreshSignedJWT = SignedJWT.parse(refreshToken);
      String refreshTokenId = refreshSignedJWT.getJWTClaimsSet().getJWTID();
      createInvalidToken(refreshTokenId, refreshToken);
    }

    authInfo.setRefreshToken(null);
    authInfoRepository.save(authInfo);

    return LogoutResponse.builder()
      .loggedOut(true)
      .build();
  }

  public TokenResponse getMe(CustomAuthenticationToken authentication) {
    String email = authentication.getName();
    String accessToken = authentication.getToken();
    LocalDateTime expiresAt = authentication.getExpiresAt();

    User user = userRepository.findByEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    String id = user.getId();
    String fullName = user.getFullName();
    Role roleEntity = user.getRole();
    RoleResponse roleResponse = roleMapper.toResponse(roleEntity);

    UserAuthInfo authInfo = user.getAuthInfo();
    String refreshToken = authInfo.getRefreshToken();

    return TokenResponse.builder()
      .id(id)
      .email(email)
      .fullName(fullName)
      .role(roleResponse)
      .accessToken(accessToken)
      .expiresAt(expiresAt)
      .refreshToken(refreshToken)
      .build();
  }

  private void createInvalidToken(String id, String token) {
    InvalidToken invalidToken = InvalidToken.builder()
      .id(id)
      .token(token)
      .build();
    invalidTokenRepository.save(invalidToken);
  }

  public SignedJWT getSignedJWT(String token) throws JOSEException, ParseException {
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

    return signedJWT;
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
