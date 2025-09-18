package com.webapp.holidate.controller.auth;

import com.nimbusds.jose.JOSEException;
import com.webapp.holidate.config.security.filter.CustomAuthenticationToken;
import com.webapp.holidate.constants.enpoint.auth.AuthEndpoints;
import com.webapp.holidate.dto.request.auth.LoginRequest;
import com.webapp.holidate.dto.request.auth.RegisterRequest;
import com.webapp.holidate.dto.request.auth.TokenRequest;
import com.webapp.holidate.dto.request.auth.VerifyTokenRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.auth.*;
import com.webapp.holidate.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

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
  public ApiResponse<TokenResponse> login(@RequestBody @Valid LoginRequest loginRequest) throws JOSEException {
    TokenResponse response = authService.login(loginRequest);
    return ApiResponse.<TokenResponse>builder()
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
  public ApiResponse<TokenResponse> refreshToken(@RequestBody @Valid TokenRequest request) throws ParseException, JOSEException {
    TokenResponse response = authService.refreshToken(request);
    return ApiResponse.<TokenResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(AuthEndpoints.LOGOUT)
  public ApiResponse<LogoutResponse> logout(@RequestBody @Valid TokenRequest request) throws ParseException, JOSEException {
    LogoutResponse response = authService.logout(request);
    return ApiResponse.<LogoutResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping(AuthEndpoints.ME)
  public ApiResponse<TokenResponse> getMe(CustomAuthenticationToken authentication) {
    TokenResponse response = authService.getMe(authentication);
    return ApiResponse.<TokenResponse>builder()
      .data(response)
      .build();
  }
}
