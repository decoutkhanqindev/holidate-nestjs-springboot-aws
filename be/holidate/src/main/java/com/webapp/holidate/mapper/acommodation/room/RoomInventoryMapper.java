package com.webapp.holidate.mapper.acommodation.room;

import com.webapp.holidate.dto.response.acommodation.room.inventory.RoomInventoryResponse;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomInventoryMapper {
  @Mapping(target = "roomId", source = "id.roomId")
  @Mapping(target = "date", source = "id.date")
  RoomInventoryResponse toRoomInventoryResponse(RoomInventory inventory);

  @Named("roomInventoriesToInventoryResponses")
  default List<RoomInventoryResponse> toRoomInventoryResponses(List<RoomInventory> inventory) {
    return inventory.stream()
      .map(this::toRoomInventoryResponse)
      .toList();
  }
}