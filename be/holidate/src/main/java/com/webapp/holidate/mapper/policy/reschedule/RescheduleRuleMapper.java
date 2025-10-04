package com.webapp.holidate.mapper.policy.reschedule;

import com.webapp.holidate.dto.response.policy.reschedule.RescheduleRuleResponse;
import com.webapp.holidate.entity.policy.reschedule.RescheduleRule;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface RescheduleRuleMapper {
  RescheduleRuleResponse toRescheduleRuleResponse(RescheduleRule RescheduleRule);

  @Named("rulesToRuleResponses")
  default List<RescheduleRuleResponse> rulesToRuleResponses(Set<RescheduleRule> rules) {
    boolean hasRules = rules != null && !rules.isEmpty();
    if (!hasRules) {
      return List.of();
    }

    return rules.stream()
        .map(this::toRescheduleRuleResponse)
        .collect(Collectors.toList());
  }
}
