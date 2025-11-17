package com.webapp.holidate.entity.report;

import com.webapp.holidate.constants.db.DbTableNames;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = DbTableNames.SYSTEM_DAILY_REPORTS)
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class SystemDailyReport {
  @Id
  @Column(nullable = false)
  LocalDate reportDate;

  @Column(nullable = false)
  @Builder.Default
  double grossRevenue = 0.0;

  @Column(nullable = false)
  @Builder.Default
  double netRevenue = 0.0;

  @Column(nullable = false)
  @Builder.Default
  int totalBookingsCreated = 0;

  @Column(nullable = false)
  @Builder.Default
  int totalBookingsCompleted = 0;

  @Column(nullable = false)
  @Builder.Default
  int totalBookingsCancelled = 0;

  @Column(nullable = false)
  @Builder.Default
  int newCustomersRegistered = 0;

  @Column(nullable = false)
  @Builder.Default
  int newPartnersRegistered = 0;

  @Column(nullable = true)
  Double systemAverageReviewScore;

  @Column(nullable = false)
  @Builder.Default
  int totalReviews = 0;

  @Column(nullable = false)
  LocalDateTime updatedAt;
}

