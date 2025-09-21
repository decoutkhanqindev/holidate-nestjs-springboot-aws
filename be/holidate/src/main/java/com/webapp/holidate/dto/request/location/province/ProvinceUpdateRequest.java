package com.webapp.holidate.dto.request.location.province;

import jakarta.validation.constraints.Size;
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
public class ProvinceUpdateRequest {
  String name;
  @Size(min = 2, max = 3, message = "PROVINCE_CODE_INVALID")
  String code;
  String countryId;
}
