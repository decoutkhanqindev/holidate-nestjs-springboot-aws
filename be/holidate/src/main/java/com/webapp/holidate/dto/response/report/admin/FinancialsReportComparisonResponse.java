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
public class FinancialsReportComparisonResponse {
  FinancialsReportResponse currentPeriod;
  FinancialsReportResponse previousPeriod;
  FinancialComparison comparison;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class FinancialComparison {
    @Builder.Default
    Double grossRevenueDifference = 0.0;
    @Builder.Default
    Double grossRevenuePercentageChange = 0.0;
    @Builder.Default
    Double netRevenueDifference = 0.0;
    @Builder.Default
    Double netRevenuePercentageChange = 0.0;
    @Builder.Default
    Double partnerPayoutDifference = 0.0;
    @Builder.Default
    Double partnerPayoutPercentageChange = 0.0;
    @Builder.Default
    Double grossMarginDifference = 0.0;
    @Builder.Default
    Double grossMarginPercentageChange = 0.0;
  }
}

