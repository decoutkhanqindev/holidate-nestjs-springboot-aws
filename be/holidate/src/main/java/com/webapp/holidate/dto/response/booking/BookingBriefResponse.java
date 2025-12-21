package com.webapp.holidate.dto.response.booking;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class BookingBriefResponse {
  String id;
  LocalDate checkInDate;
  LocalDate checkOutDate;
  int numberOfNights;
  int numberOfRooms;
  int numberOfAdults;
  int numberOfChildren;
}
