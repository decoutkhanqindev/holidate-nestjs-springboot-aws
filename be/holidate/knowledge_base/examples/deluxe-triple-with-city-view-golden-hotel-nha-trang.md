---
# ============================================================
# YAML FRONTMATTER - ROOM DETAIL METADATA
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "room_detail"
doc_id: "6380326d-6b6f-4310-b8c5-539e1e69bac6"  # Source: curl_step_3 -> data.id (GET /accommodation/rooms/{ROOM_ID})
slug: "deluxe-triple-with-city-view-golden-hotel-nha-trang"  # Source: Generated from curl_step_3 -> data.name + hotel.name
parent_hotel_slug: "golden-hotel-nha-trang"  # Source: Generated from curl_step_2.1 -> data.name
parent_hotel_id: "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf"  # Source: curl_step_3 -> data.hotel.id
last_updated: "2025-11-27T01:45:05.4876138Z"  # Source: curl_step_3 -> data.updatedAt (fallback to createdAt if null)
language: "vi"

# === LOCATION (INHERITED FROM HOTEL) ===
location:
  country: "viet-nam"  # Source: curl_step_3 -> data.hotel.country.name
  city: "thanh-pho-nha-trang"  # Source: curl_step_3 -> data.hotel.city.name
  district: "thanh-pho-nha-trang"  # Source: curl_step_3 -> data.hotel.district.name
  hotel_name: "Golden Hotel Nha Trang"  # Source: curl_step_3 -> data.hotel.name

# === ROOM CLASSIFICATION ===
room_id: "6380326d-6b6f-4310-b8c5-539e1e69bac6"  # Source: curl_step_3 -> data.id
room_name: "Deluxe Triple With City View"  # Source: curl_step_3 -> data.name (Vietnamese, e.g., "Premier Deluxe Triple")
room_type: "deluxe"  # INFERRED from curl_step_3 -> data.name using inferRoomType() logic
room_category: "double"  # INFERRED from curl_step_3 -> data.maxAdults + maxChildren using inferRoomCategory() logic

# === ROOM SPECIFICATIONS ===
# Source: curl_step_3 -> data (GET /accommodation/rooms/{ROOM_ID})
bed_type: "Giường King (cỡ lớn)"  # Source: curl_step_3 -> data.bedType.name (Vietnamese, e.g., "2 giường đơn")
bed_type_id: "78efc094-a067-11f0-a7b7-0a6aab4924ab"  # Source: curl_step_3 -> data.bedType.id
max_adults: 2  # Source: curl_step_3 -> data.maxAdults
max_children: 0  # Source: curl_step_3 -> data.maxChildren
area_sqm: 25.0  # Source: curl_step_3 -> data.area
view: "Hướng thành phố"  # Source: curl_step_3 -> data.view (Vietnamese, e.g., "Hướng biển, Nhìn ra thành phố")
floor_range: ""  # Optional: Not in API response, default null

# === ROOM FEATURES ===
# Source: curl_step_3 -> data.amenities[] -> amenity.name (Vietnamese)
# Mapped to English via AmenityMappingService using curl_step_2.5 (all amenities) as reference
room_amenity_tags:
  - "air_conditioning"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")
  - "balcony"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")
  - "free_bottled_water"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")
  - "hot_water"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")
  - "minibar"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")
  - "private_bathroom"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")
  - "standing_shower"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")
  - "toiletries"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")
  - "tv"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")

# === ROOM POLICIES ===
# Source: curl_step_3 -> data (room-level) OR curl_step_2.1 -> data.policy (hotel-level inheritance)
smoking_allowed: false  # Source: curl_step_3 -> data.smokingAllowed
wifi_available: true  # Source: curl_step_3 -> data.wifiAvailable
breakfast_included: true  # Source: curl_step_3 -> data.breakfastIncluded
cancellation_policy: "Chính sách tiêu chuẩn"  # Source: curl_step_3 -> data.cancellationPolicy.name OR curl_step_2.1 -> data.policy.cancellationPolicy.name (inherit)
reschedule_policy: "Chính sách tiêu chuẩn"  # Source: curl_step_3 -> data.reschedulePolicy.name OR curl_step_2.1 -> data.policy.reschedulePolicy.name (inherit)

# === INVENTORY INFO (STATIC) ===
# Source: curl_step_3 -> data
quantity: 10  # Source: curl_step_3 -> data.totalRooms
status: "active"  # Source: curl_step_3 -> data.status

