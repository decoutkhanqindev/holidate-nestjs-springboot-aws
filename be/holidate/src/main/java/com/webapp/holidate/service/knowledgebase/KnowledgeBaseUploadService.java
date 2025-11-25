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
import java.util.ArrayList;
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
    // MustacheFactory is thread-safe and caches compiled templates
    // Each template compilation is cached by template path, but context is fresh each time
    MustacheFactory mustacheFactory = new DefaultMustacheFactory();

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Generate markdown from hotel DTO and upload to AWS S3
     * 
     * IMPORTANT: This method is thread-safe. Each call creates:
     * - A fresh context map (via buildTemplateContext)
     * - A fresh StringWriter
     * - Defensive copies of all lists to prevent shared state
     * 
     * @param dto Hotel knowledge base DTO
     * @return S3 object key (full path)
     * @throws IOException if template rendering or upload fails
     */
    public String generateAndUploadHotelProfile(HotelKnowledgeBaseDto dto) throws IOException {
        log.info("Generating hotel profile for: {} (ID: {}, Slug: {})", dto.getName(), dto.getHotelId(), dto.getSlug());
        
        // CRITICAL VALIDATION: Verify DTO is not null and has required fields
        if (dto == null) {
            throw new IllegalArgumentException("DTO cannot be null");
        }
        if (dto.getHotelId() == null || dto.getHotelId().isEmpty()) {
            throw new IllegalArgumentException("DTO hotelId cannot be null or empty");
        }
        if (dto.getName() == null || dto.getName().isEmpty()) {
            throw new IllegalArgumentException("DTO name cannot be null or empty");
        }
        if (dto.getSlug() == null || dto.getSlug().isEmpty()) {
            log.warn("DTO slug is null or empty for hotel: {} (ID: {})", dto.getName(), dto.getHotelId());
        }
        
        // Step 1: Load template (DefaultMustacheFactory caches compiled templates, which is thread-safe)
        // CRITICAL: Each template compilation returns a new Mustache instance, but the compiled template
        // is cached by path. The context passed to execute() must be fresh for each hotel.
        Mustache template = mustacheFactory.compile("templates/template_hotel_profile.md");
        
        // Additional safety: Verify template is not null
        if (template == null) {
            throw new IllegalStateException("Failed to compile Mustache template");
        }
        
        // Step 2: Build context for Mustache (creates fresh map with defensive copies of all lists)
        Map<String, Object> context = buildTemplateContext(dto);
        
        // CRITICAL VALIDATION: Verify context contains correct hotel data before rendering
        String contextName = (String) context.get("name");
        String contextDocId = (String) context.get("doc_id");
        String contextSlug = (String) context.get("slug");
        
        log.info("Context verification - DTO: name={}, id={}, slug={}", 
                dto.getName(), dto.getHotelId(), dto.getSlug());
        log.info("Context verification - Context: name={}, doc_id={}, slug={}", 
                contextName, contextDocId, contextSlug);
        
        // Validate name matches
        if (!dto.getName().equals(contextName)) {
            log.error("CRITICAL: Context name mismatch! DTO name: {}, Context name: {}", dto.getName(), contextName);
            throw new IllegalStateException("Context name does not match DTO name");
        }
        
        // Validate doc_id matches
        if (!dto.getHotelId().equals(contextDocId)) {
            log.error("CRITICAL: Context doc_id mismatch! DTO id: {}, Context doc_id: {}", dto.getHotelId(), contextDocId);
            throw new IllegalStateException("Context doc_id does not match DTO hotelId");
        }
        
        // Validate slug matches (if both are not null)
        if (dto.getSlug() != null && contextSlug != null && !dto.getSlug().equals(contextSlug)) {
            log.error("CRITICAL: Context slug mismatch! DTO slug: {}, Context slug: {}", dto.getSlug(), contextSlug);
            throw new IllegalStateException("Context slug does not match DTO slug");
        }
        
        // Step 3: Render template (creates fresh StringWriter for each call)
        // CRITICAL: Use the context directly (it's already isolated with defensive copies)
        // The createIsolatedContext was causing overhead and may not be necessary
        // since buildTemplateContext already creates fresh objects
        
        StringWriter writer = new StringWriter();
        template.execute(writer, context);
        String markdownContent = writer.toString();
        
        // Clear writer reference to help GC
        writer = null;
        
        // Debug: Verify rendered content contains correct hotel name
        if (!markdownContent.contains(dto.getName())) {
            log.error("CRITICAL: Rendered content does not contain hotel name! Hotel: {}, Content preview: {}", 
                    dto.getName(), markdownContent.substring(0, Math.min(200, markdownContent.length())));
        } else {
            log.debug("Content verification passed - hotel name found in rendered markdown");
        }
        
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
     * IMPORTANT: Uses dto.getSlug() which is generated from hotel.getName() via SlugService.
     * No hardcoded values are used - all slugs are dynamically generated.
     * 
     * @param dto Hotel DTO
     * @return Relative path string
     */
    private String buildRelativePath(HotelKnowledgeBaseDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Hotel DTO cannot be null");
        }
        
        LocationHierarchyDto location = dto.getLocation();
        if (location == null) {
            throw new IllegalArgumentException("Hotel location cannot be null");
        }
        
        // Get slug from DTO (generated from hotel name via SlugService)
        String hotelSlug = dto.getSlug();
        if (hotelSlug == null || hotelSlug.isBlank()) {
            log.warn("Hotel slug is null or blank for hotel: {} (ID: {}). Using fallback.", 
                    dto.getName(), dto.getHotelId());
            // Generate fallback slug from hotel name if slug is missing
            hotelSlug = dto.getName() != null 
                    ? dto.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-")
                    : "unknown-hotel";
        }
        
        String citySlug = location.getCitySlug();
        if (citySlug == null || citySlug.isBlank()) {
            log.warn("City slug is null or blank for hotel: {} (ID: {})", 
                    dto.getName(), dto.getHotelId());
            citySlug = "unknown-city";
        }
        
        String districtSlug = location.getDistrictSlug();
        if (districtSlug == null || districtSlug.isBlank()) {
            log.warn("District slug is null or blank for hotel: {} (ID: {})", 
                    dto.getName(), dto.getHotelId());
            districtSlug = "unknown-district";
        }
        
        String relativePath = String.format("vietnam/%s/%s/hotels/%s.md", 
                citySlug, districtSlug, hotelSlug);
        
        log.debug("Built relative path for hotel {} (ID: {}): {}", 
                dto.getName(), dto.getHotelId(), relativePath);
        
        return relativePath;
    }

    /**
     * Build Mustache template context from DTO
     * Flattens nested objects for easy template access
     * 
     * THREAD SAFETY: This method creates:
     * - A fresh HashMap for the context
     * - Defensive copies of all lists to prevent shared mutable state
     * - Fresh nested maps for location and other complex objects
     * 
     * @param dto Hotel knowledge base DTO
     * @return Context map for Mustache rendering (completely isolated, no shared references)
     */
    private Map<String, Object> buildTemplateContext(HotelKnowledgeBaseDto dto) {
        // Create fresh context map for each hotel to ensure thread safety
        // IMPORTANT: This method must create completely new objects for each hotel
        // No shared references should exist between different hotel contexts
        Map<String, Object> ctx = new HashMap<>();
        
        // === FRONTMATTER METADATA ===
        
        // Document identification - use fresh String values (not references)
        ctx.put("doc_type", "hotel_profile");
        ctx.put("doc_id", dto.getHotelId() != null ? new String(dto.getHotelId()) : null);
        ctx.put("slug", dto.getSlug() != null ? new String(dto.getSlug()) : null);
        ctx.put("last_updated", dto.getLastUpdated() != null 
            ? dto.getLastUpdated().format(ISO_FORMATTER) + "Z" 
            : LocalDateTime.now().format(ISO_FORMATTER) + "Z");
        ctx.put("language", "vi");
        
        // Location hierarchy (flattened for Mustache nested access)
        // CRITICAL: Create completely fresh locationMap with new String values
        LocationHierarchyDto loc = dto.getLocation();
        if (loc != null) {
            Map<String, Object> locationMap = new HashMap<>();
            // Create new String instances to avoid any potential reference issues
            locationMap.put("country", loc.getCountry() != null ? new String(loc.getCountry()) : null);
            locationMap.put("country_code", loc.getCountryCode() != null ? new String(loc.getCountryCode()) : null);
            locationMap.put("province", loc.getProvince() != null ? new String(loc.getProvince()) : null);
            locationMap.put("province_name", loc.getProvinceName() != null ? new String(loc.getProvinceName()) : null);
            locationMap.put("city", loc.getCity() != null ? new String(loc.getCity()) : null);
            locationMap.put("city_name", loc.getCityName() != null ? new String(loc.getCityName()) : null);
            locationMap.put("district", loc.getDistrict() != null ? new String(loc.getDistrict()) : null);
            locationMap.put("district_name", loc.getDistrictName() != null ? new String(loc.getDistrictName()) : null);
            locationMap.put("ward", loc.getWard() != null ? new String(loc.getWard()) : null);
            locationMap.put("ward_name", loc.getWardName() != null ? new String(loc.getWardName()) : null);
            locationMap.put("street", loc.getStreet() != null ? new String(loc.getStreet()) : null);
            locationMap.put("street_name", loc.getStreetName() != null ? new String(loc.getStreetName()) : null);
            locationMap.put("address", loc.getAddress() != null ? new String(loc.getAddress()) : null);
            
            // Coordinates - create fresh map
            if (loc.getLatitude() != null && loc.getLongitude() != null) {
                Map<String, Object> coordinates = new HashMap<>();
                coordinates.put("lat", loc.getLatitude());
                coordinates.put("lng", loc.getLongitude());
                locationMap.put("coordinates", coordinates);
            }
            
            ctx.put("location", locationMap);
        }
        
        // Search tags - Create defensive copies to ensure thread safety
        ctx.put("location_tags", dto.getLocationTags() != null ? new ArrayList<>(dto.getLocationTags()) : List.of());
        ctx.put("amenity_tags", dto.getAmenityEnglishTags() != null ? new ArrayList<>(dto.getAmenityEnglishTags()) : List.of());
        ctx.put("vibe_tags", dto.getVibeTagsInferred() != null ? new ArrayList<>(dto.getVibeTagsInferred()) : List.of());
        
        // Pricing reference - create new String instances
        PriceReferenceDto price = dto.getPriceReference();
        if (price != null) {
            ctx.put("reference_min_price", price.getMinPrice() != null ? price.getMinPrice().intValue() : 0);
            ctx.put("reference_min_price_room", price.getMinPriceRoomName() != null ? new String(price.getMinPriceRoomName()) : new String("N/A"));
            ctx.put("reference_max_price", price.getMaxPrice() != null ? price.getMaxPrice().intValue() : 0);
            ctx.put("reference_max_price_room", price.getMaxPriceRoomName() != null ? new String(price.getMaxPriceRoomName()) : new String("N/A"));
        } else {
            ctx.put("reference_min_price", 0);
            ctx.put("reference_min_price_room", new String("N/A"));
            ctx.put("reference_max_price", 0);
            ctx.put("reference_max_price_room", new String("N/A"));
        }
        
        // Hotel classification
        ctx.put("star_rating", dto.getStarRating() != null ? dto.getStarRating().intValue() : 0);
        
        // Business metadata - create new String instances
        ctx.put("hotel_id", dto.getHotelId() != null ? new String(dto.getHotelId()) : null);
        ctx.put("partner_id", new String("")); // Not available in DTO, set empty
        ctx.put("status", dto.getStatus() != null ? new String(dto.getStatus()) : new String("unknown"));
        
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
                    // Create new String instances to avoid any potential reference issues
                    venueMap.put("name", venue.getName() != null ? new String(venue.getName()) : new String("N/A"));
                    venueMap.put("distance", formatDistance(venue.getDistance()));
                    venueMap.put("category", venue.getCategoryName() != null ? new String(venue.getCategoryName()) : new String("unknown"));
                    // Description field not available in DTO, set empty or null
                    venueMap.put("description", new String(""));
                    return venueMap;
                })
                .collect(Collectors.toList());
            ctx.put("nearby_venues", venuesList);
        } else {
            ctx.put("nearby_venues", List.of());
        }
        
        // Policies - create new String instances
        ctx.put("check_in_time", dto.getCheckInTime() != null ? new String(dto.getCheckInTime().toString()) : new String("14:00"));
        ctx.put("check_out_time", dto.getCheckOutTime() != null ? new String(dto.getCheckOutTime().toString()) : new String("12:00"));
        ctx.put("early_check_in_available", true); // Default value, can be enhanced later
        ctx.put("late_check_out_available", true); // Default value, can be enhanced later
        ctx.put("allows_pay_at_hotel", dto.getAllowsPayAtHotel() != null ? dto.getAllowsPayAtHotel() : false);
        ctx.put("cancellation_policy", dto.getCancellationPolicyName() != null ? new String(dto.getCancellationPolicyName()) : new String("Chính sách tiêu chuẩn"));
        ctx.put("reschedule_policy", dto.getReschedulePolicyName() != null ? new String(dto.getReschedulePolicyName()) : new String("Chính sách tiêu chuẩn"));
        ctx.put("smoking_policy", new String("Khu vực hút thuốc riêng")); // Default value, can be enhanced later
        
        // SEO Keywords (generate from hotel name, location, amenities)
        // Create defensive copy to ensure thread safety
        List<String> keywords = generateKeywords(dto);
        ctx.put("keywords", keywords != null ? new ArrayList<>(keywords) : new ArrayList<>());
        
        // Required documents - Create defensive copy to ensure thread safety
        ctx.put("required_documents", dto.getRequiredDocuments() != null ? new ArrayList<>(dto.getRequiredDocuments()) : List.of());
        
        // === BODY CONTENT ===
        
        // Hotel name and description - create new String instances
        ctx.put("name", dto.getName() != null ? new String(dto.getName()) : "");
        ctx.put("description", dto.getDescription() != null ? new String(dto.getDescription()) : "");
        
        // Images - Create defensive copy for gallery images to ensure thread safety
        ctx.put("mainImageUrl", dto.getMainImageUrl() != null ? new String(dto.getMainImageUrl()) : new String(""));
        ctx.put("galleryImageUrls", dto.getGalleryImageUrls() != null ? new ArrayList<>(dto.getGalleryImageUrls()) : List.of());
        
        // Rooms summary
        List<RoomSummaryDto> rooms = dto.getRooms();
        if (rooms != null && !rooms.isEmpty()) {
            List<Map<String, Object>> roomsList = rooms.stream()
                .map(room -> {
                    Map<String, Object> roomMap = new HashMap<>();
                    // Create new String instances to avoid any potential reference issues
                    roomMap.put("name", room.getName() != null ? new String(room.getName()) : new String("N/A"));
                    roomMap.put("area", room.getArea() != null ? room.getArea().doubleValue() : 0.0);
                    roomMap.put("view", room.getView() != null ? new String(room.getView()) : new String("N/A"));
                    roomMap.put("bed_type", room.getBedType() != null ? new String(room.getBedType()) : new String("N/A"));
                    roomMap.put("max_adults", room.getMaxAdults() != null ? room.getMaxAdults().intValue() : 0);
                    roomMap.put("max_children", room.getMaxChildren() != null ? room.getMaxChildren().intValue() : 0);
                    roomMap.put("smoking_allowed", Boolean.TRUE.equals(room.getSmokingAllowed()));
                    roomMap.put("wifi_available", Boolean.TRUE.equals(room.getWifiAvailable()));
                    roomMap.put("breakfast_included", Boolean.TRUE.equals(room.getBreakfastIncluded()));
                    roomMap.put("mainImageUrl", room.getMainImageUrl() != null ? new String(room.getMainImageUrl()) : new String(""));
                    // Create defensive copy for room gallery images to ensure thread safety
                    roomMap.put("galleryImageUrls", room.getGalleryImageUrls() != null ? new ArrayList<>(room.getGalleryImageUrls()) : List.of());
                    return roomMap;
                })
                .collect(Collectors.toList());
            ctx.put("rooms", roomsList);
        } else {
            ctx.put("rooms", List.of());
        }
        
        // Combined tags for body - Create defensive copy to ensure thread safety
        ctx.put("tags", dto.getTags() != null ? new ArrayList<>(dto.getTags()) : List.of());
        
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

