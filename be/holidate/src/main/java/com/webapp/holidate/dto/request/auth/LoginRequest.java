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
public class LoginRequest {
  @NotBlank(message = "EMAIL_NOT_BLANK")
  @Email(message = "EMAIL_INVALID")
  String email;

  @NotBlank(message = "PASSWORD_NOT_BLANK")
  @Size(min = 8, message = "PASSWORD_INVALID")
  String password;
}