# === PRICING INFO (STATIC REFERENCE) ===
# Source: curl_step_3 -> data
base_price: 670000  # Source: curl_step_3 -> data.basePricePerNight (VNĐ/night, BASE price, not dynamic)
# current_price: Not included in KB (dynamic pricing, changes daily)
price_note: "Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống"  # Template string: "Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống"

# === VIBE TAGS (ROOM-SPECIFIC) ===
# INFERRED from room features: view, amenities, room_type, max_children
vibe_tags:
  - "balcony_room"  # Inferred from: view contains "biển"/"ocean" → "sea_view", has bathtub + sea_view → "romantic", maxChildren > 0 → "family_friendly"

# === SEO KEYWORDS ===
keywords:
  - "deluxe triple with city view"  # Generated from: room.name, city.name, view, bed_type, room_type
  - "phòng thành phố nha trang"  # Generated from: room.name, city.name, view, bed_type, room_type
  - "giường king size"  # Generated from: room.name, city.name, view, bed_type, room_type
  - "phòng deluxe"  # Generated from: room.name, city.name, view, bed_type, room_type

---

# 🛏️ Deluxe Triple With City View - **Deluxe Triple With City View** là hạng phòng hướng thành phố tại Golden Hotel Nha Trang, với diện tích 25.0m², phù hợp cho tối đa 2 người lớn.

![Deluxe Triple With City View](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/10019241-2514x1699-FIT_AND_TRIM-b1fe75c115f7045ae38f6a9b9785ef62.jpeg)  # Source: curl_step_3 -> data.photos[].photos[0].url (first photo, or filter by category)

## 📐 Thông Số Phòng

| Đặc điểm              | Thông tin chi tiết                       |
|-----------------------|------------------------------------------|
| **Diện tích**         | 25.0 m²                         |  # Source: curl_step_3 -> data.area
| **Loại giường**       | Giường King (cỡ lớn)                            |  # Source: curl_step_3 -> data.bedType.name
| **Sức chứa**          | Tối đa 2 người lớn + 0 trẻ em |  # Source: curl_step_3 -> data.maxAdults, maxChildren
| **Hướng nhìn**        | Hướng thành phố                                 |  # Source: curl_step_3 -> data.view

---

## 💎 Mô Tả Không Gian

**Deluxe Triple With City View** là hạng phòng hướng thành phố tại Golden Hotel Nha Trang, với diện tích 25.0m², phù hợp cho tối đa 2 người lớn và 0 trẻ em.


---

## ✨ Tiện Nghi Trong Phòng

### 🔌 Công Nghệ & Giải Trí
- ✅ **WiFi tốc độ cao**: Miễn phí
- ✅ **TV**: Smart TV với các kênh giải trí

### ☕ Ăn Uống & Minibar
- ✅ **Tủ lạnh**: Minibar
- ✅ **Minibar**: Đồ uống và snack trong phòng
- ✅ **Nước đóng chai miễn phí**: Cung cấp hàng ngày

### 🚿 Phòng Tắm
- ✅ **Phòng tắm riêng**: Không gian riêng tư
- ✅ **Vòi tắm đứng**: Tiện lợi và hiện đại
- ✅ **Nước nóng 24/7**: Luôn sẵn sàng
- ✅ **Bộ vệ sinh cá nhân**: Đầy đủ tiện nghi

### 🌡️ Tiện Nghi Khác
- ✅ **Điều hòa**: Điều khiển nhiệt độ cá nhân
- ✅ **Ban công**: Không gian mở, view đẹp

---

## 🍽️ Ăn Sáng & Dịch Vụ Ăn Uống

### Bữa Sáng Buffet (Đã Bao Gồm)
- ⏰ **Thời gian**: 06:00 - 10:00
- 🍳 **Menu**: Buffet quốc tế với nhiều món Á - Âu

---

## 📋 Chính Sách Đặt Phòng

### ❌ Chính Sách Hủy
**Gói "Chính sách tiêu chuẩn"**:  # Source: curl_step_3 -> data.cancellationPolicy.name OR curl_step_2.1 -> data.policy.cancellationPolicy.name

### 🔄 Chính Sách Đổi Lịch
**Gói "Chính sách tiêu chuẩn"**:  # Source: curl_step_3 -> data.reschedulePolicy.name OR curl_step_2.1 -> data.policy.reschedulePolicy.name

