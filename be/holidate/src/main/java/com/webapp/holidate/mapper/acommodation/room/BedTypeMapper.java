package com.webapp.holidate.mapper.acommodation.room;

import com.webapp.holidate.dto.response.acommodation.room.BedTypeResponse;
import com.webapp.holidate.entity.accommodation.room.BedType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BedTypeMapper {
  BedTypeResponse toBedTypeResponse(BedType bedType);
}
