package com.webapp.holidate.dto.response.dashboard.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class RealtimeFinancialsResponse {
  /**
   * Total revenue from COMPLETED bookings today
   */
  @Builder.Default
  double totalRevenueToday = 0.0;
}