### 🚭 Quy Định Trong Phòng
- **Hút thuốc**: Nghiêm cấm
- **Thú cưng**: Không cho phép

---

## 💰 Thông Tin Giá

> ⚠️ **QUAN TRỌNG: Giá Động Theo Ngày**
> 
> Phòng **Deluxe Triple With City View** có **giá cơ bản** là **670000 VNĐ/đêm**, nhưng giá thực tế bạn phải trả sẽ **thay đổi** tùy vào:
> 
> 1. **📅 Thời điểm đặt phòng**: Cuối tuần/ngày lễ cao hơn
> 2. **🌡️ Mùa du lịch**: Mùa cao điểm giá tăng
> 3. **📊 Tình trạng phòng trống**: Occupancy cao → giá tăng
> 4. **🎁 Khuyến mãi đang chạy**: Early bird, last minute, combo

> 🔍 **Để biết giá chính xác cho kỳ nghỉ của bạn**, vui lòng cho tôi biết:
> - Ngày check-in và check-out cụ thể
> - Số người lớn và trẻ em
> - Có muốn thêm dịch vụ nào không
> 
> Tôi sẽ kiểm tra hệ thống ngay và báo giá chi tiết kèm các khuyến mãi đang có!
> 
> {{TOOL:get_room_price|room_id=6380326d-6b6f-4310-b8c5-539e1e69bac6|check_in={date}|check_out={date}}}

---

## 🎯 Phù Hợp Với Ai?


---

## 📸 Hình Ảnh Phòng

  # Source: curl_step_3 -> data.photos[].photos[].url (all except main, limit 10)
![Deluxe Triple With City View](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/10019241-800x518-FIT_AND_TRIM-519e495dd0a4b9e1c786d6cbf2bdb205.jpg)
  # Source: curl_step_3 -> data.photos[].photos[].url (all except main, limit 10)
![Deluxe Triple With City View](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/10019241-1827x1219-FIT_AND_TRIM-a36d9257b8ff3636c8ec151304d1293b.jpeg)

---

## 📞 Hỗ Trợ Đặt Phòng

Tôi có thể giúp bạn:
- ✅ Kiểm tra phòng trống cho ngày cụ thể
- ✅ Tính toán giá chính xác (bao gồm thuế, phí)
- ✅ Tìm mã giảm giá đang có hiệu lực
- ✅ Gợi ý combo tiết kiệm

Hãy cho tôi biết kế hoạch của bạn để được hỗ trợ tốt nhất! 😊

---

<!-- 
====================================================================
DATA SOURCE MAPPING REFERENCE (Based on Actual API Responses)
====================================================================

CURL COMMANDS EXECUTED:
1. curl_step_2.2: GET /accommodation/rooms?hotel-id={HOTEL_ID}
   → Extract: ROOM_ID (first room in data.content[])

2. curl_step_3: GET /accommodation/rooms/{ROOM_ID}
   → Response: RoomDetailsResponse
   → Fields used:
     - data.id → doc_id, room_id
     - data.name → room_name (Vietnamese, e.g., "Premier Deluxe Triple")
     - data.hotel.id → parent_hotel_id
     - data.hotel.name → location.hotel_name
     - data.hotel.country/city/district → location.*
     - data.view → view (Vietnamese, e.g., "Hướng biển, Nhìn ra thành phố")
     - data.area → area_sqm
     - data.maxAdults → max_adults
     - data.maxChildren → max_children
     - data.bedType.name → bed_type (Vietnamese, e.g., "2 giường đơn")
     - data.bedType.id → bed_type_id
     - data.amenities[] → room_amenity_tags (via mapping)
     - data.smokingAllowed → smoking_allowed
     - data.wifiAvailable → wifi_available
     - data.breakfastIncluded → breakfast_included
     - data.cancellationPolicy → cancellation_policy (or inherit from hotel)
     - data.reschedulePolicy → reschedule_policy (or inherit from hotel)
     - data.totalRooms → quantity
     - data.status → status
     - data.basePricePerNight → base_price
     - data.currentPricePerNight → current_price
     - data.photos[] → mainImageUrl, galleryImageUrls
     - data.updatedAt/createdAt → last_updated

