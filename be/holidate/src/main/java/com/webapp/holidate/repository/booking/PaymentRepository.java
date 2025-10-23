package com.webapp.holidate.repository.booking;

import com.webapp.holidate.entity.booking.Booking;
import com.webapp.holidate.entity.booking.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, String> {
}
