package com.webapp.holidate.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum HotelStatusType {
  ACTIVE("active"),
  INACTIVE("inactive"),
  UNDER_MAINTENANCE("under_maintenance"),
  CLOSED("closed");

  String value;
}
