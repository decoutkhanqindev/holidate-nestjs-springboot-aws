package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.City;
import com.webapp.holidate.entity.location.Province;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CityRepository extends JpaRepository<City, String> {
  boolean existsByCode(String code);
}
