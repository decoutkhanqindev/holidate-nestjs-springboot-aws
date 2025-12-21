package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Comprehensive review summary for Knowledge Base including score distribution and recent reviews
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewSummaryDto {
    Long totalReviews;
    Double averageScore;
    List<ScoreDistribution> scoreDistribution;
    List<RecentReview> recentReviews;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ScoreDistribution {
        String bucket; // "9-10", "7-8", "5-6", "3-4", "1-2"
        Long count;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RecentReview {
        Integer score;
        String commentSnippet; // First 200 characters without PII
        LocalDateTime date;
    }
}

