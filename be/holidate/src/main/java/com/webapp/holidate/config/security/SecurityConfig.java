package com.webapp.holidate.config.security;

import java.util.List;

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
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.webapp.holidate.component.security.CustomAccessDeniedHandler;
import com.webapp.holidate.component.security.CustomAuthenticationEntryPoint;
import com.webapp.holidate.component.security.CustomJwtDecoder;
import com.webapp.holidate.component.security.filter.CustomCookieAuthenticationFilter;
import com.webapp.holidate.component.security.filter.CustomJwtAuthenticationFilter;
import com.webapp.holidate.component.security.oauth2.CustomOAuth2AuthenticationFailureHandler;
import com.webapp.holidate.component.security.oauth2.CustomOAuth2AuthenticationSuccessHandler;
import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.constants.api.endpoint.AccommodationEndpoints;
import com.webapp.holidate.constants.api.endpoint.AmenityEndpoints;
import com.webapp.holidate.constants.api.endpoint.BookingEndpoints;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.endpoint.DashboardEndpoints;
import com.webapp.holidate.constants.api.endpoint.DiscountEndpoints;
import com.webapp.holidate.constants.api.endpoint.DocumentEndpoints;
import com.webapp.holidate.constants.api.endpoint.ImageEndpoints;
import com.webapp.holidate.constants.api.endpoint.KnowledgeBaseEndpoints;
import com.webapp.holidate.constants.api.endpoint.LocationEndpoints;
import com.webapp.holidate.constants.api.endpoint.PolicyEndpoints;
import com.webapp.holidate.constants.api.endpoint.ReportEndpoints;
import com.webapp.holidate.constants.api.endpoint.SpecialDayEndpoints;
import com.webapp.holidate.constants.api.endpoint.UserEndpoints;
import com.webapp.holidate.constants.api.endpoint.auth.AuthEndpoints;
import com.webapp.holidate.service.auth.GoogleService;
import com.webapp.holidate.type.user.RoleType;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;

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
        CustomJwtAuthenticationFilter jwtAuthenticationFilter;

        @NonFinal
        @Value(AppProperties.FRONTEND_URL)
        String frontendUrl;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http.authorizeHttpRequests(request -> request
                                // A. public endpoints
                                // 1. auth endpoints (all auth endpoints are public)
                                .requestMatchers(AuthEndpoints.AUTH + ALL_ENDPOINTS).permitAll()
                                // 2. location endpoints (GET only)
                                .requestMatchers(HttpMethod.GET, LocationEndpoints.LOCATION + ALL_ENDPOINTS).permitAll()
                                // 3. accommodation endpoints
                                // 3.1. hotels (GET only)
                                .requestMatchers(HttpMethod.GET,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.HOTELS
                                                                + ALL_ENDPOINTS)
                                .permitAll()
                                // 3.2. rooms (GET only)
                                .requestMatchers(HttpMethod.GET,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS)
                                .permitAll()
                                .requestMatchers(HttpMethod.GET,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                                                                + CommonEndpoints.ID)
                                .permitAll()
                                // 3.3. room inventory endpoints - must be protected (not public)
                                .requestMatchers(HttpMethod.GET,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                                                                + AccommodationEndpoints.ROOM_INVENTORIES
                                                                + ALL_ENDPOINTS)
                                .hasAnyAuthority(RoleType.ADMIN.getValue(), RoleType.PARTNER.getValue())
                                // 4. amenity endpoints (GET only)
                                .requestMatchers(HttpMethod.GET, AmenityEndpoints.AMENITY + ALL_ENDPOINTS).permitAll()
                                // 4.1. amenity categories (GET only)
                                .requestMatchers(HttpMethod.GET,
                                                AmenityEndpoints.AMENITY + AmenityEndpoints.AMENITY_CATEGORIES
                                                                + ALL_ENDPOINTS)
                                .permitAll()
                                // 4.2. image/photo category endpoints (GET only)
                                .requestMatchers(HttpMethod.GET,
                                                ImageEndpoints.IMAGE + ImageEndpoints.PHOTO_CATEGORIES + ALL_ENDPOINTS)
                                .permitAll()
                                // 5. special day endpoints (GET only)
                                .requestMatchers(HttpMethod.GET, SpecialDayEndpoints.SPECIAL_DAYS + ALL_ENDPOINTS)
                                .permitAll()
                                // 6. discount endpoints (GET only)
                                .requestMatchers(HttpMethod.GET, DiscountEndpoints.DISCOUNTS + ALL_ENDPOINTS)
                                .permitAll()
                                // 7. review endpoints (GET only)
                                .requestMatchers(HttpMethod.GET, BookingEndpoints.REVIEWS + ALL_ENDPOINTS)
                                .permitAll()
                                // 8. payment callback endpoints (VNPay callback)
                                .requestMatchers(HttpMethod.GET, BookingEndpoints.PAYMENT + BookingEndpoints.CALLBACK)
                                .permitAll()

                                // B. protected endpoints
                                // I. user role
                                // 1. profile endpoints (USER and PARTNER can access their own profile)
                                // Note: Authorization logic in controller/service layer determines access based
                                // on ownership (users can only access their own profile)
                                .requestMatchers(HttpMethod.GET, UserEndpoints.USERS + CommonEndpoints.ID)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.PUT, UserEndpoints.USERS + CommonEndpoints.ID)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                // 2. booking endpoints (shared by USER, PARTNER, ADMIN)
                                // Note: Authorization logic in controller/service layer determines access based
                                // on ownership
                                .requestMatchers(HttpMethod.POST, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.POST,
                                                BookingEndpoints.BOOKINGS + BookingEndpoints.PRICE_PREVIEW
                                                                + ALL_ENDPOINTS)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.POST,
                                                BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                                                                + BookingEndpoints.CANCEL)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.POST,
                                                BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                                                                + BookingEndpoints.RESCHEDULE)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS + CommonEndpoints.ID)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.POST,
                                                BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                                                                + BookingEndpoints.CHECKIN)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.POST,
                                                BookingEndpoints.BOOKINGS + CommonEndpoints.ID
                                                                + BookingEndpoints.CHECKOUT)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                // 3. review endpoints (shared by USER, PARTNER, ADMIN)
                                .requestMatchers(HttpMethod.POST, BookingEndpoints.REVIEWS + ALL_ENDPOINTS)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.PUT, BookingEndpoints.REVIEWS + CommonEndpoints.ID)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.DELETE, BookingEndpoints.REVIEWS + CommonEndpoints.ID)
                                .hasAnyAuthority(RoleType.USER.getValue(), RoleType.PARTNER.getValue(),
                                                RoleType.ADMIN.getValue())

                                // II. partner role
                                // Note: Profile endpoints are already defined in USER section above
                                // 2. hotel management endpoints (partner can update hotels they own, but not
                                // create/delete)
                                .requestMatchers(HttpMethod.PUT,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.HOTELS
                                                                + CommonEndpoints.ID)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                // 3. room management endpoints (partner specific)
                                // Note: GET /accommodation/rooms and GET /accommodation/rooms/{id} are public
                                // (see public endpoints section)
                                .requestMatchers(HttpMethod.POST,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                .requestMatchers(HttpMethod.PUT,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                                                                + CommonEndpoints.ID)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                .requestMatchers(HttpMethod.DELETE,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
                                                                + CommonEndpoints.ID)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                // 3.2. policy endpoints (partner and admin can view policies and rules)
                                .requestMatchers(HttpMethod.GET,
                                                PolicyEndpoints.POLICY + PolicyEndpoints.CANCELLATION_POLICIES
                                                                + ALL_ENDPOINTS)
                                .hasAnyAuthority(RoleType.PARTNER.getValue(), RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                PolicyEndpoints.POLICY + PolicyEndpoints.CANCELLATION_RULES
                                                                + ALL_ENDPOINTS)
                                .hasAnyAuthority(RoleType.PARTNER.getValue(), RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                PolicyEndpoints.POLICY + PolicyEndpoints.RESCHEDULE_POLICIES
                                                                + ALL_ENDPOINTS)
                                .hasAnyAuthority(RoleType.PARTNER.getValue(), RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                PolicyEndpoints.POLICY + PolicyEndpoints.RESCHEDULE_RULES
                                                                + ALL_ENDPOINTS)
                                .hasAnyAuthority(RoleType.PARTNER.getValue(), RoleType.ADMIN.getValue())
                                // 3.3. document endpoints (partner and admin can view identification documents)
                                .requestMatchers(HttpMethod.GET,
                                                DocumentEndpoints.DOCUMENT + DocumentEndpoints.IDENTIFICATION_DOCUMENTS
                                                                + ALL_ENDPOINTS)
                                .hasAnyAuthority(RoleType.PARTNER.getValue(), RoleType.ADMIN.getValue())
                                // 3.1. room inventory management endpoints (partner specific)
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
                                // 4. booking endpoints - DELETE (only PARTNER and ADMIN, not USER)
                                .requestMatchers(HttpMethod.DELETE, BookingEndpoints.BOOKINGS + CommonEndpoints.ID)
                                .hasAnyAuthority(RoleType.PARTNER.getValue(), RoleType.ADMIN.getValue())
                                // 5. partner report endpoints
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.PARTNER_REPORTS + ReportEndpoints.REVENUE)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.PARTNER_REPORTS + ReportEndpoints.BOOKINGS_SUMMARY)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.PARTNER_REPORTS + ReportEndpoints.OCCUPANCY)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.PARTNER_REPORTS + ReportEndpoints.ROOMS_PERFORMANCE)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.PARTNER_REPORTS + ReportEndpoints.CUSTOMERS_SUMMARY)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.PARTNER_REPORTS + ReportEndpoints.REVIEWS_SUMMARY)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                // 6. partner dashboard endpoints
                                .requestMatchers(HttpMethod.GET,
                                                DashboardEndpoints.PARTNER_DASHBOARD + DashboardEndpoints.SUMMARY)
                                .hasAuthority(RoleType.PARTNER.getValue())
                                // Note: Other booking endpoints are already defined in USER section above

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
                                // 3.0. hotel management endpoints (only admin can create and delete hotels, not
                                // partner)
                                .requestMatchers(HttpMethod.POST,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.HOTELS
                                                                + ALL_ENDPOINTS)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.PUT,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.HOTELS
                                                                + CommonEndpoints.ID)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.DELETE,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.HOTELS
                                                                + CommonEndpoints.ID)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                // 3.1. room management endpoints (admin can also manage rooms)
                                // Note: GET /accommodation/rooms and GET /accommodation/rooms/{id} are public
                                // (see public endpoints section)
                                .requestMatchers(HttpMethod.POST,
                                                AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS)
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
                                                AmenityEndpoints.AMENITY + AmenityEndpoints.AMENITY_CATEGORIES
                                                                + ALL_ENDPOINTS)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.DELETE,
                                                AmenityEndpoints.AMENITY + AmenityEndpoints.AMENITY_CATEGORIES
                                                                + CommonEndpoints.ID)
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
                                // 7. booking endpoints - PUT (only ADMIN)
                                .requestMatchers(HttpMethod.PUT, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                // Note: Other booking endpoints are already defined in USER section above
                                // Note: DELETE booking endpoint is already defined in PARTNER section above
                                // 8. policy endpoints (admin can also view policies and rules)
                                // Note: GET policy endpoints are already defined in PARTNER section above
                                // 9. document endpoints (admin can also view identification documents)
                                // Note: GET document endpoints are already defined in PARTNER section above
                                // 10. admin report endpoints
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.ADMIN_REPORTS + ReportEndpoints.REVENUE)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.ADMIN_REPORTS + ReportEndpoints.HOTEL_PERFORMANCE)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.ADMIN_REPORTS + ReportEndpoints.USERS_SUMMARY)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.ADMIN_REPORTS + ReportEndpoints.TRENDS + ReportEndpoints.SEASONALITY)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.ADMIN_REPORTS + ReportEndpoints.TRENDS + ReportEndpoints.POPULAR_LOCATIONS)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.ADMIN_REPORTS + ReportEndpoints.TRENDS + ReportEndpoints.POPULAR_ROOM_TYPES)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.GET,
                                                ReportEndpoints.ADMIN_REPORTS + ReportEndpoints.FINANCIALS)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                // 11. generate all report endpoints (admin only)
                                .requestMatchers(HttpMethod.POST,
                                                ReportEndpoints.PARTNER_REPORTS + ReportEndpoints.GENERATE_ALL)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                .requestMatchers(HttpMethod.POST,
                                                ReportEndpoints.ADMIN_REPORTS + ReportEndpoints.GENERATE_ALL)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                // 12. knowledge base endpoints (admin only)
                                .requestMatchers(KnowledgeBaseEndpoints.ADMIN_KB + ALL_ENDPOINTS)
                                .hasAuthority(RoleType.ADMIN.getValue())
                                // 13. admin dashboard endpoints
                                .requestMatchers(HttpMethod.GET,
                                                DashboardEndpoints.ADMIN_DASHBOARD + DashboardEndpoints.SUMMARY)
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
                http.addFilterAfter(jwtAuthenticationFilter,BearerTokenAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        RoleHierarchy roleHierarchy() {
                // ADMIN > PARTNER > USER
                return RoleHierarchyImpl.fromHierarchy(
                                RoleType.ADMIN.getValue() + " > " + RoleType.PARTNER.getValue() + "\n" +
                                                RoleType.PARTNER.getValue() + " > " + RoleType.USER.getValue());
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