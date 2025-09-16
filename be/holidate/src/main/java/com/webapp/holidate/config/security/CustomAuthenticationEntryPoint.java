package com.webapp.holidate.config.security;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.exception.CustomAuthenticationException;
import com.webapp.holidate.type.ErrorType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
  @Override
  public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
    ErrorType errorType = ErrorType.UNAUTHORIZED;

    if (authException instanceof CustomAuthenticationException e) {
      errorType = e.getErrorType();
    }

    ApiResponse<?> apiResponse = ApiResponse.builder()
      .statusCode(errorType.getStatusCode())
      .message(errorType.getMessage())
      .build();

    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setStatus(errorType.getStatusCode());
    new ObjectMapper().writeValue(response.getOutputStream(), apiResponse);
  }
}
