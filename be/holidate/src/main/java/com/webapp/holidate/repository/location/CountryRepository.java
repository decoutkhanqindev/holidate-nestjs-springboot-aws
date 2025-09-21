package com.webapp.holidate.repository.location;

import com.webapp.holidate.entity.location.Country;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CountryRepository extends JpaRepository<Country, String> {
  boolean existsByCode(String code);
}
