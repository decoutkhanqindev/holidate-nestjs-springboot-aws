package com.webapp.holidate.config.security;


import com.webapp.holidate.config.security.oauth2.CustomOAuth2AuthenticationFailureHandler;
import com.webapp.holidate.config.security.oauth2.CustomOAuth2AuthenticationSuccessHandler;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.constants.enpoint.auth.AuthEndpoints;
import com.webapp.holidate.constants.enpoint.auth.EmailEndpoints;
import com.webapp.holidate.service.auth.GoogleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SecurityConfig {
  private String[] PUBLIC_AUTH_POST_ENDPOINTS = {
    AuthEndpoints.AUTH + AuthEndpoints.LOGIN,
    AuthEndpoints.AUTH + AuthEndpoints.LOGOUT,
    AuthEndpoints.AUTH + AuthEndpoints.VERIFY_TOKEN,
    AuthEndpoints.AUTH + AuthEndpoints.REFRESH_TOKEN,
    AuthEndpoints.AUTH + EmailEndpoints.EMAIL + EmailEndpoints.SEND_VERIFICATION_EMAIL,
    AuthEndpoints.AUTH + EmailEndpoints.EMAIL + EmailEndpoints.RESEND_VERIFICATION_EMAIL,
    AuthEndpoints.AUTH + EmailEndpoints.EMAIL + EmailEndpoints.VERIFY_EMAIL,
  };

  GoogleService googleService;
  CustomOAuth2AuthenticationSuccessHandler successHandler;
  CustomOAuth2AuthenticationFailureHandler failureHandler;

  @NonFinal
  @Value(AppValues.FRONTEND_URL)
  String frontendUrl;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(request ->
      request
        .requestMatchers(HttpMethod.POST, PUBLIC_AUTH_POST_ENDPOINTS).permitAll()
        .requestMatchers(("/**")).permitAll()
        .anyRequest().authenticated()
    );

    http
      .csrf(CsrfConfigurer::disable)
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .oauth2Login(oauth2 ->
        oauth2
          .userInfoEndpoint(userInfo ->
            userInfo.userService(googleService)
          )
          .successHandler(successHandler)
          .failureHandler(failureHandler)
      )
      .formLogin(FormLoginConfigurer::disable);

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration corsConfiguration = new CorsConfiguration();
    corsConfiguration.setAllowedOrigins(List.of(frontendUrl));
    corsConfiguration.setAllowedMethods(List.of("*"));
    corsConfiguration.setAllowedHeaders(List.of("*"));
    corsConfiguration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
    urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

    return urlBasedCorsConfigurationSource;
  }
}
