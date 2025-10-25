package com.webapp.holidate.controller.discount;

import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.endpoint.DiscountEndpoints;
import com.webapp.holidate.constants.api.param.DiscountParams;
import com.webapp.holidate.constants.api.param.HotelParams;
import com.webapp.holidate.constants.api.param.PaginationParams;
import com.webapp.holidate.constants.api.param.SortingParams;
import com.webapp.holidate.constants.api.param.SpecialDayParams;
import com.webapp.holidate.dto.request.discount.DiscountCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.dto.response.discount.DiscountDetailsResponse;
import com.webapp.holidate.dto.response.discount.DiscountResponse;
import com.webapp.holidate.service.discount.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(DiscountEndpoints.DISCOUNTS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class DiscountController {
  DiscountService service;

  @PostMapping
  public ApiResponse<DiscountResponse> create(
      @RequestBody @Valid DiscountCreationRequest request,
      @RequestParam(value = HotelParams.HOTEL_ID, required = false) String hotelId,
      @RequestParam(value = SpecialDayParams.SPECIAL_DAY_ID, required = false) String specialDayId) {
    DiscountResponse response = service.create(request, hotelId, specialDayId);
    return ApiResponse.<DiscountResponse>builder()
        .data(response)
        .build();
  }

  @GetMapping
  public ApiResponse<PagedResponse<DiscountResponse>> getAll(
      @RequestParam(name = DiscountParams.CODE, required = false) String code,
      @RequestParam(name = DiscountParams.ACTIVE, required = false) Boolean active,
      @RequestParam(name = DiscountParams.CURRENTLY_VALID, required = false) Boolean currentlyValid,
      @RequestParam(name = DiscountParams.VALID_FROM, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate validFrom,
      @RequestParam(name = DiscountParams.VALID_TO, required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate validTo,
      @RequestParam(name = DiscountParams.MIN_PERCENTAGE, required = false) Double minPercentage,
      @RequestParam(name = DiscountParams.MAX_PERCENTAGE, required = false) Double maxPercentage,
      @RequestParam(name = DiscountParams.MIN_BOOKING_PRICE, required = false) Integer minBookingPrice,
      @RequestParam(name = DiscountParams.MAX_BOOKING_PRICE, required = false) Integer maxBookingPrice,
      @RequestParam(name = DiscountParams.MIN_BOOKING_COUNT, required = false) Integer minBookingCount,
      @RequestParam(name = DiscountParams.MAX_BOOKING_COUNT, required = false) Integer maxBookingCount,
      @RequestParam(name = DiscountParams.AVAILABLE, required = false) Boolean available,
      @RequestParam(name = DiscountParams.EXHAUSTED, required = false) Boolean exhausted,
      @RequestParam(name = DiscountParams.MIN_TIMES_USED, required = false) Integer minTimesUsed,
      @RequestParam(name = DiscountParams.MAX_TIMES_USED, required = false) Integer maxTimesUsed,
      @RequestParam(name = DiscountParams.HOTEL_ID, required = false) String hotelId,
      @RequestParam(name = DiscountParams.SPECIAL_DAY_ID, required = false) String specialDayId,
      @RequestParam(name = PaginationParams.PAGE, defaultValue = PaginationParams.DEFAULT_PAGE) int page,
      @RequestParam(name = PaginationParams.SIZE, defaultValue = PaginationParams.DEFAULT_SIZE) int size,
      @RequestParam(name = SortingParams.SORT_BY, defaultValue = DiscountParams.CREATED_AT) String sortBy,
      @RequestParam(name = SortingParams.SORT_DIR, defaultValue = SortingParams.SORT_DIR_ASC) String sortDir) {
    PagedResponse<DiscountResponse> response = service.getAll(
        code, active, currentlyValid, validFrom, validTo,
        minPercentage, maxPercentage, minBookingPrice, maxBookingPrice,
        minBookingCount, maxBookingCount, available, exhausted,
        minTimesUsed, maxTimesUsed, hotelId, specialDayId,
        page, size, sortBy, sortDir);
    return ApiResponse.<PagedResponse<DiscountResponse>>builder()
        .data(response)
        .build();
  }

  @GetMapping(CommonEndpoints.ID)
  public ApiResponse<DiscountDetailsResponse> getById(@PathVariable String id) {
    DiscountDetailsResponse response = service.getById(id);
    return ApiResponse.<DiscountDetailsResponse>builder()
        .data(response)
        .build();
  }
}
