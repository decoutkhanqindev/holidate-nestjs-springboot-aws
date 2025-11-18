package com.webapp.holidate.entity.report;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = DbTableNames.HOTEL_DAILY_REPORTS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class HotelDailyReport {
  @EmbeddedId
  HotelDailyReportId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId(DbFieldNames.HOTEL_ID_CAMEL)
  @JoinColumn(name = DbFieldNames.HOTEL_ID, nullable = false)
  @ToString.Exclude
  Hotel hotel;

  @Column(nullable = false)
  @Builder.Default
  double totalRevenue = 0.0;

  @Column(nullable = false)
  @Builder.Default
  int createdBookings = 0;

  @Column(nullable = false)
  @Builder.Default
  int pendingPaymentBookings = 0;

  @Column(nullable = false)
  @Builder.Default
  int confirmedBookings = 0;

  @Column(nullable = false)
  @Builder.Default
  int checkedInBookings = 0;

  @Column(nullable = false)
  @Builder.Default
  int completedBookings = 0;

  @Column(nullable = false)
  @Builder.Default
  int cancelledBookings = 0;

  @Column(nullable = false)
  @Builder.Default
  int rescheduledBookings = 0;

  @Column(nullable = false)
  @Builder.Default
  int occupiedRoomNights = 0;

  @Column(nullable = false)
  @Builder.Default
  int totalRoomNights = 0;

  @Column(nullable = false)
  @Builder.Default
  int newCustomerBookings = 0;

  @Column(nullable = false)
  @Builder.Default
  int returningCustomerBookings = 0;

  @Column(nullable = true)
  Double averageReviewScore;

  @Column(nullable = false)
  @Builder.Default
  int reviewCount = 0;

  @Column(nullable = false)
  LocalDateTime updatedAt;
}
