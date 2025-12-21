package com.webapp.holidate.controller.policy.reschedule;

import com.webapp.holidate.constants.api.endpoint.PolicyEndpoints;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.policy.reschedule.RescheduleRuleResponse;
import com.webapp.holidate.service.policy.reschedule.RescheduleRuleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(PolicyEndpoints.POLICY + PolicyEndpoints.RESCHEDULE_RULES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RescheduleRuleController {
  RescheduleRuleService service;

  @GetMapping
  public ApiResponse<List<RescheduleRuleResponse>> getAll() {
    List<RescheduleRuleResponse> responses = service.getAll();
    return ApiResponse.<List<RescheduleRuleResponse>>builder()
      .data(responses)
      .build();
  }
}

