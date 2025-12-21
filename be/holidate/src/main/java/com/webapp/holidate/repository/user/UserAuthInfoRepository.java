package com.webapp.holidate.repository.user;

import com.webapp.holidate.constants.db.query.AuthQueries;
import com.webapp.holidate.entity.user.UserAuthInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserAuthInfoRepository extends JpaRepository<UserAuthInfo, String> {
  @Query(AuthQueries.FIND_USER_AUTH_INFO_BY_USER_EMAIL)
  Optional<UserAuthInfo> findByUserEmail(String email);
}
