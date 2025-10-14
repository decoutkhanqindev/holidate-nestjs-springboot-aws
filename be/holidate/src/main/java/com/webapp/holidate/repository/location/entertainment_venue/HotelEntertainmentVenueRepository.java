package com.webapp.holidate.repository.location.entertainment_venue;

import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenueCategory;
import com.webapp.holidate.entity.location.entertainment_venue.HotelEntertainmentVenue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelEntertainmentVenueRepository extends JpaRepository<HotelEntertainmentVenue, String> {
}
