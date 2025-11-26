---
# ============================================================
# YAML FRONTMATTER - METADATA FOR VECTOR DB & FILTERING
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "hotel_profile"
doc_id: "aa7c737b-56d7-4c48-ad04-76b02a1caa07"  # Source: curl_step_2.1 -> data.id (GET /accommodation/hotels/{id})
slug: "khach-san-raon-danang-beach-o-24h"  # Source: Generated from curl_step_2.1 -> data.name
last_updated: "2025-11-27T01:07:59.7251303Z"  # Source: curl_step_2.1 -> data.updatedAt (fallback to createdAt if null)
language: "vi"

# === LOCATION HIERARCHY ===
# Source: curl_step_2.1 -> data.country/province/city/district/ward/street
location:
  country: "viet-nam"  # Source: curl_step_2.1 -> data.country.name
  country_code: "VN"  # Source: curl_step_2.1 -> data.country.code
  province: "thanh-pho-da-nang"  # Source: curl_step_2.1 -> data.province.name
  province_name: "Thành phố Đà Nẵng"  # Source: curl_step_2.1 -> data.province.name
  city: "thanh-pho-da-nang"  # Source: curl_step_2.1 -> data.city.name
  city_name: "Thành phố Đà Nẵng"  # Source: curl_step_2.1 -> data.city.name
  district: "quan-ngu-hanh-son"  # Source: curl_step_2.1 -> data.district.name
  district_name: "Quận Ngũ Hành Sơn"  # Source: curl_step_2.1 -> data.district.name
  ward: "phuong-my-an"  # Source: curl_step_2.1 -> data.ward.name
  ward_name: "Phường Mỹ An"  # Source: curl_step_2.1 -> data.ward.name
  street: "duong-an-thuong-32"  # Source: curl_step_2.1 -> data.street.name
  street_name: "Đường An Thượng 32"  # Source: curl_step_2.1 -> data.street.name
  address: "5-7"  # Source: curl_step_2.1 -> data.address
  coordinates:
    lat: 0.0  # Source: curl_step_2.1 -> data.latitude
    lng: 0.0  # Source: curl_step_2.1 -> data.longitude

# === SEARCH OPTIMIZATION TAGS ===
# Source: Generated from location + entertainment venues
location_tags:
  - "viet_nam"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "thanh_pho_da_nang"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "beach_city"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "central_vietnam"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "quan_ngu_hanh_son"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "phuong_my_an"  # Generated from: city.name, district.name, + venue names from curl_step_2.4

# Source: curl_step_2.1 -> data.amenities[] -> amenity.name (Vietnamese)
# Mapped to English via AmenityMappingService using curl_step_2.5 (all amenities) as reference
amenity_tags:

# Source: Inferred from star_rating + amenities + location + price range
vibe_tags:
  - "boutique"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "luxury"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags

# === PRICING REFERENCE (STATIC) ===
# Source: curl_step_2.2 -> data.content[] -> MIN(basePricePerNight) where status='active'
reference_min_price: 0  # VNĐ - Source: MIN from curl_step_2.2
reference_min_price_room: "N/A"  # Source: Room.name of cheapest room from curl_step_2.2
reference_max_price: 0  # VNĐ - Source: MAX from curl_step_2.2 (optional)

# === HOTEL CLASSIFICATION ===
# Source: curl_step_2.1 -> data.starRating
star_rating: 5

# === BUSINESS METADATA ===
hotel_id: "aa7c737b-56d7-4c48-ad04-76b02a1caa07"  # Source: curl_step_2.1 -> data.id
partner_id: ""  # Source: curl_step_2.1 -> data.partner.id
status: "active"  # Source: curl_step_2.1 -> data.status

# === PERFORMANCE STATS ===
# Source: curl_step_2.2 -> data.content.length (total rooms)
total_rooms: 0  # Source: curl_step_2.2 -> data.totalItems
available_room_types: 0  # Source: curl_step_2.2 -> COUNT(DISTINCT data.content[].name)

