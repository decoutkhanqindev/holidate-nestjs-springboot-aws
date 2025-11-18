package com.webapp.holidate.component.scheduler;

import com.webapp.holidate.service.report.AdminReportService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AdminReportScheduler {

  AdminReportService adminReportService;

  /**
   * Generate system daily reports for the previous day (T-1).
   * Runs daily at 2:30 AM, 30 minutes after the partner report job (2:00 AM)
   * to ensure partner reports are completed first.
   */
  @Scheduled(cron = "0 30 2 * * *") // runs daily at 2:30 AM
  public void generateSystemDailyReports() {
    try {
      // Calculate report date (yesterday, T-1)
      LocalDate reportDate = LocalDate.now().minusDays(1);

      log.info("Starting scheduled system daily report generation for date: {}", reportDate);
      adminReportService.generateSystemDailyReport(reportDate);
      log.info("Completed scheduled system daily report generation for date: {}", reportDate);

    } catch (Exception e) {
      log.error("Error in scheduled system daily report generation: {}", e.getMessage(), e);
      // Don't rethrow - let the scheduler continue for next run
      // The transaction will be rolled back automatically
    }
  }
}

