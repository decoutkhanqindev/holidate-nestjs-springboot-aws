package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.district.DistrictCreationRequest;
import com.webapp.holidate.dto.request.location.district.DistrictUpdateRequest;
import com.webapp.holidate.dto.response.location.DistrictResponse;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.entity.location.District;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DistrictMapper {
  District toEntity(DistrictCreationRequest request);

  DistrictResponse toDistrictResponse(District district);

  LocationResponse toLocationResponse(District District);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "city", ignore = true)
  @Mapping(target = "wards", ignore = true)
  @Mapping(target = "hotels", ignore = true)
  void updateEntity(@MappingTarget District District, DistrictUpdateRequest request);
}