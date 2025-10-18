package com.webapp.holidate.service.accommodation.room;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.constants.api.param.PaginationParams;
import com.webapp.holidate.constants.api.param.RoomInventoryParams;
import com.webapp.holidate.dto.request.acommodation.room.inventory.RoomInventoryCreationRequest;
import com.webapp.holidate.dto.request.acommodation.room.inventory.RoomInventoryPriceUpdateRequest;
import com.webapp.holidate.dto.response.acommodation.room.RoomWithInventoriesResponse;
import com.webapp.holidate.dto.response.acommodation.room.inventory.RoomInventoryPriceDetailsResponse;
import com.webapp.holidate.dto.response.acommodation.room.inventory.RoomInventoryResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.accommodation.room.RoomInventoryId;
import com.webapp.holidate.exception.AppException;
import com.webapp.holidate.mapper.PagedMapper;
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
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoomInventoryService {
  RoomRepository roomRepository;
  RoomInventoryRepository roomInventoryRepository;

  RoomMapper roomMapper;
  RoomInventoryMapper roomInventoryMapper;
  PagedMapper pagedMapper;

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

  // Get room inventories with pagination and sorting
  public PagedResponse<RoomInventoryResponse> getAllByRoomIdForDateBetween(
    String roomId, LocalDate startDate, LocalDate endDate,
    int page, int size, String sortBy, String sortDir
  ) {
    // Step 1: Get all inventories for the date range
    List<RoomInventory> inventories = roomInventoryRepository.findAllByRoomIdAndDateBetween(roomId, startDate, endDate);

    // Step 2: Convert entities to response DTOs
    List<RoomInventoryResponse> inventoryResponses = inventories.stream()
      .map(roomInventoryMapper::toRoomInventoryResponse)
      .toList();

    // Step 3: Apply sorting if sort field is specified
    if (sortBy != null && !sortBy.isEmpty()) {
      inventoryResponses = applySorting(inventoryResponses, sortBy, sortDir);
    }

    // Step 4: Apply pagination and return paged response
    return applyPagination(inventoryResponses, page, size);
  }

  // Sort room inventory responses by specified field and direction
  private List<RoomInventoryResponse> applySorting(
    List<RoomInventoryResponse> inventoryResponses, String sortBy, String sortDir
  ) {
    // Step 1: Determine sort direction
    boolean isAscending = PaginationParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir);

    // Step 2: Apply sorting using comparator
    return inventoryResponses.stream()
      .sorted((inv1, inv2) -> {
          // Step 3: Compare values based on sort field
          int comparison = switch (sortBy) {
            case RoomInventoryParams.SORT_BY_DATE ->
              // Compare dates
              inv1.getDate().compareTo(inv2.getDate());
            case RoomInventoryParams.SORT_BY_PRICE ->
              // Compare prices
              Double.compare(inv1.getPrice(), inv2.getPrice());
            case RoomInventoryParams.SORT_BY_AVAILABLE_ROOMS ->
              // Compare available room counts
              Integer.compare(inv1.getAvailableRooms(), inv2.getAvailableRooms());
            case RoomInventoryParams.SORT_BY_STATUS ->
              // Compare status strings
              inv1.getStatus().compareTo(inv2.getStatus());
            default ->
              // Default sort by date
              inv1.getDate().compareTo(inv2.getDate());
          };

          // Step 4: Reverse comparison for descending order
          return isAscending ? comparison : -comparison;
        }
      )
      .toList();
  }

  // Apply pagination to inventory responses list
  private PagedResponse<RoomInventoryResponse> applyPagination(
    List<RoomInventoryResponse> inventoryResponses, int page, int size
  ) {
    // Step 1: Calculate pagination metadata
    long totalElements = inventoryResponses.size();
    int totalPages = (int) Math.ceil((double) totalElements / size);

    // Step 2: Handle empty result case
    if (totalElements == 0) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Step 3: Calculate page boundaries
    int startIndex = page * size;
    int endIndex = Math.min(startIndex + size, inventoryResponses.size());

    // Step 4: Handle page out of range case
    if (startIndex >= inventoryResponses.size()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Step 5: Extract content for current page
    List<RoomInventoryResponse> content = inventoryResponses.subList(startIndex, endIndex);

    // Step 6: Create and return paged response
    return pagedMapper.createPagedResponse(content, page, size, totalElements, totalPages);
  }

  // @Transactional
  // public void updateAvailabilityForBooking(BookingRequest request) {
  // List<RoomInventory> inventories =
  // roomInventoryRepository.findById_RoomIdAndId_DateBetween(
  // request.getRoomId(), request.getStartDate(), request.getEndDate());
  //
  // long daysRequested = ChronoUnit.DAYS.between(request.getStartDate(),
  // request.getEndDate().plusDays(1));
  // if (inventories.size() != daysRequested) {
  // throw new ResourceNotFoundException("Một số ngày trong khoảng thời gian bạn
  // chọn không có sẵn để đặt.");
  // }
  //
  // for (RoomInventory inventory : inventories) {
  // if (inventory.getAvailableRooms() < request.getNumberOfRooms()) {
  // throw new InsufficientRoomsException("Không đủ phòng trống vào ngày " +
  // inventory.getId().getDate());
  // }
  // inventory.setAvailableRooms(inventory.getAvailableRooms() -
  // request.getNumberOfRooms());
  // if (inventory.getAvailableRooms() == 0) {
  // inventory.setStatus("SOLD_OUT");
  // }
  // }
  // roomInventoryRepository.saveAll(inventories);
  // }

  // @Transactional
  // public void updateAvailabilityForCancellation(BookingRequest request) {
  // // Tương tự logic booking nhưng cộng lại số phòng
  // }


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

  public List<RoomInventoryPriceDetailsResponse> getPriceDetails(
    String roomId, LocalDate startDate, LocalDate endDate
  ) {
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
      })
      .toList();
  }
}
