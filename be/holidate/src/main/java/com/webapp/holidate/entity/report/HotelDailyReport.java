package com.webapp.holidate.entity.report;

import java.time.LocalDateTime;

import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.constants.db.DbTableNames;
import com.webapp.holidate.entity.accommodation.Hotel;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

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
  int completedBookings = 0;

  @Column(nullable = false)
  @Builder.Default
  int cancelledBookings = 0;

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
