package com.webapp.holidate.controller.auth;

import com.webapp.holidate.constants.enpoint.auth.AuthEndpoints;
import com.webapp.holidate.constants.enpoint.auth.EmailEndpoints;
import com.webapp.holidate.dto.request.auth.email.SendEmailVerificationRequest;
import com.webapp.holidate.dto.request.auth.email.VerifyEmailRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.auth.VerificationResponse;
import com.webapp.holidate.dto.response.auth.email.SendEmailVerificationResponse;
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

  @PostMapping(EmailEndpoints.SEND_VERIFICATION_EMAIL)
  public ApiResponse<SendEmailVerificationResponse> sendVerificationEmail(@RequestBody @Valid SendEmailVerificationRequest request) {
    SendEmailVerificationResponse response = emailService.sendVerificationEmail(request);
    return ApiResponse.<SendEmailVerificationResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(EmailEndpoints.RESEND_VERIFICATION_EMAIL)
  public ApiResponse<SendEmailVerificationResponse> resendVerificationEmail(@RequestBody @Valid SendEmailVerificationRequest request) {
    SendEmailVerificationResponse response = emailService.resendVerificationEmail(request);
    return ApiResponse.<SendEmailVerificationResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(EmailEndpoints.VERIFY_EMAIL)
  public ApiResponse<VerificationResponse> verifyEmail(@RequestBody @Valid VerifyEmailRequest request) {
    VerificationResponse response = emailService.verifyEmail(request);
    return ApiResponse.<VerificationResponse>builder()
      .data(response)
      .build();
  }
}
