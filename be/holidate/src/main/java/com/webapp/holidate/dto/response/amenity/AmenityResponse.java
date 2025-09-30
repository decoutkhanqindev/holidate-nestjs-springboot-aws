package com.webapp.holidate.dto.response.amenity;

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
public class AmenityResponse {
  String id;
  String name;
  String description;
  boolean free;
}
