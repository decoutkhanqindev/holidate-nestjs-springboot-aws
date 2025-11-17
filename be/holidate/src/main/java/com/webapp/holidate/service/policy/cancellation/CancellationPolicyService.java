package com.webapp.holidate.service.policy.cancellation;

import com.webapp.holidate.dto.response.policy.cancellation.CancellationPolicyResponse;
import com.webapp.holidate.mapper.policy.cancellation.CancellationPolicyMapper;
import com.webapp.holidate.repository.policy.cancellation.CancellationPolicyRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CancellationPolicyService {
  CancellationPolicyRepository repository;
  CancellationPolicyMapper mapper;

  @Transactional(readOnly = true)
  public List<CancellationPolicyResponse> getAll() {
    return repository.findAll()
      .stream()
      .map(mapper::toCancellationPolicyResponse)
      .toList();
  }
}

