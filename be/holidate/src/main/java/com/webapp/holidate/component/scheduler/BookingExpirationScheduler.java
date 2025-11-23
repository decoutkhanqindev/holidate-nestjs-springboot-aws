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

  /**
   * Cancel expired bookings (pending payment for more than 15 minutes).
   * Runs every 5 minutes.
   */
  @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 milliseconds
  public void cancelExpiredBookings() {
    try {
      log.info("Starting scheduled cancellation of expired bookings");
      bookingService.cancelExpiredBookings();
      log.info("Completed scheduled cancellation of expired bookings");
    } catch (Exception e) {
      log.error("Error in scheduled cancellation of expired bookings: {}", e.getMessage(), e);
      // Don't rethrow - let the scheduler continue for next run
      // The transaction will be rolled back automatically
    }
  }

  /**
   * Cancel no-show bookings (check-in date was yesterday but guest didn't check in).
   * Runs daily at 12:00 PM (noon).
   */
  @Scheduled(cron = "0 0 12 * * *") // runs daily at 12:00 PM (noon)
  public void cancelNoShowBookings() {
    try {
      log.info("Starting scheduled cancellation of no-show bookings");
      bookingService.cancelNoShowBookings();
      log.info("Completed scheduled cancellation of no-show bookings");
    } catch (Exception e) {
      log.error("Error in scheduled cancellation of no-show bookings: {}", e.getMessage(), e);
      // Don't rethrow - let the scheduler continue for next run
      // The transaction will be rolled back automatically
    }
  }
}