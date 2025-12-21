package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Amenities grouped by category for Knowledge Base
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AmenityCategoryDto {
    String category;
    List<AmenityDetail> amenities;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class AmenityDetail {
        String name;
        String nameEnglish;
        Boolean free;
        String description;
        String icon;
    }
}

