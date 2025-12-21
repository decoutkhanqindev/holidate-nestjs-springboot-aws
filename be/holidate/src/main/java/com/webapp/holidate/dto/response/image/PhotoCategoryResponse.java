package com.webapp.holidate.dto.response.image;

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
public class PhotoCategoryResponse {
  String id;
  String name;
  List<PhotoResponse> photos;
}
