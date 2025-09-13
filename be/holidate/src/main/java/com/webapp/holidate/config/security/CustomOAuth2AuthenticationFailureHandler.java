package com.webapp.holidate.config.security;

import com.nimbusds.jose.JOSEException;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.UserRepository;
import com.webapp.holidate.service.auth.AuthService;
import com.webapp.holidate.type.ErrorType;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {
  @NonFinal
  @Value(AppValues.FRONTEND_LOGIN_FAILURE_URL)
  String frontendLoginFailureUrl;

  @Override
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
    String redirectUrl = String.format("%s?error=%s", frontendLoginFailureUrl, exception.getMessage());
    getRedirectStrategy().sendRedirect(request, response, redirectUrl);
  }
}
