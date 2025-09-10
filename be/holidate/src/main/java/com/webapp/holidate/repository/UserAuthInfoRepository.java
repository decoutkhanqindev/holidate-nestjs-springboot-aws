package com.webapp.holidate.repository;

import com.webapp.holidate.entity.UserAuthInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAuthInfoRepository extends JpaRepository<UserAuthInfo, String> {
  Optional<UserAuthInfo> findByEmailVerificationToken(String token);
  Optional<UserAuthInfo> findByUserEmail(String email);
}
