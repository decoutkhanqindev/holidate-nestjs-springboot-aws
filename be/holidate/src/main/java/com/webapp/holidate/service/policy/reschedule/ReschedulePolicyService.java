package com.webapp.holidate.service.policy.reschedule;

import com.webapp.holidate.dto.response.policy.reschedule.ReschedulePolicyResponse;
import com.webapp.holidate.mapper.policy.reschedule.ReschedulePolicyMapper;
import com.webapp.holidate.repository.policy.resechedule.ReschedulePolicyRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ReschedulePolicyService {
  ReschedulePolicyRepository repository;
  ReschedulePolicyMapper mapper;

  @Transactional(readOnly = true)
  public List<ReschedulePolicyResponse> getAll() {
    return repository.findAll()
        .stream()
        .map(mapper::toReschedulePolicyResponse)
        .toList();
  }
}
