package com.webapp.holidate.controller.policy.cancellation;

import com.webapp.holidate.constants.api.endpoint.PolicyEndpoints;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.policy.cancellation.CancellationRuleResponse;
import com.webapp.holidate.service.policy.cancellation.CancellationRuleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(PolicyEndpoints.POLICY + PolicyEndpoints.CANCELLATION_RULES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CancellationRuleController {
  CancellationRuleService service;

  @GetMapping
  public ApiResponse<List<CancellationRuleResponse>> getAll() {
    List<CancellationRuleResponse> responses = service.getAll();
    return ApiResponse.<List<CancellationRuleResponse>>builder()
      .data(responses)
      .build();
  }
}

