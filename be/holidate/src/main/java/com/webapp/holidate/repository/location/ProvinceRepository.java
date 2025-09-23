package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProvinceRepository extends JpaRepository<Province, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByCountryId(String countryId);

  List<Province> findAllByNameContainingIgnoreCase(String name);

  List<Province> findAllByCountryId(String countryId);

  List<Province> findAllByNameContainingIgnoreCaseAndCountryId(String name, String countryId);
}
