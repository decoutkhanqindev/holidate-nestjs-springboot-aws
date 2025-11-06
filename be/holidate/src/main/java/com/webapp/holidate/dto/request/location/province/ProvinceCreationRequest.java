package com.webapp.holidate.dto.request.location.province;

import jakarta.validation.constraints.NotBlank;
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

  @NotBlank(message = "CODE_NOT_BLANK")
  String code;

  @NotBlank(message = "COUNTRY_ID_NOT_BLANK")
  String countryId;
}
