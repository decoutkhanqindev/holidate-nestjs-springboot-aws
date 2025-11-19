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
public class BookingsSummaryResponse {
  @Builder.Default
  Long totalCreated = 0L;

  @Builder.Default
  Long totalPending = 0L;

  @Builder.Default
  Long totalConfirmed = 0L;

  @Builder.Default
  Long totalCheckedIn = 0L;

  @Builder.Default
  Long totalCompleted = 0L;

  @Builder.Default
  Long totalCancelled = 0L;

  @Builder.Default
  Long totalRescheduled = 0L;

  @Builder.Default
  Double cancellationRate = 0.0;
}
