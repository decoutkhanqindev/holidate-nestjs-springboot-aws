package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.Street;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StreetRepository extends JpaRepository<Street, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByWardId(String wardId);
}
