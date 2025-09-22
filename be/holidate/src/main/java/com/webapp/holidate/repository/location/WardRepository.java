package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.Ward;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WardRepository extends JpaRepository<Ward, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByDistrictId(String districtId);
}
