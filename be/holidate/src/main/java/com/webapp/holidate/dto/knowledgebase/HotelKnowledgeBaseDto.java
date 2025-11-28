package com.webapp.holidate.dto.knowledgebase;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

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
}

