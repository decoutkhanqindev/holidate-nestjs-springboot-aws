package com.webapp.holidate.dto.response.booking;

import java.time.LocalDateTime;

import com.webapp.holidate.dto.response.acommodation.hotel.HotelBriefResponse;
import com.webapp.holidate.dto.response.acommodation.room.RoomBriefResponse;
import com.webapp.holidate.dto.response.discount.DiscountBriefResponse;
import com.webapp.holidate.dto.response.discount.DiscountResponse;
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
  String checkInDate;
  String checkOutDate;
  int numberOfAdults;
  int numberOfChildren;
  double originalPrice;
  double discountAmount;
  double finalPrice;
  DiscountBriefResponse appliedDiscount;
  String contactFullName;
  String contactEmail;
  String contactPhone;
  String bookingDateTime;
  String status;
  String paymentUrl;
  LocalDateTime createdAt;
  LocalDateTime expiresAt;
}
