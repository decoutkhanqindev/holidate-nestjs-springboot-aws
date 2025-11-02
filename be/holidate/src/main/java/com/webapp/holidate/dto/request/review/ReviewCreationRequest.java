package com.webapp.holidate.dto.request.review;

import com.webapp.holidate.dto.request.image.PhotoCreationRequest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ReviewCreationRequest {
  @NotBlank(message = "BOOKING_ID_NOT_BLANK")
  String bookingId;

  @NotNull(message = "SCORE_NOT_BLANK")
  @Min(value = 1, message = "SCORE_INVALID")
  @Max(value = 10, message = "SCORE_INVALID")
  Integer score;

  String comment;

  List<PhotoCreationRequest> photos;
}