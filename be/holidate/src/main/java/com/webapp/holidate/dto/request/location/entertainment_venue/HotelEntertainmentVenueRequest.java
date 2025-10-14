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
public class HotelEntertainmentVenueRequest {
  @NotBlank(message = "ENTERTAINMENT_VENUE_ID_NOT_BLANK")
  String entertainmentVenueId;
  @Positive(message = "DISTANCE_MUST_BE_POSITIVE")
  int distance;
}