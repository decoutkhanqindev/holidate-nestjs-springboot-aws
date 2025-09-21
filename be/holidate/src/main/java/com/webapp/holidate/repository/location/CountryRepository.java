package com.webapp.holidate.repository.location;

import com.webapp.holidate.constants.db.query.location.CountryQueries;
import com.webapp.holidate.entity.location.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);

  @Query(CountryQueries.FIND_ALL_BY_NAME)
  List<Country> findAllByName(String name);
}
