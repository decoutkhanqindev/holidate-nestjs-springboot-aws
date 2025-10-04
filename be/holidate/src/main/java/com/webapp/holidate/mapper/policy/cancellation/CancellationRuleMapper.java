package com.webapp.holidate.mapper.policy.cancellation;

import com.webapp.holidate.dto.response.policy.cancellation.CancellationRuleResponse;
import com.webapp.holidate.entity.policy.cancelation.CancellationRule;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CancellationRuleMapper {
  CancellationRuleResponse toCancellationRuleResponse(CancellationRule cancellationRule);

  @Named("rulesToRuleResponses")
  default List<CancellationRuleResponse> rulesToRuleResponses(Set<CancellationRule> rules) {
    boolean hasRules = rules != null && !rules.isEmpty();
    if (!hasRules) {
      return List.of();
    }

    return rules.stream()
        .map(this::toCancellationRuleResponse)
        .collect(Collectors.toList());
  }
}
