package com.webapp.holidate.dto.response.location.entertainment_venue;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class EntertainmentVenueCategoryResponse {
  String id;
  String name;
  List<EntertainmentVenueResponse> entertainmentVenues;
}
