package com.webapp.holidate.dto.response.policy.cancellation;

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
public class CancellationPolicyResponse {
  String id;
  String name;
  String description;
  List<CancellationRuleResponse> rules;
}