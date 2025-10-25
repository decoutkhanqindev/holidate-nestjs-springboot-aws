package com.webapp.holidate.controller.discount;

import com.webapp.holidate.constants.api.endpoint.DiscountEndpoints;
import com.webapp.holidate.constants.api.param.HotelParams;
import com.webapp.holidate.constants.api.param.SpecialDayParams;
import com.webapp.holidate.dto.request.discount.DiscountCreationRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.discount.DiscountResponse;
import com.webapp.holidate.service.discount.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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
    @RequestParam(value = SpecialDayParams.SPECIAL_DAY_ID, required = false) String specialDayId
  ) {
    DiscountResponse response = service.create(request, hotelId, specialDayId);
    return ApiResponse.<DiscountResponse>builder()
      .data(response)
      .build();
  }
}
