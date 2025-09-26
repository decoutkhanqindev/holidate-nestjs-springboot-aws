package com.webapp.holidate.type;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
@Getter
@ToString
public enum HotelStatusType {
  ACTIVE("active"),
  INACTIVE("inactive"),
  UNDER_MAINTENANCE("under_maintenance"),
  CLOSED("closed");

  String value;
}
