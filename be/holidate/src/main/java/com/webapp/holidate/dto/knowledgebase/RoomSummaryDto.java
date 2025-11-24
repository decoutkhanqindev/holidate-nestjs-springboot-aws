package com.webapp.holidate.dto.knowledgebase;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * DTO for room summary information in Knowledge Base.
 * Contains essential room details like name, area, view, bed type, and capacity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomSummaryDto {
    String name;
    Double area;
    String view;
    String bedType;
    Integer maxAdults;
    Integer maxChildren;
    Boolean smokingAllowed;
    Boolean wifiAvailable;
    Boolean breakfastIncluded;
}

