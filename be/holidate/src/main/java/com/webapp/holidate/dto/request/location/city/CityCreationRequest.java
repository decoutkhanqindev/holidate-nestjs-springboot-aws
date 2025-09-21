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
public class CityCreationRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @Size(min = 2, max = 3, message = "CITY_CODE_INVALID")
  @NotBlank(message = "CITY_CODE_NOT_BLANK")
  String code;

  @NotBlank(message = "PROVINCE_ID_NOT_BLANK")
  String provinceId;
}
