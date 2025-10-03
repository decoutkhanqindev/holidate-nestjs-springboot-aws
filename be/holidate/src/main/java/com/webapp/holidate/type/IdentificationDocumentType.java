package com.webapp.holidate.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum IdentificationDocumentType {
  NATIONAL_ID("national_id"),
  PASSPORT("passport"),
  BIRTH_CERTIFICATE("birth_certificate");

  String value;
}
