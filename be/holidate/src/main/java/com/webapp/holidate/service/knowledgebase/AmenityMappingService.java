package com.webapp.holidate.service.knowledgebase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for mapping Vietnamese amenity names to standardized English tags.
 * Provides consistent naming for knowledge base generation and AI processing.
 * 
 * This service maintains a mapping dictionary and falls back to snake_case
 * conversion for unmapped amenities.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AmenityMappingService {
    
    private final SlugService slugService;
    
    // Static mapping of Vietnamese amenity names to English tags
    private static final Map<String, String> AMENITY_MAPPING = new HashMap<>();
    
    static {
        // Common Hotel Amenities
        AMENITY_MAPPING.put("wifi", "wifi");
        AMENITY_MAPPING.put("wi-fi", "wifi");
        AMENITY_MAPPING.put("wifi miễn phí", "free_wifi");
        AMENITY_MAPPING.put("bãi đậu xe", "parking");
        AMENITY_MAPPING.put("bể bơi", "swimming_pool");
        AMENITY_MAPPING.put("hồ bơi", "swimming_pool");
        AMENITY_MAPPING.put("nhà hàng", "restaurant");
        AMENITY_MAPPING.put("phòng gym", "gym");
        AMENITY_MAPPING.put("trung tâm thể dục", "fitness_center");
        AMENITY_MAPPING.put("spa", "spa");
        AMENITY_MAPPING.put("massage", "massage");
        AMENITY_MAPPING.put("sauna", "sauna");
        AMENITY_MAPPING.put("bar", "bar");
        AMENITY_MAPPING.put("quầy bar", "bar");
        AMENITY_MAPPING.put("lễ tân 24/7", "24h_reception");
        AMENITY_MAPPING.put("lễ tân 24h", "24h_reception");
        AMENITY_MAPPING.put("dịch vụ phòng", "room_service");
        AMENITY_MAPPING.put("dịch vụ giặt ủi", "laundry_service");
        AMENITY_MAPPING.put("trung tâm hội nghị", "conference_room");
        AMENITY_MAPPING.put("phòng họp", "meeting_room");
        AMENITY_MAPPING.put("trung tâm kinh doanh", "business_center");
        AMENITY_MAPPING.put("sân tennis", "tennis_court");
        AMENITY_MAPPING.put("sân golf", "golf_course");
        AMENITY_MAPPING.put("khu vui chơi trẻ em", "kids_club");
        AMENITY_MAPPING.put("câu lạc bộ trẻ em", "kids_club");
        AMENITY_MAPPING.put("bể bơi trẻ em", "kids_pool");
        AMENITY_MAPPING.put("sân chơi", "playground");
        AMENITY_MAPPING.put("dịch vụ đưa đón sân bay", "airport_shuttle");
        AMENITY_MAPPING.put("đưa đón sân bay", "airport_shuttle");
        AMENITY_MAPPING.put("cho phép thú cưng", "pet_friendly");
        AMENITY_MAPPING.put("chấp nhận thú cưng", "pet_friendly");
        AMENITY_MAPPING.put("điều hòa", "air_conditioning");
        AMENITY_MAPPING.put("máy lạnh", "air_conditioning");
        AMENITY_MAPPING.put("két sắt", "safe_box");
        AMENITY_MAPPING.put("tủ an toàn", "safe_box");
        AMENITY_MAPPING.put("minibar", "minibar");
        AMENITY_MAPPING.put("quầy bar mini", "minibar");
        AMENITY_MAPPING.put("bữa sáng miễn phí", "free_breakfast");
        AMENITY_MAPPING.put("bãi biển riêng", "private_beach");
        AMENITY_MAPPING.put("view biển", "sea_view");
        AMENITY_MAPPING.put("nhìn ra biển", "sea_view");
        AMENITY_MAPPING.put("view núi", "mountain_view");
        AMENITY_MAPPING.put("nhìn ra núi", "mountain_view");
        AMENITY_MAPPING.put("ban công", "balcony");
        AMENITY_MAPPING.put("sân hiên", "terrace");
        AMENITY_MAPPING.put("thang máy", "elevator");
        AMENITY_MAPPING.put("máy sấy tóc", "hair_dryer");
        AMENITY_MAPPING.put("tv màn hình phẳng", "flat_screen_tv");
        AMENITY_MAPPING.put("tivi", "tv");
        AMENITY_MAPPING.put("bồn tắm", "bathtub");
        AMENITY_MAPPING.put("vòi sen", "shower");
        AMENITY_MAPPING.put("máy pha cà phê", "coffee_maker");
        AMENITY_MAPPING.put("ấm đun nước", "electric_kettle");
        AMENITY_MAPPING.put("bếp nấu", "kitchen");
        AMENITY_MAPPING.put("nhà bếp", "kitchenette");
        AMENITY_MAPPING.put("tủ lạnh", "refrigerator");
        AMENITY_MAPPING.put("lò vi sóng", "microwave");
        AMENITY_MAPPING.put("máy giặt", "washing_machine");
        
        // Luxury Amenities
        AMENITY_MAPPING.put("nhà hàng cao cấp", "fine_dining");
        AMENITY_MAPPING.put("butler", "butler_service");
        AMENITY_MAPPING.put("concierge", "concierge");
        AMENITY_MAPPING.put("phục vụ riêng", "private_butler");
        AMENITY_MAPPING.put("massage đôi", "couple_massage");
        AMENITY_MAPPING.put("hồ bơi vô cực", "infinity_pool");
        AMENITY_MAPPING.put("jacuzzi", "jacuzzi");
        AMENITY_MAPPING.put("bồn tắm nước nóng", "hot_tub");
        
        // Business Amenities
        AMENITY_MAPPING.put("máy in", "printer");
        AMENITY_MAPPING.put("máy fax", "fax_machine");
        AMENITY_MAPPING.put("phòng hội nghị", "conference_hall");
        AMENITY_MAPPING.put("dịch vụ thư ký", "secretary_service");
    }
    
    /**
     * Map a single Vietnamese amenity name to English tag.
     * Falls back to snake_case conversion if not found in mapping.
     * 
     * @param vietnameseName Vietnamese amenity name
     * @return English tag in snake_case format
     */
    public String mapToEnglish(String vietnameseName) {
        if (vietnameseName == null || vietnameseName.trim().isEmpty()) {
            return "";
        }
        
        String normalized = vietnameseName.toLowerCase().trim();
        
        // Check exact match first
        if (AMENITY_MAPPING.containsKey(normalized)) {
            return AMENITY_MAPPING.get(normalized);
        }
        
        // Check partial match (for composite names)
        for (Map.Entry<String, String> entry : AMENITY_MAPPING.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                log.debug("Partial match found: '{}' -> '{}'", vietnameseName, entry.getValue());
                return entry.getValue();
            }
        }
        
        // Fallback to slug conversion
        String fallback = slugService.toSnakeCase(vietnameseName);
        log.debug("No mapping found for '{}', using fallback: '{}'", vietnameseName, fallback);
        return fallback;
    }
    
    /**
     * Map a collection of Vietnamese amenity names to English tags.
     * 
     * @param vietnameseNames Collection of Vietnamese amenity names
     * @return List of unique English tags
     */
    public List<String> mapToEnglishList(Collection<String> vietnameseNames) {
        if (vietnameseNames == null || vietnameseNames.isEmpty()) {
            return Collections.emptyList();
        }
        
        return vietnameseNames.stream()
                .map(this::mapToEnglish)
                .filter(tag -> !tag.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
    
    /**
     * Check if an amenity tag matches any of the specified tags.
     * Useful for vibe inference logic.
     * 
     * @param amenityTag English amenity tag
     * @param tagsToCheck List of tags to check against
     * @return true if match found
     */
    public boolean matchesAnyTag(String amenityTag, List<String> tagsToCheck) {
        if (amenityTag == null || tagsToCheck == null) {
            return false;
        }
        
        String normalized = amenityTag.toLowerCase();
        return tagsToCheck.stream()
                .anyMatch(tag -> normalized.contains(tag.toLowerCase()) || 
                                  tag.toLowerCase().contains(normalized));
    }
}

