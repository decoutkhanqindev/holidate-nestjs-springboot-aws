package com.webapp.holidate.dto.response.report.partner;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class CustomerSummaryComparisonResponse {
  CustomerSummaryResponse currentPeriod;
  CustomerSummaryResponse previousPeriod;
  CustomerComparison comparison;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class CustomerComparison {
    @Builder.Default
    Long totalNewCustomerBookingsDifference = 0L;
    @Builder.Default
    Double totalNewCustomerBookingsPercentageChange = 0.0;
    @Builder.Default
    Long totalReturningCustomerBookingsDifference = 0L;
    @Builder.Default
    Double totalReturningCustomerBookingsPercentageChange = 0.0;
    @Builder.Default
    Long totalCompletedBookingsDifference = 0L;
    @Builder.Default
    Double totalCompletedBookingsPercentageChange = 0.0;
  }
}

