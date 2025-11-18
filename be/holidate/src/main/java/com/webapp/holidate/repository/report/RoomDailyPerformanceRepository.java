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
}
