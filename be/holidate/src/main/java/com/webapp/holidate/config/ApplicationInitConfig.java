package com.webapp.holidate.config;

import com.webapp.holidate.constants.AppValues;
import com.webapp.holidate.constants.EnvVariables;
import com.webapp.holidate.entity.Role;
import com.webapp.holidate.entity.User;
import com.webapp.holidate.entity.UserAuthInfo;
import com.webapp.holidate.repository.RoleRepository;
import com.webapp.holidate.repository.UserRepository;
import com.webapp.holidate.type.AuthProviderType;
import com.webapp.holidate.type.RoleType;
import lombok.AccessLevel;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ApplicationInitConfig {
  UserRepository userRepository;
  RoleRepository roleRepository;
  PasswordEncoder passwordEncoder;

  @NonFinal
  @Value(AppValues.ADMIN_EMAIL)
  String adminEmail;
  @Value(AppValues.ADMIN_PASSWORD)
  @NonFinal
  String adminPassword;
  @Value(AppValues.ADMIN_FULL_NAME)
  @NonFinal
  String adminFullName;

  @Bean
  public ApplicationRunner applicationRunner() {
    return args -> {
      if (userRepository.existsByFullName(adminFullName)){
        log.info("Admin user already exists. Email: {}, Password: {}, Full Name: {}", adminEmail, adminPassword, adminFullName);
      } else {
        createAdminUser();
      }
    };
  }

  private void createAdminUser() {
    String encodedPassword = passwordEncoder.encode(adminPassword);
    Role role = roleRepository.findByName(RoleType.ADMIN.getValue());

    User user = User.builder()
      .email(adminEmail)
      .password(encodedPassword)
      .fullName(adminFullName)
      .role(role)
      .build();

    UserAuthInfo userAuthInfo = UserAuthInfo.builder()
      .authProvider(AuthProviderType.LOCAL.getValue())
      .active(true)
      .user(user)
      .build();

    user.setAuthInfo(userAuthInfo);

    userRepository.save(user);
    log.info("Admin user created. Email: {}, Password: {}, Full Name: {}", adminEmail, adminPassword, adminFullName);
  }
}