# Source: curl_step_2.3 -> Aggregated from reviews
review_score:   # Source: curl_step_2.3 -> AVG(data.content[].score) or null if empty
review_count: 0  # Source: curl_step_2.3 -> data.totalItems

# === NEARBY ATTRACTIONS ===
# Source: curl_step_2.1 -> data.entertainmentVenues[] OR curl_step_2.4 -> data[].entertainmentVenues[]
nearby_venues:

# === POLICIES ===
# Source: curl_step_2.1 -> data.policy
check_in_time: "14:00"  # Source: curl_step_2.1 -> data.policy.checkInTime (format: "HH:mm:ss")
check_out_time: "12:00"  # Source: curl_step_2.1 -> data.policy.checkOutTime
early_check_in_available: true  # Source: Check if amenity "EARLY_CHECK_IN" exists in curl_step_2.1 -> data.amenities
late_check_out_available: true  # Source: Check if amenity "Trả phòng muộn" exists
cancellation_policy: "Chính sách tiêu chuẩn"  # Source: curl_step_2.1 -> data.policy.cancellationPolicy.name
reschedule_policy: "Chính sách tiêu chuẩn"  # Source: curl_step_2.1 -> data.policy.reschedulePolicy.name
allows_pay_at_hotel: false  # Source: curl_step_2.1 -> data.policy.allowsPayAtHotel
smoking_policy: "Khu vực hút thuốc riêng"  # Source: Inferred from hotel-level amenities or default "Không hút thuốc"

# === IMAGES ===
mainImageUrl: "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[0].url (first photo, or filter by category name="main")
galleryImageUrls:
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-b0698f733b24661b9d24b98b30019ca1.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-85b3ba41998cace6b8c56e546ad9a0bc.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)

# === SEO KEYWORDS ===
keywords:
  - "khách sạn raon danang beach - ở 24h"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "khách sạn thành phố đà nẵng"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "quận ngũ hành sơn"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "khách sạn 5 sao"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags

---

# 🏨 Khách sạn Raon Danang Beach - Ở 24H - 

![Khách sạn Raon Danang Beach - Ở 24H](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg)

## 📖 Giới Thiệu

