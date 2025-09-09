package com.webapp.holidate.repository;

import com.webapp.holidate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
  boolean existsByFullName(String fullName);
  boolean existsByEmail(String email);
  User findByEmail(String email);
}
