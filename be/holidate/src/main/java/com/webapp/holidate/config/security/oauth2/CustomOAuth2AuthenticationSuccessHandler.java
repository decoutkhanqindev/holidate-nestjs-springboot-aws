package com.webapp.holidate.config.security.oauth2;

import com.nimbusds.jose.JOSEException;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.entity.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.UserAuthInfoRepository;
import com.webapp.holidate.repository.UserRepository;
import com.webapp.holidate.service.auth.AuthService;
import com.webapp.holidate.type.ErrorType;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

  AuthService authService;
  UserRepository userRepository;
  UserAuthInfoRepository authInfoRepository;

  @NonFinal
  @Value(AppValues.FRONTEND_LOGIN_SUCCESS_URL)
  String frontendLoginSuccessUrl;

  @NonFinal
  @Value(AppValues.ACCESS_TOKEN_EXPIRATION_MILLIS)
  long accessTokenExpirationMillis;

  @NonFinal
  @Value(AppValues.REFRESH_TOKEN_EXPIRATION_MILLIS)
  long refreshTokenExpirationMillis;

  @NonFinal
  @Value(AppValues.TOKEN_COOKIE_NAME)
  String tokenCookieName;

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
    String email = oAuth2User.getAttribute("email");
    User user = userRepository.findByEmail(email)
      .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));
    UserAuthInfo authInfo = user.getAuthInfo();

    String accessToken;
    String refreshToken;
    try {
      accessToken = authService.generateToken(user, accessTokenExpirationMillis);
      refreshToken = authService.generateToken(user, refreshTokenExpirationMillis);
    } catch (JOSEException e) {
      throw new AppException(ErrorType.UNKNOWN_ERROR);
    }

    authInfo.setRefreshToken(refreshToken);
    authInfoRepository.save(authInfo);

    Cookie cookie = new Cookie(tokenCookieName, accessToken);
    int maxAge = (int) (accessTokenExpirationMillis / 1000);
    cookie.setHttpOnly(true);
    cookie.setSecure(false); // set to true in production
    cookie.setPath("/");
    cookie.setMaxAge(maxAge);

    String cookieHeader = String.format(
      "%s=%s; Max-Age=%d; Path=/; HttpOnly; Secure; SameSite=None",
      tokenCookieName, accessToken, maxAge
    );
    response.addHeader("Set-Cookie", cookieHeader);

    getRedirectStrategy().sendRedirect(request, response, frontendLoginSuccessUrl);
  }
}
