package com.webapp.holidate.dto.response.policy.reschedule;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class RescheduleRuleResponse {
  String id;
  int daysBeforeCheckin;
  int feePercentage;
}