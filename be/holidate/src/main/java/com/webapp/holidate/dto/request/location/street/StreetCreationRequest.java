package com.webapp.holidate.dto.request.location.street;

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
public class StreetCreationRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  String code;

  @NotBlank(message = "WARD_ID_NOT_BLANK")
  String wardId;
}