Không chỉ nằm trong tầm tay dễ dàng đến các địa điểm tham quan khác nhau cho cuộc phiêu lưu của bạn, mà việc ở tại Raon Danang Beach Hotel - STAY 24H cũng sẽ mang đến cho bạn một kỳ nghỉ dễ chịu.&#10;&#10;Raon Danang Beach Hotel - STAY 24H rất được khuyến khích cho những người đi du lịch ba lô, những người muốn có một kỳ nghỉ giá cả phải chăng nhưng vẫn thoải mái.&#10;&#10;Đối với bạn, những du khách muốn đi du lịch thoải mái với ngân sách, Raon Danang Beach Hotel - STAY 24H là nơi hoàn hảo để ở, nơi cung cấp các tiện nghi đầy đủ cũng như các dịch vụ tuyệt vời.&#10;&#10;Khách sạn này là sự lựa chọn hoàn hảo cho các cặp đôi đang tìm kiếm một kỳ nghỉ lãng mạn hoặc một nơi nghỉ trăng mật. Tận hưởng những đêm đáng nhớ nhất với người yêu của bạn bằng cách ở tại Raon Danang Beach Hotel - STAY 24H.&#10;&#10;Từ sự kiện kinh doanh đến các buổi họp mặt của công ty, Raon Danang Beach Hotel - STAY 24H cung cấp các dịch vụ và tiện nghi đầy đủ mà bạn và đồng nghiệp của bạn cần.&#10;&#10;Hãy vui vẻ với nhiều tiện nghi giải trí khác nhau dành cho bạn và cả gia đình tại Raon Danang Beach Hotel - STAY 24H, một chỗ ở tuyệt vời cho kỳ nghỉ gia đình của bạn.&#10;&#10;Nếu bạn dự định có một kỳ nghỉ dài hạn, việc ở tại Raon Danang Beach Hotel - STAY 24H là sự lựa chọn đúng đắn dành cho bạn. Cung cấp nhiều tiện nghi và chất lượng dịch vụ tuyệt vời, chỗ ở này chắc chắn sẽ khiến bạn cảm thấy như ở nhà.&#10;&#10;Trong khi đi du lịch với bạn bè có thể rất vui, thì việc đi du lịch một mình lại có những đặc quyền riêng. Đối với chỗ ở, Raon Danang Beach Hotel - STAY 24H phù hợp với những người coi trọng sự riêng tư trong thời gian lưu trú của bạn.&#10;&#10;Dịch vụ tuyệt vời cùng với nhiều tiện nghi được cung cấp sẽ khiến bạn không phàn nàn trong suốt thời gian lưu trú tại Raon Danang Beach Hotel - STAY 24H.&#10;&#10;Có một ngày vui vẻ và thư giãn tại hồ bơi, cho dù bạn đi du lịch một mình hay với những người thân yêu của mình.&#10;&#10;Quầy lễ tân 24 giờ luôn sẵn sàng phục vụ bạn, từ nhận phòng đến trả phòng hoặc bất kỳ sự hỗ trợ nào bạn cần. Nếu bạn muốn nhiều hơn, đừng ngần ngại hỏi quầy lễ tân, chúng tôi luôn sẵn sàng phục vụ bạn.&#10;&#10;Thưởng thức các món ăn yêu thích của bạn với các món ăn đặc biệt từ Raon Danang Beach Hotel - STAY 24H dành riêng cho bạn.&#10;&#10;Wi-Fi có sẵn trong các khu vực công cộng của khách sạn để giúp bạn giữ liên lạc với gia đình và bạn bè.&#10;&#10;Raon Danang Beach Hotel - STAY 24H là một khách sạn có sự thoải mái tuyệt vời và dịch vụ tuyệt vời theo ý kiến của hầu hết khách của khách sạn.&#10;&#10;Với tất cả các tiện nghi được cung cấp, Raon Danang Beach Hotel - STAY 24H là nơi thích hợp để ở.  # Source: curl_step_2.1 -> data.description

> 🌟 **Điểm nổi bật**: Được 0 du khách đánh giá **/10** điểm - "" về dịch vụ, vị trí và tiện nghi.

---

## ⭐ Đặc Điểm Nổi Bật

### 🏖️ 1. Vị Trí
- **5-7**, Đường An Thượng 32, Phường Mỹ An, Quận Ngũ Hành Sơn, Thành phố Đà Nẵng

### 💎 2. Tiện Nghi Khách Sạn

### 👨‍👩‍👧‍👦 3. Thân Thiện Với Gia Đình

---

## 🛏️ Hạng Phòng Đa Dạng

Khách sạn cung cấp 0 loại phòng chính:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|

---

## 💰 Thông Tin Giá Tham Khảo

**Giá khởi điểm**: Từ **0 VNĐ**/đêm  
*(Áp dụng cho phòng **N/A**, 1-2 khách)*

**Giá cao nhất**: Khoảng **0 VNĐ**/đêm  

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
> Tôi sẽ kiểm tra ngay: }}

---

## 📍 Địa Điểm Lân Cận


---

## 📋 Chính Sách Khách Sạn

### ⏰ Giờ Nhận/Trả Phòng
- **Check-in**: Từ 14:00 (Hỗ trợ nhận phòng sớm tùy tình trạng phòng trống - có thể phát sinh phí)
- **Check-out**: Trước 12:00 (Trả phòng muộn đến 18:00 với phụ thu 50% giá phòng)

### ❌ Chính Sách Hủy Phòng
**Áp dụng gói "Chính sách tiêu chuẩn"**:  # Source: curl_step_2.1 -> data.policy.cancellationPolicy.name

### 💳 Thanh Toán
- **Phương thức**: 
  - ✅ Thanh toán online qua VNPay (ATM, Visa, Mastercard, QR Pay)
  - ❌ **KHÔNG** hỗ trợ thanh toán tại khách sạn

---

## 🎯 Phù Hợp Với Ai?


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