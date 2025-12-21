package com.webapp.holidate.dto.response.report.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class FinancialsReportResponse {
  List<FinancialDataPoint> data;
  FinancialSummary summary;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class FinancialDataPoint {
    LocalDate period;
    Double grossRevenue;
    Double netRevenue;
    Double partnerPayout;
    Double grossMargin;
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
  public static class FinancialSummary {
    @Builder.Default
    Double totalGrossRevenue = 0.0;
    @Builder.Default
    Double totalNetRevenue = 0.0;
    @Builder.Default
    Double totalPartnerPayout = 0.0;
    @Builder.Default
    Double averageGrossMargin = 0.0;
  }
}

