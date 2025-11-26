---
# ============================================================
# YAML FRONTMATTER - METADATA FOR VECTOR DB & FILTERING
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "hotel_profile"
doc_id: "{{doc_id}}"  # Source: curl_step_2.1 -> data.id (GET /accommodation/hotels/{id})
slug: "{{slug}}"  # Source: Generated from curl_step_2.1 -> data.name
last_updated: "{{last_updated}}"  # Source: curl_step_2.1 -> data.updatedAt (fallback to createdAt if null)
language: "vi"

# === LOCATION HIERARCHY ===
# Source: curl_step_2.1 -> data.country/province/city/district/ward/street
location:
  country: "{{location.country}}"  # Source: curl_step_2.1 -> data.country.name
  country_code: "{{location.country_code}}"  # Source: curl_step_2.1 -> data.country.code
  province: "{{location.province}}"  # Source: curl_step_2.1 -> data.province.name
  province_name: "{{location.province_name}}"  # Source: curl_step_2.1 -> data.province.name
  city: "{{location.city}}"  # Source: curl_step_2.1 -> data.city.name
  city_name: "{{location.city_name}}"  # Source: curl_step_2.1 -> data.city.name
  district: "{{location.district}}"  # Source: curl_step_2.1 -> data.district.name
  district_name: "{{location.district_name}}"  # Source: curl_step_2.1 -> data.district.name
  ward: "{{location.ward}}"  # Source: curl_step_2.1 -> data.ward.name
  ward_name: "{{location.ward_name}}"  # Source: curl_step_2.1 -> data.ward.name
  street: "{{location.street}}"  # Source: curl_step_2.1 -> data.street.name
  street_name: "{{location.street_name}}"  # Source: curl_step_2.1 -> data.street.name
  address: "{{location.address}}"  # Source: curl_step_2.1 -> data.address
  coordinates:
    lat: {{location.coordinates.lat}}  # Source: curl_step_2.1 -> data.latitude
    lng: {{location.coordinates.lng}}  # Source: curl_step_2.1 -> data.longitude

