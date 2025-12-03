package com.webapp.holidate.component.security.oauth2;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.utils.ResponseUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {
  @NonFinal
  @Value(AppProperties.FRONTEND_URL)
  String frontendUrl;

  @NonFinal
  @Value(AppProperties.JWT_TOKEN_COOKIE_NAME)
  String tokenCookieName;

  @Override
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                      AuthenticationException exception) throws IOException {
    // Set cookie domain to .holidate.site for production
    String cookieDomain = frontendUrl != null && frontendUrl.contains("holidate.site") ? ".holidate.site" : null;
    ResponseUtil.handleAuthCookiesResponse(response, tokenCookieName, null, 0, cookieDomain);
    getRedirectStrategy().sendRedirect(request, response, frontendUrl);
  }
}
