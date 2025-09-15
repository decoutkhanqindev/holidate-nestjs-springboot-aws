package com.webapp.holidate.repository;

import com.webapp.holidate.entity.InvalidToken;
import com.webapp.holidate.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvalidTokenRepository extends JpaRepository<InvalidToken, String> {
}
