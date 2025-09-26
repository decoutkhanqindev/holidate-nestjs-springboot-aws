package com.webapp.holidate.repository.accomodation;

import com.webapp.holidate.entity.acommodation.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelRepository extends JpaRepository<Hotel, String> {
  boolean existsByName(String name);
}
