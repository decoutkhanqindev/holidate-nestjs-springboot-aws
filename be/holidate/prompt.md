## CONTEXT
You are a senior AI/backend engineer working on Holidate, an online hotel booking platform. The system has implemented an AI chatbot that helps users find rooms using natural language. The chatbot relies on a Knowledge Base consisting of Markdown files stored in AWS S3, generated from two templates: `template_hotel_profile.md` and `template_room_detail.md`.

Currently, these templates lack critical information from multiple API endpoints, preventing the chatbot from providing comprehensive responses to user queries about hotels, rooms, availability, pricing, discounts, reviews, and policies.

## PROBLEM STATEMENT
The chatbot cannot effectively respond to queries requiring detailed information because the Knowledge Base templates lack data from these key API endpoints:

1. `/accommodation/hotels/{id}` - Hotel detail endpoint
2. `/accommodation/rooms/{id}` - Room detail endpoint  
3. `/accommodation/rooms/inventories` - Room inventory/availability endpoint
4. `/reviews` - Reviews endpoint
5. `/discounts` - Discounts endpoint
6. `/amenity/amenities` - Amenities endpoint
7. `/policy/cancellation-policies` and `/policy/reschedule-policies` - Policy endpoints

This limitation prevents the chatbot from answering complex questions that require combined information from multiple endpoints.

## OBJECTIVE
Enhance both templates to include comprehensive metadata from ALL relevant API endpoints to enable the chatbot to provide detailed, accurate responses equivalent to making direct API calls to all endpoints above.

## STEP 1: COMPREHENSIVE API ENDPOINT ANALYSIS

### Critical Endpoints and Their Data Requirements

#### A. HOTEL DETAIL ENDPOINT: `GET /accommodation/hotels/{id}`
**Essential Data Fields:**
- Hotel basic info: name, description, address, star rating
- Location hierarchy: country, province, city, district, ward, street
- Amenities (with categories): amenities[].amenities[].name
- Photos with categories: photos[].photos[].url + category
- Policies: check-in/out times, cancellation policy, reschedule policy, pay-at-hotel option
- Entertainment venues nearby: entertainmentVenues[].entertainmentVenues[].name/distance
- Review statistics: total reviews count, average score
- Status and commission rate

#### B. ROOM DETAIL ENDPOINT: `GET /accommodation/rooms/{id}`
**Essential Data Fields:**
- Room specifications: name, view, area, max adults/children
- Bed type information: bedType.name
- Room features: amenities, smoking allowed, wifi, breakfast included
- Policies: cancellation policy, reschedule policy (room-specific or inherited from hotel)
- Photos with categories
- Base price, current price, price notes
- Quantity (total rooms of this type)
- Status (active/inactive/maintenance/closed)

#### C. ROOM INVENTORY ENDPOINT: `GET /accommodation/rooms/inventories`
**Essential Data Fields:**
- Daily availability for next 30 days: date, price, available_quantity, status
- Must support filtering by check-in/check-out dates
- Must include price variations by date
- Must show availability status per date

#### D. REVIEWS ENDPOINT: `GET /reviews?hotel-id={id}`
**Essential Data Fields:**
- Review statistics: total reviews, average score
- Score distribution (9-10, 7-8, 5-6, 3-4, 1-2)
- Recent reviews (without PII): comment snippets, scores
- Review count by period (last 30 days)

#### E. DISCOUNTS ENDPOINT: `GET /discounts?hotel-id={id}&currently-valid=true`
**Essential Data Fields:**
- Active discounts: code, description, percentage, min booking price/count
- Valid date ranges
- Usage limits and times used
- Special day associations

#### F. AMENITIES ENDPOINT: `/amenity/amenities`
**Essential Data Fields:**
- All amenity types with categories
- Free/paid status
- Descriptions for user understanding

#### G. POLICY ENDPOINTS
**Essential Data Fields:**
- Cancellation policy rules: days before check-in, penalty percentage
- Reschedule policy rules: days before check-in, fee percentage
- Hotel-specific vs. room-specific policy inheritance

## STEP 2: TEMPLATE ENHANCEMENT REQUIREMENTS

