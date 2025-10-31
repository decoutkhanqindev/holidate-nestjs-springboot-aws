package com.webapp.holidate.controller.booking;

import com.webapp.holidate.constants.api.endpoint.BookingEndpoints;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.param.BookingParams;
import com.webapp.holidate.constants.api.param.PaginationParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.dto.request.booking.BookingCreationRequest;
import com.webapp.holidate.dto.request.booking.BookingPricePreviewRequest;
import com.webapp.holidate.dto.request.booking.BookingRescheduleRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.dto.response.booking.BookingPriceDetailsResponse;
import com.webapp.holidate.dto.response.booking.BookingResponse;
import com.webapp.holidate.service.booking.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping(BookingEndpoints.BOOKINGS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class BookingController {
  BookingService service;

  @PostMapping
  public ApiResponse<BookingResponse> create(
      @RequestBody @Valid BookingCreationRequest request,
      HttpServletRequest httpRequest) {
    BookingResponse response = service.create(request, httpRequest);
    return ApiResponse.<BookingResponse>builder()
        .data(response)
        .build();
  }

  @PostMapping(BookingEndpoints.PRICE_PREVIEW)
  public ApiResponse<BookingPriceDetailsResponse> createPricePreview(
      @RequestBody @Valid BookingPricePreviewRequest request) {
    BookingPriceDetailsResponse response = service.createPricePreview(request);
    return ApiResponse.<BookingPriceDetailsResponse>builder()
        .data(response)
        .build();
  }

  @GetMapping
  public ApiResponse<PagedResponse<BookingResponse>> getAll(
      @RequestParam(name = BookingParams.USER_ID, required = false) String userId,
      @RequestParam(name = BookingParams.ROOM_ID, required = false) String roomId,
      @RequestParam(name = BookingParams.HOTEL_ID, required = false) String hotelId,
      @RequestParam(name = BookingParams.STATUS, required = false) String status,
      @RequestParam(name = BookingParams.CHECK_IN_DATE, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
      @RequestParam(name = BookingParams.CHECK_OUT_DATE, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
      @RequestParam(name = BookingParams.CREATED_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdFrom,
      @RequestParam(name = BookingParams.CREATED_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdTo,
      @RequestParam(name = BookingParams.MIN_PRICE, required = false) Double minPrice,
      @RequestParam(name = BookingParams.MAX_PRICE, required = false) Double maxPrice,
      @RequestParam(name = BookingParams.CONTACT_EMAIL, required = false) String contactEmail,
      @RequestParam(name = BookingParams.CONTACT_PHONE, required = false) String contactPhone,
      @RequestParam(name = BookingParams.CONTACT_FULL_NAME, required = false) String contactFullName,
      @RequestParam(name = PaginationParams.PAGE, defaultValue = PaginationParams.DEFAULT_PAGE) int page,
      @RequestParam(name = PaginationParams.SIZE, defaultValue = PaginationParams.DEFAULT_SIZE) int size,
      @RequestParam(name = SortingParams.SORT_BY, defaultValue = BookingParams.CREATED_AT) String sortBy,
      @RequestParam(name = SortingParams.SORT_DIR, defaultValue = SortingParams.SORT_DIR_DESC) String sortDir) {
    PagedResponse<BookingResponse> response = service.getAll(
        userId, roomId, hotelId, status,
        checkInDate, checkOutDate, createdFrom, createdTo,
        minPrice, maxPrice, contactEmail, contactPhone, contactFullName,
        page, size, sortBy, sortDir);
    return ApiResponse.<PagedResponse<BookingResponse>>builder()
        .data(response)
        .build();
  }

  @GetMapping(CommonEndpoints.ID)
  public ApiResponse<BookingResponse> getById(@PathVariable String id) {
    BookingResponse response = service.getById(id);
    return ApiResponse.<BookingResponse>builder()
        .data(response)
        .build();
  }

  @DeleteMapping(CommonEndpoints.ID)
  public ApiResponse<BookingResponse> delete(@PathVariable String id) {
    BookingResponse response = service.delete(id);
    return ApiResponse.<BookingResponse>builder()
        .data(response)
        .build();
  }

  @PostMapping(CommonEndpoints.ID + BookingEndpoints.CANCEL)
  public ApiResponse<BookingResponse> cancel(@PathVariable String id) {
    BookingResponse response = service.cancel(id);
    return ApiResponse.<BookingResponse>builder()
        .data(response)
        .build();
  }

  @PostMapping(CommonEndpoints.ID + BookingEndpoints.RESCHEDULE)
  public ApiResponse<BookingResponse> reschedule(
      @PathVariable String id,
      @RequestBody @Valid BookingRescheduleRequest request,
      HttpServletRequest httpRequest) {
    BookingResponse response = service.reschedule(id, request, httpRequest);
    return ApiResponse.<BookingResponse>builder()
        .data(response)
        .build();
  }
}
