package com.webapp.holidate.service.knowledgebase;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.webapp.holidate.dto.knowledgebase.HotelKnowledgeBaseDto;
import com.webapp.holidate.dto.knowledgebase.LocationHierarchyDto;
import com.webapp.holidate.dto.knowledgebase.NearbyVenueDto;
import com.webapp.holidate.dto.knowledgebase.PriceReferenceDto;
import com.webapp.holidate.dto.knowledgebase.RoomKnowledgeBaseDto;
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
import java.util.regex.Pattern;
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
        
        // Clean HTML comments from markdown content before upload
        markdownContent = cleanMarkdownContent(markdownContent);
        
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
            
            // Coordinates - Only include if valid (not null and not 0.0)
            if (loc.getLatitude() != null && loc.getLongitude() != null 
                && loc.getLatitude() != 0.0 && loc.getLongitude() != 0.0) {
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
        List<String> vibeTags = dto.getVibeTagsInferred() != null ? new ArrayList<>(dto.getVibeTagsInferred()) : List.of();
        ctx.put("vibe_tags", vibeTags);
        
        // Helper flags for vibe_tags (Mustache doesn't support direct comparison)
        ctx.put("has_family_friendly", vibeTags.contains("family_friendly"));
        ctx.put("has_romantic", vibeTags.contains("romantic"));
        ctx.put("has_business", vibeTags.contains("business"));
        
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
        // Review stats - null-safe handling per DATA_VALIDATION_REPORT.md section 3
        // If review_count = 0, review_score should be null (not 0.0) for conditional rendering
        ctx.put("review_score", dto.getReviewScore() != null ? dto.getReviewScore().doubleValue() : null);
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
        ctx.put("tagline", ""); // Not available in DTO, set empty
        
        // Review rating label (generate from review_score)
        String reviewRatingLabel = "";
        if (dto.getReviewScore() != null) {
            double score = dto.getReviewScore();
            if (score >= 9.0) {
                reviewRatingLabel = "Xuất sắc";
            } else if (score >= 8.0) {
                reviewRatingLabel = "Rất tốt";
            } else if (score >= 7.0) {
                reviewRatingLabel = "Tốt";
            } else if (score >= 6.0) {
                reviewRatingLabel = "Khá";
            } else {
                reviewRatingLabel = "Trung bình";
            }
        }
        ctx.put("review_rating_label", reviewRatingLabel);
        
        // Policy rules (not available in DTO, set empty list)
        ctx.put("cancellation_policy_rules", List.of());
        ctx.put("reschedule_policy_rules", List.of());
        
        // Tool call for hotel availability (pre-formatted to avoid Mustache nested variable issues)
        String hotelId = dto.getHotelId() != null ? dto.getHotelId() : "";
        ctx.put("tool_call_check_availability", 
            String.format("{{TOOL:check_availability|hotel_id=%s|check_in={date}|check_out={date}}}", hotelId));
        
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
        
        // === NEW FIELDS FOR AI OPTIMIZATION ===
        
        // Full address
        ctx.put("full_address", dto.getFullAddress() != null ? new String(dto.getFullAddress()) : "");
        
        // Coordinates - Only include if valid (not null and not 0.0)
        Double lat = dto.getCoordinates() != null ? dto.getCoordinates().getLatitude() : (loc != null ? loc.getLatitude() : null);
        Double lng = dto.getCoordinates() != null ? dto.getCoordinates().getLongitude() : (loc != null ? loc.getLongitude() : null);
        
        // Only add coordinates if both are valid (not null and not 0.0)
        if (lat != null && lng != null && lat != 0.0 && lng != 0.0) {
            Map<String, Object> coordinatesMap = new HashMap<>();
            coordinatesMap.put("latitude", lat);
            coordinatesMap.put("longitude", lng);
            ctx.put("coordinates", coordinatesMap);
        } else {
            // Set to null so template can check if coordinates exist
            ctx.put("coordinates", null);
        }
        
        // Distances
        if (dto.getDistances() != null) {
            Map<String, Object> distancesMap = new HashMap<>();
            distancesMap.put("to_beach_meters", dto.getDistances().getToBeachMeters() != null ? dto.getDistances().getToBeachMeters() : 0);
            distancesMap.put("to_city_center_meters", dto.getDistances().getToCityCenterMeters() != null ? dto.getDistances().getToCityCenterMeters() : 0);
            distancesMap.put("to_airport_meters", dto.getDistances().getToAirportMeters() != null ? dto.getDistances().getToAirportMeters() : 0);
            if (dto.getDistances().getToBeachMeters() != null) {
                distancesMap.put("to_beach_km", String.format("%.1f", dto.getDistances().getToBeachMeters() / 1000.0));
            }
            ctx.put("distances", distancesMap);
        } else {
            Map<String, Object> distancesMap = new HashMap<>();
            distancesMap.put("to_beach_meters", 0);
            distancesMap.put("to_city_center_meters", 0);
            distancesMap.put("to_airport_meters", 0);
            distancesMap.put("to_beach_km", "0.0");
            ctx.put("distances", distancesMap);
        }
        
        // Check-in policy
        if (dto.getCheckInPolicy() != null) {
            Map<String, Object> checkInPolicyMap = new HashMap<>();
            checkInPolicyMap.put("earliest_time", dto.getCheckInPolicy().getEarliestTime() != null ? new String(dto.getCheckInPolicy().getEarliestTime()) : "14:00");
            checkInPolicyMap.put("latest_time", dto.getCheckInPolicy().getLatestTime() != null ? new String(dto.getCheckInPolicy().getLatestTime()) : "22:00");
            ctx.put("check_in_policy", checkInPolicyMap);
        } else {
            Map<String, Object> checkInPolicyMap = new HashMap<>();
            checkInPolicyMap.put("earliest_time", dto.getCheckInTime() != null ? dto.getCheckInTime().toString() : "14:00");
            checkInPolicyMap.put("latest_time", dto.getCheckInTime() != null ? dto.getCheckInTime().toString() : "22:00");
            ctx.put("check_in_policy", checkInPolicyMap);
        }
        
        // Check-out policy
        if (dto.getCheckOutPolicy() != null) {
            Map<String, Object> checkOutPolicyMap = new HashMap<>();
            checkOutPolicyMap.put("latest_time", dto.getCheckOutPolicy().getLatestTime() != null ? new String(dto.getCheckOutPolicy().getLatestTime()) : "12:00");
            checkOutPolicyMap.put("late_checkout_available", dto.getCheckOutPolicy().getLateCheckoutAvailable() != null ? dto.getCheckOutPolicy().getLateCheckoutAvailable() : false);
            checkOutPolicyMap.put("late_checkout_fee", dto.getCheckOutPolicy().getLateCheckoutFee() != null ? new String(dto.getCheckOutPolicy().getLateCheckoutFee()) : "50% giá phòng");
            ctx.put("check_out_policy", checkOutPolicyMap);
        } else {
            Map<String, Object> checkOutPolicyMap = new HashMap<>();
            checkOutPolicyMap.put("latest_time", dto.getCheckOutTime() != null ? dto.getCheckOutTime().toString() : "12:00");
            checkOutPolicyMap.put("late_checkout_available", ctx.get("late_check_out_available"));
            checkOutPolicyMap.put("late_checkout_fee", "50% giá phòng");
            ctx.put("check_out_policy", checkOutPolicyMap);
        }
        
        // Amenities by category
        if (dto.getAmenitiesByCategory() != null && !dto.getAmenitiesByCategory().isEmpty()) {
            List<Map<String, Object>> amenitiesByCategoryList = new ArrayList<>();
            dto.getAmenitiesByCategory().forEach((category, amenities) -> {
                Map<String, Object> categoryMap = new HashMap<>();
                categoryMap.put("category", category);
                categoryMap.put("category_name", capitalizeCategoryName(category));
                List<Map<String, Object>> amenitiesList = amenities.stream()
                    .map(amenity -> {
                        Map<String, Object> amenityMap = new HashMap<>();
                        amenityMap.put("name", amenity.getName() != null ? new String(amenity.getName()) : "");
                        amenityMap.put("available", amenity.getAvailable() != null ? amenity.getAvailable() : false);
                        return amenityMap;
                    })
                    .collect(Collectors.toList());
                categoryMap.put("amenities", amenitiesList);
                amenitiesByCategoryList.add(categoryMap);
            });
            ctx.put("amenities_by_category", amenitiesByCategoryList);
        } else {
            ctx.put("amenities_by_category", List.of());
        }
        
        // Hotel policies
        if (dto.getHotelPolicies() != null) {
            Map<String, Object> policiesMap = new HashMap<>();
            policiesMap.put("pets_allowed", dto.getHotelPolicies().getPetsAllowed() != null ? dto.getHotelPolicies().getPetsAllowed() : false);
            policiesMap.put("smoking_allowed", dto.getHotelPolicies().getSmokingAllowed() != null ? dto.getHotelPolicies().getSmokingAllowed() : false);
            policiesMap.put("children_policy", dto.getHotelPolicies().getChildrenPolicy() != null ? new String(dto.getHotelPolicies().getChildrenPolicy()) : "Trẻ em dưới 6 tuổi được ở miễn phí khi ngủ chung giường với bố mẹ");
            ctx.put("policies", policiesMap);
        } else {
            Map<String, Object> policiesMap = new HashMap<>();
            policiesMap.put("pets_allowed", false);
            policiesMap.put("smoking_allowed", false);
            policiesMap.put("children_policy", "Trẻ em dưới 6 tuổi được ở miễn phí khi ngủ chung giường với bố mẹ");
            ctx.put("policies", policiesMap);
        }
        
        return ctx;
    }
    
    /**
     * Capitalize category name for display
     */
    private String capitalizeCategoryName(String category) {
        if (category == null || category.isEmpty()) {
            return "";
        }
        return category.substring(0, 1).toUpperCase() + category.substring(1);
    }

    /**
     * Remove HTML comments from markdown content
     * Strips out all content between <!-- and --> including multi-line comments
     * 
     * @param content Markdown content that may contain HTML comments
     * @return Cleaned markdown content without HTML comments
     */
    private String cleanMarkdownContent(String content) {
        if (content == null) {
            return null;
        }
        // Pattern matches HTML comments including multi-line comments
        // (?s) enables DOTALL mode (dot matches newlines)
        // .*? is non-greedy to match shortest possible comment
        Pattern htmlCommentPattern = Pattern.compile("<!--.*?-->", Pattern.DOTALL);
        return htmlCommentPattern.matcher(content).replaceAll("");
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

    /**
     * Generate room detail and upload
     */
    public String generateAndUploadRoomDetail(RoomKnowledgeBaseDto dto) throws IOException {
        Mustache template = mustacheFactory.compile("templates/template_room_detail.md");
        
        Map<String, Object> context = buildRoomTemplateContext(dto);
        
        StringWriter writer = new StringWriter();
        template.execute(writer, context);
        String markdownContent = writer.toString();
        
        // Clean HTML comments from markdown content before upload
        markdownContent = cleanMarkdownContent(markdownContent);
        
        String relativePath = buildRoomRelativePath(dto);
        // Example: vietnam/da-nang/son-tra/hotels/grand-mercure-danang/deluxe-ocean-view.md
        
        String objectKey = s3Service.uploadOrUpdateMarkdown(markdownContent, relativePath);
        
        log.info("✓ Uploaded room detail: {} → S3 Key: {}", dto.getRoomName(), objectKey);
        return objectKey;
    }
    
    /**
     * Build relative path for room
     */
    private String buildRoomRelativePath(RoomKnowledgeBaseDto dto) {
        return String.format(
            "vietnam/%s/%s/hotels/%s/%s.md",
            dto.getLocation().getCitySlug(),
            dto.getLocation().getDistrictSlug(),
            dto.getParentHotelSlug(),
            dto.getSlug()
        );
    }
    
    /**
     * Build Mustache template context from RoomKnowledgeBaseDto
     * Maps all DTO fields to template variables matching template_room_detail.md
     */
    private Map<String, Object> buildRoomTemplateContext(RoomKnowledgeBaseDto dto) {
        Map<String, Object> ctx = new HashMap<>();
        
        // === FRONTMATTER METADATA ===
        
        // Document identification
        ctx.put("doc_type", "room_detail");
        ctx.put("doc_id", dto.getRoomId() != null ? new String(dto.getRoomId()) : null);
        ctx.put("slug", dto.getSlug() != null ? new String(dto.getSlug()) : null);
        ctx.put("parent_hotel_slug", dto.getParentHotelSlug() != null ? new String(dto.getParentHotelSlug()) : null);
        ctx.put("parent_hotel_id", dto.getParentHotelId() != null ? new String(dto.getParentHotelId()) : null);
        ctx.put("last_updated", dto.getLastUpdated() != null
            ? dto.getLastUpdated().format(ISO_FORMATTER) + "Z"
            : LocalDateTime.now().format(ISO_FORMATTER) + "Z");
        ctx.put("language", "vi");
        
        // Location hierarchy (inherited from hotel)
        LocationHierarchyDto loc = dto.getLocation();
        if (loc != null) {
            Map<String, Object> locationMap = new HashMap<>();
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
            locationMap.put("hotel_name", loc.getHotelName() != null ? new String(loc.getHotelName()) : null);
            
            // Coordinates - Only include if valid (not null and not 0.0)
            if (loc.getLatitude() != null && loc.getLongitude() != null 
                && loc.getLatitude() != 0.0 && loc.getLongitude() != 0.0) {
                Map<String, Object> coordinates = new HashMap<>();
                coordinates.put("lat", loc.getLatitude());
                coordinates.put("lng", loc.getLongitude());
                locationMap.put("coordinates", coordinates);
            }
            
            ctx.put("location", locationMap);
        }
        
        // Room classification
        ctx.put("room_id", dto.getRoomId() != null ? new String(dto.getRoomId()) : null);
        ctx.put("room_name", dto.getRoomName() != null ? new String(dto.getRoomName()) : null);
        ctx.put("room_type", dto.getRoomType() != null ? new String(dto.getRoomType()) : null);
        ctx.put("room_category", dto.getRoomCategory() != null ? new String(dto.getRoomCategory()) : null);
        
        // Room specifications
        ctx.put("bed_type", dto.getBedType() != null ? new String(dto.getBedType()) : new String("N/A"));
        ctx.put("bed_type_id", dto.getBedTypeId() != null ? new String(dto.getBedTypeId()) : null);
        ctx.put("max_adults", dto.getMaxAdults() != null ? dto.getMaxAdults().intValue() : 0);
        ctx.put("max_children", dto.getMaxChildren() != null ? dto.getMaxChildren().intValue() : 0);
        ctx.put("area_sqm", dto.getAreaSqm() != null ? dto.getAreaSqm().doubleValue() : 0.0);
        ctx.put("view", dto.getView() != null ? new String(dto.getView()) : new String("N/A"));
        ctx.put("floor_range", dto.getFloorRange() != null ? new String(dto.getFloorRange()) : null);
        
        // Room features - Create defensive copy to ensure thread safety
        ctx.put("room_amenity_tags", dto.getRoomAmenityTags() != null 
            ? new ArrayList<>(dto.getRoomAmenityTags()) : List.of());
        
        // Room policies
        ctx.put("smoking_allowed", dto.getSmokingAllowed() != null ? dto.getSmokingAllowed() : false);
        ctx.put("wifi_available", dto.getWifiAvailable() != null ? dto.getWifiAvailable() : false);
        ctx.put("breakfast_included", dto.getBreakfastIncluded() != null ? dto.getBreakfastIncluded() : false);
        ctx.put("cancellation_policy", dto.getCancellationPolicy() != null 
            ? new String(dto.getCancellationPolicy()) : new String("Chính sách tiêu chuẩn"));
        ctx.put("reschedule_policy", dto.getReschedulePolicy() != null
            ? new String(dto.getReschedulePolicy()) : new String("Chính sách tiêu chuẩn"));
        
        // Policy rules (not available in DTO, set empty list)
        ctx.put("cancellation_policy_rules", List.of());
        ctx.put("reschedule_policy_rules", List.of());
        
        // Inventory info
        ctx.put("quantity", dto.getQuantity() != null ? dto.getQuantity().intValue() : 0);
        ctx.put("status", dto.getStatus() != null ? new String(dto.getStatus()) : new String("active"));
        
        // Pricing info
        ctx.put("base_price", dto.getBasePrice() != null ? dto.getBasePrice().intValue() : 0);
        ctx.put("price_note", dto.getPriceNote() != null ? new String(dto.getPriceNote()) : new String(""));
        
        // Vibe tags - Create defensive copy
        ctx.put("vibe_tags", dto.getVibeTags() != null 
            ? new ArrayList<>(dto.getVibeTags()) : List.of());
        
        // SEO keywords - Create defensive copy
        ctx.put("keywords", dto.getKeywords() != null 
            ? new ArrayList<>(dto.getKeywords()) : List.of());
        
        // === BODY CONTENT ===
        
        // Room name and description
        ctx.put("name", dto.getRoomName() != null ? new String(dto.getRoomName()) : "");
        ctx.put("description", dto.getDescription() != null ? new String(dto.getDescription()) : "");
        ctx.put("room_description_title", dto.getDescription() != null ? new String(dto.getDescription()) : "");
        
        // View helpers
        String view = dto.getView() != null ? dto.getView().toLowerCase() : "";
        boolean viewContainsOcean = view.contains("ocean") || view.contains("sea") || 
                                    view.contains("bien") || view.contains("biển");
        ctx.put("view_contains_ocean", viewContainsOcean);
        
        // Generate view_description from view
        String viewDescription = "";
        if (viewContainsOcean) {
            viewDescription = "hướng biển";
        } else if (view.contains("garden") || view.contains("vuon") || view.contains("vườn")) {
            viewDescription = "hướng vườn";
        } else if (view.contains("city") || view.contains("thanh pho") || view.contains("thành phố")) {
            viewDescription = "hướng thành phố";
        }
        ctx.put("view_description", viewDescription);
        
        // Images
        ctx.put("mainImageUrl", dto.getMainImageUrl() != null ? new String(dto.getMainImageUrl()) : new String(""));
        ctx.put("galleryImageUrls", dto.getGalleryImageUrls() != null 
            ? new ArrayList<>(dto.getGalleryImageUrls()) : List.of());
        
        // Helper flags for conditional rendering (Mustache doesn't support direct comparison)
        List<String> roomAmenityTags = dto.getRoomAmenityTags() != null ? dto.getRoomAmenityTags() : List.of();
        ctx.put("has_balcony", roomAmenityTags.contains("balcony"));
        ctx.put("has_bathtub", roomAmenityTags.contains("bathtub") || roomAmenityTags.contains("jacuzzi"));
        ctx.put("has_tv", roomAmenityTags.contains("tv"));
        ctx.put("has_bluetooth", roomAmenityTags.contains("bluetooth"));
        ctx.put("has_coffee_maker", roomAmenityTags.contains("coffee_maker") || roomAmenityTags.contains("coffee_tea_maker"));
        ctx.put("has_refrigerator", roomAmenityTags.contains("refrigerator") || roomAmenityTags.contains("minibar"));
        ctx.put("has_minibar", roomAmenityTags.contains("minibar"));
        ctx.put("has_air_conditioning", roomAmenityTags.contains("air_conditioning"));
        ctx.put("has_blackout_curtains", roomAmenityTags.contains("blackout_curtains"));
        ctx.put("has_safe_box", roomAmenityTags.contains("safe_box") || roomAmenityTags.contains("in_room_safe"));
        ctx.put("has_turn_down_service", roomAmenityTags.contains("turn_down_service"));
        // Additional helper flags for amenities found in actual data
        ctx.put("has_hot_water", roomAmenityTags.contains("hot_water"));
        ctx.put("has_toiletries", roomAmenityTags.contains("toiletries"));
        ctx.put("has_private_bathroom", roomAmenityTags.contains("private_bathroom"));
        ctx.put("has_standing_shower", roomAmenityTags.contains("standing_shower"));
        ctx.put("has_free_bottled_water", roomAmenityTags.contains("free_bottled_water"));
        
        // Tool call for room price (pre-formatted to avoid Mustache nested variable issues)
        String roomId = dto.getRoomId() != null ? dto.getRoomId() : "";
        ctx.put("tool_call_get_room_price", 
            String.format("{{TOOL:get_room_price|room_id=%s|check_in={date}|check_out={date}}}", roomId));
        
        // Nearby Entertainment - Map from DTO to context
        if (dto.getNearbyEntertainment() != null && !dto.getNearbyEntertainment().isEmpty()) {
            List<Map<String, Object>> nearbyEntertainmentList = dto.getNearbyEntertainment().stream()
                .map(venue -> {
                    Map<String, Object> venueMap = new HashMap<>();
                    venueMap.put("name", venue.getName() != null ? new String(venue.getName()) : "");
                    venueMap.put("category", venue.getCategory() != null ? new String(venue.getCategory()) : "");
                    venueMap.put("distance", venue.getDistance() != null ? new String(venue.getDistance()) : "");
                    venueMap.put("shortDescription", venue.getShortDescription() != null ? new String(venue.getShortDescription()) : "");
                    return venueMap;
                })
                .collect(Collectors.toList());
            ctx.put("nearbyEntertainment", nearbyEntertainmentList);
        } else {
            ctx.put("nearbyEntertainment", List.of());
        }
        
        // === NEW FIELDS FOR AI OPTIMIZATION ===
        
        // Room specs
        if (dto.getSpecs() != null) {
            Map<String, Object> specsMap = new HashMap<>();
            specsMap.put("area_sqm", dto.getSpecs().getAreaSqm() != null ? dto.getSpecs().getAreaSqm() : dto.getAreaSqm());
            specsMap.put("has_balcony", dto.getSpecs().getHasBalcony() != null ? dto.getSpecs().getHasBalcony() : false);
            specsMap.put("has_window", dto.getSpecs().getHasWindow() != null ? dto.getSpecs().getHasWindow() : true);
            specsMap.put("view_type", dto.getSpecs().getViewType() != null ? new String(dto.getSpecs().getViewType()) : "no_view");
            // View type flags for template conditionals
            String viewType = dto.getSpecs().getViewType() != null ? dto.getSpecs().getViewType() : "no_view";
            specsMap.put("view_type_ocean", "ocean".equals(viewType));
            specsMap.put("view_type_city", "city".equals(viewType));
            specsMap.put("view_type_mountain", "mountain".equals(viewType));
            // Bed configuration - with fallback to bed_type if empty
            if (dto.getSpecs().getBedConfiguration() != null && !dto.getSpecs().getBedConfiguration().isEmpty()) {
                List<Map<String, Object>> bedConfigList = dto.getSpecs().getBedConfiguration().stream()
                    .map(bed -> {
                        Map<String, Object> bedMap = new HashMap<>();
                        bedMap.put("type", bed.getType() != null ? new String(bed.getType()) : "double");
                        bedMap.put("count", bed.getCount() != null ? bed.getCount() : 1);
                        return bedMap;
                    })
                    .collect(Collectors.toList());
                specsMap.put("bed_configuration", bedConfigList);
            } else {
                // Fallback: Create bed_configuration from bed_type if available
                String bedType = dto.getBedType() != null ? dto.getBedType().toLowerCase() : "";
                List<Map<String, Object>> bedConfigList = new ArrayList<>();
                
                if (!bedType.isEmpty()) {
                    Map<String, Object> bedMap = new HashMap<>();
                    // Infer type from bed_type string (e.g., "Giường đôi" -> "double")
                    String inferredType = "double"; // default
                    if (bedType.contains("đơn") || bedType.contains("single") || bedType.contains("twin")) {
                        inferredType = "single";
                    } else if (bedType.contains("đôi") || bedType.contains("double")) {
                        inferredType = "double";
                    } else if (bedType.contains("king") || bedType.contains("queen")) {
                        inferredType = "king";
                    }
                    
                    // Infer count from bed_type string (e.g., "2 giường đơn" -> count = 2)
                    int count = 1; // default
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)\\s*(giường|bed)", java.util.regex.Pattern.CASE_INSENSITIVE);
                    java.util.regex.Matcher matcher = pattern.matcher(bedType);
                    if (matcher.find()) {
                        try {
                            count = Integer.parseInt(matcher.group(1));
                        } catch (NumberFormatException e) {
                            count = 1;
                        }
                    }
                    
                    bedMap.put("type", inferredType);
                    bedMap.put("count", count);
                    bedConfigList.add(bedMap);
                }
                
                specsMap.put("bed_configuration", bedConfigList);
            }
            ctx.put("specs", specsMap);
        } else {
            Map<String, Object> specsMap = new HashMap<>();
            specsMap.put("area_sqm", dto.getAreaSqm() != null ? dto.getAreaSqm() : 0.0);
            specsMap.put("has_balcony", ctx.get("has_balcony"));
            specsMap.put("has_window", true);
            specsMap.put("view_type", "no_view");
            specsMap.put("view_type_ocean", false);
            specsMap.put("view_type_city", false);
            specsMap.put("view_type_mountain", false);
            
            // Fallback bed_configuration from bed_type
            String bedType = dto.getBedType() != null ? dto.getBedType().toLowerCase() : "";
            List<Map<String, Object>> bedConfigList = new ArrayList<>();
            if (!bedType.isEmpty()) {
                Map<String, Object> bedMap = new HashMap<>();
                String inferredType = "double";
                if (bedType.contains("đơn") || bedType.contains("single") || bedType.contains("twin")) {
                    inferredType = "single";
                } else if (bedType.contains("đôi") || bedType.contains("double")) {
                    inferredType = "double";
                } else if (bedType.contains("king") || bedType.contains("queen")) {
                    inferredType = "king";
                }
                int count = 1;
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)\\s*(giường|bed)", java.util.regex.Pattern.CASE_INSENSITIVE);
                java.util.regex.Matcher matcher = pattern.matcher(bedType);
                if (matcher.find()) {
                    try {
                        count = Integer.parseInt(matcher.group(1));
                    } catch (NumberFormatException e) {
                        count = 1;
                    }
                }
                bedMap.put("type", inferredType);
                bedMap.put("count", count);
                bedConfigList.add(bedMap);
            }
            specsMap.put("bed_configuration", bedConfigList);
            
            ctx.put("specs", specsMap);
        }
        
        // Pricing info
        if (dto.getPricing() != null) {
            Map<String, Object> pricingMap = new HashMap<>();
            pricingMap.put("base_price_vnd", dto.getPricing().getBasePriceVnd() != null ? dto.getPricing().getBasePriceVnd() : dto.getBasePrice());
            pricingMap.put("weekend_surcharge_percent", dto.getPricing().getWeekendSurchargePercent() != null ? dto.getPricing().getWeekendSurchargePercent() : 0.0);
            pricingMap.put("holiday_surcharge_percent", dto.getPricing().getHolidaySurchargePercent() != null ? dto.getPricing().getHolidaySurchargePercent() : 0.0);
            ctx.put("pricing", pricingMap);
        } else {
            Map<String, Object> pricingMap = new HashMap<>();
            pricingMap.put("base_price_vnd", dto.getBasePrice() != null ? dto.getBasePrice() : 0.0);
            pricingMap.put("weekend_surcharge_percent", 0.0);
            pricingMap.put("holiday_surcharge_percent", 0.0);
            ctx.put("pricing", pricingMap);
        }
        
        // Price Analytics - Map from DTO to context
        if (dto.getPriceAnalytics() != null) {
            Map<String, Object> priceAnalyticsMap = new HashMap<>();
            priceAnalyticsMap.put("minPriceNext30Days", dto.getPriceAnalytics().getMinPriceNext30Days() != null ? dto.getPriceAnalytics().getMinPriceNext30Days() : 0.0);
            priceAnalyticsMap.put("maxPriceNext30Days", dto.getPriceAnalytics().getMaxPriceNext30Days() != null ? dto.getPriceAnalytics().getMaxPriceNext30Days() : 0.0);
            priceAnalyticsMap.put("avgPriceNext30Days", dto.getPriceAnalytics().getAvgPriceNext30Days() != null ? dto.getPriceAnalytics().getAvgPriceNext30Days() : 0.0);
            priceAnalyticsMap.put("priceVolatility", dto.getPriceAnalytics().getPriceVolatility() != null ? new String(dto.getPriceAnalytics().getPriceVolatility()) : "low");
            priceAnalyticsMap.put("weekendPriceMultiplier", dto.getPriceAnalytics().getWeekendPriceMultiplier() != null ? dto.getPriceAnalytics().getWeekendPriceMultiplier() : 1.0);
            priceAnalyticsMap.put("isHighVolatility", dto.getPriceAnalytics().getIsHighVolatility() != null ? dto.getPriceAnalytics().getIsHighVolatility() : false);
            priceAnalyticsMap.put("isMediumVolatility", dto.getPriceAnalytics().getIsMediumVolatility() != null ? dto.getPriceAnalytics().getIsMediumVolatility() : false);
            priceAnalyticsMap.put("isLowVolatility", dto.getPriceAnalytics().getIsLowVolatility() != null ? dto.getPriceAnalytics().getIsLowVolatility() : true);
            ctx.put("priceAnalytics", priceAnalyticsMap);
        } else {
            // Default empty price analytics
            Map<String, Object> priceAnalyticsMap = new HashMap<>();
            priceAnalyticsMap.put("minPriceNext30Days", 0.0);
            priceAnalyticsMap.put("maxPriceNext30Days", 0.0);
            priceAnalyticsMap.put("avgPriceNext30Days", 0.0);
            priceAnalyticsMap.put("priceVolatility", "low");
            priceAnalyticsMap.put("weekendPriceMultiplier", 1.0);
            priceAnalyticsMap.put("isHighVolatility", false);
            priceAnalyticsMap.put("isMediumVolatility", false);
            priceAnalyticsMap.put("isLowVolatility", true);
            ctx.put("priceAnalytics", priceAnalyticsMap);
        }
        
        // Room policies
        if (dto.getRoomPoliciesDetail() != null) {
            Map<String, Object> roomPoliciesMap = new HashMap<>();
            if (dto.getRoomPoliciesDetail().getMaxOccupancy() != null) {
                Map<String, Object> maxOccupancyMap = new HashMap<>();
                maxOccupancyMap.put("adults", dto.getRoomPoliciesDetail().getMaxOccupancy().getAdults() != null ? dto.getRoomPoliciesDetail().getMaxOccupancy().getAdults() : (dto.getMaxAdults() != null ? dto.getMaxAdults() : 0));
                maxOccupancyMap.put("children", dto.getRoomPoliciesDetail().getMaxOccupancy().getChildren() != null ? dto.getRoomPoliciesDetail().getMaxOccupancy().getChildren() : (dto.getMaxChildren() != null ? dto.getMaxChildren() : 0));
                roomPoliciesMap.put("max_occupancy", maxOccupancyMap);
            } else {
                Map<String, Object> maxOccupancyMap = new HashMap<>();
                maxOccupancyMap.put("adults", dto.getMaxAdults() != null ? dto.getMaxAdults() : 0);
                maxOccupancyMap.put("children", dto.getMaxChildren() != null ? dto.getMaxChildren() : 0);
                roomPoliciesMap.put("max_occupancy", maxOccupancyMap);
            }
            roomPoliciesMap.put("extra_bed_available", dto.getRoomPoliciesDetail().getExtraBedAvailable() != null ? dto.getRoomPoliciesDetail().getExtraBedAvailable() : false);
            roomPoliciesMap.put("extra_bed_price_vnd", dto.getRoomPoliciesDetail().getExtraBedPriceVnd() != null ? dto.getRoomPoliciesDetail().getExtraBedPriceVnd() : 0.0);
            ctx.put("room_policies", roomPoliciesMap);
        } else {
            Map<String, Object> roomPoliciesMap = new HashMap<>();
            Map<String, Object> maxOccupancyMap = new HashMap<>();
            maxOccupancyMap.put("adults", dto.getMaxAdults() != null ? dto.getMaxAdults() : 0);
            maxOccupancyMap.put("children", dto.getMaxChildren() != null ? dto.getMaxChildren() : 0);
            roomPoliciesMap.put("max_occupancy", maxOccupancyMap);
            roomPoliciesMap.put("extra_bed_available", false);
            roomPoliciesMap.put("extra_bed_price_vnd", 0.0);
            ctx.put("room_policies", roomPoliciesMap);
        }
        
        // Room Policies Detail - Map PolicyDetailDto to context for template
        ctx.put("policiesInherited", dto.getPoliciesInherited() != null ? dto.getPoliciesInherited() : false);
        
        if (dto.getRoomPolicies() != null) {
            Map<String, Object> roomPoliciesDetailMap = new HashMap<>();
            
            // Check-in/out times
            if (dto.getRoomPolicies().getCheckInTime() != null) {
                roomPoliciesDetailMap.put("checkInTime", dto.getRoomPolicies().getCheckInTime().toString());
            } else {
                roomPoliciesDetailMap.put("checkInTime", "");
            }
            
            if (dto.getRoomPolicies().getCheckOutTime() != null) {
                roomPoliciesDetailMap.put("checkOutTime", dto.getRoomPolicies().getCheckOutTime().toString());
            } else {
                roomPoliciesDetailMap.put("checkOutTime", "");
            }
            
            roomPoliciesDetailMap.put("allowsPayAtHotel", dto.getRoomPolicies().getAllowsPayAtHotel() != null ? dto.getRoomPolicies().getAllowsPayAtHotel() : false);
            
            // Cancellation Policy
            if (dto.getRoomPolicies().getCancellationPolicy() != null) {
                Map<String, Object> cancellationPolicyMap = new HashMap<>();
                cancellationPolicyMap.put("name", dto.getRoomPolicies().getCancellationPolicy().getName() != null 
                    ? new String(dto.getRoomPolicies().getCancellationPolicy().getName()) : "");
                
                if (dto.getRoomPolicies().getCancellationPolicy().getRules() != null) {
                    List<Map<String, Object>> rulesList = dto.getRoomPolicies().getCancellationPolicy().getRules().stream()
                        .map(rule -> {
                            Map<String, Object> ruleMap = new HashMap<>();
                            ruleMap.put("daysBeforeCheckin", rule.getDaysBeforeCheckin() != null ? rule.getDaysBeforeCheckin() : 0);
                            ruleMap.put("penaltyPercentage", rule.getPenaltyPercentage() != null ? rule.getPenaltyPercentage() : 0);
                            ruleMap.put("description", rule.getDescription() != null ? new String(rule.getDescription()) : "");
                            return ruleMap;
                        })
                        .collect(Collectors.toList());
                    cancellationPolicyMap.put("rules", rulesList);
                } else {
                    cancellationPolicyMap.put("rules", List.of());
                }
                
                roomPoliciesDetailMap.put("cancellationPolicy", cancellationPolicyMap);
            } else {
                roomPoliciesDetailMap.put("cancellationPolicy", null);
            }
            
            // Reschedule Policy
            if (dto.getRoomPolicies().getReschedulePolicy() != null) {
                Map<String, Object> reschedulePolicyMap = new HashMap<>();
                reschedulePolicyMap.put("name", dto.getRoomPolicies().getReschedulePolicy().getName() != null 
                    ? new String(dto.getRoomPolicies().getReschedulePolicy().getName()) : "");
                
                if (dto.getRoomPolicies().getReschedulePolicy().getRules() != null) {
                    List<Map<String, Object>> rulesList = dto.getRoomPolicies().getReschedulePolicy().getRules().stream()
                        .map(rule -> {
                            Map<String, Object> ruleMap = new HashMap<>();
                            ruleMap.put("daysBeforeCheckin", rule.getDaysBeforeCheckin() != null ? rule.getDaysBeforeCheckin() : 0);
                            ruleMap.put("feePercentage", rule.getFeePercentage() != null ? rule.getFeePercentage() : 0);
                            ruleMap.put("description", rule.getDescription() != null ? new String(rule.getDescription()) : "");
                            return ruleMap;
                        })
                        .collect(Collectors.toList());
                    reschedulePolicyMap.put("rules", rulesList);
                } else {
                    reschedulePolicyMap.put("rules", List.of());
                }
                
                roomPoliciesDetailMap.put("reschedulePolicy", reschedulePolicyMap);
            } else {
                roomPoliciesDetailMap.put("reschedulePolicy", null);
            }
            
            ctx.put("roomPolicies", roomPoliciesDetailMap);
        } else {
            // Empty room policies detail
            ctx.put("roomPolicies", null);
        }
        
        // Update inventory calendar with day_of_week and status flags
        // Create helper method to map inventory to context map
        java.util.function.Function<com.webapp.holidate.dto.knowledgebase.RoomInventoryCalendarDto, Map<String, Object>> mapInventory = inv -> {
            Map<String, Object> invMap = new HashMap<>();
            invMap.put("date", inv.getDate() != null ? inv.getDate().toString() : "");
            invMap.put("day_of_week", inv.getDayOfWeek() != null ? new String(inv.getDayOfWeek()) : getDayOfWeekName(inv.getDate()));
            invMap.put("price_vnd", inv.getPrice() != null ? inv.getPrice() : 0.0);
            invMap.put("price", inv.getPrice() != null ? inv.getPrice() : 0.0); // Keep for backward compatibility
            invMap.put("available_rooms", inv.getAvailableRooms() != null ? inv.getAvailableRooms() : 0);
            invMap.put("availableRooms", inv.getAvailableRooms() != null ? inv.getAvailableRooms() : 0); // Keep for backward compatibility
            invMap.put("status", inv.getStatus() != null ? new String(inv.getStatus()) : "available");
            invMap.put("isWeekend", inv.getIsWeekend() != null ? inv.getIsWeekend() : false);
            invMap.put("isHoliday", inv.getIsHoliday() != null ? inv.getIsHoliday() : false);
            // Status flags for template conditionals
            String status = inv.getStatus() != null ? inv.getStatus() : "available";
            invMap.put("status_available", "available".equals(status));
            invMap.put("status_limited", "limited".equals(status));
            invMap.put("status_sold_out", "sold_out".equals(status));
            // Helper flags for availability display
            Integer availableRooms = inv.getAvailableRooms() != null ? inv.getAvailableRooms() : 0;
            invMap.put("hasRooms", availableRooms > 0);
            invMap.put("hasManyRooms", availableRooms >= 5);
            invMap.put("hasLimitedRooms", availableRooms > 0 && availableRooms < 5);
            invMap.put("isSoldOut", availableRooms == 0);
            // Flag for limit_7 template logic
            invMap.put("limit_7", false); // Will be set to true for first 7 items
            return invMap;
        };
        
        if (dto.getInventoryCalendar() != null && !dto.getInventoryCalendar().isEmpty()) {
            // Full 30-day calendar
            List<Map<String, Object>> inventoryList30Days = dto.getInventoryCalendar().stream()
                .map(mapInventory)
                .collect(Collectors.toList());
            ctx.put("inventoryCalendar", inventoryList30Days);
            
            // First 7 days for the 7-day table - add limit_7 flag
            List<Map<String, Object>> inventoryList7Days = dto.getInventoryCalendar().stream()
                .limit(7)
                .map(mapInventory)
                .map(invMap -> {
                    invMap.put("limit_7", true);
                    return invMap;
                })
                .collect(Collectors.toList());
            ctx.put("inventoryCalendar7Days", inventoryList7Days);
        } else {
            ctx.put("inventoryCalendar", List.of());
            ctx.put("inventoryCalendar7Days", List.of());
        }
        
        return ctx;
    }
    
    /**
     * Get day of week name in lowercase (e.g., "monday", "tuesday")
     */
    private String getDayOfWeekName(java.time.LocalDate date) {
        if (date == null) {
            return "unknown";
        }
        return date.getDayOfWeek().name().toLowerCase();
    }
}

