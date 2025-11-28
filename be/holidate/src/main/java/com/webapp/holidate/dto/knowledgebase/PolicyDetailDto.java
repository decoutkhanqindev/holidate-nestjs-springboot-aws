package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;
import java.util.List;

/**
 * Detailed policy information for Knowledge Base including cancellation and reschedule rules
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PolicyDetailDto {
    // Check-in/out times
    LocalTime checkInTime;
    LocalTime checkOutTime;
    Boolean allowsPayAtHotel;
    
    // Cancellation Policy Details
    CancellationPolicyDetail cancellationPolicy;
    
    // Reschedule Policy Details
    ReschedulePolicyDetail reschedulePolicy;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CancellationPolicyDetail {
        String name;
        List<PolicyRule> rules;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ReschedulePolicyDetail {
        String name;
        List<PolicyRule> rules;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PolicyRule {
        Integer daysBeforeCheckin;
        Integer penaltyPercentage; // For cancellation
        Integer feePercentage; // For reschedule
        String description;
    }
}

