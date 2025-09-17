package com.webapp.holidate.config.security.oauth2;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.constants.enpoint.auth.AuthEndpoints;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.exception.CustomAuthenticationException;
import com.webapp.holidate.service.auth.AuthService;
import com.webapp.holidate.type.ErrorType;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CustomCookieAuthenticationFilter extends OncePerRequestFilter {
  AuthService authService;

  @NonFinal
  @Value(AppValues.TOKEN_COOKIE_NAME)
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

            try {
              SignedJWT signedJWT = authService.getSignedJWT(token);
              String email = signedJWT.getJWTClaimsSet().getSubject();
              String scope = signedJWT.getJWTClaimsSet().getClaim("scope").toString();

              List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(scope));
              UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(email, null, authorities);

              SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JOSEException | ParseException e) {
              throw new CustomAuthenticationException(ErrorType.INVALID_TOKEN);
            } catch (AppException e) {
              throw new CustomAuthenticationException(e.getError());
            }
          }
        }
      }
    }

    filterChain.doFilter(request, response);
  }
}