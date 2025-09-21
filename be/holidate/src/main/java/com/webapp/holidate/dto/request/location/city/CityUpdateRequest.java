package com.webapp.holidate.dto.request.location.city;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
  @Size(min = 2, max = 3, message = "CITY_CODE_INVALID")
  String code;
  String provinceId;
}
