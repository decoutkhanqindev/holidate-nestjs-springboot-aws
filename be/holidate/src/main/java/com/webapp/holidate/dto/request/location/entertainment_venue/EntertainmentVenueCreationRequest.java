package com.webapp.holidate.dto.request.location.entertainment_venue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
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
public class EntertainmentVenueCreationRequest {
  @NotBlank(message = "NAME_NOT_BLANK")
  String name;

  @Positive(message = "DISTANCE_MUST_BE_POSITIVE")
  double distance;

  @NotBlank(message = "CITY_ID_NOT_BLANK")
  String cityId;

  @NotBlank(message = "CATEGORY_ID_NOT_BLANK")
  String categoryId;
}
