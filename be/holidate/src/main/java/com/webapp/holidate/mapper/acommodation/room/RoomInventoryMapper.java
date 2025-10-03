package com.webapp.holidate.mapper.acommodation.room;

import com.webapp.holidate.dto.response.acommodation.room.RoomInventoryResponse;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoomInventoryMapper {
  @Mapping(source = "id.roomId", target = "roomId")
  @Mapping(source = "id.date", target = "date")
  RoomInventoryResponse toRoomInventoryResponse(RoomInventory roomInventory);
}
