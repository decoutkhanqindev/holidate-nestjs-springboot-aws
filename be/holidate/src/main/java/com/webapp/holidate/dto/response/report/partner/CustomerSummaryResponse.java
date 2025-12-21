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
public class CustomerSummaryResponse {
  @Builder.Default
  Long totalNewCustomerBookings = 0L;

  @Builder.Default
  Long totalReturningCustomerBookings = 0L;

  @Builder.Default
  Long totalCompletedBookings = 0L;

  @Builder.Default
  Double newCustomerPercentage = 0.0;

  @Builder.Default
  Double returningCustomerPercentage = 0.0;
}

