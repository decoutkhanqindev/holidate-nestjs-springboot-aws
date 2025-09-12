package com.webapp.holidate.repository;

import com.webapp.holidate.constants.db.AuthQueries;
import com.webapp.holidate.entity.UserAuthInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserAuthInfoRepository extends JpaRepository<UserAuthInfo, String> {
  @Query(AuthQueries.FIND_USER_AUTH_INFO_BY_EMAIL)
  Optional<UserAuthInfo> findByEmail(String email);
}
