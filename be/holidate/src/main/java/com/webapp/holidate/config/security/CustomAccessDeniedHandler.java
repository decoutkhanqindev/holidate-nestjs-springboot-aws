package com.webapp.holidate.config.security;

import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.utils.ResponseUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
  @Override
  public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
    ResponseUtils.handleAuthErrorResponse(response, ErrorType.ACCESS_DENIED);
  }
}
