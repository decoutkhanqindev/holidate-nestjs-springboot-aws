package com.webapp.holidate.controller.policy.cancellation;

import com.webapp.holidate.constants.api.endpoint.PolicyEndpoints;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.policy.cancellation.CancellationPolicyResponse;
import com.webapp.holidate.service.policy.cancellation.CancellationPolicyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(PolicyEndpoints.POLICY + PolicyEndpoints.CANCELLATION_POLICIES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CancellationPolicyController {
  CancellationPolicyService service;

  @GetMapping
  public ApiResponse<List<CancellationPolicyResponse>> getAll() {
    List<CancellationPolicyResponse> responses = service.getAll();
    return ApiResponse.<List<CancellationPolicyResponse>>builder()
        .data(responses)
        .build();
  }
}
