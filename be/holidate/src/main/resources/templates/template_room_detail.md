---
# ============================================================
# YAML FRONTMATTER - ROOM DETAIL METADATA
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "room_detail"
doc_id: "{{doc_id}}"  # Source: curl_step_3 -> data.id (GET /accommodation/rooms/{ROOM_ID})
slug: "{{slug}}"  # Source: Generated from curl_step_3 -> data.name + hotel.name
parent_hotel_slug: "{{parent_hotel_slug}}"  # Source: Generated from curl_step_2.1 -> data.name
parent_hotel_id: "{{parent_hotel_id}}"  # Source: curl_step_3 -> data.hotel.id
last_updated: "{{last_updated}}"  # Source: curl_step_3 -> data.updatedAt (fallback to createdAt if null)
language: "vi"

# === LOCATION (INHERITED FROM HOTEL) ===
location:
  country: "{{location.country}}"  # Source: curl_step_3 -> data.hotel.country.name
  city: "{{location.city}}"  # Source: curl_step_3 -> data.hotel.city.name
  district: "{{location.district}}"  # Source: curl_step_3 -> data.hotel.district.name
  hotel_name: "{{location.hotel_name}}"  # Source: curl_step_3 -> data.hotel.name

# === ROOM CLASSIFICATION ===
room_id: "{{room_id}}"  # Source: curl_step_3 -> data.id
room_name: "{{room_name}}"  # Source: curl_step_3 -> data.name (Vietnamese, e.g., "Premier Deluxe Triple")
room_type: "{{room_type}}"  # INFERRED from curl_step_3 -> data.name using inferRoomType() logic
room_category: "{{room_category}}"  # INFERRED from curl_step_3 -> data.maxAdults + maxChildren using inferRoomCategory() logic

# === ROOM SPECIFICATIONS ===
# Source: curl_step_3 -> data (GET /accommodation/rooms/{ROOM_ID})
bed_type: "{{bed_type}}"  # Source: curl_step_3 -> data.bedType.name (Vietnamese, e.g., "2 giường đơn")
bed_type_id: "{{bed_type_id}}"  # Source: curl_step_3 -> data.bedType.id
max_adults: {{max_adults}}  # Source: curl_step_3 -> data.maxAdults
max_children: {{max_children}}  # Source: curl_step_3 -> data.maxChildren
area_sqm: {{area_sqm}}  # Source: curl_step_3 -> data.area
view: "{{view}}"  # Source: curl_step_3 -> data.view (Vietnamese, e.g., "Hướng biển, Nhìn ra thành phố")
floor_range: "{{floor_range}}"  # Optional: Not in API response, default null

