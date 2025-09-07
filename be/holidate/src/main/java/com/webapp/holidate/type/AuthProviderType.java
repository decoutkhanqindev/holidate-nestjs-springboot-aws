package com.webapp.holidate.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum AuthProviderType {
  LOCAL("local"),
  GOOGLE("google");

  String value;
}
