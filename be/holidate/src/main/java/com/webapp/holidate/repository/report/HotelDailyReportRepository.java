package com.webapp.holidate.repository.report;

import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.entity.report.HotelDailyReport;
import com.webapp.holidate.entity.report.HotelDailyReportId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HotelDailyReportRepository extends JpaRepository<HotelDailyReport, HotelDailyReportId> {

    List<HotelDailyReport> findByIdReportDate(LocalDate reportDate);

    List<HotelDailyReport> findByIdHotelId(String hotelId);

    @Modifying
    @Query(value = ReportQueries.UPSERT_HOTEL_DAILY_REPORT, nativeQuery = true)
    void upsertHotelDailyReport(
            String hotelId,
            LocalDate reportDate,
            double totalRevenue,
            int createdBookings,
            int pendingPaymentBookings,
            int confirmedBookings,
            int checkedInBookings,
            int completedBookings,
            int cancelledBookings,
            int rescheduledBookings,
            int occupiedRoomNights,
            int totalRoomNights,
            int newCustomerBookings,
            int returningCustomerBookings,
            Double averageReviewScore,
            int reviewCount,
            java.time.LocalDateTime updatedAt);

    // Get daily revenue data
    @Query(value = ReportQueries.GET_DAILY_REVENUE, nativeQuery = true)
    List<Object[]> getDailyRevenue(
            String hotelId,
            LocalDate fromDate,
            LocalDate toDate);

    // Get weekly revenue data
    @Query(value = ReportQueries.GET_WEEKLY_REVENUE, nativeQuery = true)
    List<Object[]> getWeeklyRevenue(
            String hotelId,
            LocalDate fromDate,
            LocalDate toDate);

    // Get monthly revenue data
    @Query(value = ReportQueries.GET_MONTHLY_REVENUE, nativeQuery = true)
    List<Object[]> getMonthlyRevenue(
            String hotelId,
            LocalDate fromDate,
            LocalDate toDate);

    // Get total revenue for summary
    @Query(value = ReportQueries.GET_TOTAL_REVENUE, nativeQuery = true)
    Double getTotalRevenue(
            String hotelId,
            LocalDate fromDate,
            LocalDate toDate);

    // Get booking summary
    @Query(value = ReportQueries.GET_BOOKING_SUMMARY, nativeQuery = true)
    Object[] getBookingSummary(
            String hotelId,
            LocalDate fromDate,
            LocalDate toDate);

  // Get daily occupancy data
  @Query(value = ReportQueries.GET_DAILY_OCCUPANCY_DATA, nativeQuery = true)
  List<Object[]> getDailyOccupancyData(
      String hotelId,
      LocalDate fromDate,
      LocalDate toDate);

  // Get customer summary
  @Query(value = ReportQueries.GET_CUSTOMER_SUMMARY, nativeQuery = true)
  Object[] getCustomerSummary(
      String hotelId,
      LocalDate fromDate,
      LocalDate toDate);

  // Get aggregated review stats
  @Query(value = ReportQueries.GET_AGGREGATED_REVIEW_STATS, nativeQuery = true)
  Object[] getAggregatedReviewStats(
      String hotelId,
      LocalDate fromDate,
      LocalDate toDate);
}
