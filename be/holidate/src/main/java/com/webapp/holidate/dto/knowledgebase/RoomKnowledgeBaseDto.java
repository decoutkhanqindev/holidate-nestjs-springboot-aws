package com.webapp.holidate.dto.knowledgebase;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Comprehensive DTO for Room Knowledge Base generation.
 * Aggregates all room information for markdown file generation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomKnowledgeBaseDto {
    // Basic Info
    String roomId;
    String roomName;
    String slug;
    String parentHotelSlug;
    String parentHotelId;
    String roomType; // standard | superior | deluxe | suite | villa
    String roomCategory; // single | double | twin | family | suite
    
    // Location (inherited from hotel)
    LocationHierarchyDto location;
    
    // Room Specifications
    String bedType; // From BedType.name
    String bedTypeId;
    Integer maxAdults;
    Integer maxChildren;
    Double areaSqm;
    String view; // ocean | sea | garden | city | mountain | pool | street
    String floorRange; // Optional: "5-12"
    
    // Room Features
    List<String> roomAmenityTags; // Mapped to English keys
    
    // Room Policies
    Boolean smokingAllowed;
    Boolean wifiAvailable;
    Boolean breakfastIncluded;
    String cancellationPolicy; // From CancellationPolicy.name
    String reschedulePolicy; // From ReschedulePolicy.name
    
    // Inventory Info
    Integer quantity; // Total rooms of this type
    String status; // active | inactive | maintenance | closed
    
    // Pricing Info
    Double basePrice; // VNĐ/night (BASE price, not dynamic)
    String priceNote;
    
    // Metadata
    List<String> vibeTags; // Room-specific vibe tags
    List<String> keywords; // SEO keywords
    String description; // Room description
    String mainImageUrl; // Main room image
    List<String> galleryImageUrls; // Gallery images
    LocalDateTime lastUpdated;
}

