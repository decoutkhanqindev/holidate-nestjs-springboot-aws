package com.webapp.holidate.dto.response.report.partner;

import lombok.*;
import lombok.experimental.FieldDefaults;

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
public class RoomPerformanceComparisonResponse {
  List<RoomPerformanceComparisonItem> data;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class RoomPerformanceComparisonItem {
    String roomId;
    String roomName;
    String roomView;
    // Current period
    @Builder.Default
    Double currentTotalRevenue = 0.0;
    @Builder.Default
    Long currentTotalBookedNights = 0L;
    // Previous period
    @Builder.Default
    Double previousTotalRevenue = 0.0;
    @Builder.Default
    Long previousTotalBookedNights = 0L;
    // Comparison
    @Builder.Default
    Double totalRevenueDifference = 0.0;
    @Builder.Default
    Double totalRevenuePercentageChange = 0.0;
    @Builder.Default
    Long totalBookedNightsDifference = 0L;
    @Builder.Default
    Double totalBookedNightsPercentageChange = 0.0;
  }
}

