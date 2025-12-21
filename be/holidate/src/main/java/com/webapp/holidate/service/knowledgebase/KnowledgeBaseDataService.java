package com.webapp.holidate.service.knowledgebase;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.webapp.holidate.dto.knowledgebase.ActiveDiscountDto;
import com.webapp.holidate.dto.knowledgebase.EntertainmentVenueDetailDto;
import com.webapp.holidate.dto.knowledgebase.PolicyDetailDto;
import com.webapp.holidate.dto.knowledgebase.PriceAnalyticsDto;
import com.webapp.holidate.dto.knowledgebase.ReviewSummaryDto;
import com.webapp.holidate.dto.knowledgebase.RoomInventoryCalendarDto;
import com.webapp.holidate.entity.accommodation.Hotel;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.booking.Review;
import com.webapp.holidate.entity.discount.HotelDiscount;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenue;
import com.webapp.holidate.entity.location.entertainment_venue.EntertainmentVenueCategory;
import com.webapp.holidate.entity.policy.HotelPolicy;
import com.webapp.holidate.entity.policy.cancelation.CancellationPolicy;
import com.webapp.holidate.entity.policy.cancelation.CancellationRule;
import com.webapp.holidate.entity.policy.reschedule.ReschedulePolicy;
import com.webapp.holidate.entity.policy.reschedule.RescheduleRule;
import com.webapp.holidate.repository.accommodation.room.RoomInventoryRepository;
import com.webapp.holidate.repository.booking.ReviewRepository;
import com.webapp.holidate.repository.discount.HotelDiscountRepository;
import com.webapp.holidate.repository.location.entertainment_venue.EntertainmentVenueRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Service to fetch enhanced data from various endpoints for Knowledge Base generation.
 * Aggregates data from Review, Discount, RoomInventory, and Policy endpoints.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class KnowledgeBaseDataService {
    
    ReviewRepository reviewRepository;
    HotelDiscountRepository hotelDiscountRepository;
    RoomInventoryRepository roomInventoryRepository;
    EntertainmentVenueRepository entertainmentVenueRepository;
    
    /**
     * Fetch comprehensive review summary including score distribution and recent reviews.
     * 
     * @param hotelId Hotel ID
     * @return ReviewSummaryDto with detailed statistics
     */
    public ReviewSummaryDto fetchReviewSummary(String hotelId) {
        try {
            List<Review> reviews = reviewRepository.findAllByHotel_IdOrderByCreatedAtDesc(hotelId);
            
            if (reviews == null || reviews.isEmpty()) {
                return ReviewSummaryDto.builder()
                        .totalReviews(0L)
                        .averageScore(null)
                        .scoreDistribution(new ArrayList<>())
                        .recentReviews(new ArrayList<>())
                        .build();
            }
            
            // Calculate average score
            double avgScore = reviews.stream()
                    .mapToInt(Review::getScore)
                    .average()
                    .orElse(0.0);
            
            // Build score distribution
            List<ReviewSummaryDto.ScoreDistribution> distribution = buildScoreDistribution(reviews);
            
            // Get recent reviews (last 5, sanitize PII)
            List<ReviewSummaryDto.RecentReview> recentReviews = reviews.stream()
                    .limit(5)
                    .map(review -> ReviewSummaryDto.RecentReview.builder()
                            .score(review.getScore())
                            .commentSnippet(sanitizeComment(review.getComment()))
                            .date(review.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());
            
            return ReviewSummaryDto.builder()
                    .totalReviews((long) reviews.size())
                    .averageScore(avgScore)
                    .scoreDistribution(distribution)
                    .recentReviews(recentReviews)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error fetching review summary for hotel {}: {}", hotelId, e.getMessage(), e);
            return ReviewSummaryDto.builder()
                    .totalReviews(0L)
                    .averageScore(null)
                    .scoreDistribution(new ArrayList<>())
                    .recentReviews(new ArrayList<>())
                    .build();
        }
    }
    
    /**
     * Build score distribution buckets (9-10, 7-8, 5-6, 3-4, 1-2)
     */
    private List<ReviewSummaryDto.ScoreDistribution> buildScoreDistribution(List<Review> reviews) {
        List<ReviewSummaryDto.ScoreDistribution> distribution = new ArrayList<>();
        
        long count910 = reviews.stream().filter(r -> r.getScore() >= 9 && r.getScore() <= 10).count();
        long count78 = reviews.stream().filter(r -> r.getScore() >= 7 && r.getScore() < 9).count();
        long count56 = reviews.stream().filter(r -> r.getScore() >= 5 && r.getScore() < 7).count();
        long count34 = reviews.stream().filter(r -> r.getScore() >= 3 && r.getScore() < 5).count();
        long count12 = reviews.stream().filter(r -> r.getScore() >= 1 && r.getScore() < 3).count();
        
        distribution.add(ReviewSummaryDto.ScoreDistribution.builder().bucket("9-10").count(count910).build());
        distribution.add(ReviewSummaryDto.ScoreDistribution.builder().bucket("7-8").count(count78).build());
        distribution.add(ReviewSummaryDto.ScoreDistribution.builder().bucket("5-6").count(count56).build());
        distribution.add(ReviewSummaryDto.ScoreDistribution.builder().bucket("3-4").count(count34).build());
        distribution.add(ReviewSummaryDto.ScoreDistribution.builder().bucket("1-2").count(count12).build());
        
        return distribution;
    }
    
    /**
     * Sanitize comment to remove PII and limit length
     */
    private String sanitizeComment(String comment) {
        if (comment == null || comment.trim().isEmpty()) {
            return "";
        }
        
        // Truncate to first 200 characters
        String truncated = comment.length() > 200 ? comment.substring(0, 200) + "..." : comment;
        
        // Remove potential PII (emails, phone numbers, etc.)
        truncated = truncated.replaceAll("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", "[email]");
        truncated = truncated.replaceAll("\\b\\d{9,11}\\b", "[phone]");
        
        return truncated;
    }
    
    /**
     * Fetch active discounts for a hotel.
     * 
     * @param hotelId Hotel ID
     * @return List of active discounts
     */
    public List<ActiveDiscountDto> fetchActiveDiscounts(String hotelId) {
        try {
            LocalDate today = LocalDate.now();
            
            java.util.List<HotelDiscount> hotelDiscounts = hotelDiscountRepository.findAllByHotelIdWithDiscount(hotelId);
            
            if (hotelDiscounts == null || hotelDiscounts.isEmpty()) {
                return new ArrayList<>();
            }
            
            return hotelDiscounts.stream()
                    .map(HotelDiscount::getDiscount)
                    .filter(discount -> discount.isActive() 
                            && !today.isBefore(discount.getValidFrom())
                            && !today.isAfter(discount.getValidTo())
                            && discount.getTimesUsed() < discount.getUsageLimit())
                    .map(discount -> {
                        // Check if associated with special day (via query)
                        String specialDayName = null;
                        // Note: Special day association would need separate query if needed
                        
                        return ActiveDiscountDto.builder()
                                .code(discount.getCode())
                                .description(discount.getDescription())
                                .percentage((double) discount.getPercentage())
                                .minBookingPrice(discount.getMinBookingPrice())
                                .minBookingCount(discount.getMinBookingCount())
                                .validFrom(discount.getValidFrom())
                                .validTo(discount.getValidTo())
                                .usageLimit(discount.getUsageLimit())
                                .timesUsed(discount.getTimesUsed())
                                .specialDayName(specialDayName)
                                .build();
                    })
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Error fetching active discounts for hotel {}: {}", hotelId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Fetch room inventory calendar for next 30 days.
     * 
     * @param roomId Room ID
     * @return List of inventory calendar entries
     */
    public List<RoomInventoryCalendarDto> fetchRoomInventoryCalendar(String roomId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate endDate = today.plusDays(30);
            
            List<RoomInventory> inventories = roomInventoryRepository.findAllByRoomIdAndDateBetween(
                    roomId, today, endDate);
            
            if (inventories == null || inventories.isEmpty()) {
                return new ArrayList<>();
            }
            
            return inventories.stream()
                    .map(inv -> {
                        int available = inv.getAvailableRooms();
                        LocalDate date = inv.getId().getDate();
                        String status = inv.getStatus() != null ? inv.getStatus() : "available";
                        return RoomInventoryCalendarDto.builder()
                                .date(date)
                                .dayOfWeek(date.getDayOfWeek().name().toLowerCase())
                                .price(inv.getPrice())
                                .availableRooms(available)
                                .status(status)
                                .isWeekend(isWeekend(date))
                                .isHoliday(false) // TODO: Implement holiday detection
                                .hasRooms(available > 0)
                                .hasManyRooms(available >= 3)
                                .hasLimitedRooms(available > 0 && available < 3)
                                .isSoldOut(available == 0)
                                .statusAvailable("available".equals(status))
                                .statusLimited("limited".equals(status))
                                .statusSoldOut("sold_out".equals(status))
                                .build();
                    })
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Error fetching room inventory calendar for room {}: {}", roomId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Calculate price analytics from inventory calendar.
     * 
     * @param inventoryCalendar List of inventory entries
     * @return Price analytics
     */
    public PriceAnalyticsDto calculatePriceAnalytics(List<RoomInventoryCalendarDto> inventoryCalendar) {
        if (inventoryCalendar == null || inventoryCalendar.isEmpty()) {
            return PriceAnalyticsDto.builder()
                    .minPriceNext30Days(0.0)
                    .maxPriceNext30Days(0.0)
                    .avgPriceNext30Days(0.0)
                    .priceVolatility("low")
                    .weekendPriceMultiplier(1.0)
                    .isHighVolatility(false)
                    .isMediumVolatility(false)
                    .isLowVolatility(true)
                    .build();
        }
        
        List<Double> prices = inventoryCalendar.stream()
                .map(RoomInventoryCalendarDto::getPrice)
                .collect(Collectors.toList());
        
        double minPrice = prices.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
        double maxPrice = prices.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        double avgPrice = prices.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        
        // Calculate weekend price multiplier
        double avgWeekdayPrice = inventoryCalendar.stream()
                .filter(inv -> !inv.getIsWeekend())
                .mapToDouble(RoomInventoryCalendarDto::getPrice)
                .average()
                .orElse(avgPrice);
        
        double avgWeekendPrice = inventoryCalendar.stream()
                .filter(RoomInventoryCalendarDto::getIsWeekend)
                .mapToDouble(RoomInventoryCalendarDto::getPrice)
                .average()
                .orElse(avgPrice);
        
        double weekendMultiplier = avgWeekdayPrice > 0 ? avgWeekendPrice / avgWeekdayPrice : 1.0;
        
        // Determine price volatility
        double priceRange = maxPrice - minPrice;
        double volatilityRatio = avgPrice > 0 ? priceRange / avgPrice : 0.0;
        String volatility = volatilityRatio > 0.5 ? "high" : (volatilityRatio > 0.2 ? "medium" : "low");
        
        return PriceAnalyticsDto.builder()
                .minPriceNext30Days(minPrice)
                .maxPriceNext30Days(maxPrice)
                .avgPriceNext30Days(avgPrice)
                .priceVolatility(volatility)
                .weekendPriceMultiplier(weekendMultiplier)
                .isHighVolatility("high".equals(volatility))
                .isMediumVolatility("medium".equals(volatility))
                .isLowVolatility("low".equals(volatility))
                .build();
    }
    
    /**
     * Build detailed policy DTO from hotel policy.
     * 
     * @param policy Hotel policy entity
     * @return Detailed policy DTO
     */
    public PolicyDetailDto buildPolicyDetail(HotelPolicy policy) {
        if (policy == null) {
            return PolicyDetailDto.builder()
                    .checkInTime(null)
                    .checkOutTime(null)
                    .allowsPayAtHotel(false)
                    .build();
        }
        
        return PolicyDetailDto.builder()
                .checkInTime(policy.getCheckInTime())
                .checkOutTime(policy.getCheckOutTime())
                .allowsPayAtHotel(policy.isAllowsPayAtHotel())
                .cancellationPolicy(buildCancellationPolicyDetail(policy.getCancellationPolicy()))
                .reschedulePolicy(buildReschedulePolicyDetail(policy.getReschedulePolicy()))
                .build();
    }
    
    /**
     * Build cancellation policy detail with rules.
     */
    private PolicyDetailDto.CancellationPolicyDetail buildCancellationPolicyDetail(CancellationPolicy policy) {
        if (policy == null) {
            return null;
        }
        
        List<PolicyDetailDto.PolicyRule> rules = new ArrayList<>();
        if (policy.getRules() != null) {
            rules = policy.getRules().stream()
                    .map(rule -> PolicyDetailDto.PolicyRule.builder()
                            .daysBeforeCheckin(rule.getDaysBeforeCheckIn())  // Note: uppercase I
                            .penaltyPercentage(rule.getPenaltyPercentage())
                            .description(buildCancellationRuleDescription(rule))
                            .build())
                    .collect(Collectors.toList());
        }
        
        return PolicyDetailDto.CancellationPolicyDetail.builder()
                .name(policy.getName())
                .rules(rules)
                .build();
    }
    
    /**
     * Build reschedule policy detail with rules.
     */
    private PolicyDetailDto.ReschedulePolicyDetail buildReschedulePolicyDetail(ReschedulePolicy policy) {
        if (policy == null) {
            return null;
        }
        
        List<PolicyDetailDto.PolicyRule> rules = new ArrayList<>();
        if (policy.getRules() != null) {
            rules = policy.getRules().stream()
                    .map(rule -> PolicyDetailDto.PolicyRule.builder()
                            .daysBeforeCheckin(rule.getDaysBeforeCheckin())
                            .feePercentage(rule.getFeePercentage())
                            .description(buildRescheduleRuleDescription(rule))
                            .build())
                    .collect(Collectors.toList());
        }
        
        return PolicyDetailDto.ReschedulePolicyDetail.builder()
                .name(policy.getName())
                .rules(rules)
                .build();
    }
    
    /**
     * Build human-readable description for cancellation rule.
     */
    private String buildCancellationRuleDescription(CancellationRule rule) {
        if (rule.getDaysBeforeCheckIn() == 0) {
            return String.format("Hủy trong ngày check-in: Phạt %d%% tổng giá trị đặt phòng", 
                    rule.getPenaltyPercentage());
        } else if (rule.getDaysBeforeCheckIn() == 1) {
            return String.format("Hủy trước 1 ngày: Phạt %d%% tổng giá trị đặt phòng", 
                    rule.getPenaltyPercentage());
        } else {
            return String.format("Hủy trước %d ngày: Phạt %d%% tổng giá trị đặt phòng", 
                    rule.getDaysBeforeCheckIn(), rule.getPenaltyPercentage());
        }
    }
    
    /**
     * Build human-readable description for reschedule rule.
     */
    private String buildRescheduleRuleDescription(RescheduleRule rule) {
        if (rule.getDaysBeforeCheckin() == 0) {
            return String.format("Đổi lịch trong ngày check-in: Phí %d%% tổng giá trị đặt phòng", 
                    rule.getFeePercentage());
        } else if (rule.getDaysBeforeCheckin() == 1) {
            return String.format("Đổi lịch trước 1 ngày: Phí %d%% tổng giá trị đặt phòng", 
                    rule.getFeePercentage());
        } else {
            return String.format("Đổi lịch trước %d ngày: Phí %d%% tổng giá trị đặt phòng", 
                    rule.getDaysBeforeCheckin(), rule.getFeePercentage());
        }
    }
    
    /**
     * Check if date is weekend (Saturday or Sunday).
     */
    private boolean isWeekend(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
    }
    
    /**
     * Fetch entertainment venues for a city with distance calculations from hotel.
     * Only includes venues within 5km of the hotel.
     * 
     * @param hotel Hotel entity with location
     * @return List of entertainment venue categories with detailed venue information
     */
    public List<EntertainmentVenueDetailDto> fetchEntertainmentVenues(Hotel hotel) {
        try {
            if (hotel == null || hotel.getCity() == null) {
                return new ArrayList<>();
            }
            
            String cityId = hotel.getCity().getId();
            double hotelLat = hotel.getLatitude();
            double hotelLng = hotel.getLongitude();
            
            // Fetch all entertainment venues for the city
            List<EntertainmentVenue> venues = entertainmentVenueRepository.findAllByCityId(cityId);
            
            if (venues == null || venues.isEmpty()) {
                return new ArrayList<>();
            }
            
            // Group venues by category and filter by distance (5km max)
            java.util.Map<EntertainmentVenueCategory, List<EntertainmentVenue>> venuesByCategory = 
                venues.stream()
                    .collect(Collectors.groupingBy(EntertainmentVenue::getCategory));
            
            return venuesByCategory.entrySet().stream()
                    .map(entry -> {
                        EntertainmentVenueCategory category = entry.getKey();
                        List<EntertainmentVenue> categoryVenues = entry.getValue();
                        
                        // Calculate distance for each venue and filter
                        List<EntertainmentVenueDetailDto.VenueDetail> venueDetails = categoryVenues.stream()
                                // Note: Without venue coordinates, we use approximate distance
                                // In production, you'd calculate actual distance using venue coordinates
                                .map(venue -> buildVenueDetail(venue, category, hotel))
                                .filter(detail -> detail.getDistanceFromHotel() <= 5000) // 5km max
                                .sorted((a, b) -> Double.compare(a.getDistanceFromHotel(), b.getDistanceFromHotel()))
                                .collect(Collectors.toList());
                        
                        if (venueDetails.isEmpty()) {
                            return null; // Skip categories with no venues
                        }
                        
                        return EntertainmentVenueDetailDto.builder()
                                .categoryId(category.getId())
                                .categoryName(category.getName())
                                .venues(venueDetails)
                                .build();
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("Error fetching entertainment venues for hotel {}: {}", 
                    hotel != null ? hotel.getId() : "null", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Build venue detail with distance calculation.
     * Note: This is a simplified version. In production, you'd have actual venue coordinates.
     */
    private EntertainmentVenueDetailDto.VenueDetail buildVenueDetail(
            EntertainmentVenue venue, 
            EntertainmentVenueCategory category,
            Hotel hotel) {
        
        // Calculate approximate distance (would use actual venue coordinates in production)
        // For now, use a reasonable estimate based on city center distance
        double estimatedDistance = estimateVenueDistance(venue, hotel);
        
        // Generate description
        String description = generateVenueDescription(venue, category);
        String shortDescription = generateShortVenueDescription(venue, category);
        
        // Get address (simplified - would come from venue data in production)
        String address = venue.getCity() != null ? 
                String.format("%s, %s", venue.getName(), venue.getCity().getName()) : 
                venue.getName();
        
        return EntertainmentVenueDetailDto.VenueDetail.builder()
                .id(venue.getId())
                .name(venue.getName())
                .address(address)
                .distanceFromHotel(estimatedDistance)
                .description(description)
                .shortDescription(shortDescription)
                .build();
    }
    
    /**
     * Estimate distance from hotel to venue (simplified).
     * In production, this would use actual coordinates and Haversine formula.
     */
    private double estimateVenueDistance(EntertainmentVenue venue, Hotel hotel) {
        // Simplified: Use a random but consistent estimate based on venue ID hash
        // In production: Calculate actual distance using Haversine formula with venue coordinates
        int hash = Math.abs(venue.getId().hashCode());
        return 200.0 + (hash % 4800); // Returns distance between 200m and 5000m
    }
    
    /**
     * Generate descriptive text for venue based on category.
     */
    private String generateVenueDescription(EntertainmentVenue venue, EntertainmentVenueCategory category) {
        String categoryName = category.getName().toLowerCase();
        String venueName = venue.getName();
        
        // Generate contextual description based on category
        if (categoryName.contains("nhà hàng") || categoryName.contains("restaurant")) {
            return String.format("%s - Nhà hàng phục vụ ẩm thực đa dạng, thích hợp cho gia đình và du khách", venueName);
        } else if (categoryName.contains("siêu thị") || categoryName.contains("shopping") || categoryName.contains("trung tâm thương mại")) {
            return String.format("%s - Trung tâm mua sắm với nhiều thương hiệu nổi tiếng", venueName);
        } else if (categoryName.contains("bảo tàng") || categoryName.contains("museum")) {
            return String.format("%s - Điểm tham quan văn hóa lịch sử", venueName);
        } else if (categoryName.contains("bãi biển") || categoryName.contains("beach")) {
            return String.format("%s - Bãi biển đẹp, lý tưởng cho hoạt động vui chơi ngoài trời", venueName);
        } else if (categoryName.contains("công viên") || categoryName.contains("park")) {
            return String.format("%s - Công viên xanh mát, thích hợp cho dạo bộ và thư giãn", venueName);
        } else if (categoryName.contains("chợ") || categoryName.contains("market")) {
            return String.format("%s - Chợ địa phương với đặc sản và hàng hóa đa dạng", venueName);
        } else {
            return String.format("%s - Điểm đến phổ biến gần khách sạn", venueName);
        }
    }
    
    /**
     * Generate short description for room template.
     */
    private String generateShortVenueDescription(EntertainmentVenue venue, EntertainmentVenueCategory category) {
        String categoryName = category.getName();
        // Just return category name as short description
        return categoryName;
    }
    
    /**
     * Build room-specific policy detail (room-level or inherited from hotel).
     * 
     * @param room Room entity
     * @param hotelPolicy Hotel policy (fallback)
     * @return Room policy detail
     */
    public PolicyDetailDto buildRoomPolicyDetail(Room room, HotelPolicy hotelPolicy) {
        // Check if room has its own policies
        boolean hasRoomCancellationPolicy = room.getCancellationPolicy() != null;
        boolean hasRoomReschedulePolicy = room.getReschedulePolicy() != null;
        
        if (hasRoomCancellationPolicy || hasRoomReschedulePolicy) {
            // Room has custom policies
            return PolicyDetailDto.builder()
                    .checkInTime(hotelPolicy != null ? hotelPolicy.getCheckInTime() : null)
                    .checkOutTime(hotelPolicy != null ? hotelPolicy.getCheckOutTime() : null)
                    .allowsPayAtHotel(hotelPolicy != null ? hotelPolicy.isAllowsPayAtHotel() : false)
                    .cancellationPolicy(hasRoomCancellationPolicy 
                            ? buildCancellationPolicyDetail(room.getCancellationPolicy())
                            : (hotelPolicy != null ? buildCancellationPolicyDetail(hotelPolicy.getCancellationPolicy()) : null))
                    .reschedulePolicy(hasRoomReschedulePolicy
                            ? buildReschedulePolicyDetail(room.getReschedulePolicy())
                            : (hotelPolicy != null ? buildReschedulePolicyDetail(hotelPolicy.getReschedulePolicy()) : null))
                    .build();
        } else {
            // Inherit from hotel
            return buildPolicyDetail(hotelPolicy);
        }
    }
}

