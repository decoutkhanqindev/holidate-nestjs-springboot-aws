package com.webapp.holidate.mapper.policy.cancellation;

import com.webapp.holidate.dto.response.policy.cancellation.CancellationPolicyResponse;
import com.webapp.holidate.entity.policy.cancelation.CancellationPolicy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CancellationRuleMapper.class})
public interface CancellationPolicyMapper {
  @Mapping(source = "rules", target = "rules", qualifiedByName = "rulesToRuleResponses")
  CancellationPolicyResponse toCancellationPolicyResponse(CancellationPolicy cancellationPolicy);
}
