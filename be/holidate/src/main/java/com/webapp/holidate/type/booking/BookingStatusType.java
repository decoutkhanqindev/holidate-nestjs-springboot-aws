package com.webapp.holidate.type.booking;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum BookingStatusType {
  PENDING_PAYMENT("pending_payment"),
  CONFIRMED("confirmed"),
  CHECKED_IN("checked_in"),
  CANCELLED("cancelled"),
  COMPLETED("completed"),
  RESCHEDULED("rescheduled");

  String value;
}
