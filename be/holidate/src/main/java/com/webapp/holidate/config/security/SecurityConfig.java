package com.webapp.holidate.config.security;


import com.webapp.holidate.config.security.oauth2.CustomOAuth2AuthenticationFailureHandler;
import com.webapp.holidate.config.security.oauth2.CustomOAuth2AuthenticationSuccessHandler;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.constants.enpoint.RoleEndpoints;
import com.webapp.holidate.constants.enpoint.UserEndpoints;
import com.webapp.holidate.constants.enpoint.auth.AuthEndpoints;
import com.webapp.holidate.constants.enpoint.auth.EmailEndpoints;
import com.webapp.holidate.service.auth.GoogleService;
import com.webapp.holidate.type.RoleType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SecurityConfig {
  String[] PUBLIC_AUTH_ENDPOINTS = {
    AuthEndpoints.AUTH + AuthEndpoints.REGISTER,
    AuthEndpoints.AUTH + AuthEndpoints.LOGIN,
    AuthEndpoints.AUTH + AuthEndpoints.LOGOUT,
    AuthEndpoints.AUTH + AuthEndpoints.VERIFY_TOKEN,
    AuthEndpoints.AUTH + AuthEndpoints.REFRESH_TOKEN,
    AuthEndpoints.AUTH + EmailEndpoints.EMAIL + EmailEndpoints.SEND_VERIFICATION_EMAIL,
    AuthEndpoints.AUTH + EmailEndpoints.EMAIL + EmailEndpoints.RESEND_VERIFICATION_EMAIL,
    AuthEndpoints.AUTH + EmailEndpoints.EMAIL + EmailEndpoints.VERIFY_EMAIL,
  };

  String[] PRIVATE_USER_ENDPOINTS = {
    UserEndpoints.USERS,
    UserEndpoints.USERS + UserEndpoints.USER_ID
  };

  String[] PRIVATE_ROLE_ENDPOINTS = {
    RoleEndpoints.ROLES,
    RoleEndpoints.ROLES + RoleEndpoints.ROLE_ID
  };

  GoogleService googleService;
  CustomOAuth2AuthenticationSuccessHandler successHandler;
  CustomOAuth2AuthenticationFailureHandler failureHandler;

  CustomJwtDecoder jwtDecoder;
  CustomAuthenticationEntryPoint authenticationEntryPoint;
  CustomAccessDeniedHandler accessDeniedHandler;

  @NonFinal
  @Value(AppValues.FRONTEND_URL)
  String frontendUrl;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .authorizeHttpRequests(request ->
        request
          .requestMatchers(PUBLIC_AUTH_ENDPOINTS).permitAll()
          .requestMatchers(PRIVATE_USER_ENDPOINTS).hasAuthority(RoleType.ADMIN.getValue())
          .requestMatchers(PRIVATE_ROLE_ENDPOINTS).hasAuthority(RoleType.ADMIN.getValue())
          .anyRequest().authenticated()
      );

    http
      .csrf(CsrfConfigurer::disable)
      .cors(corsConfigurer -> corsConfigurer.configurationSource(corsConfigurationSource()))
      .oauth2Login(oAuth2LoginConfigurer ->
        oAuth2LoginConfigurer
          .userInfoEndpoint(userInfoEndpointConfig -> userInfoEndpointConfig.userService(googleService))
          .successHandler(successHandler)
          .failureHandler(failureHandler)
      )
      .formLogin(FormLoginConfigurer::disable);

    http
      .oauth2ResourceServer(oAuth2ResourceServerConfigurer ->
        oAuth2ResourceServerConfigurer
          .jwt(jwtConfigurer ->
            jwtConfigurer
              .decoder(jwtDecoder)
              .jwtAuthenticationConverter(jwtAuthenticationConverter())
          )
          .authenticationEntryPoint(authenticationEntryPoint)
          .accessDeniedHandler(accessDeniedHandler)
      );

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

  @Bean
  public JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
    grantedAuthoritiesConverter.setAuthoritiesClaimName("scope");
    grantedAuthoritiesConverter.setAuthorityPrefix("");

    JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
    jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);

    return jwtAuthenticationConverter;
  }
}
