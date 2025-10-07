package com.webapp.holidate.service.accommodation.room;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.dto.request.acommodation.room.inventory.RoomInventoryCreationRequest;
import com.webapp.holidate.dto.request.acommodation.room.inventory.RoomInventoryPriceUpdateRequest;
import com.webapp.holidate.dto.response.acommodation.room.RoomWithInventoriesResponse;
import com.webapp.holidate.dto.response.acommodation.room.inventory.RoomInventoryPriceDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.room.inventory.RoomInventoryResponse;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.accommodation.room.RoomInventoryId;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.acommodation.room.RoomInventoryMapper;
import com.webapp.holidate.mapper.acommodation.room.RoomMapper;
import com.webapp.holidate.repository.accommodation.room.RoomInventoryRepository;
import com.webapp.holidate.repository.accommodation.room.RoomRepository;
import com.webapp.holidate.type.ErrorType;
import com.webapp.holidate.type.accommodation.RoomStatusType;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoomInventoryService {
  RoomRepository roomRepository;
  RoomInventoryRepository roomInventoryRepository;

  RoomMapper roomMapper;
  RoomInventoryMapper roomInventoryMapper;

  @NonFinal
  @Value(AppProperties.VAT_RATE)
  double vatRate;

  @NonFinal
  @Value(AppProperties.SERVICE_FEE_RATE)
  double serviceFeeRate;

  @Transactional
  public RoomWithInventoriesResponse create(RoomInventoryCreationRequest request) {
    List<RoomInventory> inventories = new ArrayList<>();

    String roomId = request.getRoomId();
    Room room = roomRepository.findById(roomId)
      .orElseThrow(() -> new AppException(ErrorType.ROOM_NOT_FOUND));
    int quantity = room.getQuantity();
    double basePrice = room.getBasePricePerNight();
    LocalDate today = LocalDate.now();

    int days = request.getDays();
    for (int i = 0; i < days; i++) {
      LocalDate date = today.plusDays(i);
      RoomInventoryId id = RoomInventoryId.builder()
        .roomId(roomId)
        .date(date)
        .build();
      RoomInventory inventory = RoomInventory.builder()
        .id(id)
        .room(room)
        .price(basePrice)
        .availableRooms(quantity)
        .status(RoomStatusType.AVAILABLE.getValue())
        .build();
      inventories.add(inventory);
    }

    roomInventoryRepository.saveAll(inventories);

    RoomWithInventoriesResponse response = roomMapper.toRoomWithInventoriesResponse(room);
    List<RoomInventoryResponse> inventoryResponses = inventories.stream()
      .map(roomInventoryMapper::toRoomInventoryResponse)
      .toList();
    response.setInventories(inventoryResponses);

    return response;
  }

  public RoomWithInventoriesResponse getAllByRoomIdForDateBetween(String roomId, LocalDate startDate, LocalDate endDate) {
    Room room = roomRepository.findByIdWithHotelBedTypePhotosAmenitiesInventoriesCancellationPolicyReschedulePolicy(roomId)
      .orElseThrow(() -> new AppException(ErrorType.ROOM_NOT_FOUND));

    List<RoomInventory> inventories = roomInventoryRepository.findAllByRoomIdAndDateBetween(roomId, startDate, endDate);
    List<RoomInventoryResponse> inventoryResponses = inventories.stream()
      .map(roomInventoryMapper::toRoomInventoryResponse)
      .toList();

    RoomWithInventoriesResponse response = roomMapper.toRoomWithInventoriesResponse(room);
    response.setInventories(inventoryResponses);
    return response;
  }

  @Transactional
  public void updatePriceForDateBetween(RoomInventoryPriceUpdateRequest request) {
    String roomId = request.getRoomId();
    LocalDate startDate = request.getStartDate();
    LocalDate endDate = request.getEndDate();
    Double price = request.getPrice();

    List<RoomInventory> inventories = roomInventoryRepository.findAllByRoomIdAndDateBetween(roomId, startDate, endDate);
    inventories.forEach(inventory -> inventory.setPrice(price));
    roomInventoryRepository.saveAll(inventories);
  }

  //  @Transactional
//  public void updateAvailabilityForBooking(BookingRequest request) {
//    List<RoomInventory> inventories = roomInventoryRepository.findById_RoomIdAndId_DateBetween(
//      request.getRoomId(), request.getStartDate(), request.getEndDate());
//
//    long daysRequested = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate().plusDays(1));
//    if (inventories.size() != daysRequested) {
//      throw new ResourceNotFoundException("Một số ngày trong khoảng thời gian bạn chọn không có sẵn để đặt.");
//    }
//
//    for (RoomInventory inventory : inventories) {
//      if (inventory.getAvailableRooms() < request.getNumberOfRooms()) {
//        throw new InsufficientRoomsException("Không đủ phòng trống vào ngày " + inventory.getId().getDate());
//      }
//      inventory.setAvailableRooms(inventory.getAvailableRooms() - request.getNumberOfRooms());
//      if (inventory.getAvailableRooms() == 0) {
//        inventory.setStatus("SOLD_OUT");
//      }
//    }
//    roomInventoryRepository.saveAll(inventories);
//  }

//  @Transactional
//  public void updateAvailabilityForCancellation(BookingRequest request) {
//    // Tương tự logic booking nhưng cộng lại số phòng
//  }

  public List<RoomInventoryPriceDetailsResponse> getPriceDetails(String roomId, LocalDate startDate, LocalDate endDate) {
    return roomInventoryRepository.findAllByRoomIdAndDateBetween(roomId, startDate, endDate).stream()
      .map(inventory -> {
          LocalDate date = inventory.getId().getDate();
          double originalPrice = inventory.getPrice();
          double vatFee = originalPrice * vatRate;
          double serviceFee = originalPrice * serviceFeeRate;
          double finalPrice = originalPrice + vatFee + serviceFee;

          return RoomInventoryPriceDetailsResponse.builder()
            .date(date)
            .originalPrice(originalPrice)
            .priceAfterDiscount(originalPrice)
            .vatFee(vatFee)
            .serviceFee(serviceFee)
            .finalPrice(finalPrice)
            .build();
        }
      )
      .toList();
  }
}
