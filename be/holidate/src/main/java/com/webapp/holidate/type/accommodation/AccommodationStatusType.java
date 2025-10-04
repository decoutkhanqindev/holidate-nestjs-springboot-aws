package com.webapp.holidate.type.accommodation;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum AccommodationStatusType {
  ACTIVE("active"),
  INACTIVE("inactive"),
  MAINTENANCE("maintenance"),
  CLOSED("closed");

  String value;
}
