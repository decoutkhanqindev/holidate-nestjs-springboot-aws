package com.webapp.holidate.dto.request.user;

import com.webapp.holidate.constants.ValidationPatterns;
import jakarta.validation.constraints.Email;
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
public class UserCreationRequest {
  @NotBlank(message = "EMAIL_NOT_BLANK")
  @Email(message = "EMAIL_INVALID")
  String email;

  @NotBlank(message = "PASSWORD_NOT_BLANK")
  @Size(min = 8, message = "PASSWORD_INVALID")
  String password;

  @NotBlank(message = "FULL_NAME_NOT_BLANK")
  @Size(min = 3, max = 100, message = "FULL_NAME_INVALID")
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

  @NotBlank(message = "ROLE_ID_NOT_BLANK")
  String roleId;

  @NotBlank(message = "AUTH_PROVIDER_NOT_BLANK")
  String authProvider;
  String authProviderId;
  boolean active;
}
