package com.webapp.holidate.controller.policy.reschedule;

import com.webapp.holidate.constants.api.endpoint.PolicyEndpoints;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.policy.reschedule.ReschedulePolicyResponse;
import com.webapp.holidate.service.policy.reschedule.ReschedulePolicyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(PolicyEndpoints.POLICY + PolicyEndpoints.RESCHEDULE_POLICIES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ReschedulePolicyController {
  ReschedulePolicyService service;

  @GetMapping
  public ApiResponse<List<ReschedulePolicyResponse>> getAll() {
    List<ReschedulePolicyResponse> responses = service.getAll();
    return ApiResponse.<List<ReschedulePolicyResponse>>builder()
      .data(responses)
      .build();
  }
}

