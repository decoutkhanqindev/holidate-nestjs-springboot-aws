package com.webapp.holidate.dto.request.auth.otp;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class SendOtpRequest {
  @NotBlank(message = "EMAIL_NOT_BLANK")
  @Email(message = "EMAIL_INVALID")
  String email;
}