# === SEARCH OPTIMIZATION TAGS ===
# Source: Generated from location + entertainment venues
location_tags:
{{#location_tags}}
  - "{{.}}"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
{{/location_tags}}

# Source: curl_step_2.1 -> data.amenities[] -> amenity.name (Vietnamese)
# Mapped to English via AmenityMappingService using curl_step_2.5 (all amenities) as reference
amenity_tags:
{{#amenity_tags}}
  - "{{.}}"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
{{/amenity_tags}}

# Source: Inferred from star_rating + amenities + location + price range
vibe_tags:
{{#vibe_tags}}
  - "{{.}}"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
{{/vibe_tags}}

# === PRICING REFERENCE (STATIC) ===
# Source: curl_step_2.2 -> data.content[] -> MIN(basePricePerNight) where status='active'
reference_min_price: {{reference_min_price}}  # VNĐ - Source: MIN from curl_step_2.2
reference_min_price_room: "{{reference_min_price_room}}"  # Source: Room.name of cheapest room from curl_step_2.2
reference_max_price: {{reference_max_price}}  # VNĐ - Source: MAX from curl_step_2.2 (optional)

# === HOTEL CLASSIFICATION ===
# Source: curl_step_2.1 -> data.starRating
star_rating: {{star_rating}}

# === BUSINESS METADATA ===
hotel_id: "{{hotel_id}}"  # Source: curl_step_2.1 -> data.id
partner_id: "{{partner_id}}"  # Source: curl_step_2.1 -> data.partner.id
status: "{{status}}"  # Source: curl_step_2.1 -> data.status

# === PERFORMANCE STATS ===
# Source: curl_step_2.2 -> data.content.length (total rooms)
total_rooms: {{total_rooms}}  # Source: curl_step_2.2 -> data.totalItems
available_room_types: {{available_room_types}}  # Source: curl_step_2.2 -> COUNT(DISTINCT data.content[].name)

# Source: curl_step_2.3 -> Aggregated from reviews
review_score: {{review_score}}  # Source: curl_step_2.3 -> AVG(data.content[].score) or null if empty
review_count: {{review_count}}  # Source: curl_step_2.3 -> data.totalItems

# === NEARBY ATTRACTIONS ===
# Source: curl_step_2.1 -> data.entertainmentVenues[] OR curl_step_2.4 -> data[].entertainmentVenues[]
nearby_venues:
{{#nearby_venues}}
  - name: "{{name}}"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "{{distance}}"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "{{category}}"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: "{{description}}"  # Optional: Generated from category + distance
{{/nearby_venues}}

# === POLICIES ===
# Source: curl_step_2.1 -> data.policy
check_in_time: "{{check_in_time}}"  # Source: curl_step_2.1 -> data.policy.checkInTime (format: "HH:mm:ss")
check_out_time: "{{check_out_time}}"  # Source: curl_step_2.1 -> data.policy.checkOutTime
early_check_in_available: {{early_check_in_available}}  # Source: Check if amenity "EARLY_CHECK_IN" exists in curl_step_2.1 -> data.amenities
late_check_out_available: {{late_check_out_available}}  # Source: Check if amenity "Trả phòng muộn" exists
cancellation_policy: "{{cancellation_policy}}"  # Source: curl_step_2.1 -> data.policy.cancellationPolicy.name
reschedule_policy: "{{reschedule_policy}}"  # Source: curl_step_2.1 -> data.policy.reschedulePolicy.name
allows_pay_at_hotel: {{allows_pay_at_hotel}}  # Source: curl_step_2.1 -> data.policy.allowsPayAtHotel
smoking_policy: "{{smoking_policy}}"  # Source: Inferred from hotel-level amenities or default "Không hút thuốc"

# === IMAGES ===
mainImageUrl: "{{mainImageUrl}}"  # Source: curl_step_2.1 -> data.photos[].photos[0].url (first photo, or filter by category name="main")
galleryImageUrls:
{{#galleryImageUrls}}
  - "{{.}}"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)

# === SEO KEYWORDS ===
keywords:
{{#keywords}}
  - "{{.}}"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
{{/keywords}}

---

# 🏨 {{name}} - {{tagline}}

![{{name}}]({{mainImageUrl}})

## 📖 Giới Thiệu

{{description}}  # Source: curl_step_2.1 -> data.description

{{#review_count}}
> 🌟 **Điểm nổi bật**: Được {{review_count}} du khách đánh giá **{{review_score}}/10** điểm - "{{review_rating_label}}" về dịch vụ, vị trí và tiện nghi.
{{/review_count}}
{{^review_count}}
> 🌟 **Điểm nổi bật**: Khách sạn {{star_rating}} sao với vị trí thuận tiện và tiện nghi đầy đủ.
{{/review_count}}

---

## ⭐ Đặc Điểm Nổi Bật

### 🏖️ 1. Vị Trí
- **{{location.address}}**, {{location.street_name}}, {{location.ward_name}}, {{location.district_name}}, {{location.city_name}}
{{#nearby_venues}}
- **{{name}}**: {{distance}}  # Source: curl_step_2.1 -> data.entertainmentVenues
{{/nearby_venues}}

### 💎 2. Tiện Nghi Khách Sạn
{{#amenity_tags}}
- {{.}}  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
{{/amenity_tags}}

### 👨‍👩‍👧‍👦 3. Thân Thiện Với Gia Đình
{{#vibe_tags}}
{{#. == "family_friendly"}}
- Phù hợp cho gia đình có trẻ em
{{/.}}
{{/vibe_tags}}

---

## 🛏️ Hạng Phòng Đa Dạng

Khách sạn cung cấp {{available_room_types}} loại phòng chính:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|
{{#rooms}}  # Source: curl_step_2.2 -> data.content[]
| **{{name}}** | {{area}}m²      | {{view}}      | {{maxAdults}} người lớn{{#maxChildren}} + {{maxChildren}} trẻ em{{/maxChildren}} | {{#breakfastIncluded}}Bữa sáng miễn phí{{/breakfastIncluded}}{{#wifiAvailable}} WiFi miễn phí{{/wifiAvailable}} |
{{/rooms}}

---

## 💰 Thông Tin Giá Tham Khảo

**Giá khởi điểm**: Từ **{{reference_min_price}} VNĐ**/đêm  
*(Áp dụng cho phòng **{{reference_min_price_room}}**, 1-2 khách)*

{{#reference_max_price}}
**Giá cao nhất**: Khoảng **{{reference_max_price}} VNĐ**/đêm  
{{/reference_max_price}}

> ⚠️ **Disclaimer quan trọng**:  
> Giá trên là **mức tham khảo từ giá cơ bản** của khách sạn. Giá thực tế sẽ dao động theo:
> 
> - 📅 **Thời gian đặt**: Cuối tuần/ngày lễ cao hơn 30-50%
> - 🌡️ **Mùa du lịch**: Tháng 4-8 (mùa cao điểm) và Tết Nguyên Đán
> - 🎯 **Chương trình khuyến mãi**: Early bird, last minute, combo tour...
> - 🏠 **Tình trạng phòng trống**: Giá tăng khi occupancy > 80%
> 
> 🔍 **Để nhận báo giá chính xác cho ngày bạn muốn đi**, hãy cho tôi biết:
> - Ngày check-in và check-out
> - Số người lớn và trẻ em
> - Loại phòng ưa thích
> 
> Tôi sẽ kiểm tra ngay: {{TOOL:check_availability|hotel_id={{hotel_id}}}}

---

## 📍 Địa Điểm Lân Cận

{{#nearby_venues}}  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **{{name}}** ({{distance}}): {{description}}
{{/nearby_venues}}

---

## 📋 Chính Sách Khách Sạn

### ⏰ Giờ Nhận/Trả Phòng
- **Check-in**: Từ {{check_in_time}}{{#early_check_in_available}} (Hỗ trợ nhận phòng sớm tùy tình trạng phòng trống - có thể phát sinh phí){{/early_check_in_available}}
- **Check-out**: Trước {{check_out_time}}{{#late_check_out_available}} (Trả phòng muộn đến 18:00 với phụ thu 50% giá phòng){{/late_check_out_available}}

### ❌ Chính Sách Hủy Phòng
**Áp dụng gói "{{cancellation_policy}}"**:  # Source: curl_step_2.1 -> data.policy.cancellationPolicy.name
{{#cancellation_policy_rules}}  # Source: curl_step_2.1 -> data.policy.cancellationPolicy.rules[]
- {{description}}  # Generated from rules
{{/cancellation_policy_rules}}

### 💳 Thanh Toán
- **Phương thức**: 
  - ✅ Thanh toán online qua VNPay (ATM, Visa, Mastercard, QR Pay)
  {{#allows_pay_at_hotel}}
  - ✅ Hỗ trợ thanh toán tại khách sạn
  {{/allows_pay_at_hotel}}
  {{^allows_pay_at_hotel}}
  - ❌ **KHÔNG** hỗ trợ thanh toán tại khách sạn
  {{/allows_pay_at_hotel}}

---

## 🎯 Phù Hợp Với Ai?

{{#vibe_tags}}
{{#. == "family_friendly"}}
✅ **Gia đình có trẻ nhỏ**: Phù hợp cho kỳ nghỉ gia đình
{{/.}}
{{#. == "romantic"}}
✅ **Cặp đôi honeymoon**: View đẹp, không gian lãng mạn
{{/.}}
{{#. == "business"}}
✅ **Khách công tác**: Tiện nghi phục vụ công việc
{{/.}}
{{/vibe_tags}}

---

## 📞 Liên Hệ & Hỗ Trợ

Bạn có câu hỏi về khách sạn này? Tôi có thể giúp bạn:
- 🔍 Kiểm tra phòng trống cho ngày cụ thể
- 💰 So sánh giá các loại phòng
- 🎁 Tìm mã giảm giá đang có hiệu lực
- 📧 Liên hệ trực tiếp với khách sạn về yêu cầu đặc biệt

Hãy cho tôi biết kế hoạch của bạn! 😊

---

<!-- 
====================================================================
DATA SOURCE MAPPING REFERENCE (Based on Actual API Responses)
====================================================================

CURL COMMANDS EXECUTED:
1. curl_step_1: GET /accommodation/hotels?page=0&size=1
   → Extract: HOTEL_ID, CITY_ID

2. curl_step_2.1: GET /accommodation/hotels/{HOTEL_ID}
   → Response: HotelDetailsResponse
   → Fields used:
     - data.id → doc_id, hotel_id
     - data.name → name, slug
     - data.description → description
     - data.starRating → star_rating
     - data.status → status
     - data.country/province/city/district/ward/street → location.*
     - data.latitude/longitude → location.coordinates
     - data.address → location.address
     - data.amenities[] → amenity_tags (via mapping)
     - data.photos[] → mainImageUrl, galleryImageUrls
     - data.policy.* → check_in_time, check_out_time, cancellation_policy, etc.
     - data.entertainmentVenues[] → nearby_venues
     - data.partner.id → partner_id
     - data.updatedAt/createdAt → last_updated

3. curl_step_2.2: GET /accommodation/rooms?hotel-id={HOTEL_ID}
   → Response: Page<RoomResponse>
   → Fields used:
     - data.content[] → rooms list
     - data.totalItems → total_rooms
     - MIN(data.content[].basePricePerNight) → reference_min_price
     - MAX(data.content[].basePricePerNight) → reference_max_price
     - COUNT(DISTINCT data.content[].name) → available_room_types

4. curl_step_2.3: GET /reviews?hotel-id={HOTEL_ID}
   → Response: Page<ReviewResponse>
   → Fields used:
     - AVG(data.content[].score) → review_score
     - data.totalItems → review_count
     - Note: May be empty array → review_score = null, review_count = 0

5. curl_step_2.4: GET /location/entertainment-venues/city/{CITY_ID}
   → Response: EntertainmentVenueGroupResponse[]
   → Fields used:
     - data[].entertainmentVenues[] → nearby_venues (if not in hotel response)
     - data[].entertainmentVenues[].name → nearby_venues[].name
     - data[].entertainmentVenues[].distance → nearby_venues[].distance

6. curl_step_2.5: GET /amenity/amenities
   → Response: AmenityResponse[]
   → Purpose: Reference mapping table for Vietnamese → English amenity names
   → Used by: AmenityMappingService to map curl_step_2.1 -> data.amenities[].name

AGGREGATED FIELDS:
- review_score: AVG(reviews.score) from curl_step_2.3
- review_count: COUNT(reviews) from curl_step_2.3
- reference_min_price: MIN(rooms.basePricePerNight) from curl_step_2.2
- reference_max_price: MAX(rooms.basePricePerNight) from curl_step_2.2
- available_room_types: COUNT(DISTINCT rooms.name) from curl_step_2.2

INFERRED FIELDS:
- vibe_tags: Inferred from star_rating + amenity_tags + location_tags
- location_tags: Generated from city.name, district.name, + venue names
- keywords: Generated from hotel.name, city.name, star_rating, amenity_tags

MAPPING LOGIC:
- amenity_tags: Map Vietnamese names from curl_step_2.1 -> data.amenities[].amenities[].name
  to English using AmenityMappingService with curl_step_2.5 as reference
- mainImageUrl: Filter photos by category name="main" or use first photo
- galleryImageUrls: All photos except main, limit 5

PROHIBITED DATA:
- DO NOT include: commissionRate, partner contact info, internal IDs
- DO NOT hardcode: exact prices for specific dates, current availability
- DO NOT expose: Admin-only fields, Partner-only metrics

====================================================================
-->
