package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Detailed entertainment venue information for Knowledge Base.
 * Includes venues grouped by category with distance from hotel.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EntertainmentVenueDetailDto {
    String categoryId;
    String categoryName;
    List<VenueDetail> venues;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class VenueDetail {
        String id;
        String name;
        String address; // City address if available
        Double distanceFromHotel; // in meters
        String description; // Generated description based on category and name
        String shortDescription; // Shorter version for room template
    }
}

