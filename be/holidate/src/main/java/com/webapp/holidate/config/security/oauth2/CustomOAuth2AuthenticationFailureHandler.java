package com.webapp.holidate.config.security.oauth2;

import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.utils.AuthenticationUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {
  @NonFinal
  @Value(AppValues.FRONTEND_LOGIN_FAILURE_URL)
  String frontendLoginFailureUrl;

  @NonFinal
  @Value(AppValues.JWT_TOKEN_COOKIE_NAME)
  String tokenCookieName;

  @Override
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
    AuthenticationUtils.createAuthCookies(response, tokenCookieName, null, 0);
    getRedirectStrategy().sendRedirect(request, response, frontendLoginFailureUrl);
  }
}
