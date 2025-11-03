package com.webapp.holidate.dto.response.review;

import com.webapp.holidate.dto.response.image.PhotoResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
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
public class ReviewResponse {
  String id;
  int score;
  String comment;
  List<PhotoResponse> photos;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
