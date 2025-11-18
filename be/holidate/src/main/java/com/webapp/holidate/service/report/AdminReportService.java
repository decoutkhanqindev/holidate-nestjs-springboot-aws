package com.webapp.holidate.service.report;

import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.entity.report.HotelDailyReport;
import com.webapp.holidate.repository.report.HotelDailyReportRepository;
import com.webapp.holidate.repository.report.SystemDailyReportRepository;
import com.webapp.holidate.type.booking.BookingStatusType;
import com.webapp.holidate.type.user.RoleType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AdminReportService {

  HotelDailyReportRepository hotelDailyReportRepository;
  SystemDailyReportRepository systemDailyReportRepository;
  EntityManager entityManager;

  /**
   * Generate system daily report for the specified date.
   * This method implements the 5-step process described in the documentation.
   * 
   * @param reportDate The date to generate reports for (typically yesterday)
   */
  @Transactional
  public void generateSystemDailyReport(LocalDate reportDate) {
    log.info("Starting system daily report generation for date: {}", reportDate);

    try {
      // Step 0: Check prerequisites and start transaction
      checkPrerequisites(reportDate);
      LocalDateTime startTime = LocalDateTime.now();
      LocalDateTime updatedAt = LocalDateTime.now();

      // Step 1: Aggregate data from HotelDailyReport
      HotelAggregationResult hotelAggregation = aggregateHotelDailyReports(reportDate);
      log.info(
          "Aggregated hotel data: grossRevenue={}, totalBookingsCreated={}, totalBookingsCompleted={}, totalBookingsCancelled={}, totalReviews={}",
          hotelAggregation.grossRevenue, hotelAggregation.totalBookingsCreated,
          hotelAggregation.totalBookingsCompleted, hotelAggregation.totalBookingsCancelled,
          hotelAggregation.totalReviews);

      // Step 2: Calculate net revenue
      double netRevenue = calculateNetRevenue(reportDate);
      log.info("Calculated net revenue: {}", netRevenue);

      // Step 3: Aggregate new user data
      UserRegistrationResult userRegistration = aggregateNewUserData(reportDate);
      log.info("New users registered: customers={}, partners={}",
          userRegistration.newCustomersRegistered, userRegistration.newPartnersRegistered);

      // Step 4: Calculate weighted average review score
      Double systemAverageReviewScore = null;
      if (hotelAggregation.totalReviews > 0 && hotelAggregation.totalWeightedScore > 0) {
        systemAverageReviewScore = hotelAggregation.totalWeightedScore / hotelAggregation.totalReviews;
      }
      log.info("System average review score: {}", systemAverageReviewScore);

      // Step 5: Upsert data into SystemDailyReport
      upsertSystemDailyReport(
          reportDate,
          hotelAggregation.grossRevenue,
          netRevenue,
          hotelAggregation.totalBookingsCreated,
          hotelAggregation.totalBookingsCompleted,
          hotelAggregation.totalBookingsCancelled,
          userRegistration.newCustomersRegistered,
          userRegistration.newPartnersRegistered,
          systemAverageReviewScore,
          hotelAggregation.totalReviews,
          updatedAt);

      // Step 6: Commit transaction (handled by @Transactional)
      LocalDateTime endTime = LocalDateTime.now();
      log.info("Successfully generated system daily report for date {} in {} ms",
          reportDate, java.time.Duration.between(startTime, endTime).toMillis());

    } catch (Exception e) {
      log.error("Error generating system daily report for date {}: {}", reportDate, e.getMessage(), e);
      throw e; // This will trigger rollback
    }
  }

  /**
   * Step 0: Check prerequisites - verify partner job has completed
   */
  private void checkPrerequisites(LocalDate reportDate) {
    List<HotelDailyReport> hotelReports = hotelDailyReportRepository.findByIdReportDate(reportDate);

    if (hotelReports.isEmpty()) {
      log.warn("No hotel daily reports found for date {}. Partner job may not have completed yet.", reportDate);
      // Note: According to documentation, we should check if partner job completed
      // For now, we'll just log a warning. In production, you might want to throw an
      // exception
      // or implement a more sophisticated check (e.g., using a job status table)
    } else {
      log.info("Found {} hotel daily reports for date {}. Prerequisites check passed.", hotelReports.size(),
          reportDate);
    }
  }

  /**
   * Step 1: Aggregate data from HotelDailyReport
   */
  private HotelAggregationResult aggregateHotelDailyReports(LocalDate reportDate) {
    Query query = entityManager.createNativeQuery(ReportQueries.AGGREGATE_HOTEL_DAILY_REPORTS);
    query.setParameter("reportDate", reportDate);

    Object[] result = (Object[]) query.getSingleResult();

    HotelAggregationResult aggregation = new HotelAggregationResult();
    aggregation.grossRevenue = result[0] != null ? ((Number) result[0]).doubleValue() : 0.0;
    aggregation.totalBookingsCreated = result[1] != null ? ((Number) result[1]).intValue() : 0;
    aggregation.totalBookingsCompleted = result[2] != null ? ((Number) result[2]).intValue() : 0;
    aggregation.totalBookingsCancelled = result[3] != null ? ((Number) result[3]).intValue() : 0;
    aggregation.totalReviews = result[4] != null ? ((Number) result[4]).intValue() : 0;
    aggregation.totalWeightedScore = result[5] != null ? ((Number) result[5]).doubleValue() : 0.0;

    return aggregation;
  }

  /**
   * Step 2: Calculate net revenue from Booking and Hotel
   */
  private double calculateNetRevenue(LocalDate reportDate) {
    Query query = entityManager.createNativeQuery(ReportQueries.CALCULATE_NET_REVENUE);
    query.setParameter("reportDate", reportDate);
    query.setParameter("completedStatus", BookingStatusType.COMPLETED.getValue());

    Object result = query.getSingleResult();
    return result != null ? ((Number) result).doubleValue() : 0.0;
  }

  /**
   * Step 3: Aggregate new user data
   */
  private UserRegistrationResult aggregateNewUserData(LocalDate reportDate) {
    LocalDateTime reportDateStart = reportDate.atStartOfDay();
    LocalDateTime reportDateEnd = reportDate.plusDays(1).atStartOfDay();

    // Get role IDs
    String customerRoleName = RoleType.USER.getValue();
    String partnerRoleName = RoleType.PARTNER.getValue();

    // Count new customers
    Query customerQuery = entityManager.createNativeQuery(ReportQueries.COUNT_NEW_CUSTOMERS);
    customerQuery.setParameter("customerRoleName", customerRoleName);
    customerQuery.setParameter("reportDateStart", reportDateStart);
    customerQuery.setParameter("reportDateEnd", reportDateEnd);
    long newCustomers = ((Number) customerQuery.getSingleResult()).longValue();

    // Count new partners
    Query partnerQuery = entityManager.createNativeQuery(ReportQueries.COUNT_NEW_PARTNERS);
    partnerQuery.setParameter("partnerRoleName", partnerRoleName);
    partnerQuery.setParameter("reportDateStart", reportDateStart);
    partnerQuery.setParameter("reportDateEnd", reportDateEnd);
    long newPartners = ((Number) partnerQuery.getSingleResult()).longValue();

    UserRegistrationResult result = new UserRegistrationResult();
    result.newCustomersRegistered = (int) newCustomers;
    result.newPartnersRegistered = (int) newPartners;

    return result;
  }

  /**
   * Step 4: Upsert system daily report
   */
  private void upsertSystemDailyReport(
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
      LocalDateTime updatedAt) {

    systemDailyReportRepository.upsertSystemDailyReport(
        reportDate,
        grossRevenue,
        netRevenue,
        totalBookingsCreated,
        totalBookingsCompleted,
        totalBookingsCancelled,
        newCustomersRegistered,
        newPartnersRegistered,
        systemAverageReviewScore,
        totalReviews,
        updatedAt);
  }

  // Inner classes for aggregation results
  private static class HotelAggregationResult {
    double grossRevenue = 0.0;
    int totalBookingsCreated = 0;
    int totalBookingsCompleted = 0;
    int totalBookingsCancelled = 0;
    int totalReviews = 0;
    double totalWeightedScore = 0.0;
  }

  private static class UserRegistrationResult {
    int newCustomersRegistered = 0;
    int newPartnersRegistered = 0;
  }
}
