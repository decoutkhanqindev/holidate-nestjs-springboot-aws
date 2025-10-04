package com.webapp.holidate.type.user;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum RoleType {
  USER("user"),
  ADMIN("admin"),
  PARTNER("partner");

  String value;
}
