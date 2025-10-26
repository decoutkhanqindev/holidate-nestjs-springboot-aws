package com.webapp.holidate.controller.booking;

import com.webapp.holidate.constants.api.endpoint.BookingEndpoints;
import com.webapp.holidate.dto.request.booking.BookingCreationRequest;
import com.webapp.holidate.dto.request.booking.BookingPricePreviewRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.booking.BookingPricePreviewResponse;
import com.webapp.holidate.dto.response.booking.BookingResponse;
import com.webapp.holidate.service.booking.BookingService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping(BookingEndpoints.BOOKINGS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class BookingController {
  BookingService service;

  @PostMapping
  public ApiResponse<BookingResponse> create(@RequestBody @Valid BookingCreationRequest request) {
    BookingResponse response = service.create(request);
    return ApiResponse.<BookingResponse>builder()
        .data(response)
        .build();
  }

  @GetMapping(BookingEndpoints.PRICE_PREVIEW)
  public ApiResponse<BookingPricePreviewResponse> getPricePreview(
      @RequestBody @Valid BookingPricePreviewRequest request) {
    BookingPricePreviewResponse response = service.getPricePreview(request);
    return ApiResponse.<BookingPricePreviewResponse>builder()
        .data(response)
        .build();
  }
}
