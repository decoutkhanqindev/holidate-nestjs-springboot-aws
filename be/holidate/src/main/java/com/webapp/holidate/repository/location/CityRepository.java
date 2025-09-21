package com.webapp.holidate.repository.location;

import com.webapp.holidate.constants.db.query.location.CityQueries;
import com.webapp.holidate.entity.location.City;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CityRepository extends CrudRepository<City, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByProvinceId(String provinceId);

  @Query(CityQueries.FIND_ALL_BY_NAME_AND_PROVINCE_ID)
  List<City> findByNameAndProvinceId(String name, String provinceId);
}
