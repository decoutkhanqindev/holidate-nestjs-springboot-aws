package com.webapp.holidate.dto.knowledgebase;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Price analytics for room over next 30 days
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PriceAnalyticsDto {
    Double minPriceNext30Days;
    Double maxPriceNext30Days;
    Double avgPriceNext30Days;
    String priceVolatility; // "low" | "medium" | "high"
    Double weekendPriceMultiplier;
    
    // Boolean fields for Mustache template conditionals
    Boolean isHighVolatility;
    Boolean isMediumVolatility;
    Boolean isLowVolatility;
}

