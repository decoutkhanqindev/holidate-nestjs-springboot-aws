package com.webapp.holidate.config.security.oauth2;

import com.webapp.holidate.constants.AppValues;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
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
  @Value(AppValues.ACCESS_TOKEN_COOKIE_NAME)
  String accessTokenCookieName;

  @NonFinal
  @Value(AppValues.REFRESH_TOKEN_COOKIE_NAME)
  String refreshTokenCookieName;

  @Override
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
    clearCookie(response);
    getRedirectStrategy().sendRedirect(request, response, frontendLoginFailureUrl);
  }

  private void clearCookie(HttpServletResponse response) {
    Cookie accessTokenCookie = new Cookie(accessTokenCookieName, null);
    accessTokenCookie.setHttpOnly(true);
    accessTokenCookie.setPath("/");
    accessTokenCookie.setSecure(false);
    accessTokenCookie.setMaxAge(0);
    response.addCookie(accessTokenCookie);

    Cookie refreshTokenCookie = new Cookie(refreshTokenCookieName, null);
    refreshTokenCookie.setHttpOnly(true);
    refreshTokenCookie.setPath("/");
    refreshTokenCookie.setSecure(false);
    refreshTokenCookie.setMaxAge(0);
    response.addCookie(refreshTokenCookie);
  }
}
