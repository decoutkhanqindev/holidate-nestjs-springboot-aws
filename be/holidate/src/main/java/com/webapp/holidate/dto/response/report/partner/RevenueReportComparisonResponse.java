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
public class RevenueReportComparisonResponse {
  RevenueReportResponse currentPeriod;
  RevenueReportResponse previousPeriod;
  RevenueComparison comparison;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class RevenueComparison {
    @Builder.Default
    Double totalRevenueDifference = 0.0;
    @Builder.Default
    Double totalRevenuePercentageChange = 0.0;
  }
}

