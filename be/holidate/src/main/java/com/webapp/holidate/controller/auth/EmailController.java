package com.webapp.holidate.controller.auth;

import com.webapp.holidate.constants.api.endpoint.auth.AuthEndpoints;
import com.webapp.holidate.constants.api.endpoint.auth.EmailEndpoints;
import com.webapp.holidate.dto.request.auth.otp.SendOtpRequest;
import com.webapp.holidate.dto.request.auth.otp.VerifyEmailVerificationOtpRequest;
import com.webapp.holidate.dto.request.auth.otp.VerifyPasswordResetOtpRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.auth.SendOtpResponse;
import com.webapp.holidate.dto.response.auth.VerificationResponse;
import com.webapp.holidate.service.auth.EmailService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(AuthEndpoints.AUTH + EmailEndpoints.EMAIL)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class EmailController {
  EmailService emailService;

  @PostMapping(EmailEndpoints.SEND_EMAIL_VERIFICATION_OTP)
  public ApiResponse<SendOtpResponse> sendEmailVerificationOtp(@RequestBody @Valid SendOtpRequest request) {
    SendOtpResponse response = emailService.sendEmailVerificationOtp(request);
    return ApiResponse.<SendOtpResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(EmailEndpoints.VERIFY_EMAIL_VERIFICATION_OTP)
  public ApiResponse<VerificationResponse> verifyEmailVerificationOtp(@RequestBody @Valid VerifyEmailVerificationOtpRequest request) {
    VerificationResponse response = emailService.verifyEmailVerificationOtp(request);
    return ApiResponse.<VerificationResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(EmailEndpoints.SEND_PASSWORD_RESET_OTP)
  public ApiResponse<SendOtpResponse> sendPasswordResetOtp(
    @RequestBody @Valid SendOtpRequest request
  ) {
    SendOtpResponse response = emailService.sendPasswordResetOtp(request);
    return ApiResponse.<SendOtpResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(EmailEndpoints.VERIFY_PASSWORD_RESET_OTP)
  public ApiResponse<VerificationResponse> verifyPasswordResetOtp(
    @RequestBody @Valid VerifyPasswordResetOtpRequest request
  ) {
    VerificationResponse response = emailService.verifyPasswordResetOtp(request);
    return ApiResponse.<VerificationResponse>builder()
      .data(response)
      .build();
  }
}
