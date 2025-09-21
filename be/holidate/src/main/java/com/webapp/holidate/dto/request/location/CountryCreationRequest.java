package com.webapp.holidate.dto.request.location;

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
public class CountryCreationRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;
  @NotBlank(message = "COUNTRY_CODE_NOT_BLANK")
  String code;
}
