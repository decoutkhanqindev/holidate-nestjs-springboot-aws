package com.webapp.holidate.dto.response.dashboard.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class TopPerformingHotelResponse {
  /**
   * Hotel ID
   */
  String hotelId;
  
  /**
   * Hotel name
   */
  String hotelName;
  
  /**
   * Total revenue in the period
   */
  @Builder.Default
  double totalRevenue = 0.0;
  
  /**
   * Total completed bookings in the period
   */
  @Builder.Default
  long totalBookings = 0;
}

