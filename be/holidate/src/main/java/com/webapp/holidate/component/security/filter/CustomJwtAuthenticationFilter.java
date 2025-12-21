package com.webapp.holidate.component.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomJwtAuthenticationFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response,
      @NotNull FilterChain filterChain) throws ServletException, IOException {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    // Convert JwtAuthenticationToken to CustomAuthenticationToken
    if (authentication instanceof JwtAuthenticationToken jwtAuth) {
      Jwt jwt = jwtAuth.getToken();
      String tokenValue = jwt.getTokenValue();
      String email = jwt.getSubject();
      String scope = jwt.getClaimAsString("scope");

      // Get expiration time from JWT
      Instant expirationInstant = jwt.getExpiresAt();
      LocalDateTime expiresAt = expirationInstant != null
          ? expirationInstant.atZone(ZoneId.systemDefault()).toLocalDateTime()
          : null;

      // Create CustomAuthenticationToken
      List<GrantedAuthority> authorities = scope != null
          ? List.of(new SimpleGrantedAuthority(scope))
          : jwtAuth.getAuthorities().stream().toList();

      CustomAuthenticationToken customAuth = new CustomAuthenticationToken(
          email,
          null,
          authorities,
          tokenValue,
          expiresAt);

      SecurityContextHolder.getContext().setAuthentication(customAuth);
    }

    filterChain.doFilter(request, response);
  }
}
