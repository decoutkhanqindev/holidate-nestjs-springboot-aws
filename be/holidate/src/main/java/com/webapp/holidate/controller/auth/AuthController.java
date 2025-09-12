package com.webapp.holidate.controller.auth;

import com.webapp.holidate.constants.enpoint.AuthEndpoints;
import com.webapp.holidate.dto.request.auth.email.SendEmailVerificationRequest;
import com.webapp.holidate.dto.request.auth.email.VerifyEmailRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.auth.email.SendEmailVerificationResponse;
import com.webapp.holidate.dto.response.auth.email.VerifyEmailResponse;
import com.webapp.holidate.service.AuthService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping(AuthEndpoints.AUTH)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthController {
  AuthService service;

  @PostMapping(AuthEndpoints.SEND_VERIFICATION_EMAIL)
  public ApiResponse<SendEmailVerificationResponse> sendVerificationEmail(@RequestBody @Valid SendEmailVerificationRequest request) {
    SendEmailVerificationResponse response = service.sendVerificationEmail(request);
    return ApiResponse.<SendEmailVerificationResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(AuthEndpoints.RESEND_VERIFICATION_EMAIL)
  public ApiResponse<SendEmailVerificationResponse> resendVerificationEmail(@RequestBody @Valid SendEmailVerificationRequest request) {
    SendEmailVerificationResponse response = service.resendVerificationEmail(request);
    return ApiResponse.<SendEmailVerificationResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(AuthEndpoints.VERIFY_EMAIL)
  public ApiResponse<VerifyEmailResponse> verifyEmail(@RequestBody @Valid VerifyEmailRequest request) {
    VerifyEmailResponse response = service.verifyEmail(request);
    return ApiResponse.<VerifyEmailResponse>builder()
      .data(response)
      .build();
  }
}
