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
public class UsersSummaryReportComparisonResponse {
  UsersSummaryReportResponse currentPeriod;
  UsersSummaryReportResponse previousPeriod;
  GrowthComparison comparison;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class GrowthComparison {
    @Builder.Default
    Long newCustomersDifference = 0L;
    @Builder.Default
    Double newCustomersPercentageChange = 0.0;
    @Builder.Default
    Long newPartnersDifference = 0L;
    @Builder.Default
    Double newPartnersPercentageChange = 0.0;
  }
}

