package com.webapp.holidate.repository.location;

import com.webapp.holidate.constants.db.query.location.LocationQueries;
import com.webapp.holidate.entity.location.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WardRepository extends JpaRepository<Ward, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByDistrictId(String districtId);

  boolean existsByNameAndDistrictId(String name, String districtId);

  boolean existsByCodeAndDistrictId(String code, String districtId);

  List<Ward> findAllByNameContainingIgnoreCase(String name);

  List<Ward> findAllByDistrictId(String districtId);

  List<Ward> findAllByNameContainingIgnoreCaseAndDistrictId(String name, String districtId);

  long countByDistrictId(String districtId);

  @Query(LocationQueries.FIND_WARD_BY_ID_WITH_DISTRICT_AND_CITY)
  Optional<Ward> findByIdWithDistrictAndCity(String id);
}
