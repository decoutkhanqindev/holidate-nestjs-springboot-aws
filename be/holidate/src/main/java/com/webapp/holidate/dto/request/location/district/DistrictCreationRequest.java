package com.webapp.holidate.dto.request.location.district;

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
public class DistrictCreationRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @Size(min = 2, max = 3, message = "DISTRICT_CODE_INVALID")
  @NotBlank(message = "DISTRICT_CODE_NOT_BLANK")
  String code;

  @NotBlank(message = "CITY_ID_NOT_BLANK")
  String cityId;
}
