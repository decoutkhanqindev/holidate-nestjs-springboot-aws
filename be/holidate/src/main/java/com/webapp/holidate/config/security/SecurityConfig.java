package com.webapp.holidate.config.security;

import com.webapp.holidate.component.security.CustomAccessDeniedHandler;
import com.webapp.holidate.component.security.CustomAuthenticationEntryPoint;
import com.webapp.holidate.component.security.CustomJwtDecoder;
import com.webapp.holidate.component.security.filter.CustomCookieAuthenticationFilter;
import com.webapp.holidate.component.security.oauth2.CustomOAuth2AuthenticationFailureHandler;
import com.webapp.holidate.component.security.oauth2.CustomOAuth2AuthenticationSuccessHandler;
import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.constants.api.endpoint.*;
import com.webapp.holidate.constants.api.endpoint.auth.AuthEndpoints;
import com.webapp.holidate.service.auth.GoogleService;
import com.webapp.holidate.type.user.RoleType;
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
  @Value(AppProperties.FRONTEND_URL)
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
        .requestMatchers(HttpMethod.GET,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.HOTELS
                + ALL_ENDPOINTS)
        .permitAll()
        .requestMatchers(HttpMethod.GET,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS)
        .permitAll()
        .requestMatchers(HttpMethod.GET,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + CommonEndpoints.ID)
        .permitAll()
        // 3.1. room inventory endpoints - must be protected (not public)
        .requestMatchers(HttpMethod.GET,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + AccommodationEndpoints.ROOM_INVENTORIES
                + ALL_ENDPOINTS)
        .hasAnyAuthority(RoleType.ADMIN.getValue(), RoleType.PARTNER.getValue())
        // 4. amenity endpoints
        .requestMatchers(HttpMethod.GET, AmenityEndpoints.AMENITY + ALL_ENDPOINTS).permitAll()
        // 5. special day endpoints
        .requestMatchers(HttpMethod.GET, SpecialDayEndpoints.SPECIAL_DAYS + ALL_ENDPOINTS)
        .permitAll()
        // 6. discount endpoints
        .requestMatchers(HttpMethod.GET, DiscountEndpoints.DISCOUNTS + ALL_ENDPOINTS)
        .permitAll()
        // 7. review endpoints
        .requestMatchers(HttpMethod.GET, BookingEndpoints.REVIEWS + ALL_ENDPOINTS)
        .permitAll()
        // 8. payment callback endpoints (VNPay callback)
        .requestMatchers(HttpMethod.GET, BookingEndpoints.PAYMENT + BookingEndpoints.CALLBACK)
        .permitAll()

        // B. protected endpoints
        // I. user role
        // 1. profile endpoints
        .requestMatchers(HttpMethod.GET, UserEndpoints.USERS + CommonEndpoints.ID)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.PUT, UserEndpoints.USERS + CommonEndpoints.ID)
        .hasAuthority(RoleType.USER.getValue())
        // 2. booking endpoints
        .requestMatchers(HttpMethod.POST, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + BookingEndpoints.PRICE_PREVIEW
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.CANCEL)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.RESCHEDULE)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS + CommonEndpoints.ID)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.CHECKIN)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.CHECKOUT)
        .hasAuthority(RoleType.USER.getValue())
        // 3. review endpoints
        .requestMatchers(HttpMethod.POST, BookingEndpoints.REVIEWS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.PUT, BookingEndpoints.REVIEWS + CommonEndpoints.ID)
        .hasAuthority(RoleType.USER.getValue())
        .requestMatchers(HttpMethod.DELETE, BookingEndpoints.REVIEWS + CommonEndpoints.ID)
        .hasAuthority(RoleType.USER.getValue())

        // II. partner role
        // 1. profile endpoints
        .requestMatchers(HttpMethod.GET, UserEndpoints.USERS + CommonEndpoints.ID)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.PUT, UserEndpoints.USERS + CommonEndpoints.ID)
        .hasAuthority(RoleType.PARTNER.getValue())
        // 2. room management endpoints (partner specific)
        .requestMatchers(HttpMethod.POST,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.GET,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.GET,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + CommonEndpoints.ID)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.PUT,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + CommonEndpoints.ID)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.DELETE,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + CommonEndpoints.ID)
        .hasAuthority(RoleType.PARTNER.getValue())
        // 2.1. room inventory management endpoints (partner specific)
        .requestMatchers(HttpMethod.POST,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + AccommodationEndpoints.ROOM_INVENTORIES
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.PUT,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + AccommodationEndpoints.ROOM_INVENTORIES
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.DELETE,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + AccommodationEndpoints.ROOM_INVENTORIES
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.PARTNER.getValue())
        // 3. booking endpoints
        .requestMatchers(HttpMethod.POST, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + BookingEndpoints.PRICE_PREVIEW
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.CANCEL)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.RESCHEDULE)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS + CommonEndpoints.ID)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.DELETE, BookingEndpoints.BOOKINGS + CommonEndpoints.ID)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.CHECKIN)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.CHECKOUT)
        .hasAuthority(RoleType.PARTNER.getValue())
        // 4. review endpoints
        .requestMatchers(HttpMethod.POST, BookingEndpoints.REVIEWS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.PUT, BookingEndpoints.REVIEWS + CommonEndpoints.ID)
        .hasAuthority(RoleType.PARTNER.getValue())
        .requestMatchers(HttpMethod.DELETE, BookingEndpoints.REVIEWS + CommonEndpoints.ID)
        .hasAuthority(RoleType.PARTNER.getValue())

        // III. admin role
        // 1. profile endpoints
        .requestMatchers(UserEndpoints.USERS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(UserEndpoints.ROLES + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 2. location endpoints
        .requestMatchers(LocationEndpoints.LOCATION + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 3. accommodation endpoints
        .requestMatchers(HttpMethod.POST, AccommodationEndpoints.ACCOMMODATION + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.GET, AccommodationEndpoints.ACCOMMODATION + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.PUT, AccommodationEndpoints.ACCOMMODATION + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.DELETE,
            AccommodationEndpoints.ACCOMMODATION + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 3.1. room management endpoints (admin can also manage rooms)
        .requestMatchers(HttpMethod.POST,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.GET,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.GET,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + CommonEndpoints.ID)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.PUT,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + CommonEndpoints.ID)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.DELETE,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + CommonEndpoints.ID)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 3.2. room inventory management endpoints (admin can also manage room
        // inventories)
        .requestMatchers(HttpMethod.POST,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + AccommodationEndpoints.ROOM_INVENTORIES
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.PUT,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + AccommodationEndpoints.ROOM_INVENTORIES
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.DELETE,
            AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                + AccommodationEndpoints.ROOM_INVENTORIES
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 4. amenity endpoints
        .requestMatchers(HttpMethod.POST, AmenityEndpoints.AMENITY + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.PUT, AmenityEndpoints.AMENITY + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.DELETE, AmenityEndpoints.AMENITY + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 4.1. amenity category endpoints
        .requestMatchers(HttpMethod.POST,
            AmenityEndpoints.AMENITY + AmenityEndpoints.AMENITY_CATEGORIES + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.DELETE,
            AmenityEndpoints.AMENITY + AmenityEndpoints.AMENITY_CATEGORIES + CommonEndpoints.ID)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 5. special day endpoints
        .requestMatchers(HttpMethod.POST, SpecialDayEndpoints.SPECIAL_DAYS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.PUT, SpecialDayEndpoints.SPECIAL_DAYS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.DELETE, SpecialDayEndpoints.SPECIAL_DAYS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 6. discount endpoints
        .requestMatchers(HttpMethod.POST, DiscountEndpoints.DISCOUNTS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.PUT, DiscountEndpoints.DISCOUNTS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.DELETE, DiscountEndpoints.DISCOUNTS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 7. booking endpoints
        .requestMatchers(HttpMethod.POST, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.PUT, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.DELETE, BookingEndpoints.BOOKINGS + CommonEndpoints.ID)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + BookingEndpoints.PRICE_PREVIEW
                + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.CANCEL)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.RESCHEDULE)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.CHECKIN)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.POST,
            BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                + BookingEndpoints.CHECKOUT)
        .hasAuthority(RoleType.ADMIN.getValue())
        // 8. review endpoints
        .requestMatchers(HttpMethod.POST, BookingEndpoints.REVIEWS + ALL_ENDPOINTS)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.PUT, BookingEndpoints.REVIEWS + CommonEndpoints.ID)
        .hasAuthority(RoleType.ADMIN.getValue())
        .requestMatchers(HttpMethod.DELETE, BookingEndpoints.REVIEWS + CommonEndpoints.ID)
        .hasAuthority(RoleType.ADMIN.getValue())

        // C. any other endpoints
        .anyRequest().authenticated());

    http
        .csrf(CsrfConfigurer::disable)
        .cors(corsConfigurer -> corsConfigurer.configurationSource(corsConfigurationSource()))
        .oauth2Login(oAuth2LoginConfigurer -> oAuth2LoginConfigurer
            .userInfoEndpoint(userInfoEndpointConfig -> userInfoEndpointConfig
                .userService(googleService))
            .successHandler(successHandler)
            .failureHandler(failureHandler))
        .formLogin(FormLoginConfigurer::disable);

    http
        .oauth2ResourceServer(oAuth2ResourceServerConfigurer -> oAuth2ResourceServerConfigurer
            .jwt(jwtConfigurer -> jwtConfigurer
                .decoder(jwtDecoder)
                .jwtAuthenticationConverter(
                    jwtAuthenticationConverter()))
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