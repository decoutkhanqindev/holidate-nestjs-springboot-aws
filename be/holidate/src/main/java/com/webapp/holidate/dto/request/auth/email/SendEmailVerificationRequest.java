package com.webapp.holidate.dto.request.auth.email;

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
public class SendEmailVerificationRequest {
  @NotBlank(message = "USER_ID_NOT_BLANK")
  String userId;
}
