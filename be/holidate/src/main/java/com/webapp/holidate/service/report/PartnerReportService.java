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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.holidate.component.security.filter.CustomAuthenticationToken;
import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.dto.response.report.partner.BookingsSummaryComparisonResponse;
import com.webapp.holidate.dto.response.report.partner.BookingsSummaryResponse;
import com.webapp.holidate.dto.response.report.partner.CustomerSummaryComparisonResponse;
import com.webapp.holidate.dto.response.report.partner.CustomerSummaryResponse;
import com.webapp.holidate.dto.response.report.partner.OccupancyReportComparisonResponse;
import com.webapp.holidate.dto.response.report.partner.OccupancyReportResponse;
import com.webapp.holidate.dto.response.report.partner.RevenueReportComparisonResponse;
import com.webapp.holidate.dto.response.report.partner.RevenueReportResponse;
import com.webapp.holidate.dto.response.report.partner.ReviewSummaryComparisonResponse;
import com.webapp.holidate.dto.response.report.partner.ReviewSummaryResponse;
import com.webapp.holidate.dto.response.report.partner.RoomPerformanceComparisonResponse;
import com.webapp.holidate.dto.response.report.partner.RoomPerformanceResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.booking.Booking;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.repository.accommodation.HotelRepository;
import com.webapp.holidate.repository.booking.ReviewRepository;
import com.webapp.holidate.repository.report.HotelDailyReportRepository;
import com.webapp.holidate.repository.report.RoomDailyPerformanceRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;
import com.webapp.holidate.type.booking.BookingStatusType;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PartnerReportService implements ApplicationContextAware {

  HotelDailyReportRepository hotelDailyReportRepository;
  RoomDailyPerformanceRepository roomDailyPerformanceRepository;
  ReviewRepository reviewRepository;
  EntityManager entityManager;
  UserRepository userRepository;
  HotelRepository hotelRepository;
  
  // ApplicationContext to get self bean (Spring proxy) for transaction management
  // Cannot be final because it's set via ApplicationContextAware
  @lombok.experimental.NonFinal
  ApplicationContext applicationContext;
  
  @Override
  public void setApplicationContext(@org.springframework.lang.NonNull ApplicationContext applicationContext) throws BeansException {
    this.applicationContext = applicationContext;
  }
  
  private PartnerReportService getSelf() {
    return applicationContext.getBean(PartnerReportService.class);
  }

  /**
   * Generate daily reports for partners (hotels) for the specified date.
   * This method implements the 6-step process described in the documentation.
   * 
   * @param reportDate The date to generate reports for (typically yesterday)
   */
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void generateDailyReports(LocalDate reportDate) {
    log.info("Starting partner daily report generation for date: {}", reportDate);

    try {
      // Step 0: Initialize transaction (handled by @Transactional)
      LocalDateTime startTime = LocalDateTime.now();
      LocalDateTime updatedAt = LocalDateTime.now();

      // Step 1: Prepare source data - Get all bookings related to report date
      List<Booking> bookings = getBookingsForReportDate(reportDate);
      log.info("Found {} bookings related to report date {}", bookings.size(), reportDate);

      // Step 2: Calculate hotel metrics
      Map<String, HotelMetrics> hotelMetricsMap = calculateHotelMetrics(bookings, reportDate);
      log.info("Calculated metrics for {} hotels", hotelMetricsMap.size());

      // Step 3: Calculate room metrics
      Map<String, RoomMetrics> roomMetricsMap = calculateRoomMetrics(bookings, reportDate);
      log.info("Calculated metrics for {} rooms", roomMetricsMap.size());

      // Step 4: Aggregate review data
      Map<String, ReviewMetrics> reviewMetricsMap = calculateReviewMetrics(reportDate);
      log.info("Calculated review metrics for {} hotels", reviewMetricsMap.size());

      // Step 5: Upsert data
      upsertHotelDailyReports(hotelMetricsMap, reviewMetricsMap, reportDate, updatedAt);
      upsertRoomDailyPerformances(roomMetricsMap, reportDate, updatedAt);

      // Step 6: Commit transaction (handled by @Transactional)
      LocalDateTime endTime = LocalDateTime.now();
      log.info("Successfully generated partner daily reports for date {} in {} ms",
          reportDate, java.time.Duration.between(startTime, endTime).toMillis());

    } catch (Exception e) {
      log.error("Error generating partner daily reports for date {}: {}", reportDate, e.getMessage(), e);
      throw e; // This will trigger rollback
    }
  }

  /**
   * Step 1: Get all bookings related to the report date
   */
  private List<Booking> getBookingsForReportDate(LocalDate reportDate) {
    LocalDateTime reportDateStart = reportDate.atStartOfDay();
    LocalDateTime reportDateEnd = reportDate.plusDays(1).atStartOfDay();

    TypedQuery<Booking> query = entityManager.createQuery(ReportQueries.FIND_BOOKINGS_FOR_REPORT_DATE, Booking.class);
    query.setParameter("reportDate", reportDate);
    query.setParameter("reportDateStart", reportDateStart);
    query.setParameter("reportDateEnd", reportDateEnd);
    query.setParameter("completedStatus", BookingStatusType.COMPLETED.getValue());
    query.setParameter("cancelledStatus", BookingStatusType.CANCELLED.getValue());
    query.setParameter("confirmedStatus", BookingStatusType.CONFIRMED.getValue());
    query.setParameter("checkedInStatus", BookingStatusType.CHECKED_IN.getValue());
    return query.getResultList();
  }

  /**
   * Step 2: Calculate hotel metrics from bookings
   */
  private Map<String, HotelMetrics> calculateHotelMetrics(List<Booking> bookings, LocalDate reportDate) {
    Map<String, HotelMetrics> metricsMap = new HashMap<>();

    // Group bookings by hotel
    Map<String, List<Booking>> bookingsByHotel = new HashMap<>();
    for (Booking booking : bookings) {
      String hotelId = booking.getHotel().getId();
      bookingsByHotel.computeIfAbsent(hotelId, k -> new ArrayList<>()).add(booking);
    }

    // Calculate metrics for each hotel
    for (Map.Entry<String, List<Booking>> entry : bookingsByHotel.entrySet()) {
      String hotelId = entry.getKey();
      List<Booking> hotelBookings = entry.getValue();

      HotelMetrics metrics = new HotelMetrics();

      for (Booking booking : hotelBookings) {
        LocalDateTime createdAt = booking.getCreatedAt();
        LocalDateTime updatedAt = booking.getUpdatedAt();
        String status = booking.getStatus();

        // Total revenue (completed bookings with checkOutDate = reportDate)
        if (BookingStatusType.COMPLETED.getValue().equals(status) &&
            booking.getCheckOutDate().equals(reportDate)) {
          metrics.totalRevenue += booking.getFinalPrice();
        }

        // Created bookings
        if (createdAt != null && createdAt.toLocalDate().equals(reportDate)) {
          metrics.createdBookings++;
        }

        // Completed bookings
        if (BookingStatusType.COMPLETED.getValue().equals(status) &&
            booking.getCheckOutDate().equals(reportDate)) {
          metrics.completedBookings++;
        }

        // Cancelled bookings
        if (BookingStatusType.CANCELLED.getValue().equals(status) &&
            updatedAt != null && updatedAt.toLocalDate().equals(reportDate)) {
          metrics.cancelledBookings++;
        }

        // Occupied room nights
        if ((BookingStatusType.CONFIRMED.getValue().equals(status) ||
            BookingStatusType.CHECKED_IN.getValue().equals(status)) &&
            booking.getCheckInDate().isBefore(reportDate.plusDays(1)) &&
            booking.getCheckOutDate().isAfter(reportDate)) {
          metrics.occupiedRoomNights += booking.getNumberOfRooms();
        }
      }

      // Get total room nights for this hotel
      metrics.totalRoomNights = getTotalRoomNightsForHotel(hotelId);

      // Calculate new/returning customer bookings
      calculateCustomerBookingMetrics(hotelBookings, reportDate, metrics);

      metricsMap.put(hotelId, metrics);
    }

    return metricsMap;
  }

  /**
   * Get total room nights (sum of quantity for ACTIVE rooms)
   */
  private int getTotalRoomNightsForHotel(String hotelId) {
    Query query = entityManager.createQuery(ReportQueries.GET_TOTAL_ROOM_NIGHTS_BY_HOTEL);
    query.setParameter("hotelId", hotelId);
    query.setParameter("activeStatus", AccommodationStatusType.ACTIVE.getValue());
    Object result = query.getSingleResult();
    return result != null ? ((Number) result).intValue() : 0;
  }

  /**
   * Calculate new and returning customer bookings
   */
  private void calculateCustomerBookingMetrics(List<Booking> hotelBookings, LocalDate reportDate,
      HotelMetrics metrics) {
    // Get all completed bookings for this hotel to find first completion dates
    TypedQuery<Object[]> query = entityManager.createQuery(ReportQueries.FIND_FIRST_COMPLETION_DATES, Object[].class);
    query.setParameter("completedStatus", BookingStatusType.COMPLETED.getValue());
    List<Object[]> firstCompletions = query.getResultList();

    // Build a map of (userId, hotelId) -> firstCompletionDate
    Map<String, LocalDate> firstCompletionMap = new HashMap<>();
    for (Object[] row : firstCompletions) {
      String userId = (String) row[0];
      String hotelId = (String) row[1];
      LocalDate firstCompletionDate = (LocalDate) row[2];
      firstCompletionMap.put(userId + "|" + hotelId, firstCompletionDate);
    }

    // Count new and returning customers
    for (Booking booking : hotelBookings) {
      if (BookingStatusType.COMPLETED.getValue().equals(booking.getStatus()) &&
          booking.getCheckOutDate().equals(reportDate)) {
        String key = booking.getUser().getId() + "|" + booking.getHotel().getId();
        LocalDate firstCompletionDate = firstCompletionMap.get(key);

        if (firstCompletionDate != null) {
          if (firstCompletionDate.equals(reportDate)) {
            metrics.newCustomerBookings++;
          } else if (firstCompletionDate.isBefore(reportDate)) {
            metrics.returningCustomerBookings++;
          }
        }
      }
    }
  }

  /**
   * Step 3: Calculate room metrics
   */
  private Map<String, RoomMetrics> calculateRoomMetrics(List<Booking> bookings, LocalDate reportDate) {
    Map<String, RoomMetrics> metricsMap = new HashMap<>();

    // Group bookings by room
    Map<String, List<Booking>> bookingsByRoom = new HashMap<>();
    for (Booking booking : bookings) {
      // Only include bookings relevant for room metrics
      if ((BookingStatusType.COMPLETED.getValue().equals(booking.getStatus()) &&
          booking.getCheckOutDate().equals(reportDate)) ||
          ((BookingStatusType.CONFIRMED.getValue().equals(booking.getStatus()) ||
              BookingStatusType.CHECKED_IN.getValue().equals(booking.getStatus())) &&
              booking.getCheckInDate().isBefore(reportDate.plusDays(1)) &&
              booking.getCheckOutDate().isAfter(reportDate))) {
        String roomId = booking.getRoom().getId();
        bookingsByRoom.computeIfAbsent(roomId, k -> new ArrayList<>()).add(booking);
      }
    }

    // Calculate metrics for each room
    for (Map.Entry<String, List<Booking>> entry : bookingsByRoom.entrySet()) {
      String roomId = entry.getKey();
      List<Booking> roomBookings = entry.getValue();

      RoomMetrics metrics = new RoomMetrics();
      metrics.roomId = roomId;

      // Get hotelId from first booking (all bookings for a room have same hotel)
      if (!roomBookings.isEmpty()) {
        metrics.hotelId = roomBookings.get(0).getHotel().getId();
      }

      for (Booking booking : roomBookings) {
        String status = booking.getStatus();

        // Revenue (completed bookings with checkOutDate = reportDate)
        if (BookingStatusType.COMPLETED.getValue().equals(status) &&
            booking.getCheckOutDate().equals(reportDate)) {
          metrics.revenue += booking.getFinalPrice();
        }

        // Booked room nights
        if ((BookingStatusType.CONFIRMED.getValue().equals(status) ||
            BookingStatusType.CHECKED_IN.getValue().equals(status)) &&
            booking.getCheckInDate().isBefore(reportDate.plusDays(1)) &&
            booking.getCheckOutDate().isAfter(reportDate)) {
          metrics.bookedRoomNights += booking.getNumberOfRooms();
        }
      }

      metricsMap.put(roomId, metrics);
    }

    return metricsMap;
  }

  /**
   * Step 4: Aggregate review data
   */
  private Map<String, ReviewMetrics> calculateReviewMetrics(LocalDate reportDate) {
    Map<String, ReviewMetrics> metricsMap = new HashMap<>();

    LocalDateTime reportDateStart = reportDate.atStartOfDay();
    LocalDateTime reportDateEnd = reportDate.plusDays(1).atStartOfDay();

    TypedQuery<Object[]> query = entityManager.createQuery(ReportQueries.CALCULATE_REVIEW_METRICS, Object[].class);
    query.setParameter("reportDateStart", reportDateStart);
    query.setParameter("reportDateEnd", reportDateEnd);
    List<Object[]> results = query.getResultList();

    for (Object[] row : results) {
      String hotelId = (String) row[0];
      Double averageScore = row[1] != null ? ((Number) row[1]).doubleValue() : null;
      Long reviewCount = ((Number) row[2]).longValue();

      ReviewMetrics metrics = new ReviewMetrics();
      metrics.averageReviewScore = averageScore;
      metrics.reviewCount = reviewCount.intValue();

      metricsMap.put(hotelId, metrics);
    }

    return metricsMap;
  }

  /**
   * Step 5: Upsert hotel daily reports
   */
  private void upsertHotelDailyReports(
      Map<String, HotelMetrics> hotelMetricsMap,
      Map<String, ReviewMetrics> reviewMetricsMap,
      LocalDate reportDate,
      LocalDateTime updatedAt) {

    for (Map.Entry<String, HotelMetrics> entry : hotelMetricsMap.entrySet()) {
      String hotelId = entry.getKey();
      HotelMetrics metrics = entry.getValue();
      ReviewMetrics reviewMetrics = reviewMetricsMap.getOrDefault(hotelId, new ReviewMetrics());

      hotelDailyReportRepository.upsertHotelDailyReport(
          hotelId,
          reportDate,
          metrics.totalRevenue,
          metrics.createdBookings,
          metrics.completedBookings,
          metrics.cancelledBookings,
          metrics.occupiedRoomNights,
          metrics.totalRoomNights,
          metrics.newCustomerBookings,
          metrics.returningCustomerBookings,
          reviewMetrics.averageReviewScore,
          reviewMetrics.reviewCount,
          updatedAt);
    }
  }

  /**
   * Step 5: Upsert room daily performances
   */
  private void upsertRoomDailyPerformances(
      Map<String, RoomMetrics> roomMetricsMap,
      LocalDate reportDate,
      LocalDateTime updatedAt) {

    for (Map.Entry<String, RoomMetrics> entry : roomMetricsMap.entrySet()) {
      RoomMetrics metrics = entry.getValue();

      roomDailyPerformanceRepository.upsertRoomDailyPerformance(
          metrics.roomId,
          reportDate,
          metrics.hotelId,
          metrics.revenue,
          metrics.bookedRoomNights,
          updatedAt);
    }
  }

  // Inner classes for metrics
  private static class HotelMetrics {
    double totalRevenue = 0.0;
    int createdBookings = 0;
    int completedBookings = 0;
    int cancelledBookings = 0;
    int occupiedRoomNights = 0;
    int totalRoomNights = 0;
    int newCustomerBookings = 0;
    int returningCustomerBookings = 0;
  }

  private static class RoomMetrics {
    String roomId;
    String hotelId;
    double revenue = 0.0;
    int bookedRoomNights = 0;
  }

  private static class ReviewMetrics {
    Double averageReviewScore;
    int reviewCount = 0;
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
   * Helper method to safely extract Long from Object (handles BigInteger, BigDecimal, etc.)
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
   * Helper method to safely extract Double from Object (handles BigInteger, BigDecimal, etc.)
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
   * Helper method to validate date range and authorize hotel access
   */
  private void validateAndAuthorize(String hotelId, LocalDate fromDate, LocalDate toDate) {
    // Validate date range
    if (fromDate.isAfter(toDate)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get authenticated user and validate hotel ownership
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication instanceof CustomAuthenticationToken)) {
      throw new AppException(ErrorType.UNAUTHORIZED);
    }

    CustomAuthenticationToken authToken = (CustomAuthenticationToken) authentication;
    String email = authToken.getName();
    User partner = userRepository.findByEmail(email)
        .orElseThrow(() -> new AppException(ErrorType.USER_NOT_FOUND));

    // Validate hotel exists and belongs to this partner
    Hotel hotel = hotelRepository.findById(hotelId)
        .orElseThrow(() -> new AppException(ErrorType.HOTEL_NOT_FOUND));

    if (!hotel.getPartner().getId().equals(partner.getId())) {
      throw new AppException(ErrorType.ACCESS_DENIED);
    }
  }

  /**
   * Get revenue report for a partner's hotel (core logic without validation).
   * This is a reusable method for comparison features.
   */
  private RevenueReportResponse getSinglePeriodRevenueReport(String hotelId, LocalDate fromDate, LocalDate toDate,
      String groupBy) {
    // Validate groupBy parameter
    String normalizedGroupBy = (groupBy == null || groupBy.isEmpty()) ? "day" : groupBy.toLowerCase();
    if (!normalizedGroupBy.equals("day") && !normalizedGroupBy.equals("week") && !normalizedGroupBy.equals("month")) {
      throw new AppException(ErrorType.INVALID_GROUP_BY);
    }

    // Get revenue data based on groupBy
    List<RevenueReportResponse.RevenueDataPoint> dataPoints;
    if (normalizedGroupBy.equals("day")) {
      dataPoints = getDailyRevenueData(hotelId, fromDate, toDate);
    } else if (normalizedGroupBy.equals("week")) {
      dataPoints = getWeeklyRevenueData(hotelId, fromDate, toDate);
    } else {
      dataPoints = getMonthlyRevenueData(hotelId, fromDate, toDate);
    }

    // Get total revenue for summary
    Double totalRevenue = hotelDailyReportRepository.getTotalRevenue(hotelId, fromDate, toDate);
    if (totalRevenue == null) {
      totalRevenue = 0.0;
    }

    // Build response
    RevenueReportResponse.RevenueSummary summary = RevenueReportResponse.RevenueSummary.builder()
        .totalRevenue(totalRevenue)
        .build();

    return RevenueReportResponse.builder()
        .data(dataPoints)
        .summary(summary)
        .build();
  }

  /**
   * Get revenue report for a partner's hotel.
   * 
   * @param hotelId  The hotel ID
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @param groupBy  Grouping unit: "day", "week", or "month"
   * @return RevenueReportResponse
   */
  @Transactional(readOnly = true)
  public RevenueReportResponse getRevenueReport(String hotelId, LocalDate fromDate, LocalDate toDate, String groupBy) {
    validateAndAuthorize(hotelId, fromDate, toDate);
    return getSinglePeriodRevenueReport(hotelId, fromDate, toDate, groupBy);
  }

  /**
   * Get revenue report with period comparison for a partner's hotel.
   * 
   * @param hotelId     The hotel ID
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param groupBy     Grouping unit: "day", "week", or "month"
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @return RevenueReportComparisonResponse
   */
  @Transactional(readOnly = true)
  public RevenueReportComparisonResponse getRevenueReportWithComparison(String hotelId, LocalDate fromDate,
      LocalDate toDate, String groupBy, LocalDate compareFrom, LocalDate compareTo) {
    validateAndAuthorize(hotelId, fromDate, toDate);

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data
    RevenueReportResponse currentPeriod = getSinglePeriodRevenueReport(hotelId, fromDate, toDate, groupBy);

    // Get previous period data
    RevenueReportResponse previousPeriod = getSinglePeriodRevenueReport(hotelId, compareFrom, compareTo, groupBy);

    // Calculate comparison
    double currentRevenue = currentPeriod.getSummary().getTotalRevenue();
    double previousRevenue = previousPeriod.getSummary().getTotalRevenue();
    double difference = currentRevenue - previousRevenue;
    double percentageChange = calculatePercentageChange(currentRevenue, previousRevenue);
    percentageChange = Math.round(percentageChange * 100.0) / 100.0;

    RevenueReportComparisonResponse.RevenueComparison comparison = RevenueReportComparisonResponse.RevenueComparison
        .builder()
        .totalRevenueDifference(difference)
        .totalRevenuePercentageChange(percentageChange)
        .build();

    return RevenueReportComparisonResponse.builder()
        .currentPeriod(currentPeriod)
        .previousPeriod(previousPeriod)
        .comparison(comparison)
        .build();
  }

  /**
   * Get daily revenue data
   */
  private List<RevenueReportResponse.RevenueDataPoint> getDailyRevenueData(String hotelId, LocalDate fromDate,
      LocalDate toDate) {
    List<Object[]> results = hotelDailyReportRepository.getDailyRevenue(hotelId, fromDate, toDate);
    return results.stream()
        .map(row -> {
          LocalDate period = ((java.sql.Date) row[0]).toLocalDate();
          Double revenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          return RevenueReportResponse.RevenueDataPoint.builder()
              .period(period)
              .revenue(revenue)
              .build();
        })
        .collect(Collectors.toList());
  }

  /**
   * Get weekly revenue data
   */
  private List<RevenueReportResponse.RevenueDataPoint> getWeeklyRevenueData(String hotelId, LocalDate fromDate,
      LocalDate toDate) {
    List<Object[]> results = hotelDailyReportRepository.getWeeklyRevenue(hotelId, fromDate, toDate);
    return results.stream()
        .map(row -> {
          LocalDate period = ((java.sql.Date) row[0]).toLocalDate();
          Double revenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          return RevenueReportResponse.RevenueDataPoint.builder()
              .period(period)
              .revenue(revenue)
              .build();
        })
        .collect(Collectors.toList());
  }

  /**
   * Get monthly revenue data
   */
  private List<RevenueReportResponse.RevenueDataPoint> getMonthlyRevenueData(String hotelId, LocalDate fromDate,
      LocalDate toDate) {
    List<Object[]> results = hotelDailyReportRepository.getMonthlyRevenue(hotelId, fromDate, toDate);
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    return results.stream()
        .map(row -> {
          // For monthly, the period is returned as a string in format 'YYYY-MM-01'
          String periodStr = (String) row[0];
          LocalDate period = LocalDate.parse(periodStr, formatter);
          Double revenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
          return RevenueReportResponse.RevenueDataPoint.builder()
              .period(period)
              .revenue(revenue)
              .build();
        })
        .collect(Collectors.toList());
  }

  /**
   * Get booking summary for a partner's hotel (core logic without validation).
   * This is a reusable method for comparison features.
   */
  private BookingsSummaryResponse getSinglePeriodBookingSummary(String hotelId, LocalDate fromDate, LocalDate toDate) {
    // Use EntityManager to execute query directly (fixes issue with Object[] return type)
    Query query = entityManager.createNativeQuery(ReportQueries.GET_BOOKING_SUMMARY);
    query.setParameter("hotelId", hotelId);
    query.setParameter("fromDate", fromDate);
    query.setParameter("toDate", toDate);
    
    Object[] result = null;
    try {
      @SuppressWarnings("unchecked")
      List<Object[]> results = query.getResultList();
      if (results != null && !results.isEmpty()) {
        result = results.get(0);
      }
    } catch (Exception e) {
      log.error("Error executing booking summary query: {}", e.getMessage(), e);
    }

    // Parse results and handle null values
    Long totalCreated = result != null && result.length > 0 ? extractLong(result[0]) : 0L;
    Long totalCompleted = result != null && result.length > 1 ? extractLong(result[1]) : 0L;
    Long totalCancelled = result != null && result.length > 2 ? extractLong(result[2]) : 0L;

    // Calculate cancellation rate (handle divide by zero)
    double cancellationRate = 0.0;
    if (totalCreated > 0) {
      cancellationRate = ((double) totalCancelled / totalCreated) * 100.0;
      // Round to 2 decimal places
      cancellationRate = Math.round(cancellationRate * 100.0) / 100.0;
    }

    // Build response
    return BookingsSummaryResponse.builder()
        .totalCreated(totalCreated)
        .totalCompleted(totalCompleted)
        .totalCancelled(totalCancelled)
        .cancellationRate(cancellationRate)
        .build();
  }

  /**
   * Get booking summary for a partner's hotel.
   * 
   * @param hotelId  The hotel ID
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @return BookingsSummaryResponse
   */
  @Transactional(readOnly = true)
  public BookingsSummaryResponse getBookingSummary(String hotelId, LocalDate fromDate, LocalDate toDate) {
    validateAndAuthorize(hotelId, fromDate, toDate);
    return getSinglePeriodBookingSummary(hotelId, fromDate, toDate);
  }

  /**
   * Get booking summary with period comparison for a partner's hotel.
   * 
   * @param hotelId     The hotel ID
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @return BookingsSummaryComparisonResponse
   */
  @Transactional(readOnly = true)
  public BookingsSummaryComparisonResponse getBookingSummaryWithComparison(String hotelId, LocalDate fromDate,
      LocalDate toDate, LocalDate compareFrom, LocalDate compareTo) {
    validateAndAuthorize(hotelId, fromDate, toDate);

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data
    BookingsSummaryResponse currentPeriod = getSinglePeriodBookingSummary(hotelId, fromDate, toDate);

    // Get previous period data
    BookingsSummaryResponse previousPeriod = getSinglePeriodBookingSummary(hotelId, compareFrom, compareTo);

    // Calculate comparison
    long totalCreatedDiff = currentPeriod.getTotalCreated() - previousPeriod.getTotalCreated();
    double totalCreatedPct = calculatePercentageChange(currentPeriod.getTotalCreated(),
        previousPeriod.getTotalCreated());
    totalCreatedPct = Math.round(totalCreatedPct * 100.0) / 100.0;

    long totalCompletedDiff = currentPeriod.getTotalCompleted() - previousPeriod.getTotalCompleted();
    double totalCompletedPct = calculatePercentageChange(currentPeriod.getTotalCompleted(),
        previousPeriod.getTotalCompleted());
    totalCompletedPct = Math.round(totalCompletedPct * 100.0) / 100.0;

    long totalCancelledDiff = currentPeriod.getTotalCancelled() - previousPeriod.getTotalCancelled();
    double totalCancelledPct = calculatePercentageChange(currentPeriod.getTotalCancelled(),
        previousPeriod.getTotalCancelled());
    totalCancelledPct = Math.round(totalCancelledPct * 100.0) / 100.0;

    double cancellationRateDiff = currentPeriod.getCancellationRate() - previousPeriod.getCancellationRate();
    double cancellationRatePct = calculatePercentageChange(currentPeriod.getCancellationRate(),
        previousPeriod.getCancellationRate());
    cancellationRatePct = Math.round(cancellationRatePct * 100.0) / 100.0;

    BookingsSummaryComparisonResponse.BookingsComparison comparison = BookingsSummaryComparisonResponse.BookingsComparison
        .builder()
        .totalCreatedDifference(totalCreatedDiff)
        .totalCreatedPercentageChange(totalCreatedPct)
        .totalCompletedDifference(totalCompletedDiff)
        .totalCompletedPercentageChange(totalCompletedPct)
        .totalCancelledDifference(totalCancelledDiff)
        .totalCancelledPercentageChange(totalCancelledPct)
        .cancellationRateDifference(cancellationRateDiff)
        .cancellationRatePercentageChange(cancellationRatePct)
        .build();

    return BookingsSummaryComparisonResponse.builder()
        .currentPeriod(currentPeriod)
        .previousPeriod(previousPeriod)
        .comparison(comparison)
        .build();
  }

  /**
   * Get occupancy report for a partner's hotel (core logic without validation).
   * This is a reusable method for comparison features.
   */
  private OccupancyReportResponse getSinglePeriodOccupancyReport(String hotelId, LocalDate fromDate, LocalDate toDate) {
    // Get daily occupancy data from repository
    List<Object[]> dailyData = hotelDailyReportRepository.getDailyOccupancyData(hotelId, fromDate, toDate);

    // Process daily data and calculate daily occupancy rates
    List<OccupancyReportResponse.OccupancyDataPoint> dataPoints = new ArrayList<>();
    long totalOccupiedForPeriod = 0L;
    long totalAvailableForPeriod = 0L;

    for (Object[] row : dailyData) {
      LocalDate reportDate = ((java.sql.Date) row[0]).toLocalDate();
      int occupiedRoomNights = row[1] != null ? ((Number) row[1]).intValue() : 0;
      int totalRoomNights = row[2] != null ? ((Number) row[2]).intValue() : 0;

      // Calculate daily occupancy rate (handle divide by zero)
      double dailyRate = 0.0;
      if (totalRoomNights > 0) {
        dailyRate = ((double) occupiedRoomNights / totalRoomNights) * 100.0;
        // Round to 2 decimal places
        dailyRate = Math.round(dailyRate * 100.0) / 100.0;
      }

      // Add to daily data points
      dataPoints.add(OccupancyReportResponse.OccupancyDataPoint.builder()
          .date(reportDate)
          .occupancyRate(dailyRate)
          .build());

      // Accumulate totals for average calculation
      totalOccupiedForPeriod += occupiedRoomNights;
      totalAvailableForPeriod += totalRoomNights;
    }

    // Calculate average occupancy rate for the period
    // Important: Use SUM(occupied) / SUM(total), NOT average of daily rates
    double averageRate = 0.0;
    if (totalAvailableForPeriod > 0) {
      averageRate = ((double) totalOccupiedForPeriod / totalAvailableForPeriod) * 100.0;
      // Round to 2 decimal places
      averageRate = Math.round(averageRate * 100.0) / 100.0;
    }

    // Build summary
    OccupancyReportResponse.OccupancySummary summary = OccupancyReportResponse.OccupancySummary.builder()
        .averageRate(averageRate)
        .totalOccupied(totalOccupiedForPeriod)
        .totalAvailable(totalAvailableForPeriod)
        .build();

    // Build response
    return OccupancyReportResponse.builder()
        .data(dataPoints)
        .summary(summary)
        .build();
  }

  /**
   * Get occupancy report for a partner's hotel.
   * 
   * @param hotelId  The hotel ID
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @return OccupancyReportResponse
   */
  @Transactional(readOnly = true)
  public OccupancyReportResponse getOccupancyReport(String hotelId, LocalDate fromDate, LocalDate toDate) {
    validateAndAuthorize(hotelId, fromDate, toDate);
    return getSinglePeriodOccupancyReport(hotelId, fromDate, toDate);
  }

  /**
   * Get occupancy report with period comparison for a partner's hotel.
   * 
   * @param hotelId     The hotel ID
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @return OccupancyReportComparisonResponse
   */
  @Transactional(readOnly = true)
  public OccupancyReportComparisonResponse getOccupancyReportWithComparison(String hotelId, LocalDate fromDate,
      LocalDate toDate, LocalDate compareFrom, LocalDate compareTo) {
    validateAndAuthorize(hotelId, fromDate, toDate);

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data
    OccupancyReportResponse currentPeriod = getSinglePeriodOccupancyReport(hotelId, fromDate, toDate);

    // Get previous period data
    OccupancyReportResponse previousPeriod = getSinglePeriodOccupancyReport(hotelId, compareFrom, compareTo);

    // Calculate comparison
    double averageRateDiff = currentPeriod.getSummary().getAverageRate()
        - previousPeriod.getSummary().getAverageRate();
    double averageRatePct = calculatePercentageChange(currentPeriod.getSummary().getAverageRate(),
        previousPeriod.getSummary().getAverageRate());
    averageRatePct = Math.round(averageRatePct * 100.0) / 100.0;

    long totalOccupiedDiff = currentPeriod.getSummary().getTotalOccupied()
        - previousPeriod.getSummary().getTotalOccupied();
    double totalOccupiedPct = calculatePercentageChange(currentPeriod.getSummary().getTotalOccupied(),
        previousPeriod.getSummary().getTotalOccupied());
    totalOccupiedPct = Math.round(totalOccupiedPct * 100.0) / 100.0;

    OccupancyReportComparisonResponse.OccupancyComparison comparison = OccupancyReportComparisonResponse.OccupancyComparison
        .builder()
        .averageRateDifference(averageRateDiff)
        .averageRatePercentageChange(averageRatePct)
        .totalOccupiedDifference(totalOccupiedDiff)
        .totalOccupiedPercentageChange(totalOccupiedPct)
        .build();

    return OccupancyReportComparisonResponse.builder()
        .currentPeriod(currentPeriod)
        .previousPeriod(previousPeriod)
        .comparison(comparison)
        .build();
  }

  /**
   * Get room performance report for a partner's hotel (core logic without
   * validation).
   * This is a reusable method for comparison features.
   */
  private RoomPerformanceResponse getSinglePeriodRoomPerformance(String hotelId, LocalDate fromDate, LocalDate toDate,
      String sortBy, String sortOrder) {
    // Validate and normalize sortBy parameter
    String normalizedSortBy = (sortBy == null || sortBy.isEmpty()) ? "revenue" : sortBy.toLowerCase();
    if (!normalizedSortBy.equals("revenue") && !normalizedSortBy.equals("bookedroomnights")) {
      throw new AppException(ErrorType.INVALID_SORT_BY);
    }

    // Validate and normalize sortOrder parameter
    String normalizedSortOrder = (sortOrder == null || sortOrder.isEmpty()) ? "desc" : sortOrder.toLowerCase();
    if (!normalizedSortOrder.equals("asc") && !normalizedSortOrder.equals("desc")) {
      throw new AppException(ErrorType.INVALID_SORT_ORDER);
    }

    // Build dynamic ORDER BY clause safely
    String orderByColumn;
    if (normalizedSortBy.equals("revenue")) {
      orderByColumn = "SUM(rdp.revenue)";
    } else if (normalizedSortBy.equals("bookedroomnights")) {
      orderByColumn = "SUM(rdp.booked_room_nights)";
    } else {
      // Should not reach here due to validation above, but add default for safety
      orderByColumn = "SUM(rdp.revenue)";
    }

    String orderByClause = orderByColumn + " " + normalizedSortOrder.toUpperCase();

    // Build complete query with dynamic ORDER BY
    String queryString = ReportQueries.GET_ROOM_PERFORMANCE_BASE + " ORDER BY " + orderByClause;

    // Execute query using EntityManager
    Query query = entityManager.createNativeQuery(queryString);
    query.setParameter("hotelId", hotelId);
    query.setParameter("fromDate", fromDate);
    query.setParameter("toDate", toDate);

    @SuppressWarnings("unchecked")
    List<Object[]> results = query.getResultList();

    // Map results to DTO
    List<RoomPerformanceResponse.RoomPerformanceItem> items = results.stream()
        .map(row -> {
          String roomId = (String) row[0];
          String roomName = (String) row[1];
          String roomView = (String) row[2];
          Double totalRevenue = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
          Long totalBookedNights = row[4] != null ? ((Number) row[4]).longValue() : 0L;

          return RoomPerformanceResponse.RoomPerformanceItem.builder()
              .roomId(roomId)
              .roomName(roomName)
              .roomView(roomView)
              .totalRevenue(totalRevenue)
              .totalBookedNights(totalBookedNights)
              .build();
        })
        .collect(Collectors.toList());

    // Build response
    return RoomPerformanceResponse.builder()
        .data(items)
        .build();
  }

  /**
   * Get room performance report for a partner's hotel.
   * 
   * @param hotelId   The hotel ID
   * @param fromDate  Start date of the report period
   * @param toDate    End date of the report period
   * @param sortBy    Sort criteria: "revenue" or "bookedRoomNights" (default:
   *                  "revenue")
   * @param sortOrder Sort order: "asc" or "desc" (default: "desc")
   * @return RoomPerformanceResponse
   */
  @Transactional(readOnly = true)
  public RoomPerformanceResponse getRoomPerformance(String hotelId, LocalDate fromDate, LocalDate toDate,
      String sortBy, String sortOrder) {
    validateAndAuthorize(hotelId, fromDate, toDate);
    return getSinglePeriodRoomPerformance(hotelId, fromDate, toDate, sortBy, sortOrder);
  }

  /**
   * Get room performance report with period comparison for a partner's hotel.
   * 
   * @param hotelId     The hotel ID
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param sortBy      Sort criteria: "revenue" or "bookedRoomNights" (default:
   *                    "revenue")
   * @param sortOrder   Sort order: "asc" or "desc" (default: "desc")
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @return RoomPerformanceComparisonResponse
   */
  @Transactional(readOnly = true)
  public RoomPerformanceComparisonResponse getRoomPerformanceWithComparison(String hotelId, LocalDate fromDate,
      LocalDate toDate, String sortBy, String sortOrder, LocalDate compareFrom, LocalDate compareTo) {
    validateAndAuthorize(hotelId, fromDate, toDate);

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data
    RoomPerformanceResponse currentPeriod = getSinglePeriodRoomPerformance(hotelId, fromDate, toDate, sortBy,
        sortOrder);

    // Get previous period data
    RoomPerformanceResponse previousPeriod = getSinglePeriodRoomPerformance(hotelId, compareFrom, compareTo, sortBy,
        sortOrder);

    // Merge two lists by roomId
    Map<String, RoomPerformanceResponse.RoomPerformanceItem> currentMap = currentPeriod.getData().stream()
        .collect(Collectors.toMap(RoomPerformanceResponse.RoomPerformanceItem::getRoomId, item -> item));

    Map<String, RoomPerformanceResponse.RoomPerformanceItem> previousMap = previousPeriod.getData().stream()
        .collect(Collectors.toMap(RoomPerformanceResponse.RoomPerformanceItem::getRoomId, item -> item));

    // Get all unique roomIds
    Set<String> allRoomIds = new HashSet<>(currentMap.keySet());
    allRoomIds.addAll(previousMap.keySet());

    // Build comparison items
    List<RoomPerformanceComparisonResponse.RoomPerformanceComparisonItem> comparisonItems = new ArrayList<>();
    for (String roomId : allRoomIds) {
      RoomPerformanceResponse.RoomPerformanceItem current = currentMap.getOrDefault(roomId,
          RoomPerformanceResponse.RoomPerformanceItem.builder()
              .roomId(roomId)
              .roomName("")
              .roomView("")
              .totalRevenue(0.0)
              .totalBookedNights(0L)
              .build());

      RoomPerformanceResponse.RoomPerformanceItem previous = previousMap.getOrDefault(roomId,
          RoomPerformanceResponse.RoomPerformanceItem.builder()
              .roomId(roomId)
              .roomName("")
              .roomView("")
              .totalRevenue(0.0)
              .totalBookedNights(0L)
              .build());

      // Use current period's room info (name, view)
      String roomName = current.getRoomName() != null && !current.getRoomName().isEmpty() ? current.getRoomName()
          : previous.getRoomName();
      String roomView = current.getRoomView() != null && !current.getRoomView().isEmpty() ? current.getRoomView()
          : previous.getRoomView();

      // Calculate comparison
      double revenueDiff = current.getTotalRevenue() - previous.getTotalRevenue();
      double revenuePct = calculatePercentageChange(current.getTotalRevenue(), previous.getTotalRevenue());
      revenuePct = Math.round(revenuePct * 100.0) / 100.0;

      long bookedNightsDiff = current.getTotalBookedNights() - previous.getTotalBookedNights();
      double bookedNightsPct = calculatePercentageChange(current.getTotalBookedNights(),
          previous.getTotalBookedNights());
      bookedNightsPct = Math.round(bookedNightsPct * 100.0) / 100.0;

      comparisonItems.add(RoomPerformanceComparisonResponse.RoomPerformanceComparisonItem.builder()
          .roomId(roomId)
          .roomName(roomName)
          .roomView(roomView)
          .currentTotalRevenue(current.getTotalRevenue())
          .currentTotalBookedNights(current.getTotalBookedNights())
          .previousTotalRevenue(previous.getTotalRevenue())
          .previousTotalBookedNights(previous.getTotalBookedNights())
          .totalRevenueDifference(revenueDiff)
          .totalRevenuePercentageChange(revenuePct)
          .totalBookedNightsDifference(bookedNightsDiff)
          .totalBookedNightsPercentageChange(bookedNightsPct)
          .build());
    }

    return RoomPerformanceComparisonResponse.builder()
        .data(comparisonItems)
        .build();
  }

  /**
   * Get customer summary report for a partner's hotel (core logic without
   * validation).
   * This is a reusable method for comparison features.
   */
  private CustomerSummaryResponse getSinglePeriodCustomerSummary(String hotelId, LocalDate fromDate, LocalDate toDate) {
    // Use EntityManager directly for native query to ensure correct result mapping
    Query query = entityManager.createNativeQuery(ReportQueries.GET_CUSTOMER_SUMMARY);
    query.setParameter("hotelId", hotelId);
    query.setParameter("fromDate", fromDate);
    query.setParameter("toDate", toDate);

    @SuppressWarnings("unchecked")
    List<Object[]> results = query.getResultList();
    Object[] result = null;
    if (!results.isEmpty()) {
      result = results.get(0);
    }

    // Parse results and handle null values
    long totalNewCustomerBookings = result != null && result.length > 0 ? extractLong(result[0]) : 0L;
    long totalReturningCustomerBookings = result != null && result.length > 1 ? extractLong(result[1]) : 0L;

    // Calculate total completed bookings in period
    long totalCompletedBookingsInPeriod = totalNewCustomerBookings + totalReturningCustomerBookings;

    // Calculate percentages (handle divide by zero)
    double newCustomerPercentage = 0.0;
    double returningCustomerPercentage = 0.0;
    if (totalCompletedBookingsInPeriod > 0) {
      newCustomerPercentage = ((double) totalNewCustomerBookings / totalCompletedBookingsInPeriod) * 100.0;
      returningCustomerPercentage = ((double) totalReturningCustomerBookings / totalCompletedBookingsInPeriod) * 100.0;
      // Round to 2 decimal places
      newCustomerPercentage = Math.round(newCustomerPercentage * 100.0) / 100.0;
      returningCustomerPercentage = Math.round(returningCustomerPercentage * 100.0) / 100.0;
    }

    // Build response
    return CustomerSummaryResponse.builder()
        .totalNewCustomerBookings(totalNewCustomerBookings)
        .totalReturningCustomerBookings(totalReturningCustomerBookings)
        .totalCompletedBookings(totalCompletedBookingsInPeriod)
        .newCustomerPercentage(newCustomerPercentage)
        .returningCustomerPercentage(returningCustomerPercentage)
        .build();
  }

  /**
   * Get customer summary report for a partner's hotel.
   * 
   * @param hotelId  The hotel ID
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @return CustomerSummaryResponse
   */
  @Transactional(readOnly = true)
  public CustomerSummaryResponse getCustomerSummary(String hotelId, LocalDate fromDate, LocalDate toDate) {
    validateAndAuthorize(hotelId, fromDate, toDate);
    return getSinglePeriodCustomerSummary(hotelId, fromDate, toDate);
  }

  /**
   * Get customer summary report with period comparison for a partner's hotel.
   * 
   * @param hotelId     The hotel ID
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @return CustomerSummaryComparisonResponse
   */
  @Transactional(readOnly = true)
  public CustomerSummaryComparisonResponse getCustomerSummaryWithComparison(String hotelId, LocalDate fromDate,
      LocalDate toDate, LocalDate compareFrom, LocalDate compareTo) {
    validateAndAuthorize(hotelId, fromDate, toDate);

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data
    CustomerSummaryResponse currentPeriod = getSinglePeriodCustomerSummary(hotelId, fromDate, toDate);

    // Get previous period data
    CustomerSummaryResponse previousPeriod = getSinglePeriodCustomerSummary(hotelId, compareFrom, compareTo);

    // Calculate comparison
    long newCustomerDiff = currentPeriod.getTotalNewCustomerBookings() - previousPeriod.getTotalNewCustomerBookings();
    double newCustomerPct = calculatePercentageChange(currentPeriod.getTotalNewCustomerBookings(),
        previousPeriod.getTotalNewCustomerBookings());
    newCustomerPct = Math.round(newCustomerPct * 100.0) / 100.0;

    long returningCustomerDiff = currentPeriod.getTotalReturningCustomerBookings()
        - previousPeriod.getTotalReturningCustomerBookings();
    double returningCustomerPct = calculatePercentageChange(currentPeriod.getTotalReturningCustomerBookings(),
        previousPeriod.getTotalReturningCustomerBookings());
    returningCustomerPct = Math.round(returningCustomerPct * 100.0) / 100.0;

    long completedDiff = currentPeriod.getTotalCompletedBookings() - previousPeriod.getTotalCompletedBookings();
    double completedPct = calculatePercentageChange(currentPeriod.getTotalCompletedBookings(),
        previousPeriod.getTotalCompletedBookings());
    completedPct = Math.round(completedPct * 100.0) / 100.0;

    CustomerSummaryComparisonResponse.CustomerComparison comparison = CustomerSummaryComparisonResponse.CustomerComparison
        .builder()
        .totalNewCustomerBookingsDifference(newCustomerDiff)
        .totalNewCustomerBookingsPercentageChange(newCustomerPct)
        .totalReturningCustomerBookingsDifference(returningCustomerDiff)
        .totalReturningCustomerBookingsPercentageChange(returningCustomerPct)
        .totalCompletedBookingsDifference(completedDiff)
        .totalCompletedBookingsPercentageChange(completedPct)
        .build();

    return CustomerSummaryComparisonResponse.builder()
        .currentPeriod(currentPeriod)
        .previousPeriod(previousPeriod)
        .comparison(comparison)
        .build();
  }

  /**
   * Get review summary report for a partner's hotel (core logic without
   * validation).
   * This is a reusable method for comparison features.
   */
  private ReviewSummaryResponse getSinglePeriodReviewSummary(String hotelId, LocalDate fromDate, LocalDate toDate) {
    // Step 1: Get aggregated review stats from HotelDailyReport
    Object[] aggregatedStats = hotelDailyReportRepository.getAggregatedReviewStats(hotelId, fromDate, toDate);
    double totalWeightedScoreSum = aggregatedStats != null && aggregatedStats.length > 0
        ? extractDouble(aggregatedStats[0])
        : 0.0;
    long totalReviewCount = aggregatedStats != null && aggregatedStats.length > 1
        ? extractLong(aggregatedStats[1])
        : 0L;

    // Step 2: Calculate weighted average score (handle divide by zero)
    double averageScore = 0.0;
    if (totalReviewCount > 0) {
      averageScore = totalWeightedScoreSum / totalReviewCount;
      // Round to 2 decimal places
      averageScore = Math.round(averageScore * 100.0) / 100.0;
    }

    // Step 3: Get score distribution from Review table
    List<Object[]> scoreDistributionResults = reviewRepository.getScoreDistribution(hotelId, fromDate, toDate);

    // Step 4: Build score distribution map from query results
    Map<String, Long> distributionMap = new HashMap<>();
    for (Object[] row : scoreDistributionResults) {
      String scoreBucket = (String) row[0];
      Long reviewCount = row.length > 1 ? extractLong(row[1]) : 0L;
      distributionMap.put(scoreBucket, reviewCount);
    }

    // Step 5: Build complete score distribution list with all buckets (including
    // empty ones)
    List<ReviewSummaryResponse.ScoreDistributionItem> scoreDistribution = new ArrayList<>();
    String[] allBuckets = { "9-10", "7-8", "5-6", "3-4", "1-2" };
    for (String bucket : allBuckets) {
      Long count = distributionMap.getOrDefault(bucket, 0L);
      scoreDistribution.add(ReviewSummaryResponse.ScoreDistributionItem.builder()
          .scoreBucket(bucket)
          .reviewCount(count)
          .build());
    }

    // Build response
    return ReviewSummaryResponse.builder()
        .totalReviews(totalReviewCount)
        .averageScore(averageScore)
        .scoreDistribution(scoreDistribution)
        .build();
  }

  /**
   * Get review summary report for a partner's hotel.
   * 
   * @param hotelId  The hotel ID
   * @param fromDate Start date of the report period
   * @param toDate   End date of the report period
   * @return ReviewSummaryResponse
   */
  @Transactional(readOnly = true)
  public ReviewSummaryResponse getReviewSummary(String hotelId, LocalDate fromDate, LocalDate toDate) {
    validateAndAuthorize(hotelId, fromDate, toDate);
    return getSinglePeriodReviewSummary(hotelId, fromDate, toDate);
  }

  /**
   * Get review summary report with period comparison for a partner's hotel.
   * 
   * @param hotelId     The hotel ID
   * @param fromDate    Start date of the report period
   * @param toDate      End date of the report period
   * @param compareFrom Start date of comparison period
   * @param compareTo   End date of comparison period
   * @return ReviewSummaryComparisonResponse
   */
  @Transactional(readOnly = true)
  public ReviewSummaryComparisonResponse getReviewSummaryWithComparison(String hotelId, LocalDate fromDate,
      LocalDate toDate, LocalDate compareFrom, LocalDate compareTo) {
    validateAndAuthorize(hotelId, fromDate, toDate);

    // Validate comparison date range
    if (compareFrom.isAfter(compareTo)) {
      throw new AppException(ErrorType.INVALID_DATE_RANGE);
    }

    // Get current period data
    ReviewSummaryResponse currentPeriod = getSinglePeriodReviewSummary(hotelId, fromDate, toDate);

    // Get previous period data
    ReviewSummaryResponse previousPeriod = getSinglePeriodReviewSummary(hotelId, compareFrom, compareTo);

    // Calculate comparison
    long totalReviewsDiff = currentPeriod.getTotalReviews() - previousPeriod.getTotalReviews();
    double totalReviewsPct = calculatePercentageChange(currentPeriod.getTotalReviews(),
        previousPeriod.getTotalReviews());
    totalReviewsPct = Math.round(totalReviewsPct * 100.0) / 100.0;

    double averageScoreDiff = currentPeriod.getAverageScore() - previousPeriod.getAverageScore();
    double averageScorePct = calculatePercentageChange(currentPeriod.getAverageScore(),
        previousPeriod.getAverageScore());
    averageScorePct = Math.round(averageScorePct * 100.0) / 100.0;

    ReviewSummaryComparisonResponse.ReviewComparison comparison = ReviewSummaryComparisonResponse.ReviewComparison
        .builder()
        .totalReviewsDifference(totalReviewsDiff)
        .totalReviewsPercentageChange(totalReviewsPct)
        .averageScoreDifference(averageScoreDiff)
        .averageScorePercentageChange(averageScorePct)
        .build();

    return ReviewSummaryComparisonResponse.builder()
        .currentPeriod(currentPeriod)
        .previousPeriod(previousPeriod)
        .comparison(comparison)
        .build();
  }

  /**
   * Generate daily reports for all dates in the system.
   * This method finds the date range from Booking table and processes all dates.
   * 
   * @return Map containing summary of the operation (totalDates, successCount, failureCount)
   */
  public Map<String, Object> generateAllDailyReports() {
    log.info("Starting bulk partner daily report generation for all dates");

    try {
      // Find date range from Booking table
      Query dateRangeQuery = entityManager.createNativeQuery(ReportQueries.FIND_BOOKING_DATE_RANGE);
      Object[] dateRangeResult = (Object[]) dateRangeQuery.getSingleResult();

      if (dateRangeResult == null || dateRangeResult[0] == null || dateRangeResult[1] == null) {
        log.warn("No booking data found in the system");
        return Map.of(
            "totalDates", 0,
            "successCount", 0,
            "failureCount", 0,
            "message", "No booking data found in the system");
      }

      // Parse date result - could be Date, String, or LocalDate
      LocalDate minDate;
      LocalDate maxDate;
      
      try {
        if (dateRangeResult[0] instanceof java.sql.Date) {
          minDate = ((java.sql.Date) dateRangeResult[0]).toLocalDate();
        } else if (dateRangeResult[0] instanceof java.sql.Timestamp) {
          minDate = ((java.sql.Timestamp) dateRangeResult[0]).toLocalDateTime().toLocalDate();
        } else if (dateRangeResult[0] instanceof String) {
          minDate = LocalDate.parse((String) dateRangeResult[0]);
        } else if (dateRangeResult[0] instanceof java.time.LocalDate) {
          minDate = (LocalDate) dateRangeResult[0];
        } else {
          throw new IllegalArgumentException("Unexpected date type: " + dateRangeResult[0].getClass().getName());
        }

        if (dateRangeResult[1] instanceof java.sql.Date) {
          maxDate = ((java.sql.Date) dateRangeResult[1]).toLocalDate();
        } else if (dateRangeResult[1] instanceof java.sql.Timestamp) {
          maxDate = ((java.sql.Timestamp) dateRangeResult[1]).toLocalDateTime().toLocalDate();
        } else if (dateRangeResult[1] instanceof String) {
          maxDate = LocalDate.parse((String) dateRangeResult[1]);
        } else if (dateRangeResult[1] instanceof java.time.LocalDate) {
          maxDate = (LocalDate) dateRangeResult[1];
        } else {
          throw new IllegalArgumentException("Unexpected date type: " + dateRangeResult[1].getClass().getName());
        }
      } catch (Exception e) {
        log.error("Error parsing date range result: {}", e.getMessage(), e);
        throw new AppException(ErrorType.UNKNOWN_ERROR);
      }

      // Check if we got default values (meaning no real data)
      if (minDate.equals(LocalDate.of(9999, 12, 31)) || maxDate.equals(LocalDate.of(1900, 1, 1))) {
        log.warn("No booking data found in the system (got default dates)");
        return Map.of(
            "totalDates", 0,
            "successCount", 0,
            "failureCount", 0,
            "message", "No booking data found in the system");
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
      LocalDate currentDate = minDate;
      while (!currentDate.isAfter(maxDate)) {
        try {
          log.info("Processing date: {}", currentDate);
          // Use getSelf() to call through Spring proxy, ensuring transaction propagation works
          getSelf().generateDailyReports(currentDate);
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

      log.info("Completed bulk partner daily report generation. Total: {}, Success: {}, Failed: {}",
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
      log.error("Error in bulk partner daily report generation: {}", e.getMessage(), e);
      throw e;
    }
  }
}
