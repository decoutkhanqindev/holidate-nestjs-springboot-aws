package com.webapp.holidate.service.knowledgebase;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.webapp.holidate.constants.AppProperties;
import com.webapp.holidate.dto.knowledgebase.HotelKnowledgeBaseDto;
import com.webapp.holidate.dto.knowledgebase.LocationHierarchyDto;
import com.webapp.holidate.dto.knowledgebase.NearbyVenueDto;
import com.webapp.holidate.dto.knowledgebase.PriceReferenceDto;
import com.webapp.holidate.dto.knowledgebase.ReviewStatsDto;
import com.webapp.holidate.dto.knowledgebase.RoomKnowledgeBaseDto;
import com.webapp.holidate.dto.knowledgebase.RoomSummaryDto;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.amenity.HotelAmenity;
import com.webapp.holidate.entity.image.HotelPhoto;
import com.webapp.holidate.entity.image.RoomPhoto;
import com.webapp.holidate.entity.location.entertainment_venue.HotelEntertainmentVenue;
import com.webapp.holidate.repository.knowledgebase.KnowledgeBaseRepository;
import com.webapp.holidate.type.accommodation.AccommodationStatusType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Main service for transforming Hotel entities into Knowledge Base DTOs.
 * Orchestrates all helper services to build complete hotel knowledge base data.
 * 
 * This service:
 * - Extracts data from Hotel entity and related entities
 * - Transforms Vietnamese text to English tags
 * - Infers metadata like vibe tags and location tags
 * - Calculates statistics and summaries
 * 
 * Usage:
 * List<Hotel> hotels = knowledgeBaseRepository.findAllActiveHotelsForKnowledgeBase(status);
 * List<HotelKnowledgeBaseDto> kbDtos = hotels.stream()
 *     .map(knowledgeBaseGenerationService::buildHotelKB)
 *     .collect(Collectors.toList());
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeBaseGenerationService {
    
    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final SlugService slugService;
    private final AmenityMappingService amenityMappingService;
    private final VibeInferenceService vibeInferenceService;
    private final LocationTagService locationTagService;
    
    @Value(AppProperties.KB_IMAGE_DEFAULT_PLACEHOLDER_URL)
    private String defaultPlaceholderImageUrl;
    
    /**
     * Build complete Knowledge Base DTO for a hotel.
     * This method aggregates all hotel information into a single DTO.
     * 
     * Note: This method should be called within an existing transaction context.
     * The @Transactional annotation is removed to avoid nested transaction issues
     * when called from KnowledgeBaseBatchService.processBatch().
     * 
     * @param hotel Hotel entity (must have relationships loaded)
     * @return Complete HotelKnowledgeBaseDto
     */
    public HotelKnowledgeBaseDto buildHotelKB(Hotel hotel) {
        if (hotel == null) {
            throw new IllegalArgumentException("Hotel cannot be null");
        }
        
        // CRITICAL: Log hotel details to verify correct hotel is being processed
        log.info("Building Knowledge Base DTO for hotel: {} (ID: {})", hotel.getName(), hotel.getId());
        
        try {
            // Build location hierarchy
            LocationHierarchyDto location = buildLocationHierarchy(hotel);
            
            // Get price reference
            PriceReferenceDto priceReference = getPriceReference(hotel.getId());
            
            // Get review statistics
            ReviewStatsDto reviewStats = getReviewStats(hotel.getId());
            
            // Build amenity list
            List<String> amenities = buildAmenityList(hotel.getAmenities());
            
            // Extract hotel images
            String mainImageUrl = extractMainImageUrl(hotel.getPhotos());
            List<String> galleryImageUrls = extractGalleryImageUrls(hotel.getPhotos());
            
            // Build room summaries
            List<RoomSummaryDto> rooms = buildRoomSummaries(hotel.getRooms());
            
            // Build nearby venues
            List<NearbyVenueDto> nearbyVenues = buildNearbyVenues(hotel.getEntertainmentVenues());
            
            // Extract policy information
            PolicyInfo policyInfo = extractPolicyInfo(hotel);
            
            // Infer vibe tags
            List<String> vibeTags = vibeInferenceService.inferVibeTags(hotel);
            
            // Generate location tags
            List<String> locationTags = locationTagService.generateLocationTags(hotel);
            
            // Generate slug from hotel name
            String slug = slugService.generateSlug(hotel.getName());
            
            // CRITICAL: Log DTO values before building to verify correctness
            log.info("DTO values before build - hotelId: {}, name: {}, slug: {}", 
                    hotel.getId(), hotel.getName(), slug);
            
            // Extract review stats safely to avoid unboxing warnings
            Double reviewScoreValue = null;
            Long reviewCountValue = 0L;
            if (reviewStats != null) {
                reviewScoreValue = reviewStats.getAverageScore();  // Can be null when no reviews
                Long totalReviews = reviewStats.getTotalReviews();
                reviewCountValue = totalReviews != null ? totalReviews : 0L;
            }
            
            // Build complete DTO
            HotelKnowledgeBaseDto dto = HotelKnowledgeBaseDto.builder()
                    .hotelId(hotel.getId())
                    .slug(slug)
                    .name(hotel.getName())
                    .description(hotel.getDescription())
                    .starRating(hotel.getStarRating())
                    .status(hotel.getStatus())
                    .location(location)
                    .amenityEnglishTags(amenities)
                    .rooms(rooms)
                    .priceReference(priceReference)
                    .totalRooms(rooms != null ? rooms.size() : 0)
                    .availableRoomTypes(rooms != null ? (int) rooms.stream().map(RoomSummaryDto::getName).distinct().count() : 0)
                    .nearbyVenues(nearbyVenues)
                    .checkInTime(policyInfo.checkInTime)
                    .checkOutTime(policyInfo.checkOutTime)
                    .allowsPayAtHotel(policyInfo.allowsPayAtHotel)
                    .requiredDocuments(policyInfo.requiredDocuments)
                    .cancellationPolicyName(policyInfo.cancellationPolicyName)
                    .reschedulePolicyName(policyInfo.reschedulePolicyName)
                    .reviewScore(reviewScoreValue)  // null when no reviews (per DATA_VALIDATION_REPORT.md)
                    .reviewCount(reviewCountValue)
                    .mainImageUrl(mainImageUrl)
                    .galleryImageUrls(galleryImageUrls)
                    .vibeTagsInferred(vibeTags)
                    .locationTags(locationTags)
                    .tags(buildAllTags(vibeTags, locationTags, amenities))
                    .lastUpdated(java.time.LocalDateTime.now())
                    .build();
            
            // CRITICAL: Log DTO values after building to verify correctness
            log.info("DTO values after build - hotelId: {}, name: {}, slug: {}", 
                    dto.getHotelId(), dto.getName(), dto.getSlug());
            
            return dto;
                    
        } catch (Exception e) {
            log.error("Error building Knowledge Base for hotel {}: {}", hotel.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to build Knowledge Base DTO for hotel " + hotel.getId(), e);
        }
    }
    
    /**
     * Build location hierarchy DTO from hotel location data.
     */
    private LocationHierarchyDto buildLocationHierarchy(Hotel hotel) {
        return LocationHierarchyDto.builder()
                .country(slugService.generateSlug(hotel.getCountry().getName()))
                .countryCode(hotel.getCountry().getCode())
                .province(slugService.generateSlug(hotel.getProvince().getName()))
                .provinceName(hotel.getProvince().getName())
                .city(slugService.generateSlug(hotel.getCity().getName()))
                .cityName(hotel.getCity().getName())
                .citySlug(slugService.generateSlug(hotel.getCity().getName()))
                .district(slugService.generateSlug(hotel.getDistrict().getName()))
                .districtName(hotel.getDistrict().getName())
                .districtSlug(slugService.generateSlug(hotel.getDistrict().getName()))
                .ward(slugService.generateSlug(hotel.getWard().getName()))
                .wardName(hotel.getWard().getName())
                .street(slugService.generateSlug(hotel.getStreet().getName()))
                .streetName(hotel.getStreet().getName())
                .address(hotel.getAddress())
                .latitude(hotel.getLatitude())
                .longitude(hotel.getLongitude())
                .build();
    }
    
    /**
     * Get price reference for hotel with room names.
     * Falls back to manual calculation if repository query fails.
     */
    private PriceReferenceDto getPriceReference(String hotelId) {
        try {
            String activeStatus = AccommodationStatusType.ACTIVE.getValue();
            
            // Get price data
            PriceReferenceDto priceRef = knowledgeBaseRepository.findPriceReferenceByHotelId(
                    hotelId, activeStatus);
            
            // Get room names for min and max prices
            String minPriceRoomName = knowledgeBaseRepository.findMinPriceRoomName(hotelId, activeStatus);
            String maxPriceRoomName = knowledgeBaseRepository.findMaxPriceRoomName(hotelId, activeStatus);
            
            // Update DTO with room names
            priceRef.setMinPriceRoomName(minPriceRoomName != null ? minPriceRoomName : "N/A");
            priceRef.setMaxPriceRoomName(maxPriceRoomName != null ? maxPriceRoomName : "N/A");
            
            return priceRef;
        } catch (Exception e) {
            log.warn("Failed to get price reference from repository for hotel {}, using fallback", hotelId);
            return PriceReferenceDto.builder()
                    .minPrice(0.0)
                    .minPriceRoomName("N/A")
                    .maxPrice(0.0)
                    .maxPriceRoomName("N/A")
                    .build();
        }
    }
    
    /**
     * Get review statistics for hotel.
     * Updated based on DATA_VALIDATION_REPORT.md section 3.
     * 
     * Ensures null-safety: if no reviews exist (empty array), returns:
     * - review_score = null (not 0.0)
     * - review_count = 0L
     * 
     * This allows templates to conditionally render review information.
     */
    private ReviewStatsDto getReviewStats(String hotelId) {
        try {
            ReviewStatsDto stats = knowledgeBaseRepository.getReviewStatsByHotelId(hotelId);
            
            // If query returns null, return default (no reviews)
            if (stats == null) {
                return ReviewStatsDto.builder()
                        .averageScore(null)  // null when no reviews (not 0.0)
                        .totalReviews(0L)
                        .build();
            }
            
            // If totalReviews is 0 or null, set averageScore to null
            if (stats.getTotalReviews() == null || stats.getTotalReviews() == 0) {
                return ReviewStatsDto.builder()
                        .averageScore(null)  // null when no reviews
                        .totalReviews(0L)
                        .build();
            }
            
            // If averageScore is null but we have reviews, calculate it
            if (stats.getAverageScore() == null && stats.getTotalReviews() > 0) {
                // This shouldn't happen, but handle gracefully
                log.warn("Review stats has totalReviews > 0 but averageScore is null for hotel {}", hotelId);
                return ReviewStatsDto.builder()
                        .averageScore(null)
                        .totalReviews(stats.getTotalReviews())
                        .build();
            }
            
            return stats;
        } catch (Exception e) {
            log.warn("Failed to get review stats for hotel {}: {}", hotelId, e.getMessage());
            return ReviewStatsDto.builder()
                    .averageScore(null)  // null on error (no reviews)
                    .totalReviews(0L)
                    .build();
        }
    }
    
    /**
     * Build list of English amenity tags.
     */
    private List<String> buildAmenityList(Set<HotelAmenity> hotelAmenities) {
        if (hotelAmenities == null || hotelAmenities.isEmpty()) {
            return new ArrayList<>();
        }
        
        return hotelAmenities.stream()
                .map(ha -> amenityMappingService.mapToEnglish(ha.getAmenity().getName()))
                .filter(tag -> !tag.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
    
    /**
     * Build room summary DTOs from Room entities.
     * Uses null-safe check to avoid LazyInitializationException when collection is a proxy.
     */
    private List<RoomSummaryDto> buildRoomSummaries(Set<Room> rooms) {
        if (rooms == null) {
            return new ArrayList<>();
        }
        
        // Use stream().findFirst() to safely check if collection has elements
        // This avoids calling isEmpty() on a potentially uninitialized proxy collection
        try {
            return rooms.stream()
                    .filter(room -> room != null && AccommodationStatusType.ACTIVE.getValue().equalsIgnoreCase(room.getStatus()))
                    .map(room -> {
                        String roomMainImageUrl = extractRoomMainImageUrl(room.getPhotos());
                        List<String> roomGalleryImageUrls = extractRoomGalleryImageUrls(room.getPhotos());
                        
                        return RoomSummaryDto.builder()
                                .name(room.getName())
                                .area(room.getArea())
                                .view(room.getView())
                                .bedType(room.getBedType() != null ? room.getBedType().getName() : "N/A")
                                .maxAdults(room.getMaxAdults())
                                .maxChildren(room.getMaxChildren())
                                .smokingAllowed(room.isSmokingAllowed())
                                .wifiAvailable(room.isWifiAvailable())
                                .breakfastIncluded(room.isBreakfastIncluded())
                                .mainImageUrl(roomMainImageUrl)
                                .galleryImageUrls(roomGalleryImageUrls)
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (org.hibernate.LazyInitializationException e) {
            log.warn("LazyInitializationException when building room summaries, returning empty list: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * Build nearby venue DTOs from HotelEntertainmentVenue entities.
     * Ensures proper mapping even if relationships are lazy-loaded.
     */
    private List<NearbyVenueDto> buildNearbyVenues(Set<HotelEntertainmentVenue> venues) {
        if (venues == null || venues.isEmpty()) {
            log.debug("No entertainment venues found for hotel");
            return new ArrayList<>();
        }
        
        List<NearbyVenueDto> venueDtos = venues.stream()
                .filter(hev -> {
                    // Ensure entertainment venue is not null
                    if (hev.getEntertainmentVenue() == null) {
                        log.warn("HotelEntertainmentVenue has null entertainmentVenue: {}", hev.getId());
                        return false;
                    }
                    return true;
                })
                .map(hev -> {
                    try {
                        return NearbyVenueDto.builder()
                                .name(hev.getEntertainmentVenue().getName())
                                .distance(hev.getDistance())  // Keep as Double, format in upload service
                                .categoryName(hev.getEntertainmentVenue().getCategory() != null ? 
                                        hev.getEntertainmentVenue().getCategory().getName() : "Other")
                                .build();
                    } catch (Exception e) {
                        log.warn("Error mapping entertainment venue {}: {}", 
                                hev.getId(), e.getMessage());
                        return null;
                    }
                })
                .filter(dto -> dto != null) // Remove any null DTOs from failed mappings
                .collect(Collectors.toList());
        
        log.debug("Built {} nearby venue DTOs from {} entertainment venues", 
                venueDtos.size(), venues.size());
        
        return venueDtos;
    }
    
    /**
     * Format distance in meters to human-readable string format.
     * Updated based on DATA_VALIDATION_REPORT.md section 4.
     * 
     * Format: < 1000m → "200m", >= 1000m → "3.5km"
     * 
     * Note: This method is currently unused as distance is stored as Double
     * in NearbyVenueDto and formatted in KnowledgeBaseUploadService.formatDistance().
     * Kept for potential future use or reference.
     * 
     * @param distanceInMeters Distance in meters
     * @return Formatted string (e.g., "200m", "3.5km")
     */
    @SuppressWarnings("unused")
    private String formatDistance(double distanceInMeters) {
        if (distanceInMeters < 1000) {
            return String.format("%.0fm", distanceInMeters);
        } else {
            return String.format("%.1fkm", distanceInMeters / 1000);
        }
    }
    
    /**
     * Extract policy information from hotel.
     */
    private PolicyInfo extractPolicyInfo(Hotel hotel) {
        PolicyInfo info = new PolicyInfo();
        
        if (hotel.getPolicy() != null) {
            info.checkInTime = hotel.getPolicy().getCheckInTime();
            info.checkOutTime = hotel.getPolicy().getCheckOutTime();
            info.allowsPayAtHotel = hotel.getPolicy().isAllowsPayAtHotel();
            
            // Extract required documents
            if (hotel.getPolicy().getRequiredIdentificationDocuments() != null) {
                info.requiredDocuments = hotel.getPolicy().getRequiredIdentificationDocuments().stream()
                        .map(doc -> doc.getIdentificationDocument() != null ? 
                                doc.getIdentificationDocument().getName() : "Unknown")
                        .collect(Collectors.toList());
            }
            
            // Extract policy names
            if (hotel.getPolicy().getCancellationPolicy() != null) {
                info.cancellationPolicyName = hotel.getPolicy().getCancellationPolicy().getName();
            }
            
            if (hotel.getPolicy().getReschedulePolicy() != null) {
                info.reschedulePolicyName = hotel.getPolicy().getReschedulePolicy().getName();
            }
        }
        
        return info;
    }
    
    /**
     * Build comprehensive tag list combining vibe, location, and amenity tags.
     */
    private List<String> buildAllTags(List<String> vibeTags, List<String> locationTags, List<String> amenityTags) {
        List<String> allTags = new ArrayList<>();
        
        if (vibeTags != null) {
            allTags.addAll(vibeTags);
        }
        
        if (locationTags != null) {
            allTags.addAll(locationTags);
        }
        
        // Add top amenity tags (limit to avoid tag explosion)
        if (amenityTags != null && !amenityTags.isEmpty()) {
            allTags.addAll(amenityTags.stream().limit(15).collect(Collectors.toList()));
        }
        
        return allTags.stream()
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
    
    /**
     * Extract main image URL from hotel photos.
     * Returns the first photo URL, or default placeholder if no photos exist.
     * 
     * @param hotelPhotos Set of HotelPhoto entities
     * @return Main image URL
     */
    private String extractMainImageUrl(Set<HotelPhoto> hotelPhotos) {
        if (hotelPhotos == null || hotelPhotos.isEmpty()) {
            return defaultPlaceholderImageUrl;
        }
        
        try {
            return hotelPhotos.stream()
                    .filter(hp -> hp != null && hp.getPhoto() != null && hp.getPhoto().getUrl() != null)
                    .map(hp -> hp.getPhoto().getUrl())
                    .findFirst()
                    .orElse(defaultPlaceholderImageUrl);
        } catch (Exception e) {
            log.warn("Error extracting main image URL from hotel photos: {}", e.getMessage());
            return defaultPlaceholderImageUrl;
        }
    }
    
    /**
     * Extract gallery image URLs from hotel photos (up to 5 best images).
     * Returns list of photo URLs, excluding the main image.
     * 
     * @param hotelPhotos Set of HotelPhoto entities
     * @return List of gallery image URLs (max 5)
     */
    private List<String> extractGalleryImageUrls(Set<HotelPhoto> hotelPhotos) {
        if (hotelPhotos == null || hotelPhotos.isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            List<String> allUrls = hotelPhotos.stream()
                    .filter(hp -> hp != null && hp.getPhoto() != null && hp.getPhoto().getUrl() != null)
                    .map(hp -> hp.getPhoto().getUrl())
                    .distinct()
                    .collect(Collectors.toList());
            
            // Return up to 5 images (skip first one as it's the main image)
            if (allUrls.size() <= 1) {
                return new ArrayList<>();
            }
            
            return allUrls.stream()
                    .skip(1) // Skip main image
                    .limit(5) // Max 5 gallery images
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Error extracting gallery image URLs from hotel photos: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * Extract main image URL from room photos.
     * Returns the first photo URL, or default placeholder if no photos exist.
     * 
     * @param roomPhotos Set of RoomPhoto entities
     * @return Main image URL
     */
    private String extractRoomMainImageUrl(Set<RoomPhoto> roomPhotos) {
        if (roomPhotos == null || roomPhotos.isEmpty()) {
            return defaultPlaceholderImageUrl;
        }
        
        try {
            return roomPhotos.stream()
                    .filter(rp -> rp != null && rp.getPhoto() != null && rp.getPhoto().getUrl() != null)
                    .map(rp -> rp.getPhoto().getUrl())
                    .findFirst()
                    .orElse(defaultPlaceholderImageUrl);
        } catch (Exception e) {
            log.warn("Error extracting main image URL from room photos: {}", e.getMessage());
            return defaultPlaceholderImageUrl;
        }
    }
    
    /**
     * Extract gallery image URLs from room photos (up to 5 best images).
     * Returns list of photo URLs, excluding the main image.
     * 
     * @param roomPhotos Set of RoomPhoto entities
     * @return List of gallery image URLs (max 5)
     */
    private List<String> extractRoomGalleryImageUrls(Set<RoomPhoto> roomPhotos) {
        if (roomPhotos == null || roomPhotos.isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            List<String> allUrls = roomPhotos.stream()
                    .filter(rp -> rp != null && rp.getPhoto() != null && rp.getPhoto().getUrl() != null)
                    .map(rp -> rp.getPhoto().getUrl())
                    .distinct()
                    .collect(Collectors.toList());
            
            // Return up to 5 images (skip first one as it's the main image)
            if (allUrls.size() <= 1) {
                return new ArrayList<>();
            }
            
            return allUrls.stream()
                    .skip(1) // Skip main image
                    .limit(5) // Max 5 gallery images
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Error extracting gallery image URLs from room photos: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * Builds a comprehensive RoomKnowledgeBaseDto from a Room entity.
     * This DTO is used to render the markdown content for Room Detail Knowledge Base.
     */
    public RoomKnowledgeBaseDto buildRoomKB(Room room) {
        if (room == null) {
            throw new IllegalArgumentException("Room cannot be null");
        }
        
        Hotel hotel = room.getHotel();
        if (hotel == null) {
            throw new IllegalArgumentException("Room must have an associated hotel");
        }
        
        // Build location hierarchy from hotel
        LocationHierarchyDto location = buildLocationHierarchy(hotel);
        location.setHotelName(hotel.getName());
        
        // Extract room images
        String mainImageUrl = extractRoomMainImageUrl(room.getPhotos());
        List<String> galleryImageUrls = extractRoomGalleryImageUrls(room.getPhotos());
        
        // Build amenity list for room
        List<String> roomAmenityTags = buildRoomAmenityList(room.getAmenities());
        
        // Infer vibe tags for room
        List<String> vibeTags = inferRoomVibeTags(room);
        
        // Generate keywords
        List<String> keywords = generateRoomKeywords(room, hotel);
        
        // Determine room type and category from name
        String roomType = inferRoomType(room.getName());
        String roomCategory = inferRoomCategory(room);
        
        // Build complete DTO
        return RoomKnowledgeBaseDto.builder()
            .roomId(room.getId())
            .roomName(room.getName())
            .slug(slugService.generateSlug(room.getName() + " " + hotel.getName()))
            .parentHotelSlug(slugService.generateSlug(hotel.getName()))
            .parentHotelId(hotel.getId())
            .roomType(roomType)
            .roomCategory(roomCategory)
            .location(location)
            .bedType(room.getBedType() != null ? room.getBedType().getName() : "N/A")
            .bedTypeId(room.getBedType() != null ? room.getBedType().getId() : null)
            .maxAdults(room.getMaxAdults())
            .maxChildren(room.getMaxChildren())
            .areaSqm(room.getArea())
            .view(room.getView())
            .floorRange(null) // Optional field, can be enhanced later
            .roomAmenityTags(roomAmenityTags)
            .smokingAllowed(room.isSmokingAllowed())
            .wifiAvailable(room.isWifiAvailable())
            .breakfastIncluded(room.isBreakfastIncluded())
            .cancellationPolicy(room.getCancellationPolicy() != null 
                ? room.getCancellationPolicy().getName() 
                : (hotel.getPolicy() != null && hotel.getPolicy().getCancellationPolicy() != null
                    ? hotel.getPolicy().getCancellationPolicy().getName()
                    : "Chính sách tiêu chuẩn"))
            .reschedulePolicy(room.getReschedulePolicy() != null
                ? room.getReschedulePolicy().getName()
                : (hotel.getPolicy() != null && hotel.getPolicy().getReschedulePolicy() != null
                    ? hotel.getPolicy().getReschedulePolicy().getName()
                    : "Chính sách tiêu chuẩn"))
            .quantity(room.getQuantity())
            .status(room.getStatus())
            .basePrice(room.getBasePricePerNight())
            .priceNote("Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống")
            .vibeTags(vibeTags)
            .keywords(keywords)
            .description(buildRoomDescription(room, hotel))
            .mainImageUrl(mainImageUrl)
            .galleryImageUrls(galleryImageUrls)
            .lastUpdated(java.time.LocalDateTime.now())
            .build();
    }
    
    /**
     * Build room amenity list from RoomAmenity relationships
     */
    private List<String> buildRoomAmenityList(Set<com.webapp.holidate.entity.amenity.RoomAmenity> roomAmenities) {
        if (roomAmenities == null || roomAmenities.isEmpty()) {
            return List.of();
        }
        
        return roomAmenities.stream()
            .map(ra -> amenityMappingService.mapToEnglish(ra.getAmenity().getName()))
            .filter(tag -> !tag.isEmpty())
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }
    
    /**
     * Infer room-specific vibe tags based on room features
     */
    private List<String> inferRoomVibeTags(Room room) {
        List<String> vibes = new ArrayList<>();
        
        // Rule 1: Sea/Ocean view
        if (room.getView() != null && (room.getView().contains("ocean") || room.getView().contains("sea") || room.getView().contains("biển"))) {
            vibes.add("sea_view");
        }
        
        // Rule 2: Romantic (bathtub + ocean view)
        if (hasRoomAmenity(room, "bathtub") && vibes.contains("sea_view")) {
            vibes.add("romantic");
            vibes.add("honeymoon");
        }
        
        // Rule 3: Balcony room
        if (hasRoomAmenity(room, "balcony")) {
            vibes.add("balcony_room");
        }
        
        // Rule 4: Luxury (based on room type and amenities)
        String roomType = inferRoomType(room.getName());
        if (roomType != null && (roomType.contains("suite") || 
                                 roomType.contains("villa") ||
                                 roomType.contains("premium"))) {
            vibes.add("luxury");
        }
        
        // Rule 5: Family friendly (if max children > 0)
        if (room.getMaxChildren() > 0) {
            vibes.add("family_friendly");
        }
        
        return vibes.isEmpty() ? List.of("standard") : vibes;
    }
    
    /**
     * Check if room has a specific amenity
     */
    private boolean hasRoomAmenity(Room room, String amenityKey) {
        if (room.getAmenities() == null) {
            return false;
        }
        
        Set<String> roomTags = room.getAmenities().stream()
            .map(ra -> amenityMappingService.mapToEnglish(ra.getAmenity().getName()))
            .collect(Collectors.toSet());
        
        return roomTags.contains(amenityKey);
    }
    
    /**
     * Generate SEO keywords for room
     */
    private List<String> generateRoomKeywords(Room room, Hotel hotel) {
        List<String> keywords = new ArrayList<>();
        
        // Add room name variations
        if (room.getName() != null) {
            keywords.add(room.getName().toLowerCase());
        }
        
        // Add location-based keywords
        if (hotel.getCity() != null) {
            keywords.add("phòng " + hotel.getCity().getName().toLowerCase());
        }
        
        // Add view-based keywords
        if (room.getView() != null) {
            if (room.getView().contains("ocean") || room.getView().contains("sea") || room.getView().contains("biển")) {
                keywords.add("phòng view biển " + (hotel.getCity() != null ? hotel.getCity().getName().toLowerCase() : ""));
            }
        }
        
        // Add bed type keywords
        if (room.getBedType() != null) {
            if (room.getBedType().getName().contains("King")) {
                keywords.add("giường king size");
            }
        }
        
        // Add room type keywords
        String roomType = inferRoomType(room.getName());
        if (roomType != null) {
            keywords.add("phòng " + roomType.toLowerCase());
        }
        
        return keywords.isEmpty() ? List.of("phòng khách sạn", "đặt phòng") : keywords;
    }
    
    /**
     * Infer room type from room name.
     * Updated based on DATA_VALIDATION_REPORT.md with actual API data.
     * 
     * Supports patterns: "Premier Deluxe", "Executive Family", etc.
     * 
     * @param roomName Vietnamese room name (e.g., "Premier Deluxe Triple")
     * @return Room type: "standard" | "superior" | "deluxe" | "suite" | "villa"
     */
    private String inferRoomType(String roomName) {
        if (roomName == null || roomName.trim().isEmpty()) {
            return "standard";
        }
        
        // Normalize Vietnamese accents to ASCII for pattern matching
        String lowerName = roomName.toLowerCase()
            .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
            .replaceAll("[èéẹẻẽêềếệểễ]", "e")
            .replaceAll("[ìíịỉĩ]", "i")
            .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
            .replaceAll("[ùúụủũưừứựửữ]", "u")
            .replaceAll("[ỳýỵỷỹ]", "y")
            .replaceAll("đ", "d");
        
        // Priority order: More specific → Less specific
        
        // Suite / Presidential / Executive
        if (lowerName.contains("presidential") || 
            lowerName.contains("tong thong") ||
            lowerName.contains("suite tong thong") ||
            lowerName.contains("executive suite") ||
            lowerName.contains("executive")) {  // ✅ ADDED: "Executive Family" → "suite"
            return "suite";
        }
        
        // Villa
        if (lowerName.contains("villa") || 
            lowerName.contains("biet thu") ||
            lowerName.contains("bietthu")) {
            return "villa";
        }
        
        // Deluxe / Premium / Superior / Premier
        if (lowerName.contains("deluxe") || 
            lowerName.contains("cao cap") ||
            lowerName.contains("premium") ||
            lowerName.contains("thuong hang") ||
            lowerName.contains("premier")) {  // ✅ ADDED: "Premier Deluxe" → "deluxe"
            return "deluxe";
        }
        
        if (lowerName.contains("superior") || 
            lowerName.contains("hang trung")) {
            return "superior";
        }
        
        // Suite (các trường hợp khác)
        if (lowerName.contains("suite")) {
            return "suite";
        }
        
        // Default
        return "standard";
    }
    
    /**
     * Infer room category based on max adults and children
     */
    private String inferRoomCategory(Room room) {
        if (room.getMaxChildren() > 0) {
            return "family";
        } else if (room.getMaxAdults() == 1) {
            return "single";
        } else if (room.getMaxAdults() == 2) {
            return "double";
        } else {
            return "suite";
        }
    }
    
    /**
     * Build room description from room data.
     * Updated based on DATA_VALIDATION_REPORT.md with improved view parsing.
     * 
     * Handles view format: "Hướng biển, Nhìn ra thành phố"
     * 
     * @param room Room entity
     * @param hotel Hotel entity
     * @return Generated description in Vietnamese
     */
    private String buildRoomDescription(Room room, Hotel hotel) {
        StringBuilder desc = new StringBuilder();
        
        // Title
        desc.append("**").append(room.getName()).append("**");
        
        // View description - improved parsing for composite views
        String view = room.getView();
        if (view != null && !view.trim().isEmpty()) {
            desc.append(" là hạng phòng");
            String viewLower = view.toLowerCase();
            if (viewLower.contains("ocean") || viewLower.contains("sea") || 
                viewLower.contains("bien") || viewLower.contains("biển")) {
                desc.append(" hướng biển");
            } else if (viewLower.contains("garden") || viewLower.contains("vuon") || 
                       viewLower.contains("vườn")) {
                desc.append(" hướng vườn");
            } else if (viewLower.contains("city") || viewLower.contains("thanh pho") ||
                       viewLower.contains("thành phố")) {
                desc.append(" hướng thành phố");
            }
        }
        
        desc.append(" tại ").append(hotel.getName());
        
        // Area
        if (room.getArea() > 0) {
            desc.append(", với diện tích ").append(room.getArea()).append("m²");
        }
        
        // Capacity
        if (room.getMaxAdults() > 0) {
            desc.append(", phù hợp cho tối đa ").append(room.getMaxAdults()).append(" người lớn");
            if (room.getMaxChildren() > 0) {
                desc.append(" và ").append(room.getMaxChildren()).append(" trẻ em");
            }
        }
        
        desc.append(".");
        
        return desc.toString();
    }
    
    /**
     * Inner class to hold policy information during extraction.
     */
    private static class PolicyInfo {
        java.time.LocalTime checkInTime;
        java.time.LocalTime checkOutTime;
        Boolean allowsPayAtHotel = false;
        List<String> requiredDocuments = new ArrayList<>();
        String cancellationPolicyName;
        String reschedulePolicyName;
    }
}

