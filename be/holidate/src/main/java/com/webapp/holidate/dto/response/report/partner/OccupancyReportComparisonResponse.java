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
public class OccupancyReportComparisonResponse {
  OccupancyReportResponse currentPeriod;
  OccupancyReportResponse previousPeriod;
  OccupancyComparison comparison;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class OccupancyComparison {
    @Builder.Default
    Double averageRateDifference = 0.0;
    @Builder.Default
    Double averageRatePercentageChange = 0.0;
    @Builder.Default
    Long totalOccupiedDifference = 0L;
    @Builder.Default
    Double totalOccupiedPercentageChange = 0.0;
  }
}

