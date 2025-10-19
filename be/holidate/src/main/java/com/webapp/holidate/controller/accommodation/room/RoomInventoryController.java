package com.webapp.holidate.controller.accommodation.room;

import com.webapp.holidate.constants.api.endpoint.AccommodationEndpoints;
import com.webapp.holidate.constants.api.param.CommonParams;
import com.webapp.holidate.constants.api.param.PaginationParams;
import com.webapp.holidate.constants.api.param.RoomParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.request.acommodation.room.inventory.RoomInventoryCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomWithInventoriesResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.dto.response.acommodation.room.inventory.RoomInventoryResponse;
import com.webapp.holidate.service.accommodation.room.RoomInventoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping(AccommodationEndpoints.ACCOMMODATION + AccommodationEndpoints.ROOMS
  + AccommodationEndpoints.ROOM_INVENTORIES)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoomInventoryController {
  RoomInventoryService service;

  @PostMapping
  public ApiResponse<RoomWithInventoriesResponse> create(@Valid @RequestBody RoomInventoryCreationRequest request)
    throws IOException {
    RoomWithInventoriesResponse response = service.create(request);
    return ApiResponse.<RoomWithInventoriesResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<PagedResponse<RoomInventoryResponse>> getAllByRoomIdForDateBetween(
    @RequestParam(RoomParams.ROOM_ID) String roomId,
    @RequestParam(RoomParams.START_DATE) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
    @RequestParam(RoomParams.END_DATE) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
    @RequestParam(value = CommonParams.STATUS, required = false) String status,
    @RequestParam(value = PaginationParams.PAGE, defaultValue = PaginationParams.DEFAULT_PAGE) int page,
    @RequestParam(value = PaginationParams.SIZE, defaultValue = PaginationParams.DEFAULT_SIZE) int size,
    @RequestParam(value = SortingParams.SORT_BY, required = false) String sortBy,
    @RequestParam(value = SortingParams.SORT_DIR, defaultValue = SortingParams.SORT_DIR_ASC) String sortDir
  ) {
    PagedResponse<RoomInventoryResponse> response = service.getAllByRoomIdForDateBetween(
      roomId, startDate, endDate, status, page, size, sortBy, sortDir);
    return ApiResponse.<PagedResponse<RoomInventoryResponse>>builder()
      .data(response)
      .build();
  }
}