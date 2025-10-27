package com.webapp.holidate.component.scheduler;

import com.webapp.holidate.service.booking.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class BookingExpirationScheduler {
  BookingService bookingService;

  @Scheduled(fixedRate = 300000) // runs every 5 minutes
  public void cancelExpiredBookings() {
    bookingService.cancelExpiredBookings();
  }
}
