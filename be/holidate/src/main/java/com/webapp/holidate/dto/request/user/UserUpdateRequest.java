package com.webapp.holidate.dto.request.user;

import java.time.LocalDateTime;

import org.springframework.web.multipart.MultipartFile;

import com.webapp.holidate.constants.ValidationPatterns;

import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
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

  MultipartFile avatarFile;

  Boolean active;
}