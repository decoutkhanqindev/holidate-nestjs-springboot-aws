package com.webapp.holidate.repository.booking;

import com.webapp.holidate.entity.booking.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, String> {
}
