package com.webapp.holidate.dto.request.auth.otp;

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
public class VerifyPasswordResetOtpRequest {
  @NotBlank(message = "EMAIL_NOT_BLANK")
  @Email(message = "EMAIL_INVALID")
  String email;

  @NotBlank(message = "OTP_NOT_BLANK")
  @Size(min = 6, max = 6, message = "OTP_INVALID")
  String otp;

  @NotBlank(message = "PASSWORD_NOT_BLANK")
  @Size(min = 8, message = "PASSWORD_INVALID")
  String newPassword;
}