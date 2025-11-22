package com.webapp.holidate.component.scheduler;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.webapp.holidate.service.report.PartnerReportService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PartnerReportScheduler {

  PartnerReportService partnerReportService;

  /**
   * Generate daily reports for partners (hotels) for the previous day (T-1).
   * 
   * NOTE: Currently set to 13:40 for testing purposes.
   * Production schedule: Runs daily at 2:00 AM as specified in the documentation.
   */
  @Scheduled(cron = "0 40 13 * * *") // TEST: runs daily at 13:40 (1:40 PM). Production: "0 0 2 * * *" (2:00 AM)
  public void generateDailyReports() {
    try {
      // Calculate report date (yesterday, T-1)
      LocalDate reportDate = LocalDate.now().minusDays(1);

      log.info("Starting scheduled partner daily report generation for date: {}", reportDate);
      partnerReportService.generateDailyReports(reportDate);
      log.info("Completed scheduled partner daily report generation for date: {}", reportDate);

    } catch (Exception e) {
      log.error("Error in scheduled partner daily report generation: {}", e.getMessage(), e);
      // Don't rethrow - let the scheduler continue for next run
      // The transaction will be rolled back automatically
    }
  }
}
