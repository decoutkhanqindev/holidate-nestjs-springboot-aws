package com.webapp.holidate.dto.response.booking;

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
  String userId;
  String roomId;
  String hotelId;
  String checkInDate;
  String checkOutDate;
  int numberOfAdults;
  int numberOfChildren;
  double originalPrice;
  double discountAmount;
  double finalPrice;
  String discountCode;
  String contactFullName;
  String contactEmail;
  String contactPhone;
  String bookingDateTime;
  String status;
}
