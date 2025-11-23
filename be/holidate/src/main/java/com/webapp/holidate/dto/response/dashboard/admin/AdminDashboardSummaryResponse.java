package com.webapp.holidate.dto.response.dashboard.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardSummaryResponse {
  /**
   * Realtime financial metrics for today
   */
  RealtimeFinancialsResponse realtimeFinancials;
  
  /**
   * Aggregated financial metrics for month-to-date
   */
  AggregatedFinancialsResponse aggregatedFinancials;
  
  /**
   * Booking activity for today
   */
  BookingActivityResponse bookingActivity;
  
  /**
   * Ecosystem growth metrics (users, partners, hotels)
   */
  EcosystemGrowthResponse ecosystemGrowth;
  
  /**
   * Top performing hotels in the last 7 days
   */
  @Builder.Default
  List<TopPerformingHotelResponse> topPerformingHotels = new ArrayList<>();
  
  /**
   * Number of days used for top performing hotels calculation
   */
  @Builder.Default
  int topPerformingHotelsDays = 7;
}

