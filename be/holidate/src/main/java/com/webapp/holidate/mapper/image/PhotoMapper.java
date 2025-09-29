package com.webapp.holidate.mapper.image;

import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.image.AccommodationPhoto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PhotoMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "hotel", source = "hotel")
  @Mapping(target = "room", ignore = true)
  @Mapping(target = "url", source = "url")
  AccommodationPhoto toEntity(Hotel hotel, String url);

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "hotel", ignore = true)
  @Mapping(target = "room", source = "room")
  @Mapping(target = "url", source = "url")
  AccommodationPhoto toEntity(Room room, String url);
}
