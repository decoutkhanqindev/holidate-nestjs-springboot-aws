package com.webapp.holidate.mapper.acommodation;

import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.mapper.amenity.AmenityCategoryMapper;
import com.webapp.holidate.mapper.image.PhotoCategoryMapper;
import com.webapp.holidate.mapper.policy.HotelPolicyMapper;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Mapper(
  componentModel = "spring",
  uses = {
    PhotoCategoryMapper.class,
    AmenityCategoryMapper.class,
    HotelPolicyMapper.class
  }
)
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
  @Mapping(target = "policy", ignore = true)
  @Mapping(target = "partner", ignore = true)
  @Mapping(target = "amenities", ignore = true)
  @Mapping(target = "reviews", ignore = true)
  @Mapping(target = "rooms", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "updatedAt", ignore = true)
  Hotel toEntity(HotelCreationRequest request);

  @Mapping(source = "photos", target = "photos", qualifiedByName = "hotelPhotosToCategories")
  HotelResponse toHotelResponse(Hotel hotel);

  @AfterMapping
  default void addPriceAndAvailability(Hotel hotel, @MappingTarget HotelResponse.HotelResponseBuilder responseBuilder) {
    LocalDate today = LocalDate.now();

    List<Room> rooms = hotel.getRooms().stream().toList();
    List<RoomInventory> roomInventories = rooms.stream()
      .flatMap(room -> room.getInventories().stream())
      .toList();
    Optional<RoomInventory> cheapestAvailableInventory = roomInventories.stream()
      .filter(inventory -> !inventory.getId().getDate().isBefore(today))
      .filter(inventory -> inventory.getAvailableRooms() > 0)
      .min(Comparator.comparingDouble(RoomInventory::getPrice));

    if (cheapestAvailableInventory.isPresent()) {
      RoomInventory inventory = cheapestAvailableInventory.get();
      Room room = inventory.getRoom();

      responseBuilder.rawPricePerNight(room.getBasePricePerNight());
      responseBuilder.currentPricePerNight(inventory.getPrice());
      responseBuilder.availableRooms(inventory.getAvailableRooms());
    } else {
      responseBuilder.rawPricePerNight(0.0);
      responseBuilder.currentPricePerNight(0.0);
      responseBuilder.availableRooms(0);
    }
  }

  @Mapping(source = "photos", target = "photos", qualifiedByName = "hotelPhotosToCategories")
  @Mapping(source = "amenities", target = "amenities", qualifiedByName = "hotelAmenitiesToCategories")
  HotelDetailsResponse toHotelDetailsResponse(Hotel hotel);
}