### A. UPDATE `template_hotel_profile.md`

#### 1. Enhanced YAML Frontmatter
```yaml
# HOTEL DETAIL METADATA (from /accommodation/hotels/{id})
hotel_detail:
  description: "{{hotel_detail.description}}"  # Full description
  star_rating: {{hotel_detail.star_rating}}
  status: "{{hotel_detail.status}}"
  commission_rate: {{hotel_detail.commission_rate}}
  
# POLICIES (from /accommodation/hotels/{id} and policy endpoints)
policies:
  check_in_time: "{{policies.check_in_time}}"
  check_out_time: "{{policies.check_out_time}}"
  allows_pay_at_hotel: {{policies.allows_pay_at_hotel}}
  cancellation_policy:
    name: "{{policies.cancellation_policy.name}}"
    rules:
      {{#policies.cancellation_policy.rules}}
      - days_before_checkin: {{days_before_checkin}}
        penalty_percentage: {{penalty_percentage}}
        description: "{{description}}"
      {{/policies.cancellation_policy.rules}}
  reschedule_policy:
    name: "{{policies.reschedule_policy.name}}"
    rules:
      {{#policies.reschedule_policy.rules}}
      - days_before_checkin: {{days_before_checkin}}
        fee_percentage: {{fee_percentage}}
        description: "{{description}}"
      {{/policies.reschedule_policy.rules}}
  
# REVIEWS METADATA (from /reviews endpoint)
reviews_summary:
  total_reviews: {{reviews_summary.total_reviews}}
  average_score: {{reviews_summary.average_score}}
  score_distribution:
    {{#reviews_summary.score_distribution}}
    - bucket: "{{bucket}}"
      count: {{count}}
    {{/reviews_summary.score_distribution}}
  recent_reviews:
    {{#reviews_summary.recent_reviews}}
    - score: {{score}}
      comment_snippet: "{{comment_snippet}}"
      date: "{{date}}"
    {{/reviews_summary.recent_reviews}}
  
# ACTIVE DISCOUNTS (from /discounts endpoint)
active_discounts:
  {{#active_discounts}}
  - code: "{{code}}"
    description: "{{description}}"
    percentage: {{percentage}}
    min_booking_price: {{min_booking_price}}
    valid_from: "{{valid_from}}"
    valid_to: "{{valid_to}}"
    usage_limit: {{usage_limit}}
    times_used: {{times_used}}
  {{/active_discounts}}
  
# ENTERTAINMENT VENUES (from /accommodation/hotels/{id})
nearby_attractions:
  {{#nearby_attractions}}
  - name: "{{name}}"
    category: "{{category}}"
    distance: "{{distance}}"
    description: "{{description}}"
  {{/nearby_attractions}}
  
# HOTEL AMENITIES WITH CATEGORIES (from /accommodation/hotels/{id} and /amenity/amenities)
hotel_amenities_by_category:
  {{#hotel_amenities_by_category}}
  - category: "{{category}}"
    amenities:
      {{#amenities}}
      - name: "{{name}}"
        free: {{free}}
        description: "{{description}}"
      {{/amenities}}
  {{/hotel_amenities_by_category}}
```

#### 2. Body Content Enhancements
- Add detailed "📋 Chính Sách Khách Sạn" section with full cancellation/reschedule rules
- Add "🎁 Khuyến Mãi Đang Có" section listing active discounts
- Add "⭐ Đánh Giá Khách Hàng" section with score distribution and recent review snippets
- Add "🎯 Tiện Ích Theo Danh Mục" section organizing amenities by categories
- Add "📍 Địa Điểm Lân Cận Chi Tiết" with categorized entertainment venues

### B. UPDATE `template_room_detail.md`

