package com.webapp.holidate.service.report;

import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.entity.booking.Booking;
import com.webapp.holidate.repository.report.HotelDailyReportRepository;
import com.webapp.holidate.repository.report.RoomDailyPerformanceRepository;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;
import com.webapp.holidate.type.booking.BookingStatusType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PartnerReportService {

  HotelDailyReportRepository hotelDailyReportRepository;
  RoomDailyPerformanceRepository roomDailyPerformanceRepository;
  EntityManager entityManager;

  /**
   * Generate daily reports for partners (hotels) for the specified date.
   * This method implements the 6-step process described in the documentation.
   * 
   * @param reportDate The date to generate reports for (typically yesterday)
   */
  @Transactional
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

          // Status-specific counts
          if (BookingStatusType.PENDING_PAYMENT.getValue().equals(status)) {
            metrics.pendingPaymentBookings++;
          } else if (BookingStatusType.CONFIRMED.getValue().equals(status)) {
            metrics.confirmedBookings++;
          } else if (BookingStatusType.CHECKED_IN.getValue().equals(status)) {
            metrics.checkedInBookings++;
          } else if (BookingStatusType.RESCHEDULED.getValue().equals(status)) {
            metrics.rescheduledBookings++;
          }
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
          metrics.pendingPaymentBookings,
          metrics.confirmedBookings,
          metrics.checkedInBookings,
          metrics.completedBookings,
          metrics.cancelledBookings,
          metrics.rescheduledBookings,
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
    int pendingPaymentBookings = 0;
    int confirmedBookings = 0;
    int checkedInBookings = 0;
    int completedBookings = 0;
    int cancelledBookings = 0;
    int rescheduledBookings = 0;
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
}
