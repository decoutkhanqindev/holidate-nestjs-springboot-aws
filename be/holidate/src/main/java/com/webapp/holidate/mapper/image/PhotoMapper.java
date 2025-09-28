package com.webapp.holidate.mapper.image;

import com.webapp.holidate.dto.response.image.PhotoResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.RoomPhoto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PhotoMapper {
  @Mapping(target = "hotel", source = "hotel")
  @Mapping(target = "url", source = "url")
  HotelPhoto toHotelPhoto(Hotel hotel, String url);

  @Mapping(target = "room", source = "room")
  @Mapping(target = "url", source = "url")
  RoomPhoto toRoomPhoto(RoomPhoto room, String url);

  PhotoResponse toPhotoResponse(HotelPhoto hotelPhoto);

  PhotoResponse toPhotoResponse(RoomPhoto roomPhoto);
}
