package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * DTO for nearby entertainment venue information.
 * Contains venue name, distance from hotel, and category type.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NearbyVenueDto {
    String name;
    Double distance; // Distance in meters
    String categoryName;
}

