package com.webapp.holidate.component.scheduler;

import com.webapp.holidate.service.booking.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class BookingExpirationScheduler {
  BookingService bookingService;

  @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 milliseconds
  public void cancelExpiredBookings() {
    bookingService.cancelExpiredBookings();
  }
}