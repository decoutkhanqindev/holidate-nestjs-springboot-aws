package com.webapp.holidate.dto.request.location.ward;

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
public class WardCreationRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @NotBlank(message = "CODE_NOT_BLANK")
  String code;

  @NotBlank(message = "DISTRICT_ID_NOT_BLANK")
  String districtId;
}
