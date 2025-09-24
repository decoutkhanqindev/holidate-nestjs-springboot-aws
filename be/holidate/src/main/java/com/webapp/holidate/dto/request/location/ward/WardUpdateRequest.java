package com.webapp.holidate.dto.request.location.ward;

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
public class WardUpdateRequest {
  String name;
  String code;
  String districtId;
}
