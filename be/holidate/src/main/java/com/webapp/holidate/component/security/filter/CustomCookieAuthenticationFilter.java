package com.webapp.holidate.component.security.filter;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.constants.api.endpoint.auth.AuthEndpoints;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.service.auth.AuthService;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.utils.DateTimeUtils;
import com.webapp.holidate.utils.ResponseUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.text.ParseException;
import java.util.Date;
import java.util.List;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CustomCookieAuthenticationFilter extends OncePerRequestFilter {
  AuthService authService;

  @NonFinal
  @Value(AppProperties.JWT_TOKEN_COOKIE_NAME)
  String tokenCookieName;

  @Override
  protected void doFilterInternal(HttpServletRequest request, @NotNull HttpServletResponse response, @NotNull FilterChain filterChain) throws ServletException, IOException, RuntimeException {
    String uri = request.getRequestURI();
    String getMeEndpoint = AuthEndpoints.AUTH + AuthEndpoints.ME;

    if (uri.endsWith(getMeEndpoint)) {
      Cookie[] cookies = request.getCookies();

      if (cookies != null) {
        for (Cookie cookie : cookies) {
          boolean tokenNameMatches = tokenCookieName.equals(cookie.getName());

          if (tokenNameMatches) {
            String token = cookie.getValue();
            Date expirationTime;
            String email;
            String scope;

            try {
              SignedJWT signedJWT = authService.getSignedJWT(token);
              email = signedJWT.getJWTClaimsSet().getSubject();
              scope = signedJWT.getJWTClaimsSet().getClaim("scope").toString();
              expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            } catch (JOSEException | ParseException e) {
              ResponseUtils.handleAuthErrorResponse(response, ErrorType.INVALID_TOKEN);
              return;
            } catch (AppException e) {
              ResponseUtils.handleAuthErrorResponse(response, e.getError());
              return;
            }

            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(scope));
            CustomAuthenticationToken authentication = new CustomAuthenticationToken(
              email,
              null,
              authorities,
              token,
              DateTimeUtils.dateToLocalDateTime(expirationTime)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            break;
          }
        }
      }
    }

    filterChain.doFilter(request, response);
  }
}