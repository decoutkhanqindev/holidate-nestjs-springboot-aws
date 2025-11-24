package com.webapp.holidate.service.knowledgebase;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.webapp.holidate.dto.knowledgebase.HotelKnowledgeBaseDto;
import com.webapp.holidate.dto.knowledgebase.LocationHierarchyDto;
import com.webapp.holidate.dto.knowledgebase.NearbyVenueDto;
import com.webapp.holidate.dto.knowledgebase.PriceReferenceDto;
import com.webapp.holidate.dto.knowledgebase.RoomSummaryDto;
import com.webapp.holidate.service.storage.S3KnowledgeBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Knowledge Base Upload Service
 * 
 * Responsibilities:
 * - Render Mustache templates with DTO data
 * - Generate markdown content from hotel information
 * - Upload/Update files to AWS S3
 * - Maintain knowledge base structure
 */
@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class KnowledgeBaseUploadService {

    S3KnowledgeBaseService s3Service;
    MustacheFactory mustacheFactory = new DefaultMustacheFactory();

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Generate markdown from hotel DTO and upload to AWS S3
     * 
     * @param dto Hotel knowledge base DTO
     * @return S3 object key (full path)
     * @throws IOException if template rendering or upload fails
     */
    public String generateAndUploadHotelProfile(HotelKnowledgeBaseDto dto) throws IOException {
        log.info("Generating hotel profile for: {}", dto.getName());
        
        // Step 1: Load template
        Mustache template = mustacheFactory.compile("templates/template_hotel_profile.md");
        
        // Step 2: Build context for Mustache
        Map<String, Object> context = buildTemplateContext(dto);
        
        // Step 3: Render template
        StringWriter writer = new StringWriter();
        template.execute(writer, context);
        String markdownContent = writer.toString();
        
        // Step 4: Build relative path (e.g., vietnam/da-nang/son-tra/hotels/grand-mercure.md)
        String relativePath = buildRelativePath(dto);
        
        // Step 5: Upload to S3
        String objectKey = s3Service.uploadOrUpdateMarkdown(markdownContent, relativePath);
        
        log.info("✓ Uploaded hotel profile: {} → S3 Key: {}", dto.getName(), objectKey);
        return objectKey;
    }

    /**
     * Build relative path for hotel markdown file
     * Format: vietnam/{city-slug}/{district-slug}/hotels/{hotel-slug}.md
     * 
     * @param dto Hotel DTO
     * @return Relative path string
     */
    private String buildRelativePath(HotelKnowledgeBaseDto dto) {
        LocationHierarchyDto location = dto.getLocation();
        
        return String.format(
            "vietnam/%s/%s/hotels/%s.md",
            location.getCitySlug() != null ? location.getCitySlug() : "unknown-city",
            location.getDistrictSlug() != null ? location.getDistrictSlug() : "unknown-district",
            dto.getSlug() != null ? dto.getSlug() : "unknown-hotel"
        );
    }

    /**
     * Build Mustache template context from DTO
     * Flattens nested objects for easy template access
     * 
     * @param dto Hotel knowledge base DTO
     * @return Context map for Mustache rendering
     */
    private Map<String, Object> buildTemplateContext(HotelKnowledgeBaseDto dto) {
        Map<String, Object> ctx = new HashMap<>();
        
        // === FRONTMATTER METADATA ===
        
        // Document identification
        ctx.put("doc_type", "hotel_profile");
        ctx.put("doc_id", dto.getHotelId());
        ctx.put("slug", dto.getSlug());
        ctx.put("last_updated", dto.getLastUpdated() != null 
            ? dto.getLastUpdated().format(ISO_FORMATTER) + "Z" 
            : LocalDateTime.now().format(ISO_FORMATTER) + "Z");
        ctx.put("language", "vi");
        
        // Location hierarchy (flattened for Mustache nested access)
        LocationHierarchyDto loc = dto.getLocation();
        if (loc != null) {
            Map<String, Object> locationMap = new HashMap<>();
            locationMap.put("country", loc.getCountry());
            locationMap.put("country_code", loc.getCountryCode());
            locationMap.put("province", loc.getProvince());
            locationMap.put("province_name", loc.getProvinceName());
            locationMap.put("city", loc.getCity());
            locationMap.put("city_name", loc.getCityName());
            locationMap.put("district", loc.getDistrict());
            locationMap.put("district_name", loc.getDistrictName());
            locationMap.put("ward", loc.getWard());
            locationMap.put("ward_name", loc.getWardName());
            locationMap.put("street", loc.getStreet());
            locationMap.put("street_name", loc.getStreetName());
            locationMap.put("address", loc.getAddress());
            
            // Coordinates
            if (loc.getLatitude() != null && loc.getLongitude() != null) {
                Map<String, Object> coordinates = new HashMap<>();
                coordinates.put("lat", loc.getLatitude());
                coordinates.put("lng", loc.getLongitude());
                locationMap.put("coordinates", coordinates);
            }
            
            ctx.put("location", locationMap);
        }
        
        // Search tags
        ctx.put("location_tags", dto.getLocationTags() != null ? dto.getLocationTags() : List.of());
        ctx.put("amenity_tags", dto.getAmenityEnglishTags() != null ? dto.getAmenityEnglishTags() : List.of());
        ctx.put("vibe_tags", dto.getVibeTagsInferred() != null ? dto.getVibeTagsInferred() : List.of());
        
        // Pricing reference
        PriceReferenceDto price = dto.getPriceReference();
        if (price != null) {
            ctx.put("reference_min_price", price.getMinPrice() != null ? price.getMinPrice().intValue() : 0);
            ctx.put("reference_min_price_room", price.getMinPriceRoomName() != null ? price.getMinPriceRoomName() : "N/A");
            ctx.put("reference_max_price", price.getMaxPrice() != null ? price.getMaxPrice().intValue() : 0);
            ctx.put("reference_max_price_room", price.getMaxPriceRoomName() != null ? price.getMaxPriceRoomName() : "N/A");
        } else {
            ctx.put("reference_min_price", 0);
            ctx.put("reference_min_price_room", "N/A");
            ctx.put("reference_max_price", 0);
            ctx.put("reference_max_price_room", "N/A");
        }
        
        // Hotel classification
        ctx.put("star_rating", dto.getStarRating() != null ? dto.getStarRating().intValue() : 0);
        
        // Business metadata
        ctx.put("hotel_id", dto.getHotelId());
        ctx.put("partner_id", ""); // Not available in DTO, set empty
        ctx.put("status", dto.getStatus() != null ? dto.getStatus() : "unknown");
        
        // Performance stats
        ctx.put("total_rooms", dto.getTotalRooms() != null ? dto.getTotalRooms().intValue() : 0);
        ctx.put("available_room_types", dto.getAvailableRoomTypes() != null ? dto.getAvailableRoomTypes().intValue() : 0);
        ctx.put("review_score", dto.getReviewScore() != null ? dto.getReviewScore().doubleValue() : 0.0);
        ctx.put("review_count", dto.getReviewCount() != null ? dto.getReviewCount().longValue() : 0L);
        
        // Nearby venues
        List<NearbyVenueDto> venues = dto.getNearbyVenues();
        if (venues != null && !venues.isEmpty()) {
            List<Map<String, Object>> venuesList = venues.stream()
                .map(venue -> {
                    Map<String, Object> venueMap = new HashMap<>();
                    venueMap.put("name", venue.getName() != null ? venue.getName() : "N/A");
                    venueMap.put("distance", formatDistance(venue.getDistance()));
                    venueMap.put("category", venue.getCategoryName() != null ? venue.getCategoryName() : "unknown");
                    // Description field not available in DTO, set empty or null
                    venueMap.put("description", "");
                    return venueMap;
                })
                .collect(Collectors.toList());
            ctx.put("nearby_venues", venuesList);
        } else {
            ctx.put("nearby_venues", List.of());
        }
        
        // Policies
        ctx.put("check_in_time", dto.getCheckInTime() != null ? dto.getCheckInTime().toString() : "14:00");
        ctx.put("check_out_time", dto.getCheckOutTime() != null ? dto.getCheckOutTime().toString() : "12:00");
        ctx.put("early_check_in_available", true); // Default value, can be enhanced later
        ctx.put("late_check_out_available", true); // Default value, can be enhanced later
        ctx.put("allows_pay_at_hotel", dto.getAllowsPayAtHotel() != null ? dto.getAllowsPayAtHotel() : false);
        ctx.put("cancellation_policy", dto.getCancellationPolicyName() != null ? dto.getCancellationPolicyName() : "Chính sách tiêu chuẩn");
        ctx.put("reschedule_policy", dto.getReschedulePolicyName() != null ? dto.getReschedulePolicyName() : "Chính sách tiêu chuẩn");
        ctx.put("smoking_policy", "Khu vực hút thuốc riêng"); // Default value, can be enhanced later
        
        // SEO Keywords (generate from hotel name, location, amenities)
        List<String> keywords = generateKeywords(dto);
        ctx.put("keywords", keywords);
        
        // Required documents
        ctx.put("required_documents", dto.getRequiredDocuments() != null ? dto.getRequiredDocuments() : List.of());
        
        // === BODY CONTENT ===
        
        // Hotel name and description
        ctx.put("name", dto.getName());
        ctx.put("description", dto.getDescription() != null ? dto.getDescription() : "");
        
        // Rooms summary
        List<RoomSummaryDto> rooms = dto.getRooms();
        if (rooms != null && !rooms.isEmpty()) {
            List<Map<String, Object>> roomsList = rooms.stream()
                .map(room -> {
                    Map<String, Object> roomMap = new HashMap<>();
                    roomMap.put("name", room.getName() != null ? room.getName() : "N/A");
                    roomMap.put("area", room.getArea() != null ? room.getArea().doubleValue() : 0.0);
                    roomMap.put("view", room.getView() != null ? room.getView() : "N/A");
                    roomMap.put("bed_type", room.getBedType() != null ? room.getBedType() : "N/A");
                    roomMap.put("max_adults", room.getMaxAdults() != null ? room.getMaxAdults().intValue() : 0);
                    roomMap.put("max_children", room.getMaxChildren() != null ? room.getMaxChildren().intValue() : 0);
                    roomMap.put("smoking_allowed", Boolean.TRUE.equals(room.getSmokingAllowed()));
                    roomMap.put("wifi_available", Boolean.TRUE.equals(room.getWifiAvailable()));
                    roomMap.put("breakfast_included", Boolean.TRUE.equals(room.getBreakfastIncluded()));
                    return roomMap;
                })
                .collect(Collectors.toList());
            ctx.put("rooms", roomsList);
        } else {
            ctx.put("rooms", List.of());
        }
        
        // Combined tags for body
        ctx.put("tags", dto.getTags() != null ? dto.getTags() : List.of());
        
        return ctx;
    }

    /**
     * Format distance from meters to human-readable string
     * 
     * @param distanceInMeters Distance in meters
     * @return Formatted string (e.g., "200m", "3.5km")
     */
    private String formatDistance(Double distanceInMeters) {
        if (distanceInMeters == null) {
            return "N/A";
        }
        
        if (distanceInMeters < 1000) {
            return String.format("%.0fm", distanceInMeters);
        } else {
            return String.format("%.1fkm", distanceInMeters / 1000);
        }
    }

    /**
     * Generate SEO keywords from hotel information
     * 
     * @param dto Hotel DTO
     * @return List of keywords
     */
    private List<String> generateKeywords(HotelKnowledgeBaseDto dto) {
        List<String> keywords = new java.util.ArrayList<>();
        
        // Add hotel name variations
        if (dto.getName() != null) {
            keywords.add(dto.getName().toLowerCase());
        }
        
        // Add location-based keywords
        if (dto.getLocation() != null) {
            if (dto.getLocation().getCityName() != null) {
                keywords.add("khách sạn " + dto.getLocation().getCityName().toLowerCase());
            }
            if (dto.getLocation().getDistrictName() != null) {
                keywords.add(dto.getLocation().getDistrictName().toLowerCase());
            }
        }
        
        // Add star rating keyword
        if (dto.getStarRating() != null && dto.getStarRating() >= 5) {
            keywords.add("khách sạn " + dto.getStarRating() + " sao");
        }
        
        // Add amenity-based keywords
        if (dto.getAmenityEnglishTags() != null) {
            if (dto.getAmenityEnglishTags().contains("beachfront")) {
                keywords.add("resort biển");
            }
            if (dto.getAmenityEnglishTags().contains("spa")) {
                keywords.add("resort spa");
            }
        }
        
        // Add vibe-based keywords
        if (dto.getVibeTagsInferred() != null) {
            if (dto.getVibeTagsInferred().contains("family_friendly")) {
                keywords.add("nghỉ dưỡng gia đình");
            }
            if (dto.getVibeTagsInferred().contains("romantic")) {
                keywords.add("honeymoon");
            }
        }
        
        return keywords.isEmpty() ? List.of("khách sạn", "nghỉ dưỡng") : keywords;
    }
}

