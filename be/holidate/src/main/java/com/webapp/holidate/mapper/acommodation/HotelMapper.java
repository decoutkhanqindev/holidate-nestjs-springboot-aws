package com.webapp.holidate.mapper.acommodation;

import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.request.acommodation.hotel.HotelUpdateRequest;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.mapper.image.PhotoMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = { PhotoMapper.class })
public interface HotelMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "country", ignore = true)
  @Mapping(target = "province", ignore = true)
  @Mapping(target = "city", ignore = true)
  @Mapping(target = "district", ignore = true)
  @Mapping(target = "ward", ignore = true)
  @Mapping(target = "street", ignore = true)
  @Mapping(target = "photos", ignore = true)
  @Mapping(target = "latitude", ignore = true)
  @Mapping(target = "longitude", ignore = true)
  @Mapping(target = "starRating", ignore = true)
  @Mapping(target = "averageScore", ignore = true)
  @Mapping(target = "allowsPayAtHotel", ignore = true)
  @Mapping(target = "partner", ignore = true)
  @Mapping(target = "amenities", ignore = true)
  @Mapping(target = "reviews", ignore = true)
  @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "updatedAt", ignore = true)
  Hotel toEntity(HotelCreationRequest request);

  @Mapping(target = "rawPricePerNight", ignore = true)
  @Mapping(target = "currentPricePerNight", ignore = true)
  @Mapping(target = "availableRooms", ignore = true)
  @Mapping(source = "photos", target = "photos")
  HotelResponse toHotelResponse(Hotel hotel);
}