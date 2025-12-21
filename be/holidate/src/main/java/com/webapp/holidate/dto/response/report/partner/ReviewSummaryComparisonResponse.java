package com.webapp.holidate.dto.response.report.partner;

import lombok.*;
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
public class ReviewSummaryComparisonResponse {
  ReviewSummaryResponse currentPeriod;
  ReviewSummaryResponse previousPeriod;
  ReviewComparison comparison;

  @Data
  @Builder
  @FieldDefaults(level = AccessLevel.PRIVATE)
  @NoArgsConstructor
  @AllArgsConstructor
  @Getter
  @Setter
  @ToString
  @EqualsAndHashCode
  public static class ReviewComparison {
    @Builder.Default
    Long totalReviewsDifference = 0L;
    @Builder.Default
    Double totalReviewsPercentageChange = 0.0;
    @Builder.Default
    Double averageScoreDifference = 0.0;
    @Builder.Default
    Double averageScorePercentageChange = 0.0;
  }
}

