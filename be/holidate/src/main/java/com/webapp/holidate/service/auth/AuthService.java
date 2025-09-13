package com.webapp.holidate.service.auth;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.dto.request.auth.LoginRequest;
import com.webapp.holidate.dto.request.auth.VerifyTokenRequest;
import com.webapp.holidate.dto.request.auth.email.SendEmailVerificationRequest;
import com.webapp.holidate.dto.request.auth.email.VerifyEmailRequest;
import com.webapp.holidate.dto.response.auth.LoginResponse;
import com.webapp.holidate.dto.response.auth.VerificationResponse;
import com.webapp.holidate.dto.response.auth.email.SendEmailVerificationResponse;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.entity.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.UserAuthInfoRepository;
import com.webapp.holidate.repository.UserRepository;
import com.webapp.holidate.type.AuthProviderType;
import com.webapp.holidate.type.ErrorType;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Random;


@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthService {
  UserRepository userRepository;
  PasswordEncoder passwordEncoder;

  @NonFinal
  @Value(AppValues.SECRET_KEY)
  String SECRET_KEY;

  @NonFinal
  @Value(AppValues.ISSUER)
  String ISSUER;

  @NonFinal
  @Value(AppValues.ACCESS_TOKEN_EXPIRATION_MINUTES)
  int accessTokenExpirationMinutes;

  @NonFinal
  @Value(AppValues.REFRESH_TOKEN_EXPIRATION_DAYS)
  int refreshTokenExpirationDays;

  public LoginResponse login(LoginRequest loginRequest) throws JOSEException {
    User user = userRepository.findByEmail(loginRequest.getEmail())
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    boolean active = user.getAuthInfo() != null && user.getAuthInfo().isActive();
    if (!active) {
      throw new AppException(ErrorType.UNAUTHENTICATED);
    }

    String rawPassword = loginRequest.getPassword();
    String encodedPassword = user.getPassword();
    boolean passwordMatches = isPasswordMatches(rawPassword, encodedPassword);
    if (!passwordMatches) {
      throw new AppException(ErrorType.UNAUTHENTICATED);
    }

    String accessToken = generateToken(user);
    return LoginResponse.builder()
      .accessToken(accessToken)
      .refreshToken(null)
      .build();
  }

  private boolean isPasswordMatches(String rawPassword, String encodedPassword) {
    return passwordEncoder.matches(rawPassword, encodedPassword);
  }

  private String generateToken(User user) throws JOSEException {
    Date now = new Date();
    Date expirationTime = new Date(now.getTime() + accessTokenExpirationMinutes * 60 * 1000L);

    JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
    JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
      .jwtID(user.getId())
      .subject(user.getEmail())
      .subject(user.getFullName())
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

  public VerificationResponse verifyToken(VerifyTokenRequest verifyTokenRequest) throws JOSEException, ParseException {
    String token = verifyTokenRequest.getToken();
    SignedJWT signedJWT = SignedJWT.parse(token);

    Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
    boolean expired = isVerificationTokenExpired(expirationTime);
    if (expired) {
      throw new AppException(ErrorType.TOKEN_EXPIRED);
    }

    JWSVerifier verifier = new MACVerifier(SECRET_KEY.getBytes());
    boolean verified = signedJWT.verify(verifier);
    if (!verified) {
      throw new AppException(ErrorType.INVALID_TOKEN);
    }

    return VerificationResponse.builder()
      .verified(true)
      .build();
  }

  private boolean isVerificationTokenExpired(Date expirationTime) {
    return expirationTime == null || expirationTime.before(new Date());
  }
}