3. curl_step_2.1: GET /accommodation/hotels/{HOTEL_ID}
   → Purpose: Inherit policies if room-level policies are null
   → Fields used:
     - data.policy.cancellationPolicy.name → cancellation_policy (if room.cancellationPolicy is null)
     - data.policy.reschedulePolicy.name → reschedule_policy (if room.reschedulePolicy is null)

4. curl_step_2.5: GET /amenity/amenities
   → Purpose: Reference mapping table for Vietnamese → English amenity names
   → Used by: AmenityMappingService to map curl_step_3 -> data.amenities[].amenities[].name

INFERRED FIELDS (CRITICAL - NOT IN API RESPONSE):
1. room_type: INFERRED from curl_step_3 -> data.name using inferRoomType() logic
   - Pattern matching on Vietnamese room name
   - Examples from actual data:
     * "Premier Deluxe Triple" → "deluxe" (contains "Deluxe")
     * "Twin Premier Deluxe Twin" → "deluxe" (contains "Deluxe")
     * "Executive Family" → "suite" (contains "Executive")
   - Logic: See inferRoomType() implementation below

2. room_category: INFERRED from curl_step_3 -> data.maxAdults + maxChildren using inferRoomCategory() logic
   - Examples from actual data:
     * maxAdults=3, maxChildren=1 → "family" (maxChildren > 0)
     * maxAdults=2, maxChildren=1 → "family" (maxChildren > 0)
     * maxAdults=4, maxChildren=0 → "suite" (maxAdults > 2)
   - Logic: See inferRoomCategory() implementation below

3. description: GENERATED from template (NOT in API response)
   - Template: "{roomName} là hạng phòng {viewDescription} tại {hotelName}, với diện tích {area}m², phù hợp cho tối đa {maxAdults} người lớn{+maxChildren trẻ em}."
   - Example: "Premier Deluxe Triple là hạng phòng hướng biển tại Khách sạn Minh Toan SAFI Ocean, với diện tích 35m², phù hợp cho tối đa 3 người lớn và 1 trẻ em."

4. vibe_tags: INFERRED from room features
   - view contains "biển"/"ocean" → "sea_view"
   - has bathtub + sea_view → "romantic", "honeymoon"
   - maxChildren > 0 → "family_friendly"
   - room_type contains "deluxe"/"suite"/"villa" → "luxury"

MAPPING LOGIC:
- room_amenity_tags: Map Vietnamese names from curl_step_3 -> data.amenities[].amenities[].name
  to English using AmenityMappingService with curl_step_2.5 as reference
  - Example mappings from actual data:
    * "Lò vi sóng" → "microwave"
    * "Tủ lạnh" → "refrigerator"
    * "Máy lạnh" → "air_conditioning"
    * "TV" → "tv"
    * "Két an toàn tại phòng" → "safe_box"
    * "Bộ vệ sinh cá nhân" → "toiletries"
    * "Máy sấy tóc" → "hairdryer"
    * "Nước nóng" → "hot_water"
- mainImageUrl: Filter photos by category name="Phòng" or use first photo
- galleryImageUrls: All photos except main, limit 10

INFERENCE LOGIC IMPLEMENTATION:

1. inferRoomType(String roomName):
   Input: "Premier Deluxe Triple"
   Process:
     - Normalize: Remove accents, lowercase
     - Check patterns in priority order:
       * "presidential"/"tong thong" → "suite"
       * "villa"/"biet thu" → "villa"
       * "deluxe"/"cao cap"/"premium"/"thuong hang" → "deluxe"
       * "superior"/"hang trung" → "superior"
       * "suite"/"executive" → "suite"
     - Default: "standard"
   Output: "deluxe"

2. inferRoomCategory(Room room):
   Input: maxAdults=3, maxChildren=1
   Process:
     - If maxChildren > 0 → "family"
     - Else if maxAdults == 1 → "single"
     - Else if maxAdults == 2 → "double"
     - Else → "suite"
   Output: "family"

VALIDATION OF DATA_GAP_ANALYSIS.md:
✅ CONFIRMED: room_type is MISSING in API response → Needs inference
✅ CONFIRMED: room_category is MISSING in API response → Needs inference
✅ CONFIRMED: description is MISSING in API response → Needs generation

PROHIBITED DATA:
- DO NOT hardcode exact prices for specific dates
- DO NOT show RoomInventory data (availableRooms, dynamic prices)
- DO NOT expose Partner commission or internal pricing rules
- DO NOT promise guaranteed availability

====================================================================
-->