#### 1. Enhanced YAML Frontmatter
```yaml
# ROOM DETAIL METADATA (from /accommodation/rooms/{id})
room_detail:
  description: "{{room_detail.description}}"
  area_sqm: {{room_detail.area_sqm}}
  bed_type: "{{room_detail.bed_type}}"
  status: "{{room_detail.status}}"
  
# ROOM-SPECIFIC POLICIES (from room detail, falling back to hotel policies)
room_policies:
  smoking_allowed: {{room_policies.smoking_allowed}}
  wifi_available: {{room_policies.wifi_available}}
  breakfast_included: {{room_policies.breakfast_included}}
  cancellation_policy:
    {{#room_policies.cancellation_policy}}
    name: "{{name}}"
    inherited: {{inherited}}
    rules:
      {{#rules}}
      - days_before_checkin: {{days_before_checkin}}
        penalty_percentage: {{penalty_percentage}}
      {{/rules}}
    {{/room_policies.cancellation_policy}}
  reschedule_policy:
    {{#room_policies.reschedule_policy}}
    name: "{{name}}"
    inherited: {{inherited}}
    rules:
      {{#rules}}
      - days_before_checkin: {{days_before_checkin}}
        fee_percentage: {{fee_percentage}}
      {{/rules}}
    {{/room_policies.reschedule_policy}}

# DAILY INVENTORY FOR NEXT 30 DAYS (from /accommodation/rooms/inventories)
inventory_calendar:
  {{#inventory_calendar}}
  - date: "{{date}}"
    price: {{price}}
    available_rooms: {{available_rooms}}
    status: "{{status}}"
    is_weekend: {{is_weekend}}
    is_holiday: {{is_holiday}}
  {{/inventory_calendar}}
  
# PRICE ANALYTICS
price_analytics:
  min_price_next_30_days: {{price_analytics.min_price_next_30_days}}
  max_price_next_30_days: {{price_analytics.max_price_next_30_days}}
  avg_price_next_30_days: {{price_analytics.avg_price_next_30_days}}
  price_volatility: "{{price_analytics.price_volatility}}"  # low/medium/high
  weekend_price_multiplier: {{price_analytics.weekend_price_multiplier}}
  
# ROOM AMENITIES WITH DETAILS (from room detail and amenities endpoint)
room_amenities_detailed:
  {{#room_amenities_detailed}}
  - name: "{{name}}"
    category: "{{category}}"
    free: {{free}}
    description: "{{description}}"
    icon: "{{icon}}"
  {{/room_amenities_detailed}}
```

#### 2. Body Content Enhancements
- Add "📅 Lịch Tồn Kho & Giá" section showing availability and price variations
- Add "💰 Phân Tích Giá" section explaining price patterns (weekend surges, holiday pricing)
- Add "📋 Chính Sách Phòng Chi Tiết" with room-specific cancellation/reschedule rules
- Add "✨ Tiện Nghi Chi Tiết" with categorized room amenities and descriptions
- Add "📊 Khả Năng Còn Phòng" section explaining booking likelihood based on current inventory

## STEP 3: BACKEND CODE CHANGES

### A. Extend DTOs
```java
// HotelKnowledgeBaseDto.java - Add these fields
private HotelDetailDto hotelDetail;
private PolicySummaryDto policies;
private ReviewSummaryDto reviewsSummary;
private List<ActiveDiscountDto> activeDiscounts;
private List<NearbyAttractionDto> nearbyAttractions;
private List<AmenityCategoryDto> hotelAmenitiesByCategory;

// RoomKnowledgeBaseDto.java - Add these fields
private RoomDetailDto roomDetail;
private RoomPolicyDto roomPolicies;
private List<RoomInventoryDto> inventoryCalendar;
private PriceAnalyticsDto priceAnalytics;
private List<DetailedAmenityDto> roomAmenitiesDetailed;
```

### B. Update Service Layer
```java
// KnowledgeBaseGenerationService.java - New methods
public HotelDetailDto fetchHotelDetail(String hotelId) {
    // Call /accommodation/hotels/{id} endpoint
}

public PolicySummaryDto fetchHotelPolicies(String hotelId) {
    // Call policy endpoints and aggregate
}

public ReviewSummaryDto fetchHotelReviews(String hotelId) {
    // Call /reviews?hotel-id={id} endpoint
}

public List<ActiveDiscountDto> fetchActiveDiscounts(String hotelId) {
    // Call /discounts?hotel-id={id}&currently-valid=true endpoint
}

public RoomDetailDto fetchRoomDetail(String roomId) {
    // Call /accommodation/rooms/{id} endpoint
}

public List<RoomInventoryDto> fetchRoomInventories(String roomId, LocalDate startDate, LocalDate endDate) {
    // Call /accommodation/rooms/inventories endpoint
}
```

