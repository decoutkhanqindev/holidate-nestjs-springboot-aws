package com.webapp.holidate.repository.amenity;

import com.webapp.holidate.entity.accommodation.amenity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AmenityRepository extends JpaRepository<Amenity, String> {
  boolean existsByName(String name);
}
