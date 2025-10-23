package com.webapp.holidate.repository.booking;

import com.webapp.holidate.entity.booking.Booking;
import com.webapp.holidate.entity.booking.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, String> {
}
