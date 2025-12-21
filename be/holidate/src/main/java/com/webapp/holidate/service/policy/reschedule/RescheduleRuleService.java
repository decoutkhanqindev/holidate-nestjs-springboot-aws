package com.webapp.holidate.service.policy.reschedule;

import com.webapp.holidate.dto.response.policy.reschedule.RescheduleRuleResponse;
import com.webapp.holidate.mapper.policy.reschedule.RescheduleRuleMapper;
import com.webapp.holidate.repository.policy.resechedule.RescheduleRuleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RescheduleRuleService {
  RescheduleRuleRepository repository;
  RescheduleRuleMapper mapper;

  @Transactional(readOnly = true)
  public List<RescheduleRuleResponse> getAll() {
    return repository.findAll()
      .stream()
      .map(mapper::toRescheduleRuleResponse)
      .toList();
  }
}

