package com.webapp.holidate.dto.request.location.district;

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
public class DistrictUpdateRequest {
  String name;
  String code;
  String cityId;
}
