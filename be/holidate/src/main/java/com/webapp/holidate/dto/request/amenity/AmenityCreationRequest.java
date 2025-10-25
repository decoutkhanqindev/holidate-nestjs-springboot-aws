package com.webapp.holidate.dto.request.amenity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class AmenityCreationRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @NotNull(message = "IS_FREE_NOT_BLANK")
  Boolean isFree;

  @NotBlank(message = "CATEGORY_ID_NOT_BLANK")
  String categoryId;
}