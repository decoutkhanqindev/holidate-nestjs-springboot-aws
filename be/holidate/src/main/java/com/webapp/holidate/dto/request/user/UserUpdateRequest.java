package com.webapp.holidate.dto.request.user;

import com.webapp.holidate.constants.ValidationPatterns;
import com.webapp.holidate.constants.db.DbFieldNames;
import com.webapp.holidate.entity.location.City;
import com.webapp.holidate.entity.location.District;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
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
  @Size(min = 3, max = 100, message = "FULL_NAME_INVALID")
  String fullName;

  @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "PHONE_NUMBER_INVALID")
  String phoneNumber;

  @Size(min = 5, max = 200, message = "ADDRESS_DETAIL_INVALID")
  String address;

  @NotBlank(message = "CITY_ID_REQUIRED")
  String cityId;

  @NotBlank(message = "DISTRICT_ID_REQUIRED")
  String districtId;

  @Pattern(regexp = "^(male|female|other)$", message = "GENDER_INVALID")
  String gender;

  @Pattern(regexp = ValidationPatterns.DATE_OF_BIRTH, message = "DATE_OF_BIRTH_INVALID")
  LocalDateTime dateOfBirth;

  @Pattern(regexp = "^https?://.*\\.(jpg|jpeg|png|gif|webp)$", message = "AVATAR_URL_INVALID")
  String avatarUrl;
}
