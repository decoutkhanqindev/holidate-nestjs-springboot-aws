package com.webapp.holidate.repository.amenity;

import com.webapp.holidate.entity.amenity.AmenityCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AmenityCategoryRepository extends JpaRepository<AmenityCategory, String> {
  boolean existsByName(String name);
}
