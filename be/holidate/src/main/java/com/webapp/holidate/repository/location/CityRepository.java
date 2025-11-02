package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CityRepository extends JpaRepository<City, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByProvinceId(String provinceId);

  List<City> findAllByNameContainingIgnoreCase(String name);

  List<City> findAllByProvinceId(String provinceId);

  List<City> findAllByNameContainingIgnoreCaseAndProvinceId(String name, String provinceId);

  long countByProvinceId(String provinceId);
}
