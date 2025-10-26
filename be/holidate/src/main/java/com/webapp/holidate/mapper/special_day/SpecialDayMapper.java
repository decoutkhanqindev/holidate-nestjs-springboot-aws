package com.webapp.holidate.mapper.special_day;

import com.webapp.holidate.dto.request.special_day.SpecialDayCreationRequest;
import com.webapp.holidate.dto.response.special_day.SpecialDayResponse;
import com.webapp.holidate.entity.special_day.SpecialDay;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SpecialDayMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "discounts", ignore = true)
  SpecialDay toEntity(SpecialDayCreationRequest request);

  SpecialDayResponse toSpecialDayResponse(SpecialDay specialDay);
}
