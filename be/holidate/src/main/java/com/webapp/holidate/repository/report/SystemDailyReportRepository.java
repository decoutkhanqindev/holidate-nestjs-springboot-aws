package com.webapp.holidate.repository.report;

import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.entity.report.SystemDailyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface SystemDailyReportRepository extends JpaRepository<SystemDailyReport, LocalDate> {

  Optional<SystemDailyReport> findByReportDate(LocalDate reportDate);

  @Modifying
  @Query(value = ReportQueries.UPSERT_SYSTEM_DAILY_REPORT, nativeQuery = true)
  void upsertSystemDailyReport(
      LocalDate reportDate,
      double grossRevenue,
      double netRevenue,
      int totalBookingsCreated,
      int totalBookingsCompleted,
      int totalBookingsCancelled,
      int newCustomersRegistered,
      int newPartnersRegistered,
      Double systemAverageReviewScore,
      int totalReviews,
      LocalDateTime updatedAt);
}
