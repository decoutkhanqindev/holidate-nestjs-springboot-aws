package com.webapp.holidate.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
  /**
   * Today's activity summary
   * Includes check-ins, check-outs, and in-house guests
   */
  TodaysActivityResponse todaysActivity;
  
  /**
   * Live booking status counts
   * Breakdown of bookings by status (pending_payment, confirmed, checked_in)
   */
  @Builder.Default
  List<BookingStatusCountResponse> bookingStatusCounts = new ArrayList<>();
  
  /**
   * Live room status counts
   * Breakdown of rooms by status (active, inactive, maintenance, closed)
   */
  @Builder.Default
  List<RoomStatusCountResponse> roomStatusCounts = new ArrayList<>();
  
  /**
   * Occupancy forecast for upcoming days
   * Shows expected occupancy for each day in the forecast period
   */
  @Builder.Default
  List<OccupancyForecastItemResponse> occupancyForecast = new ArrayList<>();
  
  /**
   * Number of days included in the forecast
   */
  @Builder.Default
  int forecastDays = 7;
}

