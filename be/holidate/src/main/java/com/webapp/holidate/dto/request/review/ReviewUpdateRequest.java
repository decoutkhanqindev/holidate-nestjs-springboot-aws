package com.webapp.holidate.dto.request.review;

import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class ReviewUpdateRequest {
  @Min(value = 1, message = "SCORE_INVALID")
  @Max(value = 10, message = "SCORE_INVALID")
  Integer score;

  String comment;

  List<PhotoCreationRequest> photosToAdd;
  List<String> photoIdsToDelete;
}
