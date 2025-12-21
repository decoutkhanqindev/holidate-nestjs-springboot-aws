package com.webapp.holidate.component.scheduler;

import com.webapp.holidate.service.accommodation.room.DynamicPricingService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PricingScheduler {
  DynamicPricingService service;

  /**
   * Apply dynamic pricing updates for room inventories.
   * Runs daily at 1:00 AM.
   */
  @Scheduled(cron = "0 0 1 * * *") // runs daily at 1 AM
  public void runDynamicPricingUpdate() {
    try {
      log.info("Starting scheduled dynamic pricing update");
      service.applyDynamicPricing();
      log.info("Completed scheduled dynamic pricing update");
    } catch (Exception e) {
      log.error("Error in scheduled dynamic pricing update: {}", e.getMessage(), e);
      // Don't rethrow - let the scheduler continue for next run
      // The transaction will be rolled back automatically
    }
  }
}
