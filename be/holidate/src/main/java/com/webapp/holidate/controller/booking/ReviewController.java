package com.webapp.holidate.controller.booking;

import com.webapp.holidate.constants.api.endpoint.BookingEndpoints;
import com.webapp.holidate.constants.api.endpoint.CommonEndpoints;
import com.webapp.holidate.constants.api.param.*;
import com.webapp.holidate.dto.request.review.ReviewCreationRequest;
import com.webapp.holidate.dto.request.review.ReviewUpdateRequest;
import com.webapp.holidate.dto.response.ApiResponse;
import com.webapp.holidate.dto.response.base.PagedResponse;
import com.webapp.holidate.dto.response.review.ReviewDetailsResponse;
import com.webapp.holidate.dto.response.review.ReviewResponse;
import com.webapp.holidate.service.booking.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping(BookingEndpoints.REVIEWS)
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ReviewController {
  ReviewService service;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<ReviewDetailsResponse> create(@ModelAttribute @Valid ReviewCreationRequest request)
    throws IOException {
    ReviewDetailsResponse response = service.create(request);
    return ApiResponse.<ReviewDetailsResponse>builder()
      .data(response)
      .build();
  }

  @GetMapping
  public ApiResponse<PagedResponse<ReviewResponse>> getAll(
    @RequestParam(name = HotelParams.HOTEL_ID, required = false) String hotelId,
    @RequestParam(name = BookingParams.USER_ID, required = false) String userId,
    @RequestParam(name = BookingParams.BOOKING_ID, required = false) String bookingId,
    @RequestParam(name = FilterParams.MIN_SCORE, required = false) Integer minScore,
    @RequestParam(name = FilterParams.MAX_SCORE, required = false) Integer maxScore,
    @RequestParam(name = PaginationParams.PAGE, defaultValue = PaginationParams.DEFAULT_PAGE) int page,
    @RequestParam(name = PaginationParams.SIZE, defaultValue = PaginationParams.DEFAULT_SIZE) int size,
    @RequestParam(name = SortingParams.SORT_BY, defaultValue = CommonParams.CREATED_AT) String sortBy,
    @RequestParam(name = SortingParams.SORT_DIR, defaultValue = SortingParams.SORT_DIR_DESC) String sortDir) {
    PagedResponse<ReviewResponse> response = service.getAll(hotelId, userId, bookingId, minScore, maxScore, page, size,
      sortBy, sortDir);
    return ApiResponse.<PagedResponse<ReviewResponse>>builder()
      .data(response)
      .build();
  }

  @GetMapping(CommonEndpoints.ID)
  public ApiResponse<ReviewDetailsResponse> getById(@PathVariable String id) {
    ReviewDetailsResponse response = service.getById(id);
    return ApiResponse.<ReviewDetailsResponse>builder()
      .data(response)
      .build();
  }

  @PutMapping(path = CommonEndpoints.ID, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<ReviewDetailsResponse> update(@PathVariable String id,
                                                   @ModelAttribute @Valid ReviewUpdateRequest request)
    throws IOException {
    ReviewDetailsResponse response = service.update(id, request);
    return ApiResponse.<ReviewDetailsResponse>builder()
      .data(response)
      .build();
  }

  @DeleteMapping(CommonEndpoints.ID)
  public ApiResponse<ReviewDetailsResponse> delete(@PathVariable String id) {
    ReviewDetailsResponse response = service.delete(id);
    return ApiResponse.<ReviewDetailsResponse>builder()
      .data(response)
      .build();
  }
}
