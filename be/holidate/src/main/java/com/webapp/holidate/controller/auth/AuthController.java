package com.webapp.holidate.controller.auth;

import com.nimbusds.jose.JOSEException;
import com.webapp.holidate.component.security.filter.CustomAuthenticationToken;
import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.constants.api.endpoint.auth.AuthEndpoints;
import com.webapp.holidate.dto.request.auth.LoginRequest;
import com.webapp.holidate.dto.request.auth.RegisterRequest;
import com.webapp.holidate.dto.request.auth.TokenRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.auth.LogoutResponse;
import com.webapp.holidate.dto.response.auth.TokenResponse;
import com.webapp.holidate.dto.response.auth.VerificationResponse;
import com.webapp.holidate.dto.response.user.UserResponse;
import com.webapp.holidate.service.auth.AuthService;
import com.webapp.holidate.service.auth.EmailService;
import com.webapp.holidate.utils.ResponseUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping(AuthEndpoints.AUTH)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthController {
  AuthService authService;
  EmailService emailService;

  @NonFinal
  @Value(AppProperties.JWT_TOKEN_COOKIE_NAME)
  String tokenCookieName;

  @PostMapping(AuthEndpoints.REGISTER)
  public ApiResponse<UserResponse> register(@RequestBody @Valid RegisterRequest request) {
    UserResponse response = authService.register(request);
    return ApiResponse.<UserResponse>builder()
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
  public ApiResponse<VerificationResponse> verifyToken(@RequestBody @Valid TokenRequest request)
    throws ParseException, JOSEException {
    VerificationResponse response = authService.verifyToken(request);
    return ApiResponse.<VerificationResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(AuthEndpoints.REFRESH_TOKEN)
  public ApiResponse<TokenResponse> refreshToken(@RequestBody @Valid TokenRequest request)
    throws ParseException, JOSEException {
    TokenResponse response = authService.refreshToken(request);
    return ApiResponse.<TokenResponse>builder()
      .data(response)
      .build();
  }

  @PostMapping(AuthEndpoints.LOGOUT)
  public ApiResponse<LogoutResponse> logout(
    @RequestBody @Valid TokenRequest request,
    HttpServletResponse httpServletResponse) throws ParseException, JOSEException {
    LogoutResponse response = authService.logout(request);

    // clear the token cookie
    ResponseUtil.handleAuthCookiesResponse(httpServletResponse, tokenCookieName, null, 0);

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
