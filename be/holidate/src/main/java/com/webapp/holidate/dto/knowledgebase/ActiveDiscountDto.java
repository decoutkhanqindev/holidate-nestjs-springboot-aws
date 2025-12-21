package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

/**
 * Active discount information for Knowledge Base
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ActiveDiscountDto {
    String code;
    String description;
    Double percentage;
    Integer minBookingPrice;
    Integer minBookingCount;
    LocalDate validFrom;
    LocalDate validTo;
    Integer usageLimit;
    Integer timesUsed;
    String specialDayName; // Optional: associated special day
}

