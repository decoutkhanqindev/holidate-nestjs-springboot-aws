package com.webapp.holidate.repository.user;

import com.webapp.holidate.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
  boolean existsByFullName(String fullName);

  Optional<User> findByEmail(String email);

  long countByRoleId(String roleId);
}
