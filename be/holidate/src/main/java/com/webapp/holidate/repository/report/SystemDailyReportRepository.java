package com.webapp.holidate.repository.report;

import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.entity.report.SystemDailyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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

  // Get daily system revenue
  @Query(value = ReportQueries.GET_SYSTEM_DAILY_REVENUE, nativeQuery = true)
  List<Object[]> getSystemDailyRevenue(LocalDate fromDate, LocalDate toDate);

  // Get weekly system revenue
  @Query(value = ReportQueries.GET_SYSTEM_WEEKLY_REVENUE, nativeQuery = true)
  List<Object[]> getSystemWeeklyRevenue(LocalDate fromDate, LocalDate toDate);

  // Get monthly system revenue
  @Query(value = ReportQueries.GET_SYSTEM_MONTHLY_REVENUE, nativeQuery = true)
  List<Object[]> getSystemMonthlyRevenue(LocalDate fromDate, LocalDate toDate);

  // Get total system revenue
  @Query(value = ReportQueries.GET_SYSTEM_TOTAL_REVENUE, nativeQuery = true)
  Double getSystemTotalRevenue(LocalDate fromDate, LocalDate toDate);

  // Get new users growth
  @Query(value = ReportQueries.GET_NEW_USERS_GROWTH, nativeQuery = true)
  Object[] getNewUsersGrowth(LocalDate fromDate, LocalDate toDate);

  // Get seasonality data
  @Query(value = ReportQueries.GET_SEASONALITY_DATA, nativeQuery = true)
  List<Object[]> getSeasonalityData(LocalDate fromDate, LocalDate toDate);

  // Get daily financials data
  @Query(value = ReportQueries.GET_FINANCIALS_DAILY_DATA, nativeQuery = true)
  List<Object[]> getFinancialsDailyData(LocalDate fromDate, LocalDate toDate);

  // Get weekly financials data
  @Query(value = ReportQueries.GET_FINANCIALS_WEEKLY_DATA, nativeQuery = true)
  List<Object[]> getFinancialsWeeklyData(LocalDate fromDate, LocalDate toDate);

  // Get monthly financials data
  @Query(value = ReportQueries.GET_FINANCIALS_MONTHLY_DATA, nativeQuery = true)
  List<Object[]> getFinancialsMonthlyData(LocalDate fromDate, LocalDate toDate);

  // Get total financials for summary
  @Query(value = ReportQueries.GET_FINANCIALS_TOTAL, nativeQuery = true)
  Object[] getFinancialsTotal(LocalDate fromDate, LocalDate toDate);
}
