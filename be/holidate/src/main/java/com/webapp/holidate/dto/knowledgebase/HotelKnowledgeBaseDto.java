package com.webapp.holidate.dto.knowledgebase;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Comprehensive DTO aggregating all hotel information for Knowledge Base generation.
 * This DTO combines location, pricing, amenities, policies, rooms, reviews, and nearby venues.
 * Used to generate Markdown files with hotel metadata and AI-friendly structured data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HotelKnowledgeBaseDto {
    // Basic Information
    String hotelId;
    String slug;
    String name;
    String description;
    Integer starRating;
    String status;

    // Location Hierarchy
    LocationHierarchyDto location;

    // Amenities (English tags for template)
    List<String> amenityEnglishTags;

    // Rooms
    List<RoomSummaryDto> rooms;
    PriceReferenceDto priceReference;
    Integer totalRooms;
    Integer availableRoomTypes;

    // Nearby Venues
    List<NearbyVenueDto> nearbyVenues;

    // Policies
    LocalTime checkInTime;
    LocalTime checkOutTime;
    Boolean allowsPayAtHotel;
    List<String> requiredDocuments;
    String cancellationPolicyName;
    String reschedulePolicyName;

    // Review Stats (flattened for easy access)
    Double reviewScore;
    Long reviewCount;
    
    // ENHANCED: Detailed review statistics
    ReviewSummaryDto reviewsSummary;
    
    // ENHANCED: Active discounts
    List<ActiveDiscountDto> activeDiscounts;
    
    // ENHANCED: Detailed policies with rules
    PolicyDetailDto policies;
    
    // ENHANCED: Hotel amenities by category
    List<AmenityCategoryDto> hotelAmenitiesByCategory;
    
    // ENHANCED: Entertainment venues by category with details
    List<EntertainmentVenueDetailDto> entertainmentVenues;

    // Images
    String mainImageUrl;
    List<String> galleryImageUrls; // Up to 5 best images

    // Metadata
    List<String> vibeTagsInferred;
    List<String> locationTags;
    List<String> tags; // Combined tags
    LocalDateTime lastUpdated;
    
    // === NEW FIELDS FOR AI OPTIMIZATION ===
    
    // Full address string
    String fullAddress;
    
    // Coordinates (separate from location hierarchy for easy access)
    Coordinates coordinates;
    
    // Distances to important locations (in meters)
    Distances distances;
    
    // Check-in/Check-out policies
    CheckInPolicy checkInPolicy;
    CheckOutPolicy checkOutPolicy;
    
    // Amenities grouped by category
    Map<String, List<Amenity>> amenitiesByCategory;
    
    // Hotel policies (pets, smoking, children)
    HotelPolicies hotelPolicies;
    
    // Nested classes
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Coordinates {
        Double latitude;
        Double longitude;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Distances {
        Integer toBeachMeters;
        Integer toCityCenterMeters;
        Integer toAirportMeters;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CheckInPolicy {
        String earliestTime; // Format: "14:00"
        String latestTime;   // Format: "22:00"
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CheckOutPolicy {
        String latestTime;              // Format: "12:00"
        Boolean lateCheckoutAvailable; // Boolean
        String lateCheckoutFee;         // Example: "50% giá phòng"
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Amenity {
        String name;
        Boolean available;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class HotelPolicies {
        Boolean petsAllowed;
        Boolean smokingAllowed;
        String childrenPolicy;
    }
}

