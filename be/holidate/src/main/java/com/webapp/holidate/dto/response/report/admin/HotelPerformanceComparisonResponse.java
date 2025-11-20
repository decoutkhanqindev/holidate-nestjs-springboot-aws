package com.webapp.holidate.dto.response.report.admin;

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
public class HotelPerformanceComparisonResponse {
  HotelPerformanceReportResponse currentPeriod;
  HotelPerformanceReportResponse previousPeriod;
  List<HotelPerformanceComparisonItem> comparison;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class HotelPerformanceComparisonItem {
    String hotelId;
    String hotelName;
    // Current period metrics
    Double currentTotalRevenue;
    Long currentTotalCompletedBookings;
    Long currentTotalCreatedBookings;
    Long currentTotalCancelledBookings;
    Double currentAverageOccupancyRate;
    Double currentCancellationRate;
    // Previous period metrics
    Double previousTotalRevenue;
    Long previousTotalCompletedBookings;
    Long previousTotalCreatedBookings;
    Long previousTotalCancelledBookings;
    Double previousAverageOccupancyRate;
    Double previousCancellationRate;
    // Differences
    Double revenueDifference;
    Double revenuePercentageChange;
    Long completedBookingsDifference;
    Double completedBookingsPercentageChange;
    Long createdBookingsDifference;
    Double createdBookingsPercentageChange;
    Long cancelledBookingsDifference;
    Double cancelledBookingsPercentageChange;
    Double occupancyRateDifference;
    Double occupancyRatePercentageChange;
    Double cancellationRateDifference;
    Double cancellationRatePercentageChange;
    // Rank change (positive = moved up, negative = moved down)
    Integer rankChange;
    Integer currentRank;
    Integer previousRank;
  }
}
