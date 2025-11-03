package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.Ward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WardRepository extends JpaRepository<Ward, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByDistrictId(String districtId);

  List<Ward> findAllByNameContainingIgnoreCase(String name);

  List<Ward> findAllByDistrictId(String districtId);

  List<Ward> findAllByNameContainingIgnoreCaseAndDistrictId(String name, String districtId);

  long countByDistrictId(String districtId);
}
