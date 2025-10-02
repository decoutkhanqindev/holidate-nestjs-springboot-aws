package com.webapp.holidate.dto.request.image;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
public class PhotoDeleteRequest {
  @NotEmpty(message = "PHOTO_IDS_NOT_EMPTY")
  List<String> photoIds;
}
