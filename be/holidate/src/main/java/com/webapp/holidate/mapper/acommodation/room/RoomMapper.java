package com.webapp.holidate.mapper.acommodation.room;

import com.webapp.holidate.dto.request.acommodation.room.RoomCreationRequest;
import com.webapp.holidate.dto.response.acommodation.room.RoomBriefResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomWithInventoriesResponse;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.mapper.amenity.AmenityCategoryMapper;
import com.webapp.holidate.mapper.image.PhotoCategoryMapper;
import com.webapp.holidate.mapper.policy.cancellation.CancellationPolicyMapper;
import com.webapp.holidate.mapper.policy.reschedule.ReschedulePolicyMapper;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.Optional;

@Mapper(componentModel = "spring", uses = {
    PhotoCategoryMapper.class,
    AmenityCategoryMapper.class,
    CancellationPolicyMapper.class,
    ReschedulePolicyMapper.class,
    RoomInventoryMapper.class
})
public interface RoomMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "hotel", ignore = true)
  @Mapping(target = "photos", ignore = true)
  @Mapping(target = "bedType", ignore = true)
  @Mapping(target = "amenities", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "cancellationPolicy", ignore = true)
  @Mapping(target = "reschedulePolicy", ignore = true)
  @Mapping(target = "inventories", ignore = true)
  @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "updatedAt", ignore = true)
  Room toEntity(RoomCreationRequest request);

  @Mapping(target = "currentPricePerNight", ignore = true)
  @Mapping(target = "availableRooms", ignore = true)
  @Mapping(target = "totalRooms", ignore = true)
  @Mapping(source = "photos", target = "photos", qualifiedByName = "roomPhotosToCategories")
  @Mapping(source = "amenities", target = "amenities", qualifiedByName = "roomAmenitiesToCategories")
  RoomResponse toRoomResponse(Room room);

  @Mapping(target = "currentPricePerNight", ignore = true)
  RoomBriefResponse toRoomBriefResponse(Room room);

  @AfterMapping
  default void addCurrentPriceToBrief(Room room,
      @MappingTarget RoomBriefResponse.RoomBriefResponseBuilder responseBuilder) {
    double currentPrice = getCurrentPricePerNight(room);
    responseBuilder.currentPricePerNight(currentPrice);
  }

  @AfterMapping
  default void addCurrentPrice(Room room, @MappingTarget RoomResponse.RoomResponseBuilder responseBuilder) {
    double currentPrice = getCurrentPricePerNight(room);
    responseBuilder.currentPricePerNight(currentPrice);

    int availableRooms = getAvailableRoomsToday(room);
    responseBuilder.availableRooms(availableRooms);

    int totalRooms = room.getQuantity();
    responseBuilder.totalRooms(totalRooms);
  }

  @Mapping(target = "currentPricePerNight", ignore = true)
  @Mapping(target = "availableRooms", ignore = true)
  @Mapping(target = "totalRooms", ignore = true)
  @Mapping(source = "photos", target = "photos", qualifiedByName = "roomPhotosToCategories")
  @Mapping(source = "amenities", target = "amenities", qualifiedByName = "roomAmenitiesToCategories")
  RoomDetailsResponse toRoomDetailsResponse(Room room);

  @AfterMapping
  default void addCurrentPriceToDetails(Room room,
      @MappingTarget RoomDetailsResponse.RoomDetailsResponseBuilder responseBuilder) {
    double currentPrice = getCurrentPricePerNight(room);
    responseBuilder.currentPricePerNight(currentPrice);

    int availableRooms = getAvailableRoomsToday(room);
    responseBuilder.availableRooms(availableRooms);

    int totalRooms = room.getQuantity();
    responseBuilder.totalRooms(totalRooms);
  }

  @Mapping(target = "inventories", ignore = true)
  RoomWithInventoriesResponse toRoomWithInventoriesResponse(Room room);

  /**
   * Tính giá hiện tại của phòng dựa trên RoomInventory của ngày hiện tại.
   * Logic tương tự như HotelMapper.addPriceAndAvailability()
   */
  default double getCurrentPricePerNight(Room room) {
    LocalDate today = LocalDate.now();

    // Nếu không có inventories, return base price
    if (room.getInventories() == null || room.getInventories().isEmpty()) {
      return room.getBasePricePerNight();
    }

    // Tìm inventory cho ngày hiện tại
    Optional<RoomInventory> todayInventory = room.getInventories().stream()
        .filter(inventory -> inventory.getId().getDate().equals(today))
        .findFirst();

    if (todayInventory.isPresent()) {
      return todayInventory.get().getPrice();
    }

    // Nếu không có inventory cho ngày hiện tại, tìm inventory gần nhất trong tương
    // lai
    Optional<RoomInventory> nearestFutureInventory = room.getInventories().stream()
        .filter(inventory -> !inventory.getId().getDate().isBefore(today))
        .min(Comparator.comparing(inv -> inv.getId().getDate()));

    return nearestFutureInventory.map(RoomInventory::getPrice).orElseGet(room::getBasePricePerNight);
  }

  /**
   * Lấy số phòng available vào ngày hiện tại dựa trên RoomInventory.
   * Logic tương tự như getCurrentPricePerNight()
   */
  default int getAvailableRoomsToday(Room room) {
    LocalDate today = LocalDate.now();

    // Nếu không có inventories, return total quantity
    if (room.getInventories() == null || room.getInventories().isEmpty()) {
      return room.getQuantity();
    }

    // Tìm inventory cho ngày hiện tại
    Optional<RoomInventory> todayInventory = room.getInventories().stream()
        .filter(inventory -> inventory.getId().getDate().equals(today))
        .findFirst();

    if (todayInventory.isPresent()) {
      return todayInventory.get().getAvailableRooms();
    }

    // Nếu không có inventory cho ngày hiện tại, tìm inventory gần nhất trong tương
    // lai
    Optional<RoomInventory> nearestFutureInventory = room.getInventories().stream()
        .filter(inventory -> !inventory.getId().getDate().isBefore(today))
        .min(Comparator.comparing(inv -> inv.getId().getDate()));

    return nearestFutureInventory.map(RoomInventory::getAvailableRooms).orElse(room.getQuantity());
  }
}