package com.webapp.holidate.type;

import com.webapp.holidate.exception.AppException;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Arrays;

@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Getter
public enum AuthProviderType {
  LOCAL("local"),
  GOOGLE("google");

  String value;
}
