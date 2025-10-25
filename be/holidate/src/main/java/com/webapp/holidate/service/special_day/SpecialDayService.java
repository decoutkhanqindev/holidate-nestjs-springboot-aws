package com.webapp.holidate.service.special_day;

import com.webapp.holidate.dto.request.special_day.SpecialDayCreationRequest;
import com.webapp.holidate.dto.request.special_day.SpecialDayUpdateRequest;
import com.webapp.holidate.dto.response.special_day.SpecialDayResponse;
import com.webapp.holidate.entity.special_day.SpecialDay;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.special_day.SpecialDayMapper;
import com.webapp.holidate.repository.special_day.SpecialDayRepository;
import com.webapp.holidate.type.ErrorType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SpecialDayService {
  SpecialDayRepository repository;
  SpecialDayMapper mapper;

  public SpecialDayResponse create(SpecialDayCreationRequest request) {
    SpecialDay specialDay = mapper.toEntity(request);
    repository.save(specialDay);
    return mapper.toSpecialDayResponse(specialDay);
  }

  public List<SpecialDayResponse> getAll() {
    return repository.findAll()
      .stream()
      .map(mapper::toSpecialDayResponse)
      .toList();
  }

  public SpecialDayResponse update(String id, SpecialDayUpdateRequest request) {
    SpecialDay specialDay = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.SPECIAL_DAY_NOT_FOUND));

    if (request.getDate() != null) {
      specialDay.setDate(request.getDate());
    }

    if (request.getName() != null) {
      specialDay.setName(request.getName());
    }

    repository.save(specialDay);
    return mapper.toSpecialDayResponse(specialDay);
  }

  public SpecialDayResponse delete(String id) {
    SpecialDay specialDay = repository.findById(id)
      .orElseThrow(() -> new AppException(ErrorType.SPECIAL_DAY_NOT_FOUND));
    repository.delete(specialDay);
    return mapper.toSpecialDayResponse(specialDay);
  }
}
