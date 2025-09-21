package com.webapp.holidate.mapper.location;

import com.webapp.holidate.dto.request.location.ProvinceCreationRequest;
import com.webapp.holidate.dto.response.location.LocationResponse;
import com.webapp.holidate.dto.response.location.ProvinceDetailsResponse;
import com.webapp.holidate.entity.location.Province;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {
  @Mapping(target  = "id", ignore = true)
  Province toEntity(ProvinceCreationRequest request);
  ProvinceDetailsResponse toProvinceDetailsResponse(Province province);
  LocationResponse toLocationResponse(Province province);
}
