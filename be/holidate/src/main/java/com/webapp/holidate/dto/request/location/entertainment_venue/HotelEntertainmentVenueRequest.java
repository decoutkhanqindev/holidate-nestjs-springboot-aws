package com.webapp.holidate.dto.request.location.entertainment_venue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class HotelEntertainmentVenueRequest {
  @NotBlank(message = "ENTERTAINMENT_VENUE_ID_NOT_BLANK")
  String entertainmentVenueId;
  @NotNull(message = "DISTANCE_MUST_BE_POSITIVE")
  @Positive(message = "DISTANCE_MUST_BE_POSITIVE")
  Integer distance;
}