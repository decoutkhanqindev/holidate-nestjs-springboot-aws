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
}
