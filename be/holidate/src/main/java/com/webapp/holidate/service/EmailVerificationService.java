package com.webapp.holidate.service;

import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.dto.request.auth.email.SendEmailVerificationRequest;
import com.webapp.holidate.dto.response.email.SendEmailVerificationResponse;
import com.webapp.holidate.dto.response.email.VerifyEmailResponse;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.entity.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.UserAuthInfoRepository;
import com.webapp.holidate.repository.UserRepository;
import com.webapp.holidate.type.ErrorType;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.gradle.internal.impldep.org.joda.time.Hours;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor()
public class EmailVerificationService {
  UserRepository userRepository;
  UserAuthInfoRepository authInfoRepository;
  JavaMailSender mailSender;
  TemplateEngine templateEngine;

  @Value(AppValues.EMAIL_VERIFICATION_URL)
  String verificationUrl;

  @Value(AppValues.EMAIL_VERIFICATION_EXPIRATION_HOURS)
  int verificationExpirationHours;

  public SendEmailVerificationResponse sendVerificationEmail(SendEmailVerificationRequest request) {
    User user = userRepository.findById(request.getUserId())
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    String token = UUID.randomUUID().toString();
    LocalDateTime exp = LocalDateTime.now().plusHours(verificationExpirationHours);

    UserAuthInfo authInfo = UserAuthInfo.builder()
      .emailVerificationToken(token)
      .emailVerificationTokenExpiry(exp)
      .isActive(false)
      .user(user)
      .build();

    authInfoRepository.save(authInfo);

    // prepare the email content using Thymeleaf
    Context context = new Context();
    context.setVariable("name", user.getFullName());
    context.setVariable("verificationUrl", verificationUrl + token);
    context.setVariable("expiryHours", verificationExpirationHours);

    // generate the HTML content
    String htmlContent = templateEngine.process("verification-email", context);

    // send the email
    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      mimeMessageHelper.setTo(user.getEmail());
      mimeMessageHelper.setSubject("Xác thực email - Holidate");
      mimeMessageHelper.setText(htmlContent, true);
      mailSender.send(mimeMessage);
    } catch (MessagingException e) {
      throw new AppException(ErrorType.SEND_EMAIL_FAILED);
    }

    return SendEmailVerificationResponse.builder()
      .isSent(true)
      .build();
  }

  public VerifyEmailResponse verifyEmail(String token) {
    UserAuthInfo authInfo = authInfoRepository.findByEmailVerificationToken(token).orElse(null);

    boolean isVerified = authInfo != null && isVerificationTokenExpired(authInfo.getEmailVerificationTokenExpiry());

    if (isVerified) {
      authInfo.setActive(true);
      authInfo.setEmailVerificationToken(null);
      authInfo.setEmailVerificationTokenExpiry(null);
      authInfoRepository.save(authInfo);
    }

    return VerifyEmailResponse.builder().isVerified(isVerified).build();
  }

  private boolean isVerificationTokenExpired(LocalDateTime expiryTime) {
    return expiryTime != null && expiryTime.isAfter(LocalDateTime.now());
  }
}
