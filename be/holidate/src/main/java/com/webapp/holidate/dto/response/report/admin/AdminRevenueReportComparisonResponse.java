package com.webapp.holidate.dto.response.report.admin;

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
public class AdminRevenueReportComparisonResponse {
  AdminRevenueReportResponse currentPeriod;
  AdminRevenueReportResponse previousPeriod;
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

