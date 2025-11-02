package com.webapp.holidate.dto.response.review;

import java.time.LocalDateTime;
import java.util.List;

import com.webapp.holidate.dto.response.image.PhotoResponse;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
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
public class ReviewResponse {
  String id;
  int score;
  String comment;
  List<PhotoResponse> photos;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
