package com.webapp.holidate.service.accommodation.room;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.constants.api.param.SortingParams;
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
import com.webapp.holidate.type.accommodation.RoomInventoryStatusType;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    Integer days = request.getDays();
    if (days == null || days <= 0) {
      throw new AppException(ErrorType.INVALID_DAYS_VALUE);
    }
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
          .status(RoomInventoryStatusType.AVAILABLE.getValue())
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

  public PagedResponse<RoomInventoryResponse> getAllByRoomIdForDateBetween(
      String roomId, LocalDate startDate, LocalDate endDate, String status,
      int page, int size, String sortBy, String sortDir) {
    // Clean up and validate pagination parameters
    page = Math.max(0, page);
    size = Math.min(Math.max(1, size), 100);

    // Check if sort direction is valid
    boolean hasSortDir = sortDir != null && !sortDir.isEmpty()
        && (SortingParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir)
            || SortingParams.SORT_DIR_DESC.equalsIgnoreCase(sortDir));
    if (!hasSortDir) {
      sortDir = SortingParams.SORT_DIR_ASC;
    }

    // Check if sort field is valid
    boolean hasSortBy = sortBy != null && !sortBy.isEmpty()
        && (RoomInventoryParams.DATE.equals(sortBy)
            || RoomInventoryParams.PRICE.equals(sortBy)
            || RoomInventoryParams.AVAILABLE_ROOMS.equals(sortBy));
    if (!hasSortBy) {
      sortBy = null;
    }

    // Check what filters are provided
    boolean hasStatusFilter = status != null && !status.isEmpty();

    // Use 100% database-level pagination - all inventory fields can be sorted at DB
    // level
    return getInventoriesWithDatabasePagination(
        roomId, startDate, endDate, status, hasStatusFilter, page, size, sortBy, sortDir);
  }

  // Get inventories with 100% database-level pagination
  private PagedResponse<RoomInventoryResponse> getInventoriesWithDatabasePagination(
      String roomId, LocalDate startDate, LocalDate endDate, String status,
      boolean hasStatusFilter, int page, int size, String sortBy, String sortDir) {
    // Get paginated data directly from database
    Page<RoomInventory> inventoryPage = getInventoriesWithPagination(
        roomId, startDate, endDate, status, hasStatusFilter, page, size, sortBy, sortDir);

    // Check if we have any inventories
    if (inventoryPage.isEmpty()) {
      return pagedMapper.createEmptyPagedResponse(page, size);
    }

    // Convert entities to response DTOs
    List<RoomInventoryResponse> inventoryResponses = inventoryPage.getContent().stream()
        .map(roomInventoryMapper::toRoomInventoryResponse)
        .toList();

    // Create and return paged response with database pagination metadata
    return pagedMapper.createPagedResponse(
        inventoryResponses,
        page,
        size,
        inventoryPage.getTotalElements(),
        inventoryPage.getTotalPages());
  }

  // Create Pageable object for database-level pagination
  private Pageable createPageable(int page, int size, String sortBy, String sortDir) {
    if (sortBy == null || sortBy.isEmpty()) {
      // Default sorting by date
      return PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id.date"));
    }

    // Map sort field to entity field
    String entitySortField = mapInventorySortFieldToEntity(sortBy);

    // Determine sort direction
    Sort.Direction direction = SortingParams.SORT_DIR_DESC.equalsIgnoreCase(sortDir)
        ? Sort.Direction.DESC
        : Sort.Direction.ASC;

    return PageRequest.of(page, size,
        Sort.by(direction, entitySortField));
  }

  // Map sort field from API to entity field name
  private String mapInventorySortFieldToEntity(String sortBy) {
    return switch (sortBy) {
      case RoomInventoryParams.DATE -> "id.date";
      case RoomInventoryParams.PRICE -> "price";
      case RoomInventoryParams.AVAILABLE_ROOMS -> "availableRooms";
      default -> "id.date"; // Default sorting by date
    };
  }

  // Get inventories with database-level pagination
  private Page<RoomInventory> getInventoriesWithPagination(
      String roomId, LocalDate startDate, LocalDate endDate, String status,
      boolean hasStatusFilter, int page, int size, String sortBy, String sortDir) {

    Pageable pageable = createPageable(page, size, sortBy, sortDir);

    // Get data from database with pagination
    if (hasStatusFilter) {
      return roomInventoryRepository.findAllByRoomIdAndDateBetweenWithFiltersPaged(
          roomId, startDate, endDate, status, pageable);
    } else {
      return roomInventoryRepository.findAllByRoomIdAndDateBetweenPaged(
          roomId, startDate, endDate, pageable);
    }
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
      String roomId, LocalDate startDate, LocalDate endDate) {
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