package com.webapp.holidate.mapper.booking;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.AfterMapping;

import com.webapp.holidate.dto.request.booking.BookingCreationRequest;
import com.webapp.holidate.dto.response.booking.BookingResponse;
import com.webapp.holidate.entity.booking.Booking;

@Mapper(componentModel = "spring")
public interface BookingMapper {
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "user", ignore = true)
  @Mapping(target = "room", ignore = true)
  @Mapping(target = "hotel", ignore = true)
  @Mapping(target = "numberOfNights", ignore = true)
  @Mapping(target = "originalPrice", ignore = true)
  @Mapping(target = "discountAmount", ignore = true)
  @Mapping(target = "finalPrice", ignore = true)
  @Mapping(target = "appliedDiscount", ignore = true)
  @Mapping(target = "payment", ignore = true)
  @Mapping(target = "review", ignore = true)
  @Mapping(target = "status", ignore = true)
  @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
  @Mapping(target = "updatedAt", ignore = true)
  Booking toEntity(BookingCreationRequest request);

  @Mapping(target = "checkInDate", expression = "java(booking.getCheckInDate().toString())")
  @Mapping(target = "checkOutDate", expression = "java(booking.getCheckOutDate().toString())")
  @Mapping(target = "bookingDateTime", expression = "java(booking.getCreatedAt().toString())")
  @Mapping(target = "expiresAt", ignore = true)
  BookingResponse toBookingResponse(Booking booking, String paymentUrl);

  @AfterMapping
  default void addExpirationTime(Booking booking,
      @MappingTarget BookingResponse.BookingResponseBuilder responseBuilder) {
    // Set expiration time to 15 minutes from creation time
    responseBuilder.expiresAt(booking.getCreatedAt().plusMinutes(15));
  }
}