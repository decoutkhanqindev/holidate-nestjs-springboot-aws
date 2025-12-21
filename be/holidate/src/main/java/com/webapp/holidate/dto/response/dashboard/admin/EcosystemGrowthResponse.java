package com.webapp.holidate.dto.response.dashboard.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class EcosystemGrowthResponse {
  /**
   * Number of new customers (users) registered today
   */
  @Builder.Default
  long newCustomersToday = 0;
  
  /**
   * Number of new partners registered today
   */
  @Builder.Default
  long newPartnersToday = 0;
  
  /**
   * Total number of active hotels in the system
   */
  @Builder.Default
  long totalActiveHotels = 0;
}

