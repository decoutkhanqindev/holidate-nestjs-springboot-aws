package com.webapp.holidate.dto.knowledgebase;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Result DTO for batch processing operations.
 * Contains statistics about the batch execution including success/failure counts
 * and a list of failed hotel IDs for debugging purposes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class BatchResult {
    
    /**
     * Number of hotels successfully processed
     */
    @Builder.Default
    int successCount = 0;
    
    /**
     * Number of hotels that failed during processing
     */
    @Builder.Default
    int failureCount = 0;
    
    /**
     * List of hotel IDs that failed during processing
     */
    @Builder.Default
    List<String> failedHotelIds = new ArrayList<>();
    
    /**
     * Total number of hotels in the batch
     */
    @Builder.Default
    int totalCount = 0;
    
    /**
     * Timestamp when batch processing started
     */
    LocalDateTime startTime;
    
    /**
     * Timestamp when batch processing completed
     */
    LocalDateTime endTime;
    
    /**
     * Duration of batch processing in milliseconds
     */
    long durationMillis;
    
    /**
     * Calculate duration from start and end times
     */
    public void calculateDuration() {
        if (startTime != null && endTime != null) {
            this.durationMillis = java.time.Duration.between(startTime, endTime).toMillis();
        }
    }
    
    /**
     * Get success rate as percentage
     */
    public double getSuccessRate() {
        if (totalCount == 0) {
            return 0.0;
        }
        return (successCount * 100.0) / totalCount;
    }
}

