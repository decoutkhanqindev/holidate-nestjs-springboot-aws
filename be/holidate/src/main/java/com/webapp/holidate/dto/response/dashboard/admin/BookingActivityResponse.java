package com.webapp.holidate.dto.response.dashboard.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class BookingActivityResponse {
  /**
   * Number of new bookings created today
   */
  @Builder.Default
  long bookingsCreatedToday = 0;
}

