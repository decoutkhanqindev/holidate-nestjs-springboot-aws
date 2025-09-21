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
public class ProvinceDetailsResponse {
  String id;
  String name;
  LocationResponse country;
  List<LocationResponse> cities;
}
