package com.webapp.holidate.dto.request;

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
  @Size(min = 3, max = 100, message = "FULL_NAME_INVALID")
  String fullName;

  @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "PHONE_NUMBER_INVALID")
  String phoneNumber;

  @Pattern(regexp = ValidationPatterns.DATE_OF_BIRTH, message = "DATE_OF_BIRTH_INVALID")
  LocalDateTime dateOfBirth;

  String avatarUrl;
}
