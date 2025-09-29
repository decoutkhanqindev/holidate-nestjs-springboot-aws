package com.webapp.holidate.dto.request.user;

import com.webapp.holidate.constants.ValidationPatterns;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class UserUpdateRequest {
  String fullName;

  @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "PHONE_NUMBER_INVALID")
  String phoneNumber;

  String address;
  String countryId;
  String provinceId;
  String cityId;
  String districtId;
  String wardId;
  String streetId;

  @Pattern(regexp = ValidationPatterns.GENDER, message = "GENDER_INVALID")
  String gender;

  LocalDateTime dateOfBirth;

  String avatarUrl;
}
