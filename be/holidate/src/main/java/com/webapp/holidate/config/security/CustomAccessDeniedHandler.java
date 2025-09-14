package com.webapp.holidate.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.type.ErrorType;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
  @Override
  public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
    ApiResponse<?> apiResponse = ApiResponse.builder()
      .statusCode(ErrorType.ACCESS_DENIED.getStatusCode())
      .message(ErrorType.ACCESS_DENIED.getMessage())
      .build();

    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    new ObjectMapper().writeValue(response.getOutputStream(), apiResponse);
  }
}
