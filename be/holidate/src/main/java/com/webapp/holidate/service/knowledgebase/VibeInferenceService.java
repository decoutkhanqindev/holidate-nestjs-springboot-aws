package com.webapp.holidate.service.knowledgebase;

import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for inferring "vibe" tags for hotels based on amenities, star rating,
 * location, and pricing. These tags help categorize hotels by experience type.
 * 
 * Vibe Categories:
 * - luxury: High-end hotels with premium amenities
 * - romantic: Couples-focused with spa, romantic settings
 * - family_friendly: Amenities for kids and families
 * - business: Meeting rooms, business centers
 * - beach_resort: Near beach with resort amenities
 * - budget_friendly: Affordable pricing
 * - boutique: Unique, small-scale hotels
 * - eco_friendly: Sustainable, nature-focused
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VibeInferenceService {
    
    private final AmenityMappingService amenityMappingService;
    
    // Price thresholds (VND)
    private static final double LUXURY_MIN_PRICE = 3_000_000.0;
    private static final double BUDGET_MAX_PRICE = 500_000.0;
    
    /**
     * Infer vibe tags for a hotel based on its characteristics.
     * 
     * @param hotel Hotel entity with amenities, rooms, and location
     * @return List of vibe tags
     */
    public List<String> inferVibeTags(Hotel hotel) {
        if (hotel == null) {
            return Collections.emptyList();
        }
        
        Set<String> vibes = new HashSet<>();
        
        // Get English amenity tags for analysis
        Set<String> amenityTags = hotel.getAmenities().stream()
                .map(ha -> amenityMappingService.mapToEnglish(ha.getAmenity().getName()))
                .collect(Collectors.toSet());
        
        // Get price range
        OptionalDouble minPrice = hotel.getRooms().stream()
                .filter(room -> "active".equalsIgnoreCase(room.getStatus()))
                .mapToDouble(Room::getBasePricePerNight)
                .min();
        
        // Rule 1: Luxury
        if (isLuxury(hotel, amenityTags, minPrice)) {
            vibes.add("luxury");
        }
        
        // Rule 2: Romantic
        if (isRomantic(hotel, amenityTags)) {
            vibes.add("romantic");
        }
        
        // Rule 3: Family Friendly
        if (isFamilyFriendly(amenityTags)) {
            vibes.add("family_friendly");
        }
        
        // Rule 4: Business
        if (isBusiness(amenityTags)) {
            vibes.add("business");
        }
        
        // Rule 5: Beach Resort
        if (isBeachResort(hotel, amenityTags)) {
            vibes.add("beach_resort");
        }
        
        // Rule 6: Budget Friendly
        if (isBudgetFriendly(minPrice)) {
            vibes.add("budget_friendly");
        }
        
        // Rule 7: Boutique
        if (isBoutique(hotel)) {
            vibes.add("boutique");
        }
        
        // Rule 8: Eco Friendly
        if (isEcoFriendly(hotel, amenityTags)) {
            vibes.add("eco_friendly");
        }
        
        // If no vibes detected, add generic tag
        if (vibes.isEmpty()) {
            vibes.add("standard");
        }
        
        // Limit to maximum 5 tags with priority logic
        List<String> prioritizedVibes = prioritizeAndLimitVibes(new ArrayList<>(vibes), hotel, minPrice);
        
        log.debug("Inferred vibes for hotel {}: {} (limited to 5)", hotel.getName(), prioritizedVibes);
        
        return prioritizedVibes;
    }
    
    /**
     * Prioritize and limit vibe tags to maximum 5.
     * Priority order:
     * 1. luxury (if price > 3tr or 5-star)
     * 2. family_friendly (if has kids_club)
     * 3. romantic (if has spa/massage and 4+ stars)
     * 4. beach_resort (if near beach with resort amenities)
     * 5. business (if has meeting rooms)
     * 6. boutique (if small and unique)
     * 7. eco_friendly (if eco-related)
     * 8. budget_friendly (if low price)
     * 
     * @param vibes All detected vibe tags
     * @param hotel Hotel entity
     * @param minPrice Optional minimum price
     * @return Prioritized list with maximum 5 tags
     */
    private List<String> prioritizeAndLimitVibes(List<String> vibes, Hotel hotel, OptionalDouble minPrice) {
        if (vibes.size() <= 5) {
            return vibes;
        }
        
        List<String> prioritized = new ArrayList<>();
        
        // Priority 1: Luxury (high price or 5-star)
        if (vibes.contains("luxury")) {
            prioritized.add("luxury");
        }
        
        // Priority 2: Family friendly (if has kids_club)
        if (vibes.contains("family_friendly")) {
            prioritized.add("family_friendly");
        }
        
        // Priority 3: Romantic (spa/massage + 4+ stars)
        if (vibes.contains("romantic")) {
            prioritized.add("romantic");
        }
        
        // Priority 4: Beach resort (near beach with amenities)
        if (vibes.contains("beach_resort")) {
            prioritized.add("beach_resort");
        }
        
        // Priority 5: Business (meeting rooms)
        if (vibes.contains("business") && prioritized.size() < 5) {
            prioritized.add("business");
        }
        
        // Priority 6: Boutique (small and unique)
        if (vibes.contains("boutique") && prioritized.size() < 5) {
            prioritized.add("boutique");
        }
        
        // Priority 7: Eco friendly
        if (vibes.contains("eco_friendly") && prioritized.size() < 5) {
            prioritized.add("eco_friendly");
        }
        
        // Priority 8: Budget friendly (only if no luxury)
        if (vibes.contains("budget_friendly") && !prioritized.contains("luxury") && prioritized.size() < 5) {
            prioritized.add("budget_friendly");
        }
        
        // If still not 5, add remaining vibes in order
        for (String vibe : vibes) {
            if (prioritized.size() >= 5) {
                break;
            }
            if (!prioritized.contains(vibe)) {
                prioritized.add(vibe);
            }
        }
        
        return prioritized;
    }
    
    /**
     * Check if hotel is luxury-tier.
     * Criteria: 5-star OR has luxury amenities OR high price point
     */
    private boolean isLuxury(Hotel hotel, Set<String> amenityTags, OptionalDouble minPrice) {
        // High star rating
        if (hotel.getStarRating() >= 5) {
            return true;
        }
        
        // Has luxury amenities
        List<String> luxuryAmenities = Arrays.asList(
                "spa", "fine_dining", "butler", "concierge", "jacuzzi", 
                "infinity_pool", "private_butler", "hot_tub", "valet_parking"
        );
        
        long luxuryAmenityCount = amenityTags.stream()
                .filter(tag -> luxuryAmenities.stream()
                        .anyMatch(luxury -> tag.contains(luxury)))
                .count();
        
        if (luxuryAmenityCount >= 2) {
            return true;
        }
        
        // High price point
        return minPrice.isPresent() && minPrice.getAsDouble() >= LUXURY_MIN_PRICE;
    }
    
    /**
     * Check if hotel is romantic/couples-focused.
     * Criteria: spa + massage OR beach/mountain location + 4+ stars
     */
    private boolean isRomantic(Hotel hotel, Set<String> amenityTags) {
        boolean hasSpa = amenityTags.stream().anyMatch(tag -> tag.contains("spa"));
        boolean hasMassage = amenityTags.stream().anyMatch(tag -> tag.contains("massage"));
        boolean hasCoupleAmenities = hasSpa || hasMassage;
        
        if (hasCoupleAmenities && hotel.getStarRating() >= 4) {
            return true;
        }
        
        // Check for romantic location (beach or mountain)
        if (hotel.getCity() != null) {
            String cityName = hotel.getCity().getName().toLowerCase();
            boolean romanticLocation = cityName.contains("biển") || 
                                        cityName.contains("đà lạt") || 
                                        cityName.contains("phú quốc");
            
            return romanticLocation && hotel.getStarRating() >= 4;
        }
        
        return false;
    }
    
    /**
     * Check if hotel is family-friendly.
     * Criteria: has kids club, kids pool, or playground
     */
    private boolean isFamilyFriendly(Set<String> amenityTags) {
        List<String> familyAmenities = Arrays.asList(
                "kids_club", "kids_pool", "playground", "family_room", 
                "babysitting", "children", "kids"
        );
        
        return amenityTags.stream()
                .anyMatch(tag -> familyAmenities.stream()
                        .anyMatch(family -> tag.contains(family)));
    }
    
    /**
     * Check if hotel is business-oriented.
     * Criteria: has meeting room or business center
     */
    private boolean isBusiness(Set<String> amenityTags) {
        List<String> businessAmenities = Arrays.asList(
                "meeting_room", "business_center", "conference", 
                "boardroom", "secretary", "business"
        );
        
        return amenityTags.stream()
                .anyMatch(tag -> businessAmenities.stream()
                        .anyMatch(business -> tag.contains(business)));
    }
    
    /**
     * Check if hotel is a beach resort.
     * Criteria: near beach (entertainment venues) AND has resort amenities
     */
    private boolean isBeachResort(Hotel hotel, Set<String> amenityTags) {
        // Check if near beach
        boolean nearBeach = false;
        if (hotel.getEntertainmentVenues() != null) {
            nearBeach = hotel.getEntertainmentVenues().stream()
                    .anyMatch(hev -> hev.getEntertainmentVenue() != null &&
                            hev.getEntertainmentVenue().getName().toLowerCase().contains("biển"));
        }
        
        if (!nearBeach && hotel.getCity() != null) {
            nearBeach = hotel.getCity().getName().toLowerCase().contains("biển");
        }
        
        // Check for resort amenities
        List<String> resortAmenities = Arrays.asList(
                "swimming_pool", "beach", "spa", "restaurant", "bar"
        );
        
        long resortAmenityCount = amenityTags.stream()
                .filter(tag -> resortAmenities.stream()
                        .anyMatch(resort -> tag.contains(resort)))
                .count();
        
        return nearBeach && resortAmenityCount >= 2;
    }
    
    /**
     * Check if hotel is budget-friendly.
     * Criteria: low minimum price
     */
    private boolean isBudgetFriendly(OptionalDouble minPrice) {
        return minPrice.isPresent() && minPrice.getAsDouble() <= BUDGET_MAX_PRICE;
    }
    
    /**
     * Check if hotel is boutique-style.
     * Criteria: small hotel (few rooms) with unique character
     */
    private boolean isBoutique(Hotel hotel) {
        // Check room count
        long activeRoomCount = hotel.getRooms().stream()
                .filter(room -> "active".equalsIgnoreCase(room.getStatus()))
                .count();
        
        // Boutique hotels typically have < 50 rooms
        if (activeRoomCount > 50) {
            return false;
        }
        
        // Check if hotel name suggests boutique character
        String hotelName = hotel.getName().toLowerCase();
        return hotelName.contains("boutique") || 
               hotelName.contains("villa") || 
               hotelName.contains("heritage") ||
               (activeRoomCount <= 20 && hotel.getStarRating() >= 4);
    }
    
    /**
     * Check if hotel is eco-friendly.
     * Criteria: eco-related amenities or garden/nature setting
     */
    private boolean isEcoFriendly(Hotel hotel, Set<String> amenityTags) {
        List<String> ecoAmenities = Arrays.asList(
                "eco", "green", "organic", "sustainable", "solar", "recycling"
        );
        
        boolean hasEcoAmenities = amenityTags.stream()
                .anyMatch(tag -> ecoAmenities.stream()
                        .anyMatch(eco -> tag.contains(eco)));
        
        // Check hotel name for eco indicators
        String hotelName = hotel.getName().toLowerCase();
        boolean hasEcoName = hotelName.contains("eco") || 
                              hotelName.contains("green") || 
                              hotelName.contains("nature");
        
        return hasEcoAmenities || hasEcoName;
    }
}

