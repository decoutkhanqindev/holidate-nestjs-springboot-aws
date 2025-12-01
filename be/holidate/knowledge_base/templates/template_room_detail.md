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

# === THÔNG SỐ KỸ THUẬT CHI TIẾT ===
specs:
  area_sqm: {{specs.area_sqm}}  # Float, Ví dụ: 33.0
  has_balcony: {{specs.has_balcony}}  # Boolean
  has_window: {{specs.has_window}}  # Boolean
  view_type: "{{specs.view_type}}"  # Enum: "ocean", "city", "mountain", "no_view"
  bed_configuration:
{{#specs.bed_configuration}}
    - type: "{{type}}"  # Ví dụ: "single", "double", "king"
      count: {{count}}  # Integer
{{/specs.bed_configuration}}

# === GIÁ CẢ & TỒN KHO CHI TIẾT ===
pricing:
  base_price_vnd: {{pricing.base_price_vnd}}  # Giá cơ bản
  weekend_surcharge_percent: {{pricing.weekend_surcharge_percent}}  # % phụ thu cuối tuần
  holiday_surcharge_percent: {{pricing.holiday_surcharge_percent}}  # % phụ thu ngày lễ

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
{{#current_price}}
current_price: {{current_price}}  # Source: curl_step_3 -> data.currentPricePerNight (may differ from base_price if discount applied)
{{/current_price}}
price_note: "{{price_note}}"  # Template string: "Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống"

# === ENHANCED: DAILY INVENTORY CALENDAR (NEXT 30 DAYS) ===
# Source: /accommodation/rooms/inventories?room-id={id} endpoint
inventory_calendar:
{{#inventoryCalendar}}
  - date: "{{date}}"  # ISO format: 2025-11-29
    day_of_week: "{{day_of_week}}"  # "monday", "tuesday", ..., "sunday"
    is_weekend: {{isWeekend}}  # Boolean
    is_holiday: {{isHoliday}}  # Boolean
    price_vnd: {{price}}  # Giá thực tế cho ngày này
    available_rooms: {{availableRooms}}  # Số phòng còn trống
    status: "{{status}}"  # "available", "limited", "sold_out"
{{/inventoryCalendar}}

# === CHÍNH SÁCH PHÒNG RIÊNG ===
room_policies:
  max_occupancy:
    adults: {{room_policies.max_occupancy.adults}}  # Integer
    children: {{room_policies.max_occupancy.children}}  # Integer
  extra_bed_available: {{room_policies.extra_bed_available}}  # Boolean
  extra_bed_price_vnd: {{room_policies.extra_bed_price_vnd}}  # Integer

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

## 📏 Thông Số Phòng

- **Diện tích**: {{specs.area_sqm}} m²

- **Ban công**: {{#specs.has_balcony}}Có{{/specs.has_balcony}}{{^specs.has_balcony}}Không{{/specs.has_balcony}}

- **Cửa sổ**: {{#specs.has_window}}Có{{/specs.has_window}}{{^specs.has_window}}Không{{/specs.has_window}}

- **Hướng nhìn**: {{#specs.view_type_ocean}}Biển{{/specs.view_type_ocean}}{{#specs.view_type_city}}Thành phố{{/specs.view_type_city}}{{#specs.view_type_mountain}}Núi{{/specs.view_type_mountain}}{{^specs.view_type_ocean}}{{^specs.view_type_city}}{{^specs.view_type_mountain}}Không có view{{/specs.view_type_mountain}}{{/specs.view_type_city}}{{/specs.view_type_ocean}}

- **Giường**: {{specs.bed_configuration.0.count}} giường {{specs.bed_configuration.0.type}}

## 📐 Thông Số Phòng (Chi Tiết)

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

## 💰 Giá & Tình Trạng Trong 7 Ngày Tới

| Ngày | Thứ | Giá (VNĐ) | Tình trạng |
|------|-----|-----------|------------|
{{#inventoryCalendar7Days}}
| {{date}} | {{day_of_week}} | {{price_vnd}} | {{#status_available}}✅ Còn {{available_rooms}} phòng{{/status_available}}{{#status_limited}}⚠️ Còn ít phòng{{/status_limited}}{{#status_sold_out}}❌ Hết phòng{{/status_sold_out}} |
{{/inventoryCalendar7Days}}

## 📅 Lịch Tồn Kho & Giá (30 Ngày Tới)

| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
{{#inventoryCalendar}}
| {{date}} | {{day_of_week}} | {{price_vnd}} | {{available_rooms}} | {{#isWeekend}}🌟 Cuối tuần{{/isWeekend}}{{#isHoliday}}🎉 Ngày lễ{{/isHoliday}}{{^isWeekend}}{{^isHoliday}}Ngày thường{{/isHoliday}}{{/isWeekend}} |
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

## ⚠️ Chính Sách Phòng

- **Sức chứa tối đa**: {{room_policies.max_occupancy.adults}} người lớn + {{room_policies.max_occupancy.children}} trẻ em

{{#room_policies.extra_bed_available}}
- **Giường phụ**: Có thể thêm với phí {{room_policies.extra_bed_price_vnd}} VNĐ/đêm
{{/room_policies.extra_bed_available}}

---

## 📊 Khả Năng Còn Phòng

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
> {{tool_call_get_room_price}}

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

