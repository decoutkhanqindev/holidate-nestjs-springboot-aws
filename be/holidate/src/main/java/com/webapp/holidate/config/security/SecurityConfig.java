package com.webapp.holidate.config.security;


import com.webapp.holidate.constants.enpoint.auth.AuthEndpoints;
import com.webapp.holidate.constants.enpoint.auth.EmailEndpoints;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.service.auth.GoogleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

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

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(request ->
      request
        .requestMatchers(HttpMethod.POST, PUBLIC_AUTH_POST_ENDPOINTS).permitAll()
        .requestMatchers(("/**")).permitAll()
        .anyRequest().authenticated()
    );

    http
      .oauth2Login(oauth2 ->
        oauth2
          .userInfoEndpoint(userInfo ->
            userInfo.userService(googleService)
          )
          .successHandler(successHandler)
          .failureHandler(failureHandler)
      )
      .formLogin(FormLoginConfigurer::disable)
      .csrf(CsrfConfigurer::disable);

    return http.build();
  }
}
