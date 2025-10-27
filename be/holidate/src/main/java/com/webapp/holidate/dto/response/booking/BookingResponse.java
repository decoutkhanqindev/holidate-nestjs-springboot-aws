package com.webapp.holidate.dto.response.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.webapp.holidate.dto.response.acommodation.hotel.HotelBriefResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomBriefResponse;
import com.webapp.holidate.dto.response.user.UserBriefResponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class BookingResponse {
  String id;
  UserBriefResponse user;
  RoomBriefResponse room;
  HotelBriefResponse hotel;
  LocalDate checkInDate;
  LocalDate checkOutDate;
  int numberOfNights;
  int numberOfRooms;
  int numberOfAdults;
  int numberOfChildren;
  BookingPriceDetailsResponse priceDetails;
  String contactFullName;
  String contactEmail;
  String contactPhone;
  String status;
  String paymentUrl;
  LocalDateTime createdAt;
  LocalDateTime expiresAt;
  LocalDateTime updatedAt;
}