# === ROOM FEATURES ===
# Source: curl_step_3 -> data.amenities[] -> amenity.name (Vietnamese)
# Mapped to English via AmenityMappingService using curl_step_2.5 (all amenities) as reference
room_amenity_tags:
{{#room_amenity_tags}}
  - "{{.}}"  # Source: curl_step_3 -> data.amenities[].amenities[].name -> mapped to English (e.g., "microwave", "refrigerator", "air_conditioning")
{{/room_amenity_tags}}

# === ROOM POLICIES ===
# Source: curl_step_3 -> data (room-level) OR curl_step_2.1 -> data.policy (hotel-level inheritance)
smoking_allowed: {{smoking_allowed}}  # Source: curl_step_3 -> data.smokingAllowed
wifi_available: {{wifi_available}}  # Source: curl_step_3 -> data.wifiAvailable
breakfast_included: {{breakfast_included}}  # Source: curl_step_3 -> data.breakfastIncluded
cancellation_policy: "{{cancellation_policy}}"  # Source: curl_step_3 -> data.cancellationPolicy.name OR curl_step_2.1 -> data.policy.cancellationPolicy.name (inherit)
reschedule_policy: "{{reschedule_policy}}"  # Source: curl_step_3 -> data.reschedulePolicy.name OR curl_step_2.1 -> data.policy.reschedulePolicy.name (inherit)

# === INVENTORY INFO (STATIC) ===
# Source: curl_step_3 -> data
quantity: {{quantity}}  # Source: curl_step_3 -> data.totalRooms
status: "{{status}}"  # Source: curl_step_3 -> data.status

# === PRICING INFO (STATIC REFERENCE) ===
# Source: curl_step_3 -> data
base_price: {{base_price}}  # Source: curl_step_3 -> data.basePricePerNight (VNĐ/night, BASE price, not dynamic)
current_price: {{current_price}}  # Source: curl_step_3 -> data.currentPricePerNight (may differ from base_price if discount applied)
price_note: "{{price_note}}"  # Template string: "Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống"

# === ENHANCED: DAILY INVENTORY CALENDAR (NEXT 30 DAYS) ===
# Source: /accommodation/rooms/inventories?room-id={id} endpoint
inventory_calendar:
{{#inventoryCalendar}}
  - date: "{{date}}"
    price: {{price}}
    available_rooms: {{availableRooms}}
    status: "{{status}}"
    is_weekend: {{isWeekend}}
    is_holiday: {{isHoliday}}
{{/inventoryCalendar}}

# === ENHANCED: PRICE ANALYTICS ===
# Calculated from inventory calendar data
price_analytics:
{{#priceAnalytics}}
  min_price_next_30_days: {{minPriceNext30Days}}
  max_price_next_30_days: {{maxPriceNext30Days}}
  avg_price_next_30_days: {{avgPriceNext30Days}}
  price_volatility: "{{priceVolatility}}"  # low/medium/high
  weekend_price_multiplier: {{weekendPriceMultiplier}}
{{/priceAnalytics}}

# === ENHANCED: DETAILED ROOM POLICIES ===
# Source: Room-specific policies or inherited from hotel
room_policies_detail:
  policies_inherited: {{policiesInherited}}
{{#roomPolicies}}
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
{{/roomPolicies}}

# === ENHANCED: NEARBY ENTERTAINMENT (SIMPLIFIED FOR ROOM VIEW) ===
# Source: Top 5 closest venues from /location/entertainment-venues/city/{cityId}
nearby_entertainment:
{{#nearbyEntertainment}}
  - name: "{{name}}"
    category: "{{category}}"
    distance: "{{distance}}"
    short_description: "{{shortDescription}}"
{{/nearbyEntertainment}}

# === VIBE TAGS (ROOM-SPECIFIC) ===
# INFERRED from room features: view, amenities, room_type, max_children
vibe_tags:
{{#vibe_tags}}
  - "{{.}}"  # Inferred from: view contains "biển"/"ocean" → "sea_view", has bathtub + sea_view → "romantic", maxChildren > 0 → "family_friendly"
{{/vibe_tags}}

# === SEO KEYWORDS ===
keywords:
{{#keywords}}
  - "{{.}}"  # Generated from: room.name, city.name, view, bed_type, room_type
{{/keywords}}

---

# 🛏️ {{room_name}} - {{room_description_title}}

![{{room_name}}]({{mainImageUrl}})  # Source: curl_step_3 -> data.photos[].photos[0].url (first photo, or filter by category)

## 📐 Thông Số Phòng

| Đặc điểm              | Thông tin chi tiết                       |
|-----------------------|------------------------------------------|
| **Diện tích**         | {{area_sqm}} m²                         |  # Source: curl_step_3 -> data.area
| **Loại giường**       | {{bed_type}}                            |  # Source: curl_step_3 -> data.bedType.name
| **Sức chứa**          | Tối đa {{max_adults}} người lớn{{#max_children}} + {{max_children}} trẻ em{{/max_children}} |  # Source: curl_step_3 -> data.maxAdults, maxChildren
| **Hướng nhìn**        | {{view}}                                 |  # Source: curl_step_3 -> data.view
{{#floor_range}}
| **Tầng**              | {{floor_range}}                          |  # Optional: Not in API
{{/floor_range}}

---

## 💎 Mô Tả Không Gian

**{{room_name}}** là hạng phòng{{#view}} {{view_description}}{{/view}} tại {{location.hotel_name}}, với diện tích {{area_sqm}}m², phù hợp cho tối đa {{max_adults}} người lớn{{#max_children}} và {{max_children}} trẻ em{{/max_children}}.

{{#view_contains_ocean}}
### 🌊 Tầm Nhìn Panorama
Phòng có tầm nhìn đẹp hướng biển, lý tưởng cho các cặp đôi và những ai yêu thích cảnh biển.
{{/view_contains_ocean}}

---

## ✨ Tiện Nghi Trong Phòng

### 🔌 Công Nghệ & Giải Trí
{{#wifi_available}}
- ✅ **WiFi tốc độ cao**: Miễn phí
{{/wifi_available}}
{{#has_tv}}
- ✅ **TV**: Smart TV với các kênh giải trí
{{/has_tv}}

### ☕ Ăn Uống & Minibar
{{#has_coffee_maker}}
- ✅ **Máy pha cà phê**: Phục vụ trong phòng
{{/has_coffee_maker}}
{{#has_refrigerator}}
- ✅ **Tủ lạnh**: Minibar
{{/has_refrigerator}}
{{#has_minibar}}
- ✅ **Minibar**: Đồ uống và snack trong phòng
{{/has_minibar}}
{{#has_free_bottled_water}}
- ✅ **Nước đóng chai miễn phí**: Cung cấp hàng ngày
{{/has_free_bottled_water}}

### 🚿 Phòng Tắm
{{#has_private_bathroom}}
- ✅ **Phòng tắm riêng**: Không gian riêng tư
{{/has_private_bathroom}}
{{#has_bathtub}}
- ✅ **Bồn tắm**: Thư giãn sau một ngày dài
{{/has_bathtub}}
{{#has_standing_shower}}
- ✅ **Vòi tắm đứng**: Tiện lợi và hiện đại
{{/has_standing_shower}}
{{#has_hot_water}}
- ✅ **Nước nóng 24/7**: Luôn sẵn sàng
{{/has_hot_water}}
{{#has_toiletries}}
- ✅ **Bộ vệ sinh cá nhân**: Đầy đủ tiện nghi
{{/has_toiletries}}

### 🌡️ Tiện Nghi Khác
{{#has_air_conditioning}}
- ✅ **Điều hòa**: Điều khiển nhiệt độ cá nhân
{{/has_air_conditioning}}
{{#has_balcony}}
- ✅ **Ban công**: Không gian mở, view đẹp
{{/has_balcony}}
{{#has_safe_box}}
- ✅ **Két an toàn**: Đủ lớn cho laptop
{{/has_safe_box}}
{{#has_blackout_curtains}}
- ✅ **Rèm che sáng**: Blackout curtains để ngủ ngon
{{/has_blackout_curtains}}

---

## 🍽️ Ăn Sáng & Dịch Vụ Ăn Uống

{{#breakfast_included}}
### Bữa Sáng Buffet (Đã Bao Gồm)
- ⏰ **Thời gian**: 06:00 - 10:00
- 🍳 **Menu**: Buffet quốc tế với nhiều món Á - Âu
{{/breakfast_included}}
{{^breakfast_included}}
### Bữa Sáng
- Bữa sáng không bao gồm trong giá phòng. Có thể đặt thêm với phụ thu.
{{/breakfast_included}}

---

## 📅 Lịch Tồn Kho & Giá (30 Ngày Tới)

{{#inventoryCalendar}}
{{#.}}
### 📆 Thông Tin Theo Ngày
| Ngày | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|---------------|-------------|-----------|
{{#inventoryCalendar}}
| {{date}} | {{price}} | {{availableRooms}} | {{#isWeekend}}🌟 Cuối tuần{{/isWeekend}}{{#isHoliday}}🎉 Ngày lễ{{/isHoliday}}{{^isWeekend}}{{^isHoliday}}Ngày thường{{/isHoliday}}{{/isWeekend}} |
{{/inventoryCalendar}}
{{/.}}
{{/inventoryCalendar}}

---

## 💰 Phân Tích Giá

{{#priceAnalytics}}
### 📊 Thống Kê Giá 30 Ngày Tới
- **Giá thấp nhất**: {{minPriceNext30Days}} VNĐ/đêm
- **Giá cao nhất**: {{maxPriceNext30Days}} VNĐ/đêm
- **Giá trung bình**: {{avgPriceNext30Days}} VNĐ/đêm
- **Mức độ biến động giá**: {{priceVolatility}}
- **Hệ số giá cuối tuần**: x{{weekendPriceMultiplier}}

### 📌 Lời Khuyên Đặt Phòng
{{#priceAnalytics}}
{{#isHighVolatility}}
- 💡 Giá biến động mạnh theo ngày. Nên đặt sớm để có giá tốt!
{{/isHighVolatility}}
{{#isMediumVolatility}}
- 💡 Giá có thay đổi nhẹ. Đặt trước 1-2 tuần để đảm bảo phòng trống.
{{/isMediumVolatility}}
{{#isLowVolatility}}
- 💡 Giá ổn định. Bạn có thể linh hoạt thời gian đặt phòng.
{{/isLowVolatility}}
{{/priceAnalytics}}
{{/priceAnalytics}}

---

## 📋 Chính Sách Đặt Phòng Chi Tiết

{{#policiesInherited}}
_Lưu ý: Phòng này áp dụng chính sách của khách sạn._
{{/policiesInherited}}
{{^policiesInherited}}
_Lưu ý: Phòng này có chính sách riêng._
{{/policiesInherited}}

### ❌ Chính Sách Hủy Phòng
{{#roomPolicies}}
{{#cancellationPolicy}}
**Áp dụng gói "{{name}}"**:
{{#rules}}
- {{description}}
{{/rules}}
{{/cancellationPolicy}}
{{/roomPolicies}}

### 🔄 Chính Sách Đổi Lịch
{{#roomPolicies}}
{{#reschedulePolicy}}
**Áp dụng gói "{{name}}"**:
{{#rules}}
- {{description}}
{{/rules}}
{{/reschedulePolicy}}
{{/roomPolicies}}

### 🚭 Quy Định Trong Phòng
- **Hút thuốc**: {{#smoking_allowed}}Cho phép{{/smoking_allowed}}{{^smoking_allowed}}Nghiêm cấm{{/smoking_allowed}}
- **Thú cưng**: Không cho phép

---

## 📊 Khả Năng Còn Phòng

{{#inventoryCalendar}}
{{#.}}
### 📈 Phân Tích Tình Trạng Phòng
{{#inventoryCalendar}}
{{#hasRooms}}
- Ngày **{{date}}**: {{#hasManyRooms}}✅ Còn nhiều phòng ({{availableRooms}} phòng){{/hasManyRooms}}{{#hasLimitedRooms}}⚠️ Sắp hết phòng ({{availableRooms}} phòng){{/hasLimitedRooms}}
{{/hasRooms}}
{{#isSoldOut}}
- Ngày **{{date}}**: ❌ Đã hết phòng
{{/isSoldOut}}
{{/inventoryCalendar}}

---

## 💰 Thông Tin Giá

> ⚠️ **QUAN TRỌNG: Giá Động Theo Ngày**
> 
> Phòng **{{room_name}}** có **giá cơ bản** là **{{base_price}} VNĐ/đêm**, nhưng giá thực tế bạn phải trả sẽ **thay đổi** tùy vào:
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
> {{TOOL:get_room_price|room_id={{room_id}}|check_in={date}|check_out={date}}}

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

## 📸 Hình Ảnh Phòng

{{#galleryImageUrls}}  # Source: curl_step_3 -> data.photos[].photos[].url (all except main, limit 10)
![{{room_name}}]({{.}})
{{/galleryImageUrls}}

---

## 🎯 Điểm Giải Trí Gần Đây

{{#nearbyEntertainment}}
• **{{name}}** ({{category}}): {{shortDescription}} - _Cách {{distance}}_

{{/nearbyEntertainment}}

{{^nearbyEntertainment}}
_Vui lòng xem thông tin khách sạn để biết các điểm giải trí gần đây._
{{/nearbyEntertainment}}

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
