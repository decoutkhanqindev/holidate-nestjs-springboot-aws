package com.webapp.holidate.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.type.ErrorType;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;

import java.io.IOException;

public class AuthenticationUtils {
  public static void handleAuthError(HttpServletResponse response, ErrorType error) throws IOException {
    ApiResponse<?> apiResponse = ApiResponse.builder().statusCode(error.getStatusCode()).message(error.getMessage()).build();

    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setStatus(error.getStatusCode());
    new ObjectMapper().writeValue(response.getOutputStream(), apiResponse);
  }

  public static void createAuthCookies(HttpServletResponse response, String name, String token, int maxAge) {
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
