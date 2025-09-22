package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.District;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DistrictRepository extends JpaRepository<District, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByCityId(String cityId);
}
