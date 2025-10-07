package com.webapp.holidate.mapper.acommodation.room;

import com.webapp.holidate.dto.request.acommodation.room.RoomCreationRequest;
import com.webapp.holidate.dto.response.acommodation.room.RoomDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomWithInventoriesResponse;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.mapper.amenity.AmenityCategoryMapper;
import com.webapp.holidate.mapper.image.PhotoCategoryMapper;
import com.webapp.holidate.mapper.policy.cancellation.CancellationPolicyMapper;
import com.webapp.holidate.mapper.policy.reschedule.ReschedulePolicyMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
  componentModel = "spring",
  uses = {
    PhotoCategoryMapper.class,
    AmenityCategoryMapper.class,
    CancellationPolicyMapper.class,
    ReschedulePolicyMapper.class,
    RoomInventoryMapper.class
  }
)
public interface RoomMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "hotel", ignore = true)
  @Mapping(target = "photos", ignore = true)
  @Mapping(target = "bedType", ignore = true)
  @Mapping(target = "amenities", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "updatedAt", ignore = true)
  Room toEntity(RoomCreationRequest request);

  @Mapping(source = "photos", target = "photos", qualifiedByName = "roomPhotosToCategories")
  @Mapping(source = "amenities", target = "amenities", qualifiedByName = "roomAmenitiesToCategories")
  RoomResponse toRoomResponse(Room room);

  @Mapping(source = "photos", target = "photos", qualifiedByName = "roomPhotosToCategories")
  @Mapping(source = "amenities", target = "amenities", qualifiedByName = "roomAmenitiesToCategories")
  RoomDetailsResponse toRoomDetailsResponse(Room room);

  @Mapping(target = "inventories", ignore = true)
  RoomWithInventoriesResponse toRoomWithInventoriesResponse(Room room);
}