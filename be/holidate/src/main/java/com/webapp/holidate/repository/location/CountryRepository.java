package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CountryRepository extends JpaRepository<Country, String> {
  boolean existsByName(String name);

  boolean existsByCode(String code);
}
