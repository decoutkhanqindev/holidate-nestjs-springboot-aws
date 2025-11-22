package com.webapp.holidate.service.report;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.dto.response.report.admin.AdminRevenueReportComparisonResponse;
import com.webapp.holidate.dto.response.report.admin.AdminRevenueReportResponse;
import com.webapp.holidate.dto.response.report.admin.FinancialsReportComparisonResponse;
import com.webapp.holidate.dto.response.report.admin.FinancialsReportResponse;
import com.webapp.holidate.dto.response.report.admin.HotelPerformanceComparisonResponse;
import com.webapp.holidate.dto.response.report.admin.HotelPerformanceReportResponse;
import com.webapp.holidate.dto.response.report.admin.PopularLocationsReportResponse;
import com.webapp.holidate.dto.response.report.admin.PopularRoomTypesReportResponse;
import com.webapp.holidate.dto.response.report.admin.SeasonalityReportResponse;
import com.webapp.holidate.dto.response.report.admin.UsersSummaryReportComparisonResponse;
import com.webapp.holidate.dto.response.report.admin.UsersSummaryReportResponse;
import com.webapp.holidate.entity.report.HotelDailyReport;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.report.HotelDailyReportRepository;
import com.webapp.holidate.repository.report.RoomDailyPerformanceRepository;
import com.webapp.holidate.repository.report.SystemDailyReportRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.booking.BookingStatusType;
import com.webapp.holidate.type.user.RoleType;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AdminReportService implements ApplicationContextAware {

  HotelDailyReportRepository hotelDailyReportRepository;
  SystemDailyReportRepository systemDailyReportRepository;
  RoomDailyPerformanceRepository roomDailyPerformanceRepository;
  UserRepository userRepository;
  HotelRepository hotelRepository;
  EntityManager entityManager;
  
  // ApplicationContext to get self bean (Spring proxy) for transaction management
  // Cannot be final because it's set via ApplicationContextAware
  @lombok.experimental.NonFinal
  ApplicationContext applicationContext;
  
  @Override
  public void setApplicationContext(@org.springframework.lang.NonNull ApplicationContext applicationContext) throws BeansException {
    this.applicationContext = applicationContext;
  }
  
  private AdminReportService getSelf() {
    return applicationContext.getBean(AdminReportService.class);
  }

  /**
   * Generate system daily report for the specified date.
   * This method implements the 5-step process described in the documentation.
   * 
   * @param reportDate The date to generate reports for (typically yesterday)
   */
  @Transactional(propagation = Propagation.REQUIRES_NEW)
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

  /**
   * Get revenue report for admin (core logic without validation).
   * This is a reusable method for comparison features.
   * 
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @param groupBy  Grouping unit: "day", "week", or "month"
   * @param filterBy Filter dimension: "hotel", "city", "province", or null
   * @param page     Page number for pagination (when filterBy is provided)
   * @param size     Page size for pagination (when filterBy is provided)
   * @return AdminRevenueReportResponse
   */
  private AdminRevenueReportResponse getSinglePeriodRevenueReport(
      LocalDate fromDate, LocalDate toDate, String groupBy, String filterBy, int page, int size) {
    // Validate groupBy parameter
    String normalizedGroupBy = (groupBy == null || groupBy.isEmpty()) ? "day" : groupBy.toLowerCase();
    if (!normalizedGroupBy.equals("day") && !normalizedGroupBy.equals("week") && !normalizedGroupBy.equals("month")) {
      throw new AppException(ErrorType.INVALID_GROUP_BY);
    }

    // Validate filterBy parameter if provided
    String normalizedFilterBy = null;
    if (filterBy != null && !filterBy.isEmpty()) {
      normalizedFilterBy = filterBy.toLowerCase();
      if (!normalizedFilterBy.equals("hotel") && !normalizedFilterBy.equals("city")
          && !normalizedFilterBy.equals("province")) {
        throw new AppException(ErrorType.INVALID_FILTER_BY);
      }
    }

    // Get trend data based on groupBy
    List<AdminRevenueReportResponse.RevenueDataPoint> dataPoints;
    if (normalizedGroupBy.equals("day")) {
      dataPoints = getSystemDailyRevenueData(fromDate, toDate);
    } else if (normalizedGroupBy.equals("week")) {
      dataPoints = getSystemWeeklyRevenueData(fromDate, toDate);
    } else {
      dataPoints = getSystemMonthlyRevenueData(fromDate, toDate);
    }

    // Get total revenue for summary
    Double totalRevenue = systemDailyReportRepository.getSystemTotalRevenue(fromDate, toDate);
    if (totalRevenue == null) {
      totalRevenue = 0.0;
    }

    // Build summary
    AdminRevenueReportResponse.RevenueSummary summary = AdminRevenueReportResponse.RevenueSummary.builder()
        .totalRevenue(totalRevenue)
        .build();

    // Get breakdown if filterBy is provided
    List<AdminRevenueReportResponse.RevenueBreakdownItem> breakdown = null;
    if (normalizedFilterBy != null) {
      breakdown = getRevenueBreakdown(normalizedFilterBy, fromDate, toDate, page, size);
    }

    return AdminRevenueReportResponse.builder()
        .data(dataPoints)
        .summary(summary)
        .breakdown(breakdown)
        .build();
  }

  /**
   * Get daily system revenue data
   */
  private List<AdminRevenueReportResponse.RevenueDataPoint> getSystemDailyRevenueData(
      LocalDate fromDate, LocalDate toDate) {
    List<Object[]> results = systemDailyReportRepository.getSystemDailyRevenue(fromDate, toDate);
    return results.stream()
        .map(row -> {
          LocalDate period = ((java.sql.Date) row[0]).toLocalDate();
          Double revenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          return AdminRevenueReportResponse.RevenueDataPoint.builder()
              .period(period)
              .revenue(revenue)
              .build();
        })
        .collect(Collectors.toList());
  }

  /**
   * Get weekly system revenue data
   */
  private List<AdminRevenueReportResponse.RevenueDataPoint> getSystemWeeklyRevenueData(
      LocalDate fromDate, LocalDate toDate) {
    List<Object[]> results = systemDailyReportRepository.getSystemWeeklyRevenue(fromDate, toDate);
    return results.stream()
        .map(row -> {
          LocalDate period = ((java.sql.Date) row[0]).toLocalDate();
          Double revenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          return AdminRevenueReportResponse.RevenueDataPoint.builder()
              .period(period)
              .revenue(revenue)
              .build();
        })
        .collect(Collectors.toList());
  }

  /**
   * Get monthly system revenue data
   */
  private List<AdminRevenueReportResponse.RevenueDataPoint> getSystemMonthlyRevenueData(
      LocalDate fromDate, LocalDate toDate) {
    List<Object[]> results = systemDailyReportRepository.getSystemMonthlyRevenue(fromDate, toDate);
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    return results.stream()
        .map(row -> {
          // For monthly, the period is returned as a string in format 'YYYY-MM-01'
          String periodStr = (String) row[0];
          LocalDate period = LocalDate.parse(periodStr, formatter);
          Double revenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          return AdminRevenueReportResponse.RevenueDataPoint.builder()
              .period(period)
              .revenue(revenue)
              .build();
        })
        .collect(Collectors.toList());
  }

  /**
   * Get revenue breakdown by filter dimension (hotel/city/province)
   * Note: For now, we return all results without database-level pagination.
   * In production, you might want to implement database-level pagination for
   * better performance.
   */
  private List<AdminRevenueReportResponse.RevenueBreakdownItem> getRevenueBreakdown(
      String filterBy, LocalDate fromDate, LocalDate toDate, int page, int size) {
    List<Object[]> results;
    if (filterBy.equals("hotel")) {
      results = hotelDailyReportRepository.getRevenueByHotel(fromDate, toDate);
    } else if (filterBy.equals("city")) {
      results = hotelDailyReportRepository.getRevenueByCity(fromDate, toDate);
    } else { // province
      results = hotelDailyReportRepository.getRevenueByProvince(fromDate, toDate);
    }

    // Map results to DTO
    List<AdminRevenueReportResponse.RevenueBreakdownItem> allItems = results.stream()
        .map(row -> {
          String filterId = (String) row[0];
          String filterName = (String) row[1];
          Double revenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
          return AdminRevenueReportResponse.RevenueBreakdownItem.builder()
              .filterId(filterId)
              .filterName(filterName)
              .revenue(revenue)
              .build();
        })
        .collect(Collectors.toList());

    // Apply in-memory pagination (for now)
    // In production, consider implementing database-level pagination
    int startIndex = page * size;
    int endIndex = Math.min(startIndex + size, allItems.size());
    if (startIndex >= allItems.size()) {
      return new ArrayList<>();
    }
    return allItems.subList(startIndex, endIndex);
  }

  /**
   * Helper method to calculate percentage change
   */
  private double calculatePercentageChange(double current, double previous) {
    if (previous == 0.0) {
      if (current > 0.0) {
        return 100.0; // Growth from zero
      } else {
        return 0.0; // Both zero
      }
    }
    return ((current - previous) / previous) * 100.0;
  }

  /**
   * Get revenue report for admin.
   * 
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @param groupBy  Grouping unit: "day", "week", or "month"
   * @param filterBy Filter dimension: "hotel", "city", "province", or null
   * @param page     Page number for pagination (when filterBy is provided)
   * @param size     Page size for pagination (when filterBy is provided)
   * @return AdminRevenueReportResponse
   */
  @Transactional(readOnly = true)
  public AdminRevenueReportResponse getRevenueReport(
      LocalDate fromDate, LocalDate toDate, String groupBy, String filterBy, int page, int size) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    return getSinglePeriodRevenueReport(fromDate, toDate, groupBy, filterBy, page, size);
  }

  /**
   * Get revenue report with period comparison for admin.
   * 
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param groupBy     Grouping unit: "day", "week", or "month"
   * @param filterBy    Filter dimension: "hotel", "city", "province", or null
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @param page        Page number for pagination (when filterBy is provided)
   * @param size        Page size for pagination (when filterBy is provided)
   * @return AdminRevenueReportComparisonResponse
   */
  @Transactional(readOnly = true)
  public AdminRevenueReportComparisonResponse getRevenueReportWithComparison(
      LocalDate fromDate, LocalDate toDate, String groupBy, String filterBy,
      LocalDate compareFrom, LocalDate compareTo, int page, int size) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data
    AdminRevenueReportResponse currentPeriod = getSinglePeriodRevenueReport(
        fromDate, toDate, groupBy, filterBy, page, size);

    // Get previous period data
    AdminRevenueReportResponse previousPeriod = getSinglePeriodRevenueReport(
        compareFrom, compareTo, groupBy, filterBy, page, size);

    // Calculate comparison
    double currentRevenue = currentPeriod.getSummary().getTotalRevenue();
    double previousRevenue = previousPeriod.getSummary().getTotalRevenue();
    double difference = currentRevenue - previousRevenue;
    double percentageChange = calculatePercentageChange(currentRevenue, previousRevenue);
    percentageChange = Math.round(percentageChange * 100.0) / 100.0;

    AdminRevenueReportComparisonResponse.RevenueComparison comparison = AdminRevenueReportComparisonResponse.RevenueComparison
        .builder()
        .totalRevenueDifference(difference)
        .totalRevenuePercentageChange(percentageChange)
        .build();

    return AdminRevenueReportComparisonResponse.builder()
        .currentPeriod(currentPeriod)
        .previousPeriod(previousPeriod)
        .comparison(comparison)
        .build();
  }

  /**
   * Get hotel performance report for admin (core logic without validation).
   * This is a reusable method for comparison features.
   * 
   * @param fromDate   Start date of the report period
   * @param toDate     End date of the report period
   * @param sortBy     Sort criteria: "revenue", "occupancy", "bookings",
   *                   "cancellationRate"
   * @param sortOrder  Sort order: "asc" or "desc"
   * @param cityId     Optional city ID filter
   * @param provinceId Optional province ID filter
   * @param page       Page number (0-indexed)
   * @param size       Page size
   * @return HotelPerformanceReportResponse with pagination
   */
  private HotelPerformanceReportResponse getSinglePeriodHotelPerformance(
      LocalDate fromDate, LocalDate toDate, String sortBy, String sortOrder,
      String cityId, String provinceId, int page, int size) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Validate and normalize sortBy parameter
    String normalizedSortBy = (sortBy == null || sortBy.isEmpty()) ? "revenue" : sortBy.toLowerCase();
    if (!normalizedSortBy.equals("revenue") && !normalizedSortBy.equals("occupancy")
        && !normalizedSortBy.equals("bookings") && !normalizedSortBy.equals("cancellationrate")) {
      throw new AppException(ErrorType.INVALID_SORT_BY);
    }

    // Validate and normalize sortOrder parameter
    String normalizedSortOrder = (sortOrder == null || sortOrder.isEmpty()) ? "desc" : sortOrder.toLowerCase();
    if (!normalizedSortOrder.equals("asc") && !normalizedSortOrder.equals("desc")) {
      throw new AppException(ErrorType.INVALID_SORT_ORDER);
    }

    // Build dynamic ORDER BY clause safely
    String orderByColumn;
    switch (normalizedSortBy) {
      case "revenue":
        orderByColumn = "s.totalRevenue";
        break;
      case "occupancy":
        orderByColumn = "averageOccupancyRate";
        break;
      case "bookings":
        orderByColumn = "s.totalCompletedBookings";
        break;
      case "cancellationrate":
        orderByColumn = "cancellationRate";
        break;
      default:
        orderByColumn = "s.totalRevenue";
    }

    String orderByClause = orderByColumn + " " + normalizedSortOrder.toUpperCase();

    // Build complete query with dynamic ORDER BY
    String queryString = ReportQueries.GET_HOTEL_PERFORMANCE_BASE + " ORDER BY " + orderByClause
        + " LIMIT :size OFFSET :offset";

    // Execute query using EntityManager
    Query query = entityManager.createNativeQuery(queryString);
    query.setParameter("fromDate", fromDate);
    query.setParameter("toDate", toDate);
    query.setParameter("cityId", cityId);
    query.setParameter("provinceId", provinceId);
    query.setParameter("size", size);
    query.setParameter("offset", page * size);

    @SuppressWarnings("unchecked")
    List<Object[]> results = query.getResultList();

    // Get total count for pagination
    Query countQuery = entityManager.createNativeQuery(ReportQueries.COUNT_HOTEL_PERFORMANCE);
    countQuery.setParameter("fromDate", fromDate);
    countQuery.setParameter("toDate", toDate);
    countQuery.setParameter("cityId", cityId);
    countQuery.setParameter("provinceId", provinceId);
    Long totalItems = ((Number) countQuery.getSingleResult()).longValue();

    // Map results to DTO
    List<HotelPerformanceReportResponse.HotelPerformanceItem> items = results.stream()
        .map(row -> {
          String hotelId = (String) row[0];
          String hotelName = (String) row[1];
          Double totalRevenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
          Long totalCompletedBookings = row[3] != null ? ((Number) row[3]).longValue() : 0L;
          Long totalCreatedBookings = row[4] != null ? ((Number) row[4]).longValue() : 0L;
          Long totalCancelledBookings = row[5] != null ? ((Number) row[5]).longValue() : 0L;
          Double averageOccupancyRate = row[6] != null ? ((Number) row[6]).doubleValue() : 0.0;
          Double cancellationRate = row[7] != null ? ((Number) row[7]).doubleValue() : 0.0;

          // Round to 2 decimal places
          averageOccupancyRate = Math.round(averageOccupancyRate * 100.0) / 100.0;
          cancellationRate = Math.round(cancellationRate * 100.0) / 100.0;

          return HotelPerformanceReportResponse.HotelPerformanceItem.builder()
              .hotelId(hotelId)
              .hotelName(hotelName)
              .totalRevenue(totalRevenue)
              .totalCompletedBookings(totalCompletedBookings)
              .totalCreatedBookings(totalCreatedBookings)
              .totalCancelledBookings(totalCancelledBookings)
              .averageOccupancyRate(averageOccupancyRate)
              .cancellationRate(cancellationRate)
              .build();
        })
        .collect(Collectors.toList());

    // Calculate pagination metadata
    int totalPages = (int) Math.ceil((double) totalItems / size);
    boolean first = page == 0;
    boolean last = page >= totalPages - 1;
    boolean hasNext = page < totalPages - 1;
    boolean hasPrevious = page > 0;

    // Build response
    return HotelPerformanceReportResponse.builder()
        .data(items)
        .page(page)
        .size(size)
        .totalItems(totalItems)
        .totalPages(totalPages)
        .first(first)
        .last(last)
        .hasNext(hasNext)
        .hasPrevious(hasPrevious)
        .build();
  }

  /**
   * Get hotel performance report for admin.
   * 
   * @param fromDate   Start date of the report period
   * @param toDate     End date of the report period
   * @param sortBy     Sort criteria: "revenue", "occupancy", "bookings",
   *                   "cancellationRate"
   * @param sortOrder  Sort order: "asc" or "desc"
   * @param cityId     Optional city ID filter
   * @param provinceId Optional province ID filter
   * @param page       Page number (0-indexed)
   * @param size       Page size
   * @return HotelPerformanceReportResponse with pagination
   */
  @Transactional(readOnly = true)
  public HotelPerformanceReportResponse getHotelPerformanceReport(
      LocalDate fromDate, LocalDate toDate, String sortBy, String sortOrder,
      String cityId, String provinceId, int page, int size) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    return getSinglePeriodHotelPerformance(fromDate, toDate, sortBy, sortOrder, cityId, provinceId, page, size);
  }

  /**
   * Get hotel performance report with period comparison for admin.
   * 
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param sortBy      Sort criteria: "revenue", "occupancy", "bookings",
   *                    "cancellationRate"
   * @param sortOrder   Sort order: "asc" or "desc"
   * @param cityId      Optional city ID filter
   * @param provinceId  Optional province ID filter
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @param page        Page number (0-indexed)
   * @param size        Page size
   * @return HotelPerformanceComparisonResponse
   */
  @Transactional(readOnly = true)
  public HotelPerformanceComparisonResponse getHotelPerformanceReportWithComparison(
      LocalDate fromDate, LocalDate toDate, String sortBy, String sortOrder,
      String cityId, String provinceId, LocalDate compareFrom, LocalDate compareTo,
      int page, int size) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data (without pagination to get all hotels for comparison)
    HotelPerformanceReportResponse currentPeriod = getSinglePeriodHotelPerformance(
        fromDate, toDate, sortBy, sortOrder, cityId, provinceId, 0, Integer.MAX_VALUE);

    // Get previous period data (without pagination to get all hotels for
    // comparison)
    HotelPerformanceReportResponse previousPeriod = getSinglePeriodHotelPerformance(
        compareFrom, compareTo, sortBy, sortOrder, cityId, provinceId, 0, Integer.MAX_VALUE);

    // Create maps for easy lookup
    Map<String, HotelPerformanceReportResponse.HotelPerformanceItem> currentMap = currentPeriod.getData().stream()
        .collect(Collectors.toMap(
            HotelPerformanceReportResponse.HotelPerformanceItem::getHotelId,
            item -> item));

    Map<String, HotelPerformanceReportResponse.HotelPerformanceItem> previousMap = previousPeriod.getData().stream()
        .collect(Collectors.toMap(
            HotelPerformanceReportResponse.HotelPerformanceItem::getHotelId,
            item -> item));

    // Get all unique hotel IDs
    Set<String> allHotelIds = new HashSet<>(currentMap.keySet());
    allHotelIds.addAll(previousMap.keySet());

    // Build comparison items with rank change
    List<HotelPerformanceComparisonResponse.HotelPerformanceComparisonItem> comparisonItems = new ArrayList<>();

    // Create rank maps for both periods
    Map<String, Integer> currentRankMap = new HashMap<>();
    Map<String, Integer> previousRankMap = new HashMap<>();

    int rank = 0;
    for (HotelPerformanceReportResponse.HotelPerformanceItem item : currentPeriod.getData()) {
      rank++;
      currentRankMap.put(item.getHotelId(), rank);
    }

    rank = 0;
    for (HotelPerformanceReportResponse.HotelPerformanceItem item : previousPeriod.getData()) {
      rank++;
      previousRankMap.put(item.getHotelId(), rank);
    }

    // Process all hotels from current period (sorted by sortBy)
    for (HotelPerformanceReportResponse.HotelPerformanceItem currentItem : currentPeriod.getData()) {
      String hotelId = currentItem.getHotelId();
      HotelPerformanceReportResponse.HotelPerformanceItem previousItem = previousMap.get(hotelId);

      Integer currentRank = currentRankMap.get(hotelId);
      Integer previousRank = previousRankMap.get(hotelId);

      HotelPerformanceComparisonResponse.HotelPerformanceComparisonItem comparisonItem = buildComparisonItem(
          currentItem, previousItem, currentRank, previousRank);
      comparisonItems.add(comparisonItem);
    }

    // Then, add hotels that only exist in previous period
    for (HotelPerformanceReportResponse.HotelPerformanceItem previousItem : previousPeriod.getData()) {
      String hotelId = previousItem.getHotelId();
      if (!currentMap.containsKey(hotelId)) {
        Integer previousRank = previousRankMap.get(hotelId);

        HotelPerformanceComparisonResponse.HotelPerformanceComparisonItem comparisonItem = buildComparisonItem(
            null, previousItem, null, previousRank);
        comparisonItems.add(comparisonItem);
      }
    }

    // Apply pagination to comparison items
    int startIndex = page * size;
    int endIndex = Math.min(startIndex + size, comparisonItems.size());
    List<HotelPerformanceComparisonResponse.HotelPerformanceComparisonItem> paginatedItems = startIndex < comparisonItems
        .size()
            ? comparisonItems.subList(startIndex, endIndex)
            : new ArrayList<>();

    // Calculate pagination metadata
    long totalItems = comparisonItems.size();
    int totalPages = (int) Math.ceil((double) totalItems / size);
    boolean first = page == 0;
    boolean last = page >= totalPages - 1;
    boolean hasNext = page < totalPages - 1;
    boolean hasPrevious = page > 0;

    // Build paginated current and previous period responses based on comparison
    // items
    List<HotelPerformanceReportResponse.HotelPerformanceItem> currentPaginated = new ArrayList<>();
    List<HotelPerformanceReportResponse.HotelPerformanceItem> previousPaginated = new ArrayList<>();

    for (HotelPerformanceComparisonResponse.HotelPerformanceComparisonItem compItem : paginatedItems) {
      String hotelId = compItem.getHotelId();
      if (currentMap.containsKey(hotelId)) {
        currentPaginated.add(currentMap.get(hotelId));
      }
      if (previousMap.containsKey(hotelId)) {
        previousPaginated.add(previousMap.get(hotelId));
      }
    }

    HotelPerformanceReportResponse currentPaginatedResponse = HotelPerformanceReportResponse.builder()
        .data(currentPaginated)
        .page(page)
        .size(size)
        .totalItems(currentPeriod.getTotalItems())
        .totalPages((int) Math.ceil((double) currentPeriod.getTotalItems() / size))
        .first(first)
        .last(last)
        .hasNext(hasNext)
        .hasPrevious(hasPrevious)
        .build();

    HotelPerformanceReportResponse previousPaginatedResponse = HotelPerformanceReportResponse.builder()
        .data(previousPaginated)
        .page(page)
        .size(size)
        .totalItems(previousPeriod.getTotalItems())
        .totalPages((int) Math.ceil((double) previousPeriod.getTotalItems() / size))
        .first(first)
        .last(last)
        .hasNext(hasNext)
        .hasPrevious(hasPrevious)
        .build();

    return HotelPerformanceComparisonResponse.builder()
        .currentPeriod(currentPaginatedResponse)
        .previousPeriod(previousPaginatedResponse)
        .comparison(paginatedItems)
        .build();
  }

  /**
   * Helper method to build comparison item from current and previous period data
   */
  private HotelPerformanceComparisonResponse.HotelPerformanceComparisonItem buildComparisonItem(
      HotelPerformanceReportResponse.HotelPerformanceItem currentItem,
      HotelPerformanceReportResponse.HotelPerformanceItem previousItem,
      Integer currentRank, Integer previousRank) {

    // Get current period values (or defaults if null)
    Double currentRevenue = currentItem != null ? currentItem.getTotalRevenue() : 0.0;
    Long currentCompleted = currentItem != null ? currentItem.getTotalCompletedBookings() : 0L;
    Long currentCreated = currentItem != null ? currentItem.getTotalCreatedBookings() : 0L;
    Long currentCancelled = currentItem != null ? currentItem.getTotalCancelledBookings() : 0L;
    Double currentOccupancy = currentItem != null ? currentItem.getAverageOccupancyRate() : 0.0;
    Double currentCancellationRate = currentItem != null ? currentItem.getCancellationRate() : 0.0;
    String hotelId = currentItem != null ? currentItem.getHotelId() : previousItem.getHotelId();
    String hotelName = currentItem != null ? currentItem.getHotelName() : previousItem.getHotelName();

    // Get previous period values (or defaults if null)
    Double previousRevenue = previousItem != null ? previousItem.getTotalRevenue() : 0.0;
    Long previousCompleted = previousItem != null ? previousItem.getTotalCompletedBookings() : 0L;
    Long previousCreated = previousItem != null ? previousItem.getTotalCreatedBookings() : 0L;
    Long previousCancelled = previousItem != null ? previousItem.getTotalCancelledBookings() : 0L;
    Double previousOccupancy = previousItem != null ? previousItem.getAverageOccupancyRate() : 0.0;
    Double previousCancellationRate = previousItem != null ? previousItem.getCancellationRate() : 0.0;

    // Calculate differences
    Double revenueDiff = currentRevenue - previousRevenue;
    Long completedDiff = currentCompleted - previousCompleted;
    Long createdDiff = currentCreated - previousCreated;
    Long cancelledDiff = currentCancelled - previousCancelled;
    Double occupancyDiff = currentOccupancy - previousOccupancy;
    Double cancellationRateDiff = currentCancellationRate - previousCancellationRate;

    // Calculate percentage changes
    Double revenuePct = calculatePercentageChange(currentRevenue, previousRevenue);
    revenuePct = roundCurrency(revenuePct);
    Double completedPct = calculatePercentageChange(currentCompleted.doubleValue(), previousCompleted.doubleValue());
    completedPct = roundCurrency(completedPct);
    Double createdPct = calculatePercentageChange(currentCreated.doubleValue(), previousCreated.doubleValue());
    createdPct = roundCurrency(createdPct);
    Double cancelledPct = calculatePercentageChange(currentCancelled.doubleValue(), previousCancelled.doubleValue());
    cancelledPct = roundCurrency(cancelledPct);
    Double occupancyPct = calculatePercentageChange(currentOccupancy, previousOccupancy);
    occupancyPct = roundCurrency(occupancyPct);
    Double cancellationRatePct = calculatePercentageChange(currentCancellationRate, previousCancellationRate);
    cancellationRatePct = roundCurrency(cancellationRatePct);

    // Calculate rank change (positive = moved up, negative = moved down)
    Integer rankChange = null;
    if (currentRank > 0 && previousRank > 0) {
      rankChange = previousRank - currentRank; // Positive means moved up
    } else if (currentRank > 0 && previousRank == 0) {
      rankChange = null; // New hotel, no previous rank
    } else if (currentRank == 0 && previousRank > 0) {
      rankChange = null; // Hotel no longer exists
    }

    return HotelPerformanceComparisonResponse.HotelPerformanceComparisonItem.builder()
        .hotelId(hotelId)
        .hotelName(hotelName)
        .currentTotalRevenue(currentRevenue)
        .currentTotalCompletedBookings(currentCompleted)
        .currentTotalCreatedBookings(currentCreated)
        .currentTotalCancelledBookings(currentCancelled)
        .currentAverageOccupancyRate(currentOccupancy)
        .currentCancellationRate(currentCancellationRate)
        .previousTotalRevenue(previousRevenue)
        .previousTotalCompletedBookings(previousCompleted)
        .previousTotalCreatedBookings(previousCreated)
        .previousTotalCancelledBookings(previousCancelled)
        .previousAverageOccupancyRate(previousOccupancy)
        .previousCancellationRate(previousCancellationRate)
        .revenueDifference(roundCurrency(revenueDiff))
        .revenuePercentageChange(revenuePct)
        .completedBookingsDifference(completedDiff)
        .completedBookingsPercentageChange(completedPct)
        .createdBookingsDifference(createdDiff)
        .createdBookingsPercentageChange(createdPct)
        .cancelledBookingsDifference(cancelledDiff)
        .cancelledBookingsPercentageChange(cancelledPct)
        .occupancyRateDifference(roundCurrency(occupancyDiff))
        .occupancyRatePercentageChange(occupancyPct)
        .cancellationRateDifference(roundCurrency(cancellationRateDiff))
        .cancellationRatePercentageChange(cancellationRatePct)
        .rankChange(rankChange)
        .currentRank(currentRank > 0 ? currentRank : null)
        .previousRank(previousRank > 0 ? previousRank : null)
        .build();
  }

  /**
   * Get users summary report for admin (core logic without validation).
   * This is a reusable method for comparison features.
   * 
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @return UsersSummaryReportResponse
   */
  private UsersSummaryReportResponse getSinglePeriodUsersSummary(
      LocalDate fromDate, LocalDate toDate) {
    // Step 1: Get growth data from SystemDailyReport
    // Use EntityManager directly for native query to ensure correct result mapping
    Query query = entityManager.createNativeQuery(ReportQueries.GET_NEW_USERS_GROWTH);
    query.setParameter("fromDate", fromDate);
    query.setParameter("toDate", toDate);

    @SuppressWarnings("unchecked")
    List<Object[]> results = query.getResultList();
    Object[] growthResult = null;
    if (!results.isEmpty()) {
      growthResult = results.get(0);
    }

    Long newCustomers = growthResult != null && growthResult.length > 0
        ? extractLong(growthResult[0])
        : 0L;
    Long newPartners = growthResult != null && growthResult.length > 1
        ? extractLong(growthResult[1])
        : 0L;

    // Step 2: Get total user counts from User and Role tables
    String customerRoleName = RoleType.USER.getValue();
    String partnerRoleName = RoleType.PARTNER.getValue();
    List<Object[]> userCounts = userRepository.getTotalUserCounts(customerRoleName, partnerRoleName);

    // Parse user counts by role
    Long totalCustomers = 0L;
    Long totalPartners = 0L;
    for (Object[] row : userCounts) {
      String roleName = (String) row[0];
      Long userCount = extractLong(row[1]);
      if (customerRoleName.equals(roleName)) {
        totalCustomers = userCount;
      } else if (partnerRoleName.equals(roleName)) {
        totalPartners = userCount;
      }
    }

    // Step 3: Get total hotels count
    Long totalHotels = hotelRepository.count();

    // Step 4: Build growth in period
    UsersSummaryReportResponse.GrowthInPeriod growthInPeriod = UsersSummaryReportResponse.GrowthInPeriod
        .builder()
        .from(fromDate)
        .to(toDate)
        .newCustomers(newCustomers)
        .newPartners(newPartners)
        .build();

    // Step 5: Build platform totals
    UsersSummaryReportResponse.PlatformTotals platformTotals = UsersSummaryReportResponse.PlatformTotals
        .builder()
        .asOf(LocalDateTime.now())
        .totalCustomers(totalCustomers)
        .totalPartners(totalPartners)
        .totalHotels(totalHotels)
        .build();

    // Build response
    return UsersSummaryReportResponse.builder()
        .growthInPeriod(growthInPeriod)
        .platformTotals(platformTotals)
        .build();
  }

  /**
   * Helper method to safely extract Long from Object (handles BigInteger,
   * BigDecimal, etc.)
   */
  private Long extractLong(Object obj) {
    if (obj == null) {
      return 0L;
    }
    if (obj instanceof Number) {
      return ((Number) obj).longValue();
    }
    try {
      return Long.parseLong(obj.toString());
    } catch (NumberFormatException e) {
      return 0L;
    }
  }

  /**
   * Get users summary report for admin.
   * 
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @return UsersSummaryReportResponse
   */
  @Transactional(readOnly = true)
  public UsersSummaryReportResponse getUsersSummaryReport(
      LocalDate fromDate, LocalDate toDate) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    return getSinglePeriodUsersSummary(fromDate, toDate);
  }

  /**
   * Get users summary report with period comparison for admin.
   * 
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @return UsersSummaryReportComparisonResponse
   */
  @Transactional(readOnly = true)
  public UsersSummaryReportComparisonResponse getUsersSummaryReportWithComparison(
      LocalDate fromDate, LocalDate toDate, LocalDate compareFrom, LocalDate compareTo) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data
    UsersSummaryReportResponse currentPeriod = getSinglePeriodUsersSummary(fromDate, toDate);

    // Get previous period data
    UsersSummaryReportResponse previousPeriod = getSinglePeriodUsersSummary(compareFrom, compareTo);

    // Calculate comparison for growth metrics
    long newCustomersDiff = currentPeriod.getGrowthInPeriod().getNewCustomers()
        - previousPeriod.getGrowthInPeriod().getNewCustomers();
    double newCustomersPct = calculatePercentageChange(
        currentPeriod.getGrowthInPeriod().getNewCustomers(),
        previousPeriod.getGrowthInPeriod().getNewCustomers());
    newCustomersPct = Math.round(newCustomersPct * 100.0) / 100.0;

    long newPartnersDiff = currentPeriod.getGrowthInPeriod().getNewPartners()
        - previousPeriod.getGrowthInPeriod().getNewPartners();
    double newPartnersPct = calculatePercentageChange(
        currentPeriod.getGrowthInPeriod().getNewPartners(),
        previousPeriod.getGrowthInPeriod().getNewPartners());
    newPartnersPct = Math.round(newPartnersPct * 100.0) / 100.0;

    UsersSummaryReportComparisonResponse.GrowthComparison comparison = UsersSummaryReportComparisonResponse.GrowthComparison
        .builder()
        .newCustomersDifference(newCustomersDiff)
        .newCustomersPercentageChange(newCustomersPct)
        .newPartnersDifference(newPartnersDiff)
        .newPartnersPercentageChange(newPartnersPct)
        .build();

    return UsersSummaryReportComparisonResponse.builder()
        .currentPeriod(currentPeriod)
        .previousPeriod(previousPeriod)
        .comparison(comparison)
        .build();
  }

  /**
   * Get seasonality report for admin.
   * 
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @param metric   Metric to analyze: "revenue" or "bookings" (default:
   *                 "bookings")
   * @return SeasonalityReportResponse
   */
  @Transactional(readOnly = true)
  public SeasonalityReportResponse getSeasonalityReport(
      LocalDate fromDate, LocalDate toDate, String metric) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Validate and normalize metric parameter
    String normalizedMetric = (metric == null || metric.isEmpty()) ? "bookings" : metric.toLowerCase();
    if (!normalizedMetric.equals("revenue") && !normalizedMetric.equals("bookings")) {
      throw new AppException(ErrorType.INVALID_METRIC);
    }

    // Get seasonality data from SystemDailyReport
    List<Object[]> results = systemDailyReportRepository.getSeasonalityData(fromDate, toDate);

    // Map results to DTO
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    List<SeasonalityReportResponse.SeasonalityDataPoint> dataPoints = results.stream()
        .map(row -> {
          // Month is returned as string in format 'YYYY-MM-01'
          String monthStr = (String) row[0];
          LocalDate month = LocalDate.parse(monthStr, formatter);
          Double totalRevenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          Long totalBookings = row[2] != null ? ((Number) row[2]).longValue() : 0L;

          return SeasonalityReportResponse.SeasonalityDataPoint.builder()
              .month(month)
              .totalRevenue(totalRevenue)
              .totalBookings(totalBookings)
              .build();
        })
        .collect(Collectors.toList());

    return SeasonalityReportResponse.builder()
        .data(dataPoints)
        .build();
  }

  /**
   * Get popular locations report for admin.
   * 
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @param level    Location level: "city" or "province" (default: "city")
   * @param metric   Metric to rank by: "revenue" or "bookings" (default:
   *                 "revenue")
   * @param limit    Number of top results to return (default: 10)
   * @return PopularLocationsReportResponse
   */
  @Transactional(readOnly = true)
  public PopularLocationsReportResponse getPopularLocationsReport(
      LocalDate fromDate, LocalDate toDate, String level, String metric, int limit) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Validate and normalize level parameter
    String normalizedLevel = (level == null || level.isEmpty()) ? "city" : level.toLowerCase();
    if (!normalizedLevel.equals("city") && !normalizedLevel.equals("province")) {
      throw new AppException(ErrorType.INVALID_LEVEL);
    }

    // Validate and normalize metric parameter
    String normalizedMetric = (metric == null || metric.isEmpty()) ? "revenue" : metric.toLowerCase();
    if (!normalizedMetric.equals("revenue") && !normalizedMetric.equals("bookings")) {
      throw new AppException(ErrorType.INVALID_METRIC);
    }

    // Validate limit
    if (limit < 1) {
      limit = 10;
    }
    if (limit > 100) {
      limit = 100; // Cap at 100 for performance
    }

    // Build dynamic ORDER BY clause
    String orderByColumn = normalizedMetric.equals("revenue") ? "totalRevenue" : "totalBookings";
    String orderByClause = orderByColumn + " DESC";

    // Build base query string
    String baseQuery;
    if (normalizedLevel.equals("city")) {
      baseQuery = ReportQueries.GET_POPULAR_LOCATIONS_BY_CITY;
    } else {
      baseQuery = ReportQueries.GET_POPULAR_LOCATIONS_BY_PROVINCE;
    }

    // Replace ORDER BY clause dynamically
    String queryString = baseQuery.replace("ORDER BY totalRevenue DESC", "ORDER BY " + orderByClause);

    // Execute query using EntityManager
    Query query = entityManager.createNativeQuery(queryString);
    query.setParameter("fromDate", fromDate);
    query.setParameter("toDate", toDate);
    query.setParameter("limit", limit);

    @SuppressWarnings("unchecked")
    List<Object[]> results = query.getResultList();

    // Map results to DTO
    List<PopularLocationsReportResponse.LocationDataPoint> dataPoints = results.stream()
        .map(row -> {
          String locationId = (String) row[0];
          String locationName = (String) row[1];
          Double totalRevenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
          Long totalBookings = row[3] != null ? ((Number) row[3]).longValue() : 0L;

          return PopularLocationsReportResponse.LocationDataPoint.builder()
              .locationId(locationId)
              .locationName(locationName)
              .totalRevenue(totalRevenue)
              .totalBookings(totalBookings)
              .build();
        })
        .collect(Collectors.toList());

    return PopularLocationsReportResponse.builder()
        .data(dataPoints)
        .build();
  }

  /**
   * Get popular room types report for admin.
   * 
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @param groupBy  Grouping attribute: "view", "bedType", or "occupancy"
   *                 (default: "occupancy")
   * @param limit    Number of top results to return (default: 10)
   * @return PopularRoomTypesReportResponse
   */
  @Transactional(readOnly = true)
  public PopularRoomTypesReportResponse getPopularRoomTypesReport(
      LocalDate fromDate, LocalDate toDate, String groupBy, int limit) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Validate and normalize groupBy parameter
    String normalizedGroupBy = (groupBy == null || groupBy.isEmpty()) ? "occupancy" : groupBy.toLowerCase();
    if (!normalizedGroupBy.equals("view") && !normalizedGroupBy.equals("bedtype")
        && !normalizedGroupBy.equals("occupancy")) {
      throw new AppException(ErrorType.INVALID_GROUP_BY_ROOM_TYPE);
    }

    // Validate limit
    if (limit < 1) {
      limit = 10;
    }
    if (limit > 100) {
      limit = 100; // Cap at 100 for performance
    }

    // Get popular room types data
    List<Object[]> results;
    if (normalizedGroupBy.equals("view")) {
      results = roomDailyPerformanceRepository.getPopularRoomTypesByView(fromDate, toDate, limit);
    } else if (normalizedGroupBy.equals("bedtype")) {
      results = roomDailyPerformanceRepository.getPopularRoomTypesByBedType(fromDate, toDate, limit);
    } else { // occupancy
      results = roomDailyPerformanceRepository.getPopularRoomTypesByOccupancy(fromDate, toDate, limit);
    }

    // Map results to DTO
    List<PopularRoomTypesReportResponse.RoomTypeDataPoint> dataPoints = results.stream()
        .map(row -> {
          String roomCategory = (String) row[0];
          Long totalBookedNights = row[1] != null ? ((Number) row[1]).longValue() : 0L;

          return PopularRoomTypesReportResponse.RoomTypeDataPoint.builder()
              .roomCategory(roomCategory)
              .totalBookedNights(totalBookedNights)
              .build();
        })
        .collect(Collectors.toList());

    return PopularRoomTypesReportResponse.builder()
        .data(dataPoints)
        .build();
  }

  /**
   * Helper method to round currency to 2 decimal places
   */
  private double roundCurrency(double value) {
    return Math.round(value * 100.0) / 100.0;
  }

  /**
   * Helper method to calculate gross margin percentage
   */
  private double calculateGrossMargin(double netRevenue, double grossRevenue) {
    if (grossRevenue == 0.0) {
      return 0.0;
    }
    double margin = (netRevenue / grossRevenue) * 100.0;
    return roundCurrency(margin);
  }

  /**
   * Get financials report for admin (core logic without validation).
   * This is a reusable method for comparison features.
   * 
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @param groupBy  Grouping unit: "day", "week", or "month"
   * @return FinancialsReportResponse
   */
  private FinancialsReportResponse getSinglePeriodFinancialsReport(
      LocalDate fromDate, LocalDate toDate, String groupBy) {
    // Validate groupBy parameter
    String normalizedGroupBy = (groupBy == null || groupBy.isEmpty()) ? "day" : groupBy.toLowerCase();
    if (!normalizedGroupBy.equals("day") && !normalizedGroupBy.equals("week") && !normalizedGroupBy.equals("month")) {
      throw new AppException(ErrorType.INVALID_GROUP_BY);
    }

    // Get financials data based on groupBy
    List<FinancialsReportResponse.FinancialDataPoint> dataPoints;
    if (normalizedGroupBy.equals("day")) {
      dataPoints = getFinancialsDailyData(fromDate, toDate);
    } else if (normalizedGroupBy.equals("week")) {
      dataPoints = getFinancialsWeeklyData(fromDate, toDate);
    } else {
      dataPoints = getFinancialsMonthlyData(fromDate, toDate);
    }

    // Get total financials for summary
    Object[] totalResult = systemDailyReportRepository.getFinancialsTotal(fromDate, toDate);
    Double totalGrossRevenue = totalResult != null && totalResult.length > 0
        ? extractDouble(totalResult[0])
        : 0.0;
    Double totalNetRevenue = totalResult != null && totalResult.length > 1
        ? extractDouble(totalResult[1])
        : 0.0;

    // Round currency values
    totalGrossRevenue = roundCurrency(totalGrossRevenue);
    totalNetRevenue = roundCurrency(totalNetRevenue);

    // Calculate totals
    Double totalPartnerPayout = roundCurrency(totalGrossRevenue - totalNetRevenue);
    Double averageGrossMargin = calculateGrossMargin(totalNetRevenue, totalGrossRevenue);

    // Build summary
    FinancialsReportResponse.FinancialSummary summary = FinancialsReportResponse.FinancialSummary.builder()
        .totalGrossRevenue(totalGrossRevenue)
        .totalNetRevenue(totalNetRevenue)
        .totalPartnerPayout(totalPartnerPayout)
        .averageGrossMargin(averageGrossMargin)
        .build();

    return FinancialsReportResponse.builder()
        .data(dataPoints)
        .summary(summary)
        .build();
  }

  /**
   * Get daily financials data
   */
  private List<FinancialsReportResponse.FinancialDataPoint> getFinancialsDailyData(
      LocalDate fromDate, LocalDate toDate) {
    List<Object[]> results = systemDailyReportRepository.getFinancialsDailyData(fromDate, toDate);
    return results.stream()
        .map(row -> {
          LocalDate period = ((java.sql.Date) row[0]).toLocalDate();
          Double grossRevenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          Double netRevenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;

          // Round currency values
          grossRevenue = roundCurrency(grossRevenue);
          netRevenue = roundCurrency(netRevenue);

          // Calculate derived metrics
          Double partnerPayout = roundCurrency(grossRevenue - netRevenue);
          Double grossMargin = calculateGrossMargin(netRevenue, grossRevenue);

          return FinancialsReportResponse.FinancialDataPoint.builder()
              .period(period)
              .grossRevenue(grossRevenue)
              .netRevenue(netRevenue)
              .partnerPayout(partnerPayout)
              .grossMargin(grossMargin)
              .build();
        })
        .collect(Collectors.toList());
  }

  /**
   * Get weekly financials data
   */
  private List<FinancialsReportResponse.FinancialDataPoint> getFinancialsWeeklyData(
      LocalDate fromDate, LocalDate toDate) {
    List<Object[]> results = systemDailyReportRepository.getFinancialsWeeklyData(fromDate, toDate);
    return results.stream()
        .map(row -> {
          LocalDate period = ((java.sql.Date) row[0]).toLocalDate();
          Double grossRevenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          Double netRevenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;

          // Round currency values
          grossRevenue = roundCurrency(grossRevenue);
          netRevenue = roundCurrency(netRevenue);

          // Calculate derived metrics
          Double partnerPayout = roundCurrency(grossRevenue - netRevenue);
          Double grossMargin = calculateGrossMargin(netRevenue, grossRevenue);

          return FinancialsReportResponse.FinancialDataPoint.builder()
              .period(period)
              .grossRevenue(grossRevenue)
              .netRevenue(netRevenue)
              .partnerPayout(partnerPayout)
              .grossMargin(grossMargin)
              .build();
        })
        .collect(Collectors.toList());
  }

  /**
   * Get monthly financials data
   */
  private List<FinancialsReportResponse.FinancialDataPoint> getFinancialsMonthlyData(
      LocalDate fromDate, LocalDate toDate) {
    List<Object[]> results = systemDailyReportRepository.getFinancialsMonthlyData(fromDate, toDate);
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    return results.stream()
        .map(row -> {
          // For monthly, the period is returned as a string in format 'YYYY-MM-01'
          String periodStr = (String) row[0];
          LocalDate period = LocalDate.parse(periodStr, formatter);
          Double grossRevenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          Double netRevenue = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;

          // Round currency values
          grossRevenue = roundCurrency(grossRevenue);
          netRevenue = roundCurrency(netRevenue);

          // Calculate derived metrics
          Double partnerPayout = roundCurrency(grossRevenue - netRevenue);
          Double grossMargin = calculateGrossMargin(netRevenue, grossRevenue);

          return FinancialsReportResponse.FinancialDataPoint.builder()
              .period(period)
              .grossRevenue(grossRevenue)
              .netRevenue(netRevenue)
              .partnerPayout(partnerPayout)
              .grossMargin(grossMargin)
              .build();
        })
        .collect(Collectors.toList());
  }

  /**
   * Helper method to safely extract Double from Object (handles BigInteger,
   * BigDecimal, etc.)
   */
  private Double extractDouble(Object obj) {
    if (obj == null) {
      return 0.0;
    }
    if (obj instanceof Number) {
      return ((Number) obj).doubleValue();
    }
    try {
      return Double.parseDouble(obj.toString());
    } catch (NumberFormatException e) {
      return 0.0;
    }
  }

  /**
   * Get financials report for admin.
   * 
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @param groupBy  Grouping unit: "day", "week", or "month"
   * @return FinancialsReportResponse
   */
  @Transactional(readOnly = true)
  public FinancialsReportResponse getFinancialsReport(
      LocalDate fromDate, LocalDate toDate, String groupBy) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    return getSinglePeriodFinancialsReport(fromDate, toDate, groupBy);
  }

  /**
   * Get financials report with period comparison for admin.
   * 
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param groupBy     Grouping unit: "day", "week", or "month"
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @return FinancialsReportComparisonResponse
   */
  @Transactional(readOnly = true)
  public FinancialsReportComparisonResponse getFinancialsReportWithComparison(
      LocalDate fromDate, LocalDate toDate, String groupBy,
      LocalDate compareFrom, LocalDate compareTo) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data
    FinancialsReportResponse currentPeriod = getSinglePeriodFinancialsReport(fromDate, toDate, groupBy);

    // Get previous period data
    FinancialsReportResponse previousPeriod = getSinglePeriodFinancialsReport(compareFrom, compareTo, groupBy);

    // Calculate comparison
    double grossRevenueDiff = currentPeriod.getSummary().getTotalGrossRevenue()
        - previousPeriod.getSummary().getTotalGrossRevenue();
    double grossRevenuePct = calculatePercentageChange(
        currentPeriod.getSummary().getTotalGrossRevenue(),
        previousPeriod.getSummary().getTotalGrossRevenue());
    grossRevenuePct = roundCurrency(grossRevenuePct);

    double netRevenueDiff = currentPeriod.getSummary().getTotalNetRevenue()
        - previousPeriod.getSummary().getTotalNetRevenue();
    double netRevenuePct = calculatePercentageChange(
        currentPeriod.getSummary().getTotalNetRevenue(),
        previousPeriod.getSummary().getTotalNetRevenue());
    netRevenuePct = roundCurrency(netRevenuePct);

    double partnerPayoutDiff = currentPeriod.getSummary().getTotalPartnerPayout()
        - previousPeriod.getSummary().getTotalPartnerPayout();
    double partnerPayoutPct = calculatePercentageChange(
        currentPeriod.getSummary().getTotalPartnerPayout(),
        previousPeriod.getSummary().getTotalPartnerPayout());
    partnerPayoutPct = roundCurrency(partnerPayoutPct);

    double grossMarginDiff = currentPeriod.getSummary().getAverageGrossMargin()
        - previousPeriod.getSummary().getAverageGrossMargin();
    double grossMarginPct = calculatePercentageChange(
        currentPeriod.getSummary().getAverageGrossMargin(),
        previousPeriod.getSummary().getAverageGrossMargin());
    grossMarginPct = roundCurrency(grossMarginPct);

    FinancialsReportComparisonResponse.FinancialComparison comparison = FinancialsReportComparisonResponse.FinancialComparison
        .builder()
        .grossRevenueDifference(roundCurrency(grossRevenueDiff))
        .grossRevenuePercentageChange(grossRevenuePct)
        .netRevenueDifference(roundCurrency(netRevenueDiff))
        .netRevenuePercentageChange(netRevenuePct)
        .partnerPayoutDifference(roundCurrency(partnerPayoutDiff))
        .partnerPayoutPercentageChange(partnerPayoutPct)
        .grossMarginDifference(roundCurrency(grossMarginDiff))
        .grossMarginPercentageChange(grossMarginPct)
        .build();

    return FinancialsReportComparisonResponse.builder()
        .currentPeriod(currentPeriod)
        .previousPeriod(previousPeriod)
        .comparison(comparison)
        .build();
  }

  /**
   * Generate system daily reports for all dates in the system.
   * This method finds the date range from Booking and User tables and processes all dates.
   * Note: This should be run after PartnerReportService.generateAllDailyReports() to ensure
   * HotelDailyReport data is available.
   * 
   * @return Map containing summary of the operation (totalDates, successCount, failureCount)
   */
  public Map<String, Object> generateAllSystemDailyReports() {
    log.info("Starting bulk system daily report generation for all dates");

    try {
      // Find date range from Booking table
      Query bookingDateRangeQuery = entityManager.createNativeQuery(ReportQueries.FIND_BOOKING_DATE_RANGE);
      Object[] bookingDateRangeResult = (Object[]) bookingDateRangeQuery.getSingleResult();

      // Find date range from User table
      Query userDateRangeQuery = entityManager.createNativeQuery(ReportQueries.FIND_USER_DATE_RANGE);
      Object[] userDateRangeResult = (Object[]) userDateRangeQuery.getSingleResult();

      LocalDate minDate = null;
      LocalDate maxDate = null;

      // Determine overall min and max date from both sources
      // Parse date result - could be Date, String, or LocalDate
      if (bookingDateRangeResult != null && bookingDateRangeResult[0] != null && bookingDateRangeResult[1] != null) {
        try {
          LocalDate bookingMin;
          LocalDate bookingMax;
          
          if (bookingDateRangeResult[0] instanceof java.sql.Date) {
            bookingMin = ((java.sql.Date) bookingDateRangeResult[0]).toLocalDate();
          } else if (bookingDateRangeResult[0] instanceof java.sql.Timestamp) {
            bookingMin = ((java.sql.Timestamp) bookingDateRangeResult[0]).toLocalDateTime().toLocalDate();
          } else if (bookingDateRangeResult[0] instanceof String) {
            bookingMin = LocalDate.parse((String) bookingDateRangeResult[0]);
          } else if (bookingDateRangeResult[0] instanceof java.time.LocalDate) {
            bookingMin = (LocalDate) bookingDateRangeResult[0];
          } else {
            throw new IllegalArgumentException("Unexpected date type: " + bookingDateRangeResult[0].getClass().getName());
          }

          if (bookingDateRangeResult[1] instanceof java.sql.Date) {
            bookingMax = ((java.sql.Date) bookingDateRangeResult[1]).toLocalDate();
          } else if (bookingDateRangeResult[1] instanceof java.sql.Timestamp) {
            bookingMax = ((java.sql.Timestamp) bookingDateRangeResult[1]).toLocalDateTime().toLocalDate();
          } else if (bookingDateRangeResult[1] instanceof String) {
            bookingMax = LocalDate.parse((String) bookingDateRangeResult[1]);
          } else if (bookingDateRangeResult[1] instanceof java.time.LocalDate) {
            bookingMax = (LocalDate) bookingDateRangeResult[1];
          } else {
            throw new IllegalArgumentException("Unexpected date type: " + bookingDateRangeResult[1].getClass().getName());
          }
          
          minDate = bookingMin;
          maxDate = bookingMax;
        } catch (Exception e) {
          log.error("Error parsing booking date range result: {}", e.getMessage(), e);
          throw new AppException(ErrorType.UNKNOWN_ERROR);
        }
      }

      if (userDateRangeResult != null && userDateRangeResult[0] != null && userDateRangeResult[1] != null) {
        try {
          LocalDate userMin;
          LocalDate userMax;
          
          if (userDateRangeResult[0] instanceof java.sql.Date) {
            userMin = ((java.sql.Date) userDateRangeResult[0]).toLocalDate();
          } else if (userDateRangeResult[0] instanceof java.sql.Timestamp) {
            userMin = ((java.sql.Timestamp) userDateRangeResult[0]).toLocalDateTime().toLocalDate();
          } else if (userDateRangeResult[0] instanceof String) {
            userMin = LocalDate.parse((String) userDateRangeResult[0]);
          } else if (userDateRangeResult[0] instanceof java.time.LocalDate) {
            userMin = (LocalDate) userDateRangeResult[0];
          } else {
            throw new IllegalArgumentException("Unexpected date type: " + userDateRangeResult[0].getClass().getName());
          }

          if (userDateRangeResult[1] instanceof java.sql.Date) {
            userMax = ((java.sql.Date) userDateRangeResult[1]).toLocalDate();
          } else if (userDateRangeResult[1] instanceof java.sql.Timestamp) {
            userMax = ((java.sql.Timestamp) userDateRangeResult[1]).toLocalDateTime().toLocalDate();
          } else if (userDateRangeResult[1] instanceof String) {
            userMax = LocalDate.parse((String) userDateRangeResult[1]);
          } else if (userDateRangeResult[1] instanceof java.time.LocalDate) {
            userMax = (LocalDate) userDateRangeResult[1];
          } else {
            throw new IllegalArgumentException("Unexpected date type: " + userDateRangeResult[1].getClass().getName());
          }
          
          if (minDate == null || userMin.isBefore(minDate)) {
            minDate = userMin;
          }
          if (maxDate == null || userMax.isAfter(maxDate)) {
            maxDate = userMax;
          }
        } catch (Exception e) {
          log.error("Error parsing user date range result: {}", e.getMessage(), e);
          throw new AppException(ErrorType.UNKNOWN_ERROR);
        }
      }

      if (minDate == null || maxDate == null) {
        log.warn("No data found in Booking or User tables");
        return Map.of(
            "totalDates", 0,
            "successCount", 0,
            "failureCount", 0,
            "message", "No data found in Booking or User tables");
      }

      // Limit maxDate to today - reports should only be generated for past dates
      LocalDate today = LocalDate.now();
      if (maxDate.isAfter(today)) {
        log.info("Limiting maxDate from {} to {} (today) - reports should only be generated for past dates", maxDate, today);
        maxDate = today;
      }
      
      // Ensure minDate is not in the future
      if (minDate.isAfter(today)) {
        log.warn("minDate {} is in the future, no reports to generate", minDate);
        return Map.of(
            "totalDates", 0,
            "successCount", 0,
            "failureCount", 0,
            "message", "No past dates found in the system");
      }

      log.info("Found date range: {} to {} (limited to today)", minDate, maxDate);

      int successCount = 0;
      int failureCount = 0;
      List<String> errors = new ArrayList<>();

      // Process each date from minDate to maxDate
      // Use getSelf() to call through Spring proxy, ensuring transaction propagation works
      LocalDate currentDate = minDate;
      while (!currentDate.isAfter(maxDate)) {
        try {
          log.info("Processing date: {}", currentDate);
          getSelf().generateSystemDailyReport(currentDate);
          successCount++;
        } catch (Exception e) {
          failureCount++;
          String errorMsg = String.format("Error processing date %s: %s", currentDate, e.getMessage());
          log.error(errorMsg, e);
          errors.add(errorMsg);
        }
        currentDate = currentDate.plusDays(1);
      }

      int totalDates = (int) java.time.temporal.ChronoUnit.DAYS.between(minDate, maxDate) + 1;

      log.info("Completed bulk system daily report generation. Total: {}, Success: {}, Failed: {}",
          totalDates, successCount, failureCount);

      Map<String, Object> result = new HashMap<>();
      result.put("totalDates", totalDates);
      result.put("successCount", successCount);
      result.put("failureCount", failureCount);
      result.put("minDate", minDate);
      result.put("maxDate", maxDate);
      if (!errors.isEmpty()) {
        result.put("errors", errors.subList(0, Math.min(10, errors.size()))); // Limit to first 10 errors
      }

      return result;

    } catch (Exception e) {
      log.error("Error in bulk system daily report generation: {}", e.getMessage(), e);
      throw e;
    }
  }
}
