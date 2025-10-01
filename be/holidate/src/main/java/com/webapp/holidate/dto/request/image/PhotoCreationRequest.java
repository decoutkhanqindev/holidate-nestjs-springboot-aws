package com.webapp.holidate.dto.request.image;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class PhotoCreationRequest {
  @NotBlank(message = "PHOTO_FILE_NOT_BLANK")
  MultipartFile file;

  @NotBlank(message = "CATEGORY_ID_NOT_BLANK")
  String categoryId;
}
