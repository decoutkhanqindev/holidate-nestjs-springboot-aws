package com.webapp.holidate.service.accommodation.room;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.dto.request.acommodation.room.RoomInventoryPriceUpdateRequest;
import com.webapp.holidate.dto.response.acommodation.room.RoomInventoryPriceDetailsResponse;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.accommodation.room.RoomInventoryId;
import com.webapp.holidate.repository.accommodation.room.RoomInventoryRepository;
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
  RoomInventoryRepository inventoryRepository;

  @NonFinal
  @Value(AppProperties.VAT_RATE)
  double vatRate;

  @NonFinal
  @Value(AppProperties.SERVICE_FEE_RATE)
  double serviceFeeRate;

  @Transactional
  public void create(Room room, int days) {
    List<RoomInventory> inventories = new ArrayList<>();
    String roomId = room.getId();
    int quantity = room.getQuantity();
    LocalDate today = LocalDate.now();

    for (int i = 0; i < days; i++) {
      LocalDate date = today.plusDays(i);
      RoomInventoryId id = RoomInventoryId.builder()
        .roomId(roomId)
        .date(date)
        .build();
      RoomInventory inventory = RoomInventory.builder()
        .id(id)
        .room(room)
        .availableRooms(quantity)
        .status(RoomStatusType.AVAILABLE.getValue())
        .build();
      inventories.add(inventory);
    }

    inventoryRepository.saveAll(inventories);
  }

  @Transactional
  public void updatePriceForDateBetween(RoomInventoryPriceUpdateRequest request) {
    String roomId = request.getRoomId();
    LocalDate startDate = request.getStartDate();
    LocalDate endDate = request.getEndDate();
    Double price = request.getPrice();

    List<RoomInventory> inventories = inventoryRepository.findAllByRoomIdAndDateBetween(roomId, startDate, endDate);
    inventories.forEach(inventory -> inventory.setPrice(price));
    inventoryRepository.saveAll(inventories);
  }

  //  @Transactional
//  public void updateAvailabilityForBooking(BookingRequest request) {
//    List<RoomInventory> inventories = repository.findById_RoomIdAndId_DateBetween(
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
//    repository.saveAll(inventories);
//  }

//  @Transactional
//  public void updateAvailabilityForCancellation(BookingRequest request) {
//    // Tương tự logic booking nhưng cộng lại số phòng
//  }

  public List<RoomInventoryPriceDetailsResponse> getPriceDetails(String roomId, LocalDate startDate, LocalDate endDate) {
    return inventoryRepository.findAllByRoomIdAndDateBetween(roomId, startDate, endDate).stream()
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
