package com.webapp.holidate.dto.request.image;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
  @NotEmpty(message = "PHOTO_FILES_NOT_EMPTY")
  List<MultipartFile> files;

  @NotBlank(message = "CATEGORY_ID_NOT_BLANK")
  String categoryId;
}
