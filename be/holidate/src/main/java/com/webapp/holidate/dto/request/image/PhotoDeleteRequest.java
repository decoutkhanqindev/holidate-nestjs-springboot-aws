package com.webapp.holidate.dto.request.image;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
public class PhotoDeleteRequest {
  @NotBlank(message = "PHOTO_ID_NOT_BLANK")
  String id;
}
