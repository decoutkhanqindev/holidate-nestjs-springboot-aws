package com.webapp.holidate.repository.user;

import com.webapp.holidate.entity.user.InvalidToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvalidTokenRepository extends JpaRepository<InvalidToken, String> {
}
