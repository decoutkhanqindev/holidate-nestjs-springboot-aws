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
  @Value(AppValues.TOKEN_COOKIE_NAME)
  String tokenCookieName;

  @Override
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
    Cookie cookie = new Cookie(tokenCookieName, null);
    cookie.setHttpOnly(true);
    cookie.setSecure(false); // Set to true in production
    cookie.setPath("/");
    cookie.setMaxAge(0);

    String cookieHeader = String.format(
      "%s=%s; Max-Age=%d; Path=/; HttpOnly; Secure; SameSite=None",
      tokenCookieName, null, 0
    );
    response.addHeader("Set-Cookie", cookieHeader);

    getRedirectStrategy().sendRedirect(request, response, frontendLoginFailureUrl);
  }
}
