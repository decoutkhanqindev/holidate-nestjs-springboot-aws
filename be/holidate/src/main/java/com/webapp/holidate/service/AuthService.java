package com.webapp.holidate.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.dto.request.auth.email.SendEmailVerificationRequest;
import com.webapp.holidate.dto.response.email.SendEmailVerificationResponse;
import com.webapp.holidate.dto.response.email.VerifyEmailResponse;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;


@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthService {
  UserRepository userRepository;
  UserAuthInfoRepository authInfoRepository;
  JavaMailSender mailSender;
  TemplateEngine templateEngine;

  @NonFinal
  @Value(AppValues.SECRET_KEY)
  String SECRET_KEY;

  @NonFinal
  @Value(AppValues.ISSUER)
  String ISSUER;

  @NonFinal
  @Value(AppValues.EMAIL_VERIFICATION_URL)
  String verificationUrl;

  @NonFinal
  @Value(AppValues.EMAIL_VERIFICATION_EXPIRATION_HOURS)
  int verificationExpirationHours;

  public SendEmailVerificationResponse sendVerificationEmail(SendEmailVerificationRequest request) {
    User user = userRepository.findById(request.getUserId())
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    String token = UUID.randomUUID().toString();
    LocalDateTime exp = LocalDateTime.now().plusHours(verificationExpirationHours);

    UserAuthInfo authInfo = UserAuthInfo.builder()
      .authProvider(AuthProviderType.LOCAL.getValue())
      .emailVerificationToken(token)
      .emailVerificationTokenExpiry(exp)
      .active(false)
      .user(user)
      .build();

    authInfoRepository.save(authInfo);

    // prepare the email content using Thymeleaf
    Context context = new Context();
    context.setVariable("name", user.getFullName());
    context.setVariable("verificationUrl", verificationUrl + token);
    context.setVariable("expiryHours", verificationExpirationHours);

    // generate the HTML content
    String htmlContent = templateEngine.process("email-verification", context);

    // send the email
    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      mimeMessageHelper.setTo(user.getEmail());
      mimeMessageHelper.setSubject("Xác thực Email - Holidate");
      mimeMessageHelper.setText(htmlContent, true);
      mailSender.send(mimeMessage);
    } catch (MessagingException e) {
      throw new AppException(ErrorType.SEND_EMAIL_FAILED);
    }

    return SendEmailVerificationResponse.builder()
      .sent(true)
      .build();
  }

  public VerifyEmailResponse verifyEmail(String token) {
    UserAuthInfo authInfo = authInfoRepository.findByEmailVerificationToken(token).orElse(null);

    boolean verified = authInfo != null && isVerificationTokenExpired(authInfo.getEmailVerificationTokenExpiry());

    if (verified) {
      authInfo.setEmailVerificationToken(null);
      authInfo.setEmailVerificationTokenExpiry(null);
      authInfo.setActive(true);
      authInfoRepository.save(authInfo);
    }

    return VerifyEmailResponse.builder()
      .verified(verified)
      .build();
  }

  private boolean isVerificationTokenExpired(LocalDateTime expiryTime) {
    return expiryTime != null && expiryTime.isAfter(LocalDateTime.now());
  }

  public  String generateToken(User user) throws JOSEException {
    Date now = new Date();
    Date exp = new Date(Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli());

    JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
    JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
      .jwtID(user.getId())
      .subject(user.getEmail())
      .subject(user.getFullName())
      .claim("scope", user.getRole())
      .issuer(ISSUER)
      .issueTime(now)
      .expirationTime(exp)
      .build();
    Payload payload = new Payload(claimsSet.toJSONObject());
    JWSObject jwsObject = new JWSObject(jwsHeader, payload);

    MACSigner signer = new MACSigner(SECRET_KEY);
    jwsObject.sign(signer);
    return jwsObject.serialize();
  }
}
