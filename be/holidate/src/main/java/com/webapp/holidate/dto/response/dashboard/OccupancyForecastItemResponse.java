package com.webapp.holidate.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class OccupancyForecastItemResponse {
  /**
   * Date for this forecast item
   */
  LocalDate date;
  
  /**
   * Number of rooms booked for this date
   * Includes CONFIRMED and CHECKED_IN bookings
   */
  @Builder.Default
  long roomsBooked = 0;
  
  /**
   * Total room capacity for the hotel
   */
  @Builder.Default
  long totalCapacity = 0;
  
  /**
   * Occupancy rate as percentage (0-100)
   */
  @Builder.Default
  double occupancyRate = 0.0;
}

