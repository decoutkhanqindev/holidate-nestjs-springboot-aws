package com.webapp.holidate.mapper.acommodation.room;

import com.webapp.holidate.dto.request.acommodation.room.RoomCreationRequest;
import com.webapp.holidate.dto.response.acommodation.room.RoomResponse;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.mapper.amenity.AmenityCategoryMapper;
import com.webapp.holidate.mapper.image.PhotoCategoryMapper;
import com.webapp.holidate.mapper.policy.cancellation.CancellationPolicyMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
  componentModel = "spring",
  uses = {
    PhotoCategoryMapper.class,
    AmenityCategoryMapper.class,
    CancellationPolicyMapper.class
  }
)
public interface RoomMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "hotel", ignore = true)
  @Mapping(target = "photos", ignore = true)
  @Mapping(target = "bedType", ignore = true)
  @Mapping(target = "amenities", ignore = true)
  @Mapping(target = "inventories", ignore = true)
  @Mapping(target = "cancellationPolicy", ignore = true)
  @Mapping(target = "status", constant = "ACTIVE")
  @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "updatedAt", ignore = true)
  Room toEntity(RoomCreationRequest request);

  @Mapping(source = "photos", target = "photos", qualifiedByName = "roomPhotosToCategories")
  @Mapping(source = "amenities", target = "amenities", qualifiedByName = "roomAmenitiesToCategories")
  RoomResponse toRoomResponse(Room room);
}