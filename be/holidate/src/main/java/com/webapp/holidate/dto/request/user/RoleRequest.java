package com.webapp.holidate.dto.request.user;

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
public class RoleRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @NotBlank(message = "DESCRIPTION_NOT_BLANK")
  String description;
}
