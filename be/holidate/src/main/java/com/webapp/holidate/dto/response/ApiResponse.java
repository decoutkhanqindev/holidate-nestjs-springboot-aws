package com.webapp.holidate.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class ApiResponse<T> {
  @Builder.Default
  int statusCode = 200;
  @Builder.Default
  String message = "";
  T data;
}
