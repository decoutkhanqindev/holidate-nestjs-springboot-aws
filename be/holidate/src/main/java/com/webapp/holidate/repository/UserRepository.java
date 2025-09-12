package com.webapp.holidate.repository;

import com.webapp.holidate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
  boolean existsByFullName(String fullName);
  boolean existsByEmail(String email);
  Optional<User> findByEmail(String email);
}
