package com.webapp.holidate.service.auth;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.dto.request.auth.otp.SendOtpRequest;
import com.webapp.holidate.dto.request.auth.otp.VerifyEmailVerificationOtpRequest;
import com.webapp.holidate.dto.request.auth.otp.VerifyPasswordResetOtpRequest;
import com.webapp.holidate.dto.response.auth.SendOtpResponse;
import com.webapp.holidate.dto.response.auth.VerificationResponse;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.entity.user.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.user.UserAuthInfoRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.auth.OtpType;
import com.webapp.holidate.type.user.AuthProviderType;
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
import org.springframework.security.crypto.password.PasswordEncoder;
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
  UserRepository userRepository;
  JavaMailSender mailSender;
  TemplateEngine templateEngine;
  PasswordEncoder passwordEncoder;

  @NonFinal
  @Value(AppProperties.OTP_EXPIRATION_MILLIS)
  long otpExpirationMillis;

  @NonFinal
  @Value(AppProperties.OTP_MAX_ATTEMPTS)
  int otpMaxAttempts;

  @NonFinal
  @Value(AppProperties.OTP_BLOCK_TIME_MILLIS)
  long otpBlockTimeMillis;

  public SendOtpResponse sendEmailVerificationOtp(SendOtpRequest request) {
    return sendOtp(request.getEmail(), OtpType.EMAIL_VERIFICATION, false);
  }

  public SendOtpResponse sendPasswordResetOtp(SendOtpRequest request) {
    return sendOtp(request.getEmail(), OtpType.PASSWORD_RESET, true);
  }

  private SendOtpResponse sendOtp(String email, OtpType otpType, boolean requireActive) {
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    String authProvider = authInfo.getAuthProvider();
    boolean localAuth = AuthProviderType.LOCAL.getValue().equals(authProvider);
    if (!localAuth) {
      throw new AppException(ErrorType.ONLY_LOCAL_AUTH);
    }

    boolean active = authInfo.isActive();
    if (requireActive && !active) {
      throw new AppException(ErrorType.UNAUTHORIZED);
    }
    if (!requireActive && active) {
      throw new AppException(ErrorType.USER_EXISTS);
    }

    LocalDateTime blockedUntil = authInfo.getOtpBlockedUntil();
    boolean blocked = isOtpBlocked(blockedUntil);
    if (blocked) {
      throw new AppException(ErrorType.OTP_BLOCKED);
    }

    String otp = generateVerificationOtp();
    authInfo.setOtp(otp);

    LocalDateTime expirationTime = DateTimeUtils.millisToLocalDateTime(otpExpirationMillis);
    authInfo.setOtpExpirationTime(expirationTime);

    authInfo.setOtpAttempts(0);
    authInfo.setOtpBlockedUntil(null);

    authInfoRepository.save(authInfo);

    // prepare the email content using Thymeleaf
    User user = authInfo.getUser();
    Context context = new Context();
    context.setVariable("name", user.getFullName());
    context.setVariable("otp", otp);

    int otpExpirationMinutes = (int) (otpExpirationMillis / 60000);
    context.setVariable("expiryMinutes", otpExpirationMinutes);

    // generate the HTML content
    String htmlContent = templateEngine.process(otpType.getTemplateName(), context);

    // send the email
    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      mimeMessageHelper.setTo(user.getEmail());
      mimeMessageHelper.setSubject(otpType.getEmailSubject());
      mimeMessageHelper.setText(htmlContent, true);
      mailSender.send(mimeMessage);
    } catch (MessagingException e) {
      throw new AppException(ErrorType.SEND_EMAIL_FAILED);
    }

    return SendOtpResponse.builder()
      .sent(true)
      .build();
  }

  public VerificationResponse verifyEmailVerificationOtp(VerifyEmailVerificationOtpRequest request) {
    return verifyOtp(request.getEmail(), request.getOtp(), OtpType.EMAIL_VERIFICATION, null);
  }

  public VerificationResponse verifyPasswordResetOtp(VerifyPasswordResetOtpRequest request) {
    return verifyOtp(request.getEmail(), request.getOtp(), OtpType.PASSWORD_RESET, request.getNewPassword());
  }

  private VerificationResponse verifyOtp(String email, String inputOtp, OtpType otpType, String newPassword) {
    UserAuthInfo authInfo = authInfoRepository.findByUserEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.INVALID_OTP));

    String authProvider = authInfo.getAuthProvider();
    boolean localAuth = AuthProviderType.LOCAL.getValue().equals(authProvider);
    if (!localAuth) {
      throw new AppException(ErrorType.ONLY_LOCAL_AUTH);
    }

    if (otpType == OtpType.EMAIL_VERIFICATION) {
      if (authInfo.isActive()) {
        throw new AppException(ErrorType.USER_EXISTS);
      }
    } else if (otpType == OtpType.PASSWORD_RESET) {
      if (!authInfo.isActive()) {
        throw new AppException(ErrorType.UNAUTHORIZED);
      }
    }

    String storedOtp = authInfo.getOtp();
    if (storedOtp == null) {
      throw new AppException(ErrorType.INVALID_OTP);
    }

    LocalDateTime blockedUntil = authInfo.getOtpBlockedUntil();
    boolean blocked = isOtpBlocked(blockedUntil);
    if (blocked) {
      throw new AppException(ErrorType.OTP_BLOCKED);
    }

    LocalDateTime expirationTime = authInfo.getOtpExpirationTime();
    boolean expired = isOtpExpired(expirationTime);
    if (expired) {
      throw new AppException(ErrorType.OTP_EXPIRED);
    }

    boolean verified = inputOtp.equals(storedOtp);
    if (!verified) {
      incrementOtpAttempts(authInfo);
      throw new AppException(ErrorType.INVALID_OTP);
    }

    if (otpType == OtpType.EMAIL_VERIFICATION) {
      authInfo.setActive(true);
    } else if (otpType == OtpType.PASSWORD_RESET) {
      User user = authInfo.getUser();
      String encodedPassword = passwordEncoder.encode(newPassword);
      user.setPassword(encodedPassword);
      user.setUpdatedAt(LocalDateTime.now());
      authInfo.setRefreshToken(null);
      userRepository.save(user);
    }

    authInfo.setOtp(null);
    authInfo.setOtpAttempts(0);
    authInfo.setOtpExpirationTime(null);
    authInfo.setOtpBlockedUntil(null);

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

  private boolean isOtpExpired(LocalDateTime expirationTime) {
    return expirationTime == null || expirationTime.isBefore(LocalDateTime.now());
  }

  private boolean isOtpBlocked(LocalDateTime expirationTime) {
    return expirationTime != null && expirationTime.isAfter(LocalDateTime.now());
  }

  private void incrementOtpAttempts(UserAuthInfo authInfo) {
    int attempts = authInfo.getOtpAttempts() + 1;
    authInfo.setOtpAttempts(attempts);

    boolean maxAttemptsReached = attempts >= otpMaxAttempts;
    if (maxAttemptsReached) {
      LocalDateTime blockUntil = DateTimeUtils.millisToLocalDateTime(otpBlockTimeMillis);
      authInfo.setOtpBlockedUntil(blockUntil);
      authInfo.setOtp(null);
      authInfo.setOtpExpirationTime(null);
    }

    authInfoRepository.save(authInfo);
  }
}