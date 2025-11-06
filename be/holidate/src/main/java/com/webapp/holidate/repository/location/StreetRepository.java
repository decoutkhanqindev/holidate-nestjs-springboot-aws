package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.Street;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StreetRepository extends JpaRepository<Street, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByWardId(String wardId);

  boolean existsByNameAndWardId(String name, String wardId);

  boolean existsByCodeAndWardId(String code, String wardId);

  List<Street> findAllByNameContainingIgnoreCase(String name);

  List<Street> findAllByWardId(String wardId);

  List<Street> findAllByNameContainingIgnoreCaseAndWardId(String name, String wardId);

  long countByWardId(String wardId);
}
