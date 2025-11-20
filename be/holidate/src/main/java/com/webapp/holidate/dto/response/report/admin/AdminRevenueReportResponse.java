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
public class AdminRevenueReportResponse {
  List<RevenueDataPoint> data;
  RevenueSummary summary;
  // Only populated when filterBy is provided
  List<RevenueBreakdownItem> breakdown;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class RevenueDataPoint {
    LocalDate period;
    Double revenue;
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
  public static class RevenueSummary {
    @Builder.Default
    Double totalRevenue = 0.0;
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
  public static class RevenueBreakdownItem {
    String filterId;
    String filterName;
    Double revenue;
  }
}

