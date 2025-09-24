package com.webapp.holidate.service.auth;

import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.dto.request.auth.email.SendEmailVerificationRequest;
import com.webapp.holidate.dto.request.auth.email.VerifyEmailRequest;
import com.webapp.holidate.dto.response.auth.VerificationResponse;
import com.webapp.holidate.dto.response.auth.email.SendEmailVerificationResponse;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.entity.user.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.user.UserAuthInfoRepository;
import com.webapp.holidate.type.AuthProviderType;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.utils.DateTimeUtils;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.Random;

@Log4j2
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class EmailService {
  UserAuthInfoRepository authInfoRepository;
  JavaMailSender mailSender;
  TemplateEngine templateEngine;

  @NonFinal
  @Value(AppValues.OTP_EXPIRATION_MILLIS)
  long otpExpirationMillis;

  @NonFinal
  @Value(AppValues.OTP_MAX_ATTEMPTS)
  int otpMaxAttempts;

  @NonFinal
  @Value(AppValues.OTP_BLOCK_TIME_MILLIS)
  long otpBlockTimeMillis;

  public SendEmailVerificationResponse sendVerificationEmail(SendEmailVerificationRequest request) {
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(request.getEmail())
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    String authProvider = authInfo.getAuthProvider();
    boolean localAuth = AuthProviderType.LOCAL.getValue().equals(authProvider);
    if (!localAuth) {
      throw new AppException(ErrorType.ONLY_LOCAL_AUTH);
    }

    boolean active = authInfo.isActive();
    if (active) {
      throw new AppException(ErrorType.USER_EXISTS);
    }

    LocalDateTime blockedUntil = authInfo.getEmailVerificationOtpBlockedUntil();
    boolean blocked = isVerificationOtpBlockedUntil(blockedUntil);
    if (blocked) {
      throw new AppException(ErrorType.OTP_BLOCKED);
    }

    String otp = generateVerificationOtp();
    authInfo.setEmailVerificationOtp(otp);

    LocalDateTime expirationTime = DateTimeUtils.millisToLocalDateTime(otpExpirationMillis);
    authInfo.setEmailVerificationOtpExpirationTime(expirationTime);

    authInfo.setEmailVerificationAttempts(0);
    authInfo.setEmailVerificationOtpBlockedUntil(null);

    authInfoRepository.save(authInfo);

    // prepare the email content using Thymeleaf
    User user = authInfo.getUser();
    Context context = new Context();
    context.setVariable("name", user.getFullName());
    context.setVariable("otp", otp);

    int otpExpirationMinutes = (int) (otpExpirationMillis / 60000);
    context.setVariable("expiryMinutes", otpExpirationMinutes);

    // generate the HTML content
    String htmlContent = templateEngine.process("email-verification", context);

    // send the email
    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      mimeMessageHelper.setTo(user.getEmail());
      mimeMessageHelper.setSubject("Mã OTP xác thực Email - Holidate");
      mimeMessageHelper.setText(htmlContent, true);
      mailSender.send(mimeMessage);
    } catch (MessagingException e) {
      throw new AppException(ErrorType.SEND_EMAIL_FAILED);
    }

    return SendEmailVerificationResponse.builder()
      .sent(true)
      .build();
  }

  public SendEmailVerificationResponse resendVerificationEmail(SendEmailVerificationRequest request) {
    String email = request.getEmail();
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    LocalDateTime blockedUntil = authInfo.getEmailVerificationOtpBlockedUntil();
    boolean blocked = isVerificationOtpBlockedUntil(blockedUntil);
    if (blocked) {
      throw new AppException(ErrorType.OTP_BLOCKED);
    }

    authInfo.setEmailVerificationOtp(null);
    authInfo.setEmailVerificationOtpBlockedUntil(null);
    authInfoRepository.save(authInfo);

    return sendVerificationEmail(request);
  }

  public VerificationResponse verifyEmail(VerifyEmailRequest request) {
    String email = request.getEmail();
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.INVALID_OTP));

    String authProvider = authInfo.getAuthProvider();
    boolean localAuth = AuthProviderType.LOCAL.getValue().equals(authProvider);
    if (!localAuth) {
      throw new AppException(ErrorType.ONLY_LOCAL_AUTH);
    }

    if (authInfo.isActive()) {
      throw new AppException(ErrorType.USER_EXISTS);
    }

    String storedOtp = authInfo.getEmailVerificationOtp();
    if (storedOtp == null) {
      throw new AppException(ErrorType.INVALID_OTP);
    }

    LocalDateTime blockedUntil = authInfo.getEmailVerificationOtpBlockedUntil();
    boolean blocked = isVerificationOtpBlockedUntil(blockedUntil);
    if (blocked) {
      throw new AppException(ErrorType.OTP_BLOCKED);
    }

    LocalDateTime expirationTime = authInfo.getEmailVerificationOtpExpirationTime();
    boolean expired = isVerificationOtpExpired(expirationTime);
    if (expired) {
      throw new AppException(ErrorType.OTP_EXPIRED);
    }

    boolean verified = request.getOtp().equals(storedOtp);
    if (!verified) {
      incrementVerificationAttempts(authInfo);
      throw new AppException(ErrorType.INVALID_OTP);
    }

    authInfo.setEmailVerificationOtp(null);
    authInfo.setEmailVerificationAttempts(0);
    authInfo.setEmailVerificationOtpExpirationTime(null);
    authInfo.setEmailVerificationOtpBlockedUntil(null);
    authInfo.setActive(true);

    authInfoRepository.save(authInfo);

    return VerificationResponse.builder()
      .verified(true)
      .build();
  }

  private String generateVerificationOtp() {
    Random random = new Random();
    int otp = 100000 + random.nextInt(900000);
    return String.valueOf(otp);
  }

  private boolean isVerificationOtpExpired(LocalDateTime expirationTime) {
    return expirationTime == null || expirationTime.isBefore(LocalDateTime.now());
  }

  private boolean isVerificationOtpBlockedUntil(LocalDateTime expirationTime) {
    return expirationTime != null && expirationTime.isAfter(LocalDateTime.now());
  }

  private void incrementVerificationAttempts(UserAuthInfo authInfo) {
    int attempts = authInfo.getEmailVerificationAttempts() + 1;
    authInfo.setEmailVerificationAttempts(attempts);

    if (attempts >= otpMaxAttempts) {
      LocalDateTime blockUntil = DateTimeUtils.millisToLocalDateTime(otpBlockTimeMillis);
      authInfo.setEmailVerificationOtpBlockedUntil(blockUntil);
      authInfo.setEmailVerificationOtp(null);
      authInfo.setEmailVerificationOtpExpirationTime(null);
    }

    authInfoRepository.save(authInfo);
  }
}