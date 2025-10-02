package com.webapp.holidate.config.security;

import com.webapp.holidate.config.security.filter.CustomCookieAuthenticationFilter;
import com.webapp.holidate.config.security.oauth2.CustomOAuth2AuthenticationFailureHandler;
import com.webapp.holidate.config.security.oauth2.CustomOAuth2AuthenticationSuccessHandler;
import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.constants.api.endpoint.*;
import com.webapp.holidate.constants.api.endpoint.auth.AuthEndpoints;
import com.webapp.holidate.service.auth.GoogleService;
import com.webapp.holidate.type.RoleType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SecurityConfig {
  String ALL_ENDPOINTS = "/**";

  GoogleService googleService;
  CustomOAuth2AuthenticationSuccessHandler successHandler;
  CustomOAuth2AuthenticationFailureHandler failureHandler;

  CustomJwtDecoder jwtDecoder;
  CustomAuthenticationEntryPoint authenticationEntryPoint;
  CustomAccessDeniedHandler accessDeniedHandler;
  CustomCookieAuthenticationFilter cookieAuthenticationFilter;

  @NonFinal
  @Value(AppValues.FRONTEND_URL)
  String frontendUrl;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(request -> request
        // A. public endpoints
        // 1. auth endpoints
        .requestMatchers(AuthEndpoints.AUTH + ALL_ENDPOINTS).permitAll()
        // 2. location endpoints
        .requestMatchers(HttpMethod.GET, LocationEndpoints.LOCATION + ALL_ENDPOINTS).permitAll()
        // 3. accommodation endpoints
        .requestMatchers(HttpMethod.GET, AccommodationEndpoints.ACCOMMODATION + ALL_ENDPOINTS).permitAll()
        // 4. amenity endpoints
        .requestMatchers(HttpMethod.GET, AmenityEndpoints.AMENITY + ALL_ENDPOINTS).permitAll()

        // B. protected endpoints
        // I. user role
        // 1. profile endpoints
        .requestMatchers(HttpMethod.GET, UserEndpoints.USERS + CommonEndpoints.ID)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.PUT, UserEndpoints.USERS + CommonEndpoints.ID)
        .hasAuthority(RoleType.USER.getValue())
        // II. admin role
        // 1. profile endpoints
        .requestMatchers(UserEndpoints.USERS + ALL_ENDPOINTS).hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(UserEndpoints.ROLES + ALL_ENDPOINTS).hasAuthority(RoleType.ADMIN.getValue())
        // 2. location endpoints
        .requestMatchers(LocationEndpoints.LOCATION + ALL_ENDPOINTS).hasAuthority(RoleType.ADMIN.getValue())
        // 3. accommodation endpoints
        .requestMatchers(AccommodationEndpoints.ACCOMMODATION + ALL_ENDPOINTS).hasAuthority(RoleType.ADMIN.getValue())
        // 4. amenity endpoints
        .requestMatchers(AmenityEndpoints.AMENITY + ALL_ENDPOINTS).hasAuthority(RoleType.ADMIN.getValue())

        // C. any other endpoints
        .anyRequest().authenticated());

    http
        .csrf(CsrfConfigurer::disable)
        .cors(corsConfigurer -> corsConfigurer.configurationSource(corsConfigurationSource()))
        .oauth2Login(oAuth2LoginConfigurer -> oAuth2LoginConfigurer
            .userInfoEndpoint(userInfoEndpointConfig -> userInfoEndpointConfig.userService(googleService))
            .successHandler(successHandler)
            .failureHandler(failureHandler))
        .formLogin(FormLoginConfigurer::disable);

    http
        .oauth2ResourceServer(oAuth2ResourceServerConfigurer -> oAuth2ResourceServerConfigurer
            .jwt(jwtConfigurer -> jwtConfigurer
                .decoder(jwtDecoder)
                .jwtAuthenticationConverter(jwtAuthenticationConverter()))
            .authenticationEntryPoint(authenticationEntryPoint)
            .accessDeniedHandler(accessDeniedHandler));

    http.addFilterBefore(cookieAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  RoleHierarchy roleHierarchy() {
    return RoleHierarchyImpl.fromHierarchy(RoleType.ADMIN.getValue() + " > " + RoleType.USER.getValue());
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration corsConfiguration = new CorsConfiguration();
    corsConfiguration.setAllowedOrigins(List.of(frontendUrl));
    corsConfiguration.setAllowedMethods(List.of("*"));
    corsConfiguration.setAllowedHeaders(List.of("*"));
    corsConfiguration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
    urlBasedCorsConfigurationSource.registerCorsConfiguration(ALL_ENDPOINTS, corsConfiguration);

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
