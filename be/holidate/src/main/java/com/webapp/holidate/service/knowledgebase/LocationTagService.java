package com.webapp.holidate.service.knowledgebase;

import com.webapp.holidate.entity.accommodation.Hotel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for generating location-based tags for hotels.
 * Creates hierarchical location tags for better searchability and categorization.
 * 
 * Example output for a hotel in Da Nang:
 * ["vietnam", "da_nang", "son_tra_district", "beach_area"]
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LocationTagService {
    
    private final SlugService slugService;
    
    /**
     * Generate location tags from hotel location hierarchy.
     * 
     * @param hotel Hotel entity with location relationships
     * @return List of location tags in snake_case format
     */
    public List<String> generateLocationTags(Hotel hotel) {
        List<String> tags = new ArrayList<>();
        
        if (hotel == null) {
            return tags;
        }
        
        // Add country tag
        if (hotel.getCountry() != null) {
            String countrySlug = slugService.toSnakeCase(hotel.getCountry().getName());
            tags.add(countrySlug);
        }
        
        // Add province tag
        if (hotel.getProvince() != null) {
            String provinceSlug = slugService.toSnakeCase(hotel.getProvince().getName());
            tags.add(provinceSlug);
        }
        
        // Add city tag (most important for searches)
        if (hotel.getCity() != null) {
            String citySlug = slugService.toSnakeCase(hotel.getCity().getName());
            tags.add(citySlug);
            
            // Add special city-based tags
            tags.addAll(inferCitySpecificTags(hotel.getCity().getName()));
        }
        
        // Add district tag
        if (hotel.getDistrict() != null) {
            String districtSlug = slugService.toSnakeCase(hotel.getDistrict().getName());
            tags.add(districtSlug);
            
            // Add district-specific location tags
            tags.addAll(inferDistrictTags(hotel.getDistrict().getName()));
        }
        
        // Add ward tag
        if (hotel.getWard() != null) {
            String wardSlug = slugService.toSnakeCase(hotel.getWard().getName());
            tags.add(wardSlug);
        }
        
        // Add nearby landmark tags from entertainment venues
        if (hotel.getEntertainmentVenues() != null && !hotel.getEntertainmentVenues().isEmpty()) {
            tags.addAll(extractNearbyLandmarkTags(hotel));
        }
        
        // Remove duplicates and return
        return tags.stream()
                .distinct()
                .collect(Collectors.toList());
    }
    
    /**
     * Infer special tags based on city name.
     * Examples: "biển" -> "beach_city", "miền núi" -> "mountain_city"
     */
    private List<String> inferCitySpecificTags(String cityName) {
        List<String> tags = new ArrayList<>();
        
        if (cityName == null) {
            return tags;
        }
        
        String lowerName = cityName.toLowerCase();
        
        // Coastal cities
        if (lowerName.contains("đà nẵng") || lowerName.contains("da nang")) {
            tags.add("beach_city");
            tags.add("central_vietnam");
        } else if (lowerName.contains("nha trang")) {
            tags.add("beach_city");
            tags.add("resort_city");
        } else if (lowerName.contains("vũng tàu") || lowerName.contains("vung tau")) {
            tags.add("beach_city");
            tags.add("southern_vietnam");
        } else if (lowerName.contains("phú quốc") || lowerName.contains("phu quoc")) {
            tags.add("island");
            tags.add("beach_destination");
        }
        
        // Mountain cities
        else if (lowerName.contains("đà lạt") || lowerName.contains("da lat")) {
            tags.add("mountain_city");
            tags.add("highland");
        } else if (lowerName.contains("sapa") || lowerName.contains("sa pa")) {
            tags.add("mountain_city");
            tags.add("northern_vietnam");
        }
        
        // Major cities
        else if (lowerName.contains("hà nội") || lowerName.contains("ha noi") || lowerName.contains("hanoi")) {
            tags.add("capital");
            tags.add("northern_vietnam");
            tags.add("cultural_center");
        } else if (lowerName.contains("hồ chí minh") || lowerName.contains("ho chi minh") || 
                   lowerName.contains("sài gòn") || lowerName.contains("saigon")) {
            tags.add("southern_vietnam");
            tags.add("business_hub");
            tags.add("metropolitan");
        }
        
        // Historic cities
        else if (lowerName.contains("huế") || lowerName.contains("hue")) {
            tags.add("historic_city");
            tags.add("unesco_site");
            tags.add("central_vietnam");
        } else if (lowerName.contains("hội an") || lowerName.contains("hoi an")) {
            tags.add("ancient_town");
            tags.add("unesco_site");
            tags.add("central_vietnam");
        }
        
        return tags;
    }
    
    /**
     * Infer tags based on district name.
     * Examples: district near beach, downtown district, etc.
     */
    private List<String> inferDistrictTags(String districtName) {
        List<String> tags = new ArrayList<>();
        
        if (districtName == null) {
            return tags;
        }
        
        String lowerName = districtName.toLowerCase();
        
        // Beach districts
        if (lowerName.contains("sơn trà") || lowerName.contains("son tra")) {
            tags.add("beach_area");
            tags.add("scenic_area");
        } else if (lowerName.contains("bãi biển") || lowerName.contains("beach")) {
            tags.add("beachfront");
        }
        
        // Central/Downtown areas
        if (lowerName.contains("trung tâm") || lowerName.contains("center") || 
            lowerName.contains("quận 1") || lowerName.contains("district 1") ||
            lowerName.contains("hoàn kiếm") || lowerName.contains("hoan kiem")) {
            tags.add("city_center");
            tags.add("downtown");
        }
        
        // Airport areas
        if (lowerName.contains("sân bay") || lowerName.contains("airport")) {
            tags.add("airport_area");
        }
        
        return tags;
    }
    
    /**
     * Extract landmark tags from nearby entertainment venues.
     */
    private List<String> extractNearbyLandmarkTags(Hotel hotel) {
        List<String> tags = new ArrayList<>();
        
        if (hotel.getEntertainmentVenues() == null) {
            return tags;
        }
        
        hotel.getEntertainmentVenues().forEach(hev -> {
            if (hev.getEntertainmentVenue() != null) {
                String venueName = hev.getEntertainmentVenue().getName().toLowerCase();
                
                // Check for famous landmarks
                if (venueName.contains("biển") || venueName.contains("beach")) {
                    tags.add("near_beach");
                } else if (venueName.contains("sân bay") || venueName.contains("airport")) {
                    tags.add("near_airport");
                } else if (venueName.contains("chợ") || venueName.contains("market")) {
                    tags.add("near_market");
                } else if (venueName.contains("bảo tàng") || venueName.contains("museum")) {
                    tags.add("near_museum");
                } else if (venueName.contains("công viên") || venueName.contains("park")) {
                    tags.add("near_park");
                } else if (venueName.contains("trung tâm mua sắm") || venueName.contains("shopping")) {
                    tags.add("near_shopping");
                }
            }
        });
        
        return tags;
    }
}

