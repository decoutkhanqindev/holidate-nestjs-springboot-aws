package com.webapp.holidate.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusCountResponse {
  /**
   * Booking status (e.g., "pending_payment", "confirmed", "checked_in")
   */
  String status;
  
  /**
   * Number of bookings with this status
   */
  @Builder.Default
  long count = 0;
}

