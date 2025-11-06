package com.webapp.holidate.repository.location;

import com.webapp.holidate.constants.db.query.location.LocationQueries;
import com.webapp.holidate.entity.location.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DistrictRepository extends JpaRepository<District, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByCityId(String cityId);

  boolean existsByNameAndCityId(String name, String cityId);

  boolean existsByCodeAndCityId(String code, String cityId);

  List<District> findAllByNameContainingIgnoreCase(String name);

  List<District> findAllByCityId(String cityId);

  List<District> findAllByNameContainingIgnoreCaseAndCityId(String name, String cityId);

  long countByCityId(String cityId);

  @Query(LocationQueries.FIND_DISTRICT_BY_ID_WITH_CITY_AND_PROVINCE)
  Optional<District> findByIdWithCityAndProvince(String id);
}
