package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.District;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DistrictRepository extends JpaRepository<District, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByCityId(String cityId);

  List<District> findAllByNameContainingIgnoreCase(String name);

  List<District> findAllByCityId(String cityId);

  List<District> findAllByNameContainingIgnoreCaseAndCityId(String name, String cityId);
}
