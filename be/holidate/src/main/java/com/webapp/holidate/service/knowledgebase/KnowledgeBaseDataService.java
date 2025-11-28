package com.webapp.holidate.service.knowledgebase;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.webapp.holidate.dto.knowledgebase.ActiveDiscountDto;
import com.webapp.holidate.dto.knowledgebase.PolicyDetailDto;
import com.webapp.holidate.dto.knowledgebase.PriceAnalyticsDto;
import com.webapp.holidate.dto.knowledgebase.ReviewSummaryDto;
import com.webapp.holidate.dto.knowledgebase.RoomInventoryCalendarDto;
import com.webapp.holidate.entity.accommodation.room.Room;
import com.webapp.holidate.entity.accommodation.room.RoomInventory;
import com.webapp.holidate.entity.booking.Review;
import com.webapp.holidate.entity.discount.HotelDiscount;
import com.webapp.holidate.entity.policy.HotelPolicy;
import com.webapp.holidate.entity.policy.cancelation.CancellationPolicy;
import com.webapp.holidate.entity.policy.cancelation.CancellationRule;
import com.webapp.holidate.entity.policy.reschedule.ReschedulePolicy;
import com.webapp.holidate.entity.policy.reschedule.RescheduleRule;
import com.webapp.holidate.repository.accommodation.room.RoomInventoryRepository;
import com.webapp.holidate.repository.booking.ReviewRepository;
import com.webapp.holidate.repository.discount.HotelDiscountRepository;

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
                    .map(inv -> RoomInventoryCalendarDto.builder()
                            .date(inv.getId().getDate())
                            .price(inv.getPrice())
                            .availableRooms(inv.getAvailableRooms())
                            .status(inv.getStatus())
                            .isWeekend(isWeekend(inv.getId().getDate()))
                            .isHoliday(false) // TODO: Implement holiday detection
                            .build())
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

