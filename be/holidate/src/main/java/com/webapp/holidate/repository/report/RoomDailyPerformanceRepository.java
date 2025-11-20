package com.webapp.holidate.repository.report;

import com.webapp.holidate.constants.db.query.report.ReportQueries;
import com.webapp.holidate.entity.report.RoomDailyPerformance;
import com.webapp.holidate.entity.report.RoomDailyPerformanceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RoomDailyPerformanceRepository extends JpaRepository<RoomDailyPerformance, RoomDailyPerformanceId> {

  List<RoomDailyPerformance> findByIdReportDate(LocalDate reportDate);

  List<RoomDailyPerformance> findByIdRoomId(String roomId);

  @Modifying
  @Query(value = ReportQueries.UPSERT_ROOM_DAILY_PERFORMANCE, nativeQuery = true)
  void upsertRoomDailyPerformance(
      String roomId,
      LocalDate reportDate,
      String hotelId,
      double revenue,
      int bookedRoomNights,
      LocalDateTime updatedAt);

  // Get popular room types by view
  @Query(value = ReportQueries.GET_POPULAR_ROOM_TYPES_BY_VIEW, nativeQuery = true)
  List<Object[]> getPopularRoomTypesByView(
      LocalDate fromDate,
      LocalDate toDate,
      int limit);

  // Get popular room types by bed type
  @Query(value = ReportQueries.GET_POPULAR_ROOM_TYPES_BY_BED_TYPE, nativeQuery = true)
  List<Object[]> getPopularRoomTypesByBedType(
      LocalDate fromDate,
      LocalDate toDate,
      int limit);

  // Get popular room types by occupancy
  @Query(value = ReportQueries.GET_POPULAR_ROOM_TYPES_BY_OCCUPANCY, nativeQuery = true)
  List<Object[]> getPopularRoomTypesByOccupancy(
      LocalDate fromDate,
      LocalDate toDate,
      int limit);
}
