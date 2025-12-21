package com.webapp.holidate.mapper.policy.reschedule;

import com.webapp.holidate.dto.response.policy.reschedule.ReschedulePolicyResponse;
import com.webapp.holidate.entity.policy.reschedule.ReschedulePolicy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {RescheduleRuleMapper.class})
public interface ReschedulePolicyMapper {
  @Mapping(source = "rules", target = "rules", qualifiedByName = "rulesToRuleResponses")
  ReschedulePolicyResponse toReschedulePolicyResponse(ReschedulePolicy ReschedulePolicy);
}
