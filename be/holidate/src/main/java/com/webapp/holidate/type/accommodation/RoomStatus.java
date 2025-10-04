package com.webapp.holidate.type.accommodation;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum RoomStatus {
  AVAILABLE("available"),
  UNAVAILABLE("unavailable"),
  MAINTENANCE("maintenance"),
  BOOKED("booked");

  String value;
}
