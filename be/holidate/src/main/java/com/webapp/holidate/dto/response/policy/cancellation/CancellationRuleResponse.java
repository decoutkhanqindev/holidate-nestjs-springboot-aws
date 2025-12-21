package com.webapp.holidate.dto.response.policy.cancellation;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class CancellationRuleResponse {
  String id;
  int daysBeforeCheckIn;
  int penaltyPercentage;
}