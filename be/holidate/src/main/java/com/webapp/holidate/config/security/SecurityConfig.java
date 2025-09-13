package com.webapp.holidate.config.security;


import com.webapp.holidate.constants.enpoint.auth.AuthEndpoints;
import com.webapp.holidate.constants.enpoint.auth.EmailEndpoints;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SecurityConfig {
  private String[] PUBLIC_AUTH_POST_ENDPOINTS = {
    AuthEndpoints.AUTH + AuthEndpoints.LOGIN,
    AuthEndpoints.AUTH + AuthEndpoints.LOGOUT,
    AuthEndpoints.AUTH + AuthEndpoints.VERIFY_TOKEN,
    AuthEndpoints.AUTH + EmailEndpoints.EMAIL + EmailEndpoints.SEND_VERIFICATION_EMAIL,
    AuthEndpoints.AUTH + EmailEndpoints.EMAIL + EmailEndpoints.RESEND_VERIFICATION_EMAIL,
    AuthEndpoints.AUTH + EmailEndpoints.EMAIL + EmailEndpoints.VERIFY_EMAIL,
  };

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(request ->
      request
        .requestMatchers(HttpMethod.POST, PUBLIC_AUTH_POST_ENDPOINTS).permitAll()
        .requestMatchers(("/**")).permitAll()
        .anyRequest().authenticated()
    );

    http
      .formLogin(FormLoginConfigurer::disable)
      .csrf(CsrfConfigurer::disable);

    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(10);
  }
}
