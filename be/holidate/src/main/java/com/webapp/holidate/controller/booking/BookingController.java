package com.webapp.holidate.controller.booking;

import com.webapp.holidate.constants.api.endpoint.BookingEndpoints;
import com.webapp.holidate.dto.request.booking.BookingCreationRequest;
import com.webapp.holidate.dto.request.booking.BookingPricePreviewRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.booking.BookingPriceDetailsResponse;
import com.webapp.holidate.dto.response.booking.BookingResponse;
import com.webapp.holidate.service.booking.BookingService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

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

  @GetMapping(BookingEndpoints.PRICE_PREVIEW)
  public ApiResponse<BookingPriceDetailsResponse> getPricePreview(
      @RequestBody @Valid BookingPricePreviewRequest request) {
    BookingPriceDetailsResponse response = service.getPricePreview(request);
    return ApiResponse.<BookingPriceDetailsResponse>builder()
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
}
