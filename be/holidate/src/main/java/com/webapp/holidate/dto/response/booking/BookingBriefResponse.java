package com.webapp.holidate.dto.response.booking;

import java.time.LocalDate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
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
public class BookingBriefResponse {
  String id;
  LocalDate checkInDate;
  LocalDate checkOutDate;
  int numberOfNights;
  int numberOfRooms;
  int numberOfAdults;
  int numberOfChildren;
}
