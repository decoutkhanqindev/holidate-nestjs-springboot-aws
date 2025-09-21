package com.webapp.holidate.repository.location;

import com.webapp.holidate.constants.db.query.location.ProvinceQueries;
import com.webapp.holidate.entity.location.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProvinceRepository extends JpaRepository<Province, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  boolean existsByCountryId(String countryId);

  @Query(ProvinceQueries.FIND_ALL_BY_NAME_AND_COUNTRY_ID)
  List<Province> findAllByNameAndCountryId(String name, String countryId);
}
