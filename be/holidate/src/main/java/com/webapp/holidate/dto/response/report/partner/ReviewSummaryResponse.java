package com.webapp.holidate.dto.response.report.partner;

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
public class ReviewSummaryResponse {
  @Builder.Default
  Long totalReviews = 0L;

  @Builder.Default
  Double averageScore = 0.0;

  List<ScoreDistributionItem> scoreDistribution;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class ScoreDistributionItem {
    String scoreBucket; // "9-10", "7-8", "5-6", "3-4", "1-2"
    @Builder.Default
    Long reviewCount = 0L;
  }
}

