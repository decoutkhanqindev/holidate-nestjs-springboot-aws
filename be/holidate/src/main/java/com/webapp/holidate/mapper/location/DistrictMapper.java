package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.DistrictCreationRequest;
import com.webapp.holidate.dto.response.location.DistrictDetailsResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.District;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DistrictMapper {
  @Mapping(target  = "id", ignore = true)
  District toEntity(DistrictCreationRequest request);
  DistrictDetailsResponse toDistrictDetailsResponse(District district);
  LocationResponse toLocationResponse(District district);
}
