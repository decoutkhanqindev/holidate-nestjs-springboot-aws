package com.webapp.holidate.component.scheduler;

import com.webapp.holidate.service.accommodation.room.DynamicPricingService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PricingScheduler {
  DynamicPricingService service;

  @Scheduled(cron = "0 0 1 * * *") // runs daily at 1 AM
  public void runDynamicPricingUpdate() {
    service.applyDynamicPricing();
  }
}
