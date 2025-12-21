package com.webapp.holidate.type.booking;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum PaymentStatusType {
  PENDING("pending"),
  SUCCESS("success"),
  FAILED("failed");

  String value;
}
