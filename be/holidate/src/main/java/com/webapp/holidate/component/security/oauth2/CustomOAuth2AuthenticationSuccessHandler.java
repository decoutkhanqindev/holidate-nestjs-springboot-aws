package com.webapp.holidate.component.security.oauth2;

import com.nimbusds.jose.JOSEException;
import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.entity.user.UserAuthInfo;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.user.UserAuthInfoRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.service.auth.AuthService;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.utils.ResponseUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
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
  @Value(AppProperties.FRONTEND_URL)
  String frontendUrl;

  @NonFinal
  @Value(AppProperties.JWT_ACCESS_TOKEN_EXPIRATION_MILLIS)
  long accessTokenExpirationMillis;

  @NonFinal
  @Value(AppProperties.JWT_REFRESH_TOKEN_EXPIRATION_MILLIS)
  long refreshTokenExpirationMillis;

  @NonFinal
  @Value(AppProperties.JWT_TOKEN_COOKIE_NAME)
  String tokenCookieName;

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws IOException {
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

    int maxAge = (int) (refreshTokenExpirationMillis / 1000);
    ResponseUtil.handleAuthCookiesResponse(response, tokenCookieName, accessToken, maxAge);

    getRedirectStrategy().sendRedirect(request, response, frontendUrl);
  }
}
