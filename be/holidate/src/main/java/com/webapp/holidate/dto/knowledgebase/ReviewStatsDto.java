package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * DTO for review statistics data.
 * Contains average score and total review count.
 * Used with JPQL Constructor Expression for efficient database aggregation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewStatsDto {
    Double averageScore;
    Long totalReviews;
}

