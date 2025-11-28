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
    Double currentPrice; // Current price (may differ from base due to discounts)
    String priceNote;
    
    // ENHANCED: Room inventory calendar (next 30 days)
    List<RoomInventoryCalendarDto> inventoryCalendar;
    
    // ENHANCED: Price analytics
    PriceAnalyticsDto priceAnalytics;
    
    // ENHANCED: Detailed room policies with rules
    PolicyDetailDto roomPolicies;
    Boolean policiesInherited; // True if room inherits hotel policies
    
    // ENHANCED: Room amenities with details and categories
    List<AmenityCategoryDto> roomAmenitiesDetailed;
    
    // ENHANCED: Nearby entertainment venues (simplified for room view)
    List<NearbyEntertainment> nearbyEntertainment;
    
    // Metadata
    List<String> vibeTags; // Room-specific vibe tags
    List<String> keywords; // SEO keywords
    String description; // Room description
    String mainImageUrl; // Main room image
    List<String> galleryImageUrls; // Gallery images
    LocalDateTime lastUpdated;
    
    // === NEW FIELDS FOR AI OPTIMIZATION ===
    
    // Room specifications
    RoomSpecs specs;
    
    // Pricing information
    PricingInfo pricing;
    
    // Room policies (max occupancy, extra bed)
    RoomPolicies roomPoliciesDetail;
    
    // Nested classes
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RoomSpecs {
        Float areaSqm;
        Boolean hasBalcony;
        Boolean hasWindow;
        String viewType; // "ocean", "city", "mountain", "no_view"
        List<BedConfiguration> bedConfiguration;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class BedConfiguration {
        String type; // "single", "double", "king"
        Integer count;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PricingInfo {
        Double basePriceVnd;
        Double weekendSurchargePercent;
        Double holidaySurchargePercent;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MaxOccupancy {
        Integer adults;
        Integer children;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RoomPolicies {
        MaxOccupancy maxOccupancy;
        Boolean extraBedAvailable;
        Double extraBedPriceVnd;
    }
    
    /**
     * Simplified entertainment venue for room template
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class NearbyEntertainment {
        String name;
        String category;
        String distance; // Formatted distance (e.g., "500m", "2.5km")
        String shortDescription;
    }
}

