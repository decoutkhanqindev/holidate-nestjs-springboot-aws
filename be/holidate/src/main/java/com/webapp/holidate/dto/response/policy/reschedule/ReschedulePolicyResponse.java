package com.webapp.holidate.dto.response.policy.reschedule;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class ReschedulePolicyResponse {
  String id;
  String name;
  String description;
  List<RescheduleRuleResponse> rules;
}