package com.webapp.holidate.config.security.filter;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.time.LocalDateTime;
import java.util.Collection;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Getter
public class CustomAuthenticationToken extends UsernamePasswordAuthenticationToken {
  String token;
  LocalDateTime expiresAt;

  public CustomAuthenticationToken(Object principal, Object credentials,
                                   Collection<? extends GrantedAuthority> authorities,
                                   String token, LocalDateTime expiresAt) {
    super(principal, credentials, authorities);
    this.token = token;
    this.expiresAt = expiresAt;
  }
}
