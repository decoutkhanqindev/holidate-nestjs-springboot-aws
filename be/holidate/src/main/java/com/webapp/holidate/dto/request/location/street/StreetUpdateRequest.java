package com.webapp.holidate.dto.request.location.street;

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
public class StreetUpdateRequest {
  String name;
  String code;
  String wardId;
}
