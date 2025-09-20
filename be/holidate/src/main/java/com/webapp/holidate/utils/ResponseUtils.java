package com.webapp.holidate.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.type.ErrorType;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.val;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public class ResponseUtils {
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
    Cookie cookie = new Cookie(name, token);
    cookie.setHttpOnly(true);
    cookie.setSecure(false); // set to true in production
    cookie.setPath("/");
    cookie.setMaxAge(maxAge);

    String cookieHeader = String.format(
      "%s=%s; Max-Age=%d; Path=/; HttpOnly; Secure; SameSite=None",
      name, token, maxAge
    );
    response.addHeader("Set-Cookie", cookieHeader);
  }
}
