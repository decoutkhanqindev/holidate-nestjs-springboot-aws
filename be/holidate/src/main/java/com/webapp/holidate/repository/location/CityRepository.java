package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface CityRepository extends JpaRepository<City, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByProvinceId(String provinceId);
}
