package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.Country;
import com.webapp.holidate.entity.location.Province;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProvinceRepository extends JpaRepository<Province, String> {
  boolean existsByCode(String code);
}
