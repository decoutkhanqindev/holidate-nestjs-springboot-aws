package com.webapp.holidate.dto.response.location;

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
public class WardResponse {
  String id;
  String name;
  String code;
  DistrictResponse district;
}
