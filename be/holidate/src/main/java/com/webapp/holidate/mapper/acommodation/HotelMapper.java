package com.webapp.holidate.mapper.acommodation;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.webapp.holidate.dto.request.acommodation.hotel.HotelCreationRequest;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelBriefResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.hotel.HotelResponse;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.mapper.amenity.AmenityCategoryMapper;
import com.webapp.holidate.mapper.image.PhotoCategoryMapper;
import com.webapp.holidate.mapper.location.EntertainmentVenueCategoryMapper;
import com.webapp.holidate.mapper.policy.HotelPolicyMapper;

@Mapper(componentModel = "spring", uses = {
    EntertainmentVenueCategoryMapper.class,
    PhotoCategoryMapper.class,
    AmenityCategoryMapper.class,
    HotelPolicyMapper.class
})
public interface HotelMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "country", ignore = true)
  @Mapping(target = "province", ignore = true)
  @Mapping(target = "city", ignore = true)
  @Mapping(target = "district", ignore = true)
  @Mapping(target = "ward", ignore = true)
  @Mapping(target = "street", ignore = true)
  @Mapping(target = "entertainmentVenues", ignore = true)
  @Mapping(target = "photos", ignore = true)
  @Mapping(target = "latitude", ignore = true)
  @Mapping(target = "longitude", ignore = true)
  @Mapping(target = "starRating", ignore = true)
  @Mapping(target = "policy", ignore = true)
  @Mapping(target = "partner", ignore = true)
  @Mapping(target = "amenities", ignore = true)
  @Mapping(target = "reviews", ignore = true)
  @Mapping(target = "discounts", ignore = true)
  @Mapping(target = "rooms", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "commissionRate", ignore = true)
  @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "updatedAt", ignore = true)
  Hotel toEntity(HotelCreationRequest request);

  @Mapping(target = "rawPricePerNight", ignore = true)
  @Mapping(target = "currentPricePerNight", ignore = true)
  @Mapping(target = "availableRooms", ignore = true)
  @Mapping(source = "photos", target = "photos", qualifiedByName = "hotelPhotosToCategories")
  HotelResponse toHotelResponse(Hotel hotel);

  @AfterMapping
  default void addPriceAndAvailability(Hotel hotel, @MappingTarget HotelResponse.HotelResponseBuilder responseBuilder) {
    double rawPrice = getRawPricePerNight(hotel);
    double currentPrice = getCurrentPricePerNight(hotel);
    int availableRooms = getAvailableRoomsToday(hotel);

    responseBuilder.rawPricePerNight(rawPrice);
    responseBuilder.currentPricePerNight(currentPrice);
    responseBuilder.availableRooms(availableRooms);
  }

  /**
   * OPTIMIZED: Map hotel to response WITHOUT calculating prices (for GET ALL optimization)
   * Prices will be set from database aggregation queries instead
   * This avoids loading thousands of room inventories into memory
   */
  @Mapping(target = "rawPricePerNight", ignore = true)
  @Mapping(target = "currentPricePerNight", ignore = true)
  @Mapping(target = "availableRooms", ignore = true)
  @Mapping(source = "photos", target = "photos", qualifiedByName = "hotelPhotosToCategories")
  @org.mapstruct.Named("withoutPrices")
  HotelResponse toHotelResponseWithoutPrices(Hotel hotel);

  @Mapping(source = "entertainmentVenues", target = "entertainmentVenues", qualifiedByName = "hotelEntertainmentVenuesToCategories")
  @Mapping(source = "photos", target = "photos", qualifiedByName = "hotelPhotosToCategories")
  @Mapping(source = "amenities", target = "amenities", qualifiedByName = "hotelAmenitiesToCategories")
  HotelDetailsResponse toHotelDetailsResponse(Hotel hotel);

  HotelBriefResponse toHotelBriefResponse(Hotel hotel);

  /**
   * Lấy giá gốc thấp nhất của hotel dựa trên base price của các phòng
   */
  default double getRawPricePerNight(Hotel hotel) {
    List<Room> rooms = hotel.getRooms().stream().toList();
    if (rooms.isEmpty()) {
      return 0.0;
    }

    return rooms.stream()
        .mapToDouble(Room::getBasePricePerNight)
        .min()
        .orElse(0.0);
  }

  /**
   * Tính giá hiện tại thấp nhất của hotel dựa trên RoomInventory
   * Logic: Lấy giá hiện tại của từng phòng (giá của ngày hôm nay hoặc ngày gần nhất trong tương lai),
   * sau đó tìm giá thấp nhất trong số các giá đó.
   * Điều này đảm bảo hotel.currentPricePerNight khớp với logic của room.currentPricePerNight.
   */
  default double getCurrentPricePerNight(Hotel hotel) {
    LocalDate today = LocalDate.now();

    List<Room> rooms = hotel.getRooms().stream().toList();
    if (rooms.isEmpty()) {
      return 0.0;
    }

    // Lấy giá hiện tại của từng phòng (sử dụng cùng logic như RoomMapper.getCurrentPricePerNight())
    List<Double> roomCurrentPrices = rooms.stream()
        .map(room -> getRoomCurrentPricePerNight(room, today))
        .filter(price -> price > 0.0)
        .toList();

    if (roomCurrentPrices.isEmpty()) {
      // Không có giá nào, return base price thấp nhất
      return getRawPricePerNight(hotel);
    }

    // Tìm giá thấp nhất trong số các giá hiện tại của các phòng
    return roomCurrentPrices.stream()
        .mapToDouble(Double::doubleValue)
        .min()
        .orElse(getRawPricePerNight(hotel));
  }

  /**
   * Lấy giá hiện tại của một phòng - logic giống với RoomMapper.getCurrentPricePerNight()
   * Tìm inventory cho ngày hôm nay, nếu không có thì tìm inventory gần nhất trong tương lai
   */
  default double getRoomCurrentPricePerNight(Room room, LocalDate today) {
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

    // Nếu không có inventory cho ngày hiện tại, tìm inventory gần nhất trong tương lai
    Optional<RoomInventory> nearestFutureInventory = room.getInventories().stream()
        .filter(inventory -> !inventory.getId().getDate().isBefore(today))
        .min(Comparator.comparing(inv -> inv.getId().getDate()));

    return nearestFutureInventory.map(RoomInventory::getPrice).orElseGet(room::getBasePricePerNight);
  }

  /**
   * Lấy tổng số phòng available của hotel vào ngày hiện tại
   * Logic tương tự như RoomMapper.getAvailableRoomsToday() nhưng tổng hợp cho
   * toàn hotel
   */
  default int getAvailableRoomsToday(Hotel hotel) {
    LocalDate today = LocalDate.now();

    List<Room> rooms = hotel.getRooms().stream().toList();
    if (rooms.isEmpty()) {
      return 0;
    }

    List<RoomInventory> roomInventories = rooms.stream()
        .flatMap(room -> room.getInventories().stream())
        .toList();

    if (roomInventories.isEmpty()) {
      // Không có inventory, return tổng quantity của tất cả rooms
      return rooms.stream()
          .mapToInt(Room::getQuantity)
          .sum();
    }

    // Tính tổng available rooms từ inventories của ngày hiện tại hoặc tương lai gần
    // nhất
    int totalAvailableRooms = roomInventories.stream()
        .filter(inventory -> !inventory.getId().getDate().isBefore(today))
        .mapToInt(RoomInventory::getAvailableRooms)
        .sum();

    // Nếu không có inventory nào available, fallback về total quantity
    if (totalAvailableRooms <= 0) {
      return rooms.stream()
          .mapToInt(Room::getQuantity)
          .sum();
    }

    return totalAvailableRooms;
  }
}