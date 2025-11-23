package com.webapp.holidate.dto.response.dashboard.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedFinancialsResponse {
  /**
   * Gross revenue for month-to-date (from SystemDailyReport)
   */
  @Builder.Default
  double grossRevenueMonthToDate = 0.0;
  
  /**
   * Net revenue for month-to-date (from SystemDailyReport)
   */
  @Builder.Default
  double netRevenueMonthToDate = 0.0;
  
  /**
   * Total gross revenue including today's realtime data
   */
  @Builder.Default
  double totalGrossRevenueThisMonth = 0.0;
  
  /**
   * Total net revenue including today's realtime data  
   * (Note: Net revenue for today might be estimated or same as gross if commission not yet calculated)
   */
  @Builder.Default
  double totalNetRevenueThisMonth = 0.0;
}

