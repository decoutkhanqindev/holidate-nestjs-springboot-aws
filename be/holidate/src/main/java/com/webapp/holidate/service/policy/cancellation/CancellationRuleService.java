package com.webapp.holidate.service.policy.cancellation;

import com.webapp.holidate.dto.response.policy.cancellation.CancellationRuleResponse;
import com.webapp.holidate.mapper.policy.cancellation.CancellationRuleMapper;
import com.webapp.holidate.repository.policy.cancellation.CancellationRuleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CancellationRuleService {
  CancellationRuleRepository repository;
  CancellationRuleMapper mapper;

  @Transactional(readOnly = true)
  public List<CancellationRuleResponse> getAll() {
    return repository.findAll()
      .stream()
      .map(mapper::toCancellationRuleResponse)
      .toList();
  }
}

