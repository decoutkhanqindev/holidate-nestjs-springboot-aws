package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * DTO for price reference data used in Knowledge Base.
 * Contains min/max price information for hotel rooms with corresponding room names.
 * Used with JPQL Constructor Expression for efficient database projection.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceReferenceDto {
    Double minPrice;
    String minPriceRoomName;
    Double maxPrice;
    String maxPriceRoomName;
}

