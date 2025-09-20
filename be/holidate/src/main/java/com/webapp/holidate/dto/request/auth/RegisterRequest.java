package com.webapp.holidate.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class RegisterRequest {
  @NotBlank(message = "EMAIL_NOT_BLANK")
  @Email(message = "EMAIL_INVALID")
  String email;

  @NotBlank(message = "PASSWORD_NOT_BLANK")
  @Size(min = 8, message = "PASSWORD_INVALID")
  String password;

  @NotBlank(message = "FULL_NAME_NOT_BLANK")
  @Size(min = 3, max = 100, message = "FULL_NAME_INVALID")
  String fullName;
}
