package com.webapp.holidate.dto.request.location.city;

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
public class CityUpdateRequest {
  String name;
  String code;
  String provinceId;
}
