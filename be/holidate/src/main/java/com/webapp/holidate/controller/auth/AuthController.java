package com.webapp.holidate.controller.auth;

import com.webapp.holidate.constants.enpoint.AuthEndpoints;
import com.webapp.holidate.dto.request.auth.email.SendEmailVerificationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.email.SendEmailVerificationResponse;
import com.webapp.holidate.dto.response.email.VerifyEmailResponse;
import com.webapp.holidate.service.AuthService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AuthEndpoints.AUTH)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthController {
  AuthService service;

  @PostMapping(AuthEndpoints.EMAIL_VERIFICATION)
  public ApiResponse<SendEmailVerificationResponse> sendVerificationEmail(@RequestBody @Valid SendEmailVerificationRequest request) {
    SendEmailVerificationResponse response = service.sendVerificationEmail(request);
    return ApiResponse.<SendEmailVerificationResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping(AuthEndpoints.VERIFY_EMAIL)
  public ApiResponse<VerifyEmailResponse> verifyEmail(@PathVariable("token") String token) {
    VerifyEmailResponse response = service.verifyEmail(token);
    return ApiResponse.<VerifyEmailResponse>builder()
      .data(response)
      .build();
  }
}
