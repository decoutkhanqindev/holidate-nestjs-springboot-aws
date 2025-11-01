package com.webapp.holidate.dto.response.booking;

import com.webapp.holidate.dto.response.acommodation.hotel.HotelBriefResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomBriefResponse;
import com.webapp.holidate.dto.response.user.UserBriefResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class BookingRescheduleResponse {
  String id;
  UserBriefResponse user;
  RoomBriefResponse room;
  HotelBriefResponse hotel;
  LocalDate oldCheckInDate;
  LocalDate oldCheckOutDate;
  int oldNumberOfNights;
  BookingPriceDetailsResponse oldPriceDetails;
  LocalDate newCheckInDate;
  LocalDate newCheckOutDate;
  int newNumberOfNights;
  BookingPriceDetailsResponse newPriceDetails;
  int numberOfRooms;
  int numberOfAdults;
  int numberOfChildren;
  String contactFullName;
  String contactEmail;
  String contactPhone;
  String status;
  double rescheduleFee;
  double priceDifference; // positive = customer pays more, negative = refund, zero = no change
  String paymentUrl;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
