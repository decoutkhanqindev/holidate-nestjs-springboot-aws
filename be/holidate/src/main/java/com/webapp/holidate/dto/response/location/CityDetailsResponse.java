package com.webapp.holidate.dto.response.location;

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
public class CityDetailsResponse {
  String id;
  String name;
  LocationResponse province;
  List<LocationResponse> districts;
}
