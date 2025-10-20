package com.webapp.holidate.dto.response.location.entertainment_venue;

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
public class EntertainmentVenueResponse {
  String id;
  String name;
  double distance;
}