package com.webapp.holidate.utils;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.type.ErrorType;

import jakarta.servlet.http.HttpServletResponse;

public class ResponseUtil {
  public static ResponseEntity<ApiResponse<String>> handleExceptionResponse(ErrorType error) {
    int statusCode = error.getStatusCode();
    String message = error.getMessage();

    ApiResponse<String> response = ApiResponse.<String>builder()
      .statusCode(statusCode)
      .message(message)
      .data(null)
      .build();
    return ResponseEntity.status(error.getStatusCode()).body(response);
  }

  public static void handleAuthErrorResponse(HttpServletResponse response, ErrorType error) throws IOException {
    int statusCode = error.getStatusCode();
    String message = error.getMessage();

    ApiResponse<?> apiResponse = ApiResponse.builder()
      .statusCode(statusCode)
      .message(message)
      .build();

    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setStatus(error.getStatusCode());
    new ObjectMapper().writeValue(response.getOutputStream(), apiResponse);
  }

  public static void handleAuthCookiesResponse(HttpServletResponse response, String name, String token, int maxAge) {
    handleAuthCookiesResponse(response, name, token, maxAge, null);
  }

  public static void handleAuthCookiesResponse(HttpServletResponse response, String name, String token, int maxAge, String domain) {
    ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(name, token)
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(maxAge)
            .sameSite("None");
    
    // Set domain for production (holidate.site)
    if (domain != null && !domain.isEmpty()) {
      cookieBuilder.domain(domain);
    }
    
    ResponseCookie cookie = cookieBuilder.build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
  }
}
