package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

/**
 * Daily room inventory for Knowledge Base - shows availability and pricing for next 30 days
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomInventoryCalendarDto {
    LocalDate date;
    Double price;
    Integer availableRooms;
    String status;
    Boolean isWeekend;
    Boolean isHoliday;
}