### C. Extend Template Context Building
```java
// buildTemplateContext() - Add policy details
ctx.put("policies", Map.of(
    "check_in_time", hotel.getPolicies().getCheckInTime(),
    "check_out_time", hotel.getPolicies().getCheckOutTime(),
    "allows_pay_at_hotel", hotel.getPolicies().isAllowsPayAtHotel(),
    "cancellation_policy", buildCancellationPolicyContext(hotel.getPolicies().getCancellationPolicy()),
    "reschedule_policy", buildReschedulePolicyContext(hotel.getPolicies().getReschedulePolicy())
));

// buildRoomTemplateContext() - Add inventory calendar
ctx.put("inventory_calendar", room.getInventoryCalendar().stream()
    .map(inv -> Map.of(
        "date", inv.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
        "price", inv.getPrice(),
        "available_rooms", inv.getAvailableRooms(),
        "status", inv.getStatus(),
        "is_weekend", isWeekend(inv.getDate()),
        "is_holiday", isHoliday(inv.getDate())
    ))
    .collect(Collectors.toList()));
```

## STEP 4: CHATBOT CAPABILITIES REQUIREMENTS

After these enhancements, the chatbot MUST be able to respond to complex queries combining data from multiple endpoints:

1. **Pricing + Availability Queries:**  
   "What's the price for a room with ocean view at Grand Mercure Danang from July 1-5 for 2 adults?"  
   → Requires room inventory data + room details + hotel details

2. **Policy + Discount Queries:**  
   "Can I cancel a booking with the 'Early Bird Discount' if I cancel 2 days before check-in?"  
   → Requires policy rules + discount details

3. **Review-Based Queries:**  
   "What do guests say about the breakfast at this hotel?"  
   → Requires review data + hotel amenities

4. **Complex Filter Queries:**  
   "Show me family-friendly hotels in Da Nang with a pool and free cancellation"  
   → Requires hotel details + amenities + policies + location data

5. **Booking Simulation Queries:**  
   "If I book 2 rooms for 4 adults from July 10-15, what would be the total price with all applicable discounts?"  
   → Requires inventory data + pricing + discounts + room specifications

## STEP 5: QUALITY ASSURANCE REQUIREMENTS

### Validation Tests
For each hotel and room in the system, validate that:
1. All required metadata fields from API endpoints are present in the YAML frontmatter
2. No sensitive PII data is included in the Knowledge Base files
3. Date formats follow ISO standards (YYYY-MM-DD)
4. Price values are accurate and include currency
5. Policy rules match exactly what's returned by API endpoints
6. Inventory data covers exactly the next 30 days from generation date
7. All URLs (photos, etc.) are properly escaped and functional

### Performance Requirements
1. Template generation must complete within 2 seconds per hotel
2. Room inventory data must be fetched efficiently using batch queries
3. Must handle hotels with 100+ rooms without timeout
4. Must implement caching for static data (amenities, policy rules)

## CRITICAL IMPLEMENTATION NOTES
1. **Data Freshness:** Inventory data must be regenerated daily; static data (descriptions, policies) can be updated less frequently
2. **Security:** Never include sensitive fields like commission rates in public-facing templates
3. **Backward Compatibility:** Preserve existing template structure while adding new fields
4. **Error Handling:** If a specific endpoint fails, log the error but continue generating the template with available data
5. **Localization:** All content must be in Vietnamese but metadata keys must be in English for AI processing

## FINAL DELIVERABLE REQUIREMENTS
1. Updated `template_hotel_profile.md` containing data from ALL required hotel endpoints
2. Updated `template_room_detail.md` containing data from ALL required room endpoints
3. Backend service modifications to fetch and transform data from all endpoints
4. S3 upload logic that maintains the correct file structure
5. Comprehensive unit tests validating data accuracy across all endpoints