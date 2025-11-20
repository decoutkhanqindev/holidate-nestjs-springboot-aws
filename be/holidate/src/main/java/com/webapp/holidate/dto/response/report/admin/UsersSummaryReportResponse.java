package com.webapp.holidate.dto.response.report.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class UsersSummaryReportResponse {
  GrowthInPeriod growthInPeriod;
  PlatformTotals platformTotals;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class GrowthInPeriod {
    LocalDate from;
    LocalDate to;
    @Builder.Default
    Long newCustomers = 0L;
    @Builder.Default
    Long newPartners = 0L;
  }

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class PlatformTotals {
    LocalDateTime asOf;
    @Builder.Default
    Long totalCustomers = 0L;
    @Builder.Default
    Long totalPartners = 0L;
    @Builder.Default
    Long totalHotels = 0L;
  }
}
