package com.webapp.holidate.controller.auth;

import com.nimbusds.jose.JOSEException;
import com.webapp.holidate.constants.enpoint.auth.AuthEndpoints;
import com.webapp.holidate.dto.request.auth.*;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.auth.*;
import com.webapp.holidate.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping(AuthEndpoints.AUTH)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthController {
  AuthService authService;

  @PostMapping(AuthEndpoints.REGISTER)
  public ApiResponse<RegisterResponse> register(@RequestBody @Valid RegisterRequest request) {
    RegisterResponse response = authService.register(request);
    return ApiResponse.<RegisterResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(AuthEndpoints.LOGIN)
  public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest) throws JOSEException {
    LoginResponse response = authService.login(loginRequest);
    return ApiResponse.<LoginResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(AuthEndpoints.VERIFY_TOKEN)
  public ApiResponse<VerificationResponse> verifyToken(@RequestBody @Valid VerifyTokenRequest request) throws ParseException, JOSEException {
    VerificationResponse response = authService.verifyToken(request);
    return ApiResponse.<VerificationResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(AuthEndpoints.REFRESH_TOKEN)
  public ApiResponse<RefreshTokenResponse> refreshToken(@RequestBody @Valid RefreshTokenRequest request) throws ParseException, JOSEException {
    RefreshTokenResponse response = authService.refreshToken(request);
    return ApiResponse.<RefreshTokenResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(AuthEndpoints.LOGOUT)
  public ApiResponse<LogoutResponse> logout(@RequestBody @Valid LogoutRequest request) throws ParseException, JOSEException {
    LogoutResponse response = authService.logout(request);
    return ApiResponse.<LogoutResponse>builder()
      .data(response)
      .build();
  }
}
