package com.webapp.holidate.dto.response.report.partner;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class BookingsSummaryComparisonResponse {
  BookingsSummaryResponse currentPeriod;
  BookingsSummaryResponse previousPeriod;
  BookingsComparison comparison;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class BookingsComparison {
    @Builder.Default
    Long totalCreatedDifference = 0L;
    @Builder.Default
    Double totalCreatedPercentageChange = 0.0;
    @Builder.Default
    Long totalCompletedDifference = 0L;
    @Builder.Default
    Double totalCompletedPercentageChange = 0.0;
    @Builder.Default
    Long totalCancelledDifference = 0L;
    @Builder.Default
    Double totalCancelledPercentageChange = 0.0;
    @Builder.Default
    Double cancellationRateDifference = 0.0;
    @Builder.Default
    Double cancellationRatePercentageChange = 0.0;
  }
}

