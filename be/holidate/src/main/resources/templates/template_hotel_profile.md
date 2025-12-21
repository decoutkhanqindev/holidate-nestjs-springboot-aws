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
{{#location.coordinates}}
  coordinates:
    lat: {{location.coordinates.lat}}  # Source: curl_step_2.1 -> data.latitude
    lng: {{location.coordinates.lng}}  # Source: curl_step_2.1 -> data.longitude
{{/location.coordinates}}

# === ĐỊA CHỈ VÀ VỊ TRÍ CHI TIẾT ===
full_address: "{{full_address}}"  # Ví dụ: "136, Đường Hùng Vương, Phường Lộc Thọ, Nha Trang"
{{#coordinates}}
coordinates:
  latitude: {{coordinates.latitude}}  # Ví dụ: 12.2432
  longitude: {{coordinates.longitude}}  # Ví dụ: 109.1942
{{/coordinates}}

# === KHOẢNG CÁCH ĐẾN ĐỊA ĐIỂM QUAN TRỌNG (TÍNH BẰNG MÉT) ===
distances:
  to_beach_meters: {{distances.to_beach_meters}}  # Integer, Ví dụ: 240
  to_city_center_meters: {{distances.to_city_center_meters}}  # Integer
  to_airport_meters: {{distances.to_airport_meters}}  # Integer

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

# === ENHANCED: DETAILED ENTERTAINMENT VENUES BY CATEGORY ===
# Source: /location/entertainment-venues/city/{cityId} endpoint with distance calculation
entertainment_venues:
{{#entertainmentVenues}}
  - category: "{{categoryName}}"
    venues:
{{#venues}}
      - name: "{{name}}"
        address: "{{address}}"
        distance_from_hotel: "{{distanceFromHotel}}m"
        description: "{{description}}"
{{/venues}}
{{/entertainmentVenues}}

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

# === CHÍNH SÁCH NHẬN/TRẢ PHÒNG ===
check_in_policy:
  earliest_time: "{{check_in_policy.earliest_time}}"  # Ví dụ: "14:00"
  latest_time: "{{check_in_policy.latest_time}}"  # Ví dụ: "22:00"
check_out_policy:
  latest_time: "{{check_out_policy.latest_time}}"  # Ví dụ: "12:00"
  late_checkout_available: {{check_out_policy.late_checkout_available}}  # Boolean
  late_checkout_fee: "{{check_out_policy.late_checkout_fee}}"  # Ví dụ: "50% giá phòng"

# === TIỆN NGHI THEO DANH MỤC (CẤU TRÚC CHI TIẾT) ===
amenities_by_category:
{{#amenities_by_category}}
  {{category}}:
{{#amenities}}
    - name: "{{name}}"
      available: {{available}}
{{/amenities}}
{{/amenities_by_category}}

# === CHÍNH SÁCH ĐẶC BIỆT ===
policies:
  pets_allowed: {{policies.pets_allowed}}  # Boolean
  smoking_allowed: {{policies.smoking_allowed}}  # Boolean
  children_policy: "{{policies.children_policy}}"

# === ENHANCED: DETAILED POLICY RULES ===
# Source: /policy/cancellation-policies and /policy/reschedule-policies endpoints
policies_detail:
{{#policies}}
  check_in_time: "{{checkInTime}}"
  check_out_time: "{{checkOutTime}}"
  allows_pay_at_hotel: {{allowsPayAtHotel}}
  cancellation_policy:
{{#cancellationPolicy}}
    name: "{{name}}"
    rules:
{{#rules}}
      - days_before_checkin: {{daysBeforeCheckin}}
        penalty_percentage: {{penaltyPercentage}}
        description: "{{description}}"
{{/rules}}
{{/cancellationPolicy}}
  reschedule_policy:
{{#reschedulePolicy}}
    name: "{{name}}"
    rules:
{{#rules}}
      - days_before_checkin: {{daysBeforeCheckin}}
        fee_percentage: {{feePercentage}}
        description: "{{description}}"
{{/rules}}
{{/reschedulePolicy}}
{{/policies}}

# === ENHANCED: COMPREHENSIVE REVIEW STATISTICS ===
# Source: /reviews?hotel-id={id} endpoint
reviews_summary:
{{#reviewsSummary}}
  total_reviews: {{totalReviews}}
  average_score: {{averageScore}}
  score_distribution:
{{#scoreDistribution}}
    - bucket: "{{bucket}}"
      count: {{count}}
{{/scoreDistribution}}
  recent_reviews:
{{#recentReviews}}
    - score: {{score}}
      comment_snippet: "{{commentSnippet}}"
      date: "{{date}}"
{{/recentReviews}}
{{/reviewsSummary}}

# === ENHANCED: ACTIVE DISCOUNTS ===
# Source: /discounts?hotel-id={id}&currently-valid=true endpoint
active_discounts:
{{#activeDiscounts}}
  - code: "{{code}}"
    description: "{{description}}"
    percentage: {{percentage}}
    min_booking_price: {{minBookingPrice}}
    min_booking_count: {{minBookingCount}}
    valid_from: "{{validFrom}}"
    valid_to: "{{validTo}}"
    usage_limit: {{usageLimit}}
    times_used: {{timesUsed}}
{{#specialDayName}}
    special_day: "{{specialDayName}}"
{{/specialDayName}}
{{/activeDiscounts}}

# === IMAGES ===
mainImageUrl: "{{mainImageUrl}}"  # Source: curl_step_2.1 -> data.photos[].photos[0].url (first photo, or filter by category name="main")
galleryImageUrls:
{{#galleryImageUrls}}
  - "{{.}}"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
{{/galleryImageUrls}}

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

## 📍 Vị Trí & Liên Hệ

**Địa chỉ đầy đủ**: {{full_address}}

{{#coordinates}}
**Tọa độ**: {{coordinates.latitude}}, {{coordinates.longitude}}
{{/coordinates}}

**Cách biển Nha Trang**: {{distances.to_beach_meters}} mét (~{{distances.to_beach_km}} km)

{{#nearby_venues}}
- **{{name}}**: {{distance}}  # Source: curl_step_2.1 -> data.entertainmentVenues
{{/nearby_venues}}

## ⏰ Giờ Nhận/Trả Phòng

- **Nhận phòng**: Từ {{check_in_policy.earliest_time}} đến {{check_in_policy.latest_time}}

- **Trả phòng**: Trước {{check_out_policy.latest_time}}

{{#check_out_policy.late_checkout_available}}
- **Trả phòng muộn**: Có thể sắp xếp với phí {{check_out_policy.late_checkout_fee}}
{{/check_out_policy.late_checkout_available}}

## ⭐ Đặc Điểm Nổi Bật

### 🏖️ 1. Vị Trí
- **{{location.address}}**, {{location.street_name}}, {{location.ward_name}}, {{location.district_name}}, {{location.city_name}}

### ✨ Tiện Nghi Nổi Bật
{{#amenities_by_category}}
### {{category_name}}

{{#amenities}}
{{#available}}
✅ {{name}}
{{/available}}
{{/amenities}}

{{/amenities_by_category}}

### 👨‍👩‍👧‍👦 3. Thân Thiện Với Gia Đình
{{#has_family_friendly}}
- Phù hợp cho gia đình có trẻ em
{{/has_family_friendly}}

---

## 🛏️ Hạng Phòng Đa Dạng

Khách sạn cung cấp {{available_room_types}} loại phòng chính:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|
{{#rooms}}  # Source: curl_step_2.2 -> data.content[]
| **{{name}}** | {{area}}m²      | {{view}}      | {{max_adults}} người lớn{{#max_children}} + {{max_children}} trẻ em{{/max_children}} | {{#breakfast_included}}Bữa sáng miễn phí{{/breakfast_included}}{{#wifi_available}} WiFi miễn phí{{/wifi_available}} |
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
> Tôi sẽ kiểm tra ngay: {{tool_call_check_availability}}

---

## 📍 Địa Điểm Lân Cận

{{#nearby_venues}}  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **{{name}}** ({{distance}}): {{description}}
{{/nearby_venues}}

---

## 🎯 Địa Điểm Giải Trí Gần Đây

{{#entertainmentVenues}}
### 🌟 {{categoryName}}

{{#venues}}
• **{{name}}** ({{distanceFromHotel}}m): {{description}}  
  📍 {{address}}

{{/venues}}
{{/entertainmentVenues}}

{{^entertainmentVenues}}
_Thông tin địa điểm giải trí sẽ được cập nhật sớm._
{{/entertainmentVenues}}

---

## ⭐ Đánh Giá Khách Hàng

{{#reviewsSummary}}
{{#totalReviews}}
### 📊 Tổng Quan Đánh Giá
- **Tổng số đánh giá**: {{totalReviews}} đánh giá
- **Điểm trung bình**: {{averageScore}}/10

### 📈 Phân Bố Điểm Số
{{#scoreDistribution}}
- **{{bucket}} điểm**: {{count}} đánh giá
{{/scoreDistribution}}

### 💬 Đánh Giá Gần Đây
{{#recentReviews}}
- **{{score}}/10** - "{{commentSnippet}}" _({{date}})_
{{/recentReviews}}
{{/totalReviews}}
{{^totalReviews}}
_Chưa có đánh giá cho khách sạn này._
{{/totalReviews}}
{{/reviewsSummary}}

---

## 🎁 Khuyến Mãi Đang Có

{{#activeDiscounts}}
{{#.}}
### 🏷️ {{code}} - {{description}}
- **Giảm giá**: {{percentage}}%
- **Áp dụng cho**: Đơn hàng từ {{minBookingPrice}} VNĐ
- **Thời gian**: Từ {{validFrom}} đến {{validTo}}
- **Số lần sử dụng**: {{timesUsed}}/{{usageLimit}}
{{#specialDayName}}
- **Dịp đặc biệt**: {{.}}
{{/specialDayName}}

{{/.}}
{{/activeDiscounts}}
{{^activeDiscounts}}
_Hiện tại không có khuyến mãi nào._
{{/activeDiscounts}}

---

## 📋 Chính Sách Khách Sạn Chi Tiết

### ⏰ Giờ Nhận/Trả Phòng
- **Check-in**: Từ {{check_in_time}}{{#early_check_in_available}} (Hỗ trợ nhận phòng sớm tùy tình trạng phòng trống - có thể phát sinh phí){{/early_check_in_available}}
- **Check-out**: Trước {{check_out_time}}{{#late_check_out_available}} (Trả phòng muộn đến 18:00 với phụ thu 50% giá phòng){{/late_check_out_available}}

## 📜 Chính Sách Đặc Biệt

- **Thú cưng**: {{#policies.pets_allowed}}Được phép{{/policies.pets_allowed}}{{^policies.pets_allowed}}Không được phép{{/policies.pets_allowed}}

- **Hút thuốc**: {{#policies.smoking_allowed}}Được phép ở khu vực chỉ định{{/policies.smoking_allowed}}{{^policies.smoking_allowed}}Không được phép{{/policies.smoking_allowed}}

- **Trẻ em**: {{policies.children_policy}}

### ❌ Chính Sách Hủy Phòng Chi Tiết
{{#policies}}
{{#cancellationPolicy}}
**Áp dụng gói "{{name}}"**:
{{#rules}}
- {{description}}
{{/rules}}
{{/cancellationPolicy}}
{{/policies}}

### 🔄 Chính Sách Đổi Lịch Chi Tiết
{{#policies}}
{{#reschedulePolicy}}
**Áp dụng gói "{{name}}"**:
{{#rules}}
- {{description}}
{{/rules}}
{{/reschedulePolicy}}
{{/policies}}

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

{{#has_family_friendly}}
✅ **Gia đình có trẻ nhỏ**: Phù hợp cho kỳ nghỉ gia đình
{{/has_family_friendly}}
{{#has_romantic}}
✅ **Cặp đôi honeymoon**: View đẹp, không gian lãng mạn
{{/has_romantic}}
{{#has_business}}
✅ **Khách công tác**: Tiện nghi phục vụ công việc
{{/has_business}}

---

## 📞 Liên Hệ & Hỗ Trợ

Bạn có câu hỏi về khách sạn này? Tôi có thể giúp bạn:
- 🔍 Kiểm tra phòng trống cho ngày cụ thể
- 💰 So sánh giá các loại phòng
- 🎁 Tìm mã giảm giá đang có hiệu lực
- 📧 Liên hệ trực tiếp với khách sạn về yêu cầu đặc biệt

Hãy cho tôi biết kế hoạch của bạn! 😊

