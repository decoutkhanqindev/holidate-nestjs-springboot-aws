package com.webapp.holidate.service.knowledgebase;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.webapp.holidate.dto.knowledgebase.HotelKnowledgeBaseDto;
import com.webapp.holidate.dto.knowledgebase.LocationHierarchyDto;
import com.webapp.holidate.dto.knowledgebase.NearbyVenueDto;
import com.webapp.holidate.dto.knowledgebase.PriceReferenceDto;
import com.webapp.holidate.dto.knowledgebase.ReviewStatsDto;
import com.webapp.holidate.dto.knowledgebase.RoomSummaryDto;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.amenity.HotelAmenity;
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
    
    /**
     * Build complete Knowledge Base DTO for a hotel.
     * This method aggregates all hotel information into a single DTO.
     * 
     * @param hotel Hotel entity (must have relationships loaded)
     * @return Complete HotelKnowledgeBaseDto
     */
    @Transactional(readOnly = true)
    public HotelKnowledgeBaseDto buildHotelKB(Hotel hotel) {
        if (hotel == null) {
            throw new IllegalArgumentException("Hotel cannot be null");
        }
        
        log.debug("Building Knowledge Base DTO for hotel: {} ({})", hotel.getName(), hotel.getId());
        
        try {
            // Build location hierarchy
            LocationHierarchyDto location = buildLocationHierarchy(hotel);
            
            // Get price reference
            PriceReferenceDto priceReference = getPriceReference(hotel.getId());
            
            // Get review statistics
            ReviewStatsDto reviewStats = getReviewStats(hotel.getId());
            
            // Build amenity list
            List<String> amenities = buildAmenityList(hotel.getAmenities());
            
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
            
            // Build complete DTO
            return HotelKnowledgeBaseDto.builder()
                    .hotelId(hotel.getId())
                    .slug(slugService.generateSlug(hotel.getName()))
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
                    .reviewScore(reviewStats != null && reviewStats.getAverageScore() != null 
                            ? reviewStats.getAverageScore() : 0.0)
                    .reviewCount(reviewStats != null && reviewStats.getTotalReviews() != null 
                            ? reviewStats.getTotalReviews() : 0L)
                    .vibeTagsInferred(vibeTags)
                    .locationTags(locationTags)
                    .tags(buildAllTags(vibeTags, locationTags, amenities))
                    .lastUpdated(java.time.LocalDateTime.now())
                    .build();
                    
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
     * Ensures null-safety: if no reviews exist, returns default values (0.0, 0L).
     */
    private ReviewStatsDto getReviewStats(String hotelId) {
        try {
            ReviewStatsDto stats = knowledgeBaseRepository.getReviewStatsByHotelId(hotelId);
            // Ensure null-safety: if query returns null or has null values, use defaults
            if (stats == null) {
                return ReviewStatsDto.builder()
                        .averageScore(0.0)
                        .totalReviews(0L)
                        .build();
            }
            // Ensure individual fields are not null
            if (stats.getAverageScore() == null) {
                stats.setAverageScore(0.0);
            }
            if (stats.getTotalReviews() == null) {
                stats.setTotalReviews(0L);
            }
            return stats;
        } catch (Exception e) {
            log.warn("Failed to get review stats for hotel {}: {}", hotelId, e.getMessage());
            return ReviewStatsDto.builder()
                    .averageScore(0.0)
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
     */
    private List<RoomSummaryDto> buildRoomSummaries(Set<Room> rooms) {
        if (rooms == null || rooms.isEmpty()) {
            return new ArrayList<>();
        }
        
        return rooms.stream()
                .filter(room -> AccommodationStatusType.ACTIVE.getValue().equalsIgnoreCase(room.getStatus()))
                .map(room -> RoomSummaryDto.builder()
                        .name(room.getName())
                        .area(room.getArea())
                        .view(room.getView())
                        .bedType(room.getBedType() != null ? room.getBedType().getName() : "N/A")
                        .maxAdults(room.getMaxAdults())
                        .maxChildren(room.getMaxChildren())
                        .smokingAllowed(room.isSmokingAllowed())
                        .wifiAvailable(room.isWifiAvailable())
                        .breakfastIncluded(room.isBreakfastIncluded())
                        .build())
                .collect(Collectors.toList());
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
                                .distance(formatDistance(hev.getDistance()))
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
     * Format distance in meters to human-readable format.
     */
    private Double formatDistance(double distanceInMeters) {
        return distanceInMeters;
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

