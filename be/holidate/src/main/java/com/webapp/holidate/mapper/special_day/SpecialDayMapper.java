package com.webapp.holidate.mapper.special_day;

import com.webapp.holidate.dto.request.special_day.SpecialDayCreationRequest;
import com.webapp.holidate.dto.response.special_day.SpecialDayResponse;
import com.webapp.holidate.entity.special_day.SpecialDay;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SpecialDayMapper {
  SpecialDay toEntity(SpecialDayCreationRequest request);
  SpecialDayResponse toSpecialDayResponse(SpecialDay specialDay);
}
