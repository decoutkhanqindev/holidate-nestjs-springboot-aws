package com.webapp.holidate.dto.request.location.province;

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
public class ProvinceCreationRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @Size(min = 2, max = 3, message = "PROVINCE_CODE_INVALID")
  @NotBlank(message = "PROVINCE_CODE_NOT_BLANK")
  String code;

  @NotBlank(message = "COUNTRY_ID_NOT_BLANK")
  String countryId;
}
