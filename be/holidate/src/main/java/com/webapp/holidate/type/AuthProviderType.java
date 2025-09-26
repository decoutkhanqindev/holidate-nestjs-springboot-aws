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

  public static AuthProviderType toAuthProvider(String authProvider) {
    return Arrays.stream(AuthProviderType.values()).findFirst()
      .filter(type -> type.value.equalsIgnoreCase(authProvider))
      .orElseThrow(() -> new AppException(ErrorType.AUTH_PROVIDER_NOT_VALID));
  }

  String value;
}
