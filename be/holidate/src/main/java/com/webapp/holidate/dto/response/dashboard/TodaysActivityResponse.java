package com.webapp.holidate.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class TodaysActivityResponse {
  /**
   * Number of guests expected to check in today
   * Bookings with checkInDate = today and status = CONFIRMED
   */
  @Builder.Default
  long checkInsToday = 0;
  
  /**
   * Number of guests expected to check out today
   * Bookings with checkOutDate = today and status = CHECKED_IN
   */
  @Builder.Default
  long checkOutsToday = 0;
  
  /**
   * Number of guests currently in-house
   * Bookings with status = CHECKED_IN
   */
  @Builder.Default
  long inHouseGuests = 0;
}

