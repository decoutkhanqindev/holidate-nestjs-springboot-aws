---
# ============================================================
# YAML FRONTMATTER - ROOM DETAIL METADATA
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "room_detail"
doc_id: "6820eebb-2b14-4c13-9229-82571325be85"  # Source: curl_step_3 -> data.id (GET /accommodation/rooms/{ROOM_ID})
slug: "senior-double-with-ocean-view-golden-hotel-nha-trang"  # Source: Generated from curl_step_3 -> data.name + hotel.name
parent_hotel_slug: "golden-hotel-nha-trang"  # Source: Generated from curl_step_2.1 -> data.name
parent_hotel_id: "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf"  # Source: curl_step_3 -> data.hotel.id
last_updated: "2025-11-29T03:37:56.0043833Z"  # Source: curl_step_3 -> data.updatedAt (fallback to createdAt if null)
language: "vi"

# === LOCATION (INHERITED FROM HOTEL) ===
location:
  country: "viet-nam"  # Source: curl_step_3 -> data.hotel.country.name
  city: "thanh-pho-nha-trang"  # Source: curl_step_3 -> data.hotel.city.name
  district: "thanh-pho-nha-trang"  # Source: curl_step_3 -> data.hotel.district.name
  hotel_name: "Golden Hotel Nha Trang"  # Source: curl_step_3 -> data.hotel.name

# === ROOM CLASSIFICATION ===
room_id: "6820eebb-2b14-4c13-9229-82571325be85"  # Source: curl_step_3 -> data.id
room_name: "Senior Double With Ocean View"  # Source: curl_step_3 -> data.name (Vietnamese, e.g., "Premier Deluxe Triple")
room_type: "standard"  # INFERRED from curl_step_3 -> data.name using inferRoomType() logic
room_category: "double"  # INFERRED from curl_step_3 -> data.maxAdults + maxChildren using inferRoomCategory() logic

# === ROOM SPECIFICATIONS ===
# Source: curl_step_3 -> data (GET /accommodation/rooms/{ROOM_ID})
bed_type: "Giường đôi"  # Source: curl_step_3 -> data.bedType.name (Vietnamese, e.g., "2 giường đơn")
bed_type_id: "78efbec7-a067-11f0-a7b7-0a6aab4924ab"  # Source: curl_step_3 -> data.bedType.id
max_adults: 2  # Source: curl_step_3 -> data.maxAdults
max_children: 0  # Source: curl_step_3 -> data.maxChildren
area_sqm: 25.0  # Source: curl_step_3 -> data.area
view: "Hướng mặt biển"  # Source: curl_step_3 -> data.view (Vietnamese, e.g., "Hướng biển, Nhìn ra thành phố")
floor_range: ""  # Optional: Not in API response, default null

# === THÔNG SỐ KỸ THUẬT CHI TIẾT ===
specs:
  area_sqm: 25.0  # Float, Ví dụ: 33.0
  has_balcony: true  # Boolean
  has_window: true  # Boolean
  view_type: "ocean"  # Enum: "ocean", "city", "mountain", "no_view"
  bed_configuration:
    - type: "double"  # Ví dụ: "single", "double", "king"
      count: 1  # Integer

# === GIÁ CẢ & TỒN KHO CHI TIẾT ===
pricing:
  base_price_vnd: 600000.0  # Giá cơ bản
  weekend_surcharge_percent: 32.33155598642752  # % phụ thu cuối tuần
  holiday_surcharge_percent: 0.0  # % phụ thu ngày lễ

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
base_price: 600000  # Source: curl_step_3 -> data.basePricePerNight (VNĐ/night, BASE price, not dynamic)
current_price:   # Source: curl_step_3 -> data.currentPricePerNight (may differ from base_price if discount applied)
price_note: "Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống"  # Template string: "Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống"

# === ENHANCED: DAILY INVENTORY CALENDAR (NEXT 30 DAYS) ===
# Source: /accommodation/rooms/inventories?room-id={id} endpoint
inventory_calendar:
  - date: "2025-11-29"  # ISO format: 2025-11-29
    day_of_week: "saturday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 780000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-11-30"  # ISO format: 2025-11-29
    day_of_week: "sunday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 780000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-01"  # ISO format: 2025-11-29
    day_of_week: "monday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 600000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-02"  # ISO format: 2025-11-29
    day_of_week: "tuesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 600000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-03"  # ISO format: 2025-11-29
    day_of_week: "wednesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 600000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-04"  # ISO format: 2025-11-29
    day_of_week: "thursday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 600000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-05"  # ISO format: 2025-11-29
    day_of_week: "friday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 600000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"

# === CHÍNH SÁCH PHÒNG RIÊNG ===
room_policies:
  max_occupancy:
    adults: 2  # Integer
    children: 0  # Integer
  extra_bed_available: false  # Boolean
  extra_bed_price_vnd: 0.0  # Integer

# === ENHANCED: PRICE ANALYTICS ===
# Calculated from inventory calendar data
price_analytics:

# === ENHANCED: DETAILED ROOM POLICIES ===
# Source: Room-specific policies or inherited from hotel
room_policies_detail:
  policies_inherited: 

# === ENHANCED: NEARBY ENTERTAINMENT (SIMPLIFIED FOR ROOM VIEW) ===
# Source: Top 5 closest venues from /location/entertainment-venues/city/{cityId}
nearby_entertainment:

# === VIBE TAGS (ROOM-SPECIFIC) ===
# INFERRED from room features: view, amenities, room_type, max_children
vibe_tags:
  - "sea_view"  # Inferred from: view contains "biển"/"ocean" → "sea_view", has bathtub + sea_view → "romantic", maxChildren > 0 → "family_friendly"
  - "balcony_room"  # Inferred from: view contains "biển"/"ocean" → "sea_view", has bathtub + sea_view → "romantic", maxChildren > 0 → "family_friendly"

# === SEO KEYWORDS ===
keywords:
  - "senior double with ocean view"  # Generated from: room.name, city.name, view, bed_type, room_type
  - "phòng thành phố nha trang"  # Generated from: room.name, city.name, view, bed_type, room_type
  - "phòng view biển thành phố nha trang"  # Generated from: room.name, city.name, view, bed_type, room_type
  - "phòng standard"  # Generated from: room.name, city.name, view, bed_type, room_type

---

# 🛏️ Senior Double With Ocean View - **Senior Double With Ocean View** là hạng phòng hướng biển tại Golden Hotel Nha Trang, với diện tích 25.0m², phù hợp cho tối đa 2 người lớn.

![Senior Double With Ocean View](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/10019241-2514x1699-FIT_AND_TRIM-b1fe75c115f7045ae38f6a9b9785ef62.jpeg)  # Source: curl_step_3 -> data.photos[].photos[0].url (first photo, or filter by category)

## 📏 Thông Số Phòng

- **Diện tích**: 25.0 m²

- **Ban công**: Có

- **Cửa sổ**: Có

- **Hướng nhìn**: Biển

- **Giường**:  giường 

## 📐 Thông Số Phòng (Chi Tiết)

| Đặc điểm              | Thông tin chi tiết                       |
|-----------------------|------------------------------------------|
| **Diện tích**         | 25.0 m²                         |  # Source: curl_step_3 -> data.area
| **Loại giường**       | Giường đôi                            |  # Source: curl_step_3 -> data.bedType.name
| **Sức chứa**          | Tối đa 2 người lớn + 0 trẻ em |  # Source: curl_step_3 -> data.maxAdults, maxChildren
| **Hướng nhìn**        | Hướng mặt biển                                 |  # Source: curl_step_3 -> data.view

---

## 💎 Mô Tả Không Gian

**Senior Double With Ocean View** là hạng phòng hướng biển tại Golden Hotel Nha Trang, với diện tích 25.0m², phù hợp cho tối đa 2 người lớn và 0 trẻ em.

### 🌊 Tầm Nhìn Panorama
Phòng có tầm nhìn đẹp hướng biển, lý tưởng cho các cặp đôi và những ai yêu thích cảnh biển.

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

## 💰 Giá & Tình Trạng Trong 7 Ngày Tới

| Ngày | Thứ | Giá (VNĐ) | Tình trạng |
|------|-----|-----------|------------|

## 📅 Lịch Tồn Kho & Giá (30 Ngày Tới)

### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 600000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 600000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 600000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 600000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 600000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 600000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 600000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 600000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 600000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 600000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 600000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 600000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 600000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 600000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 600000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 600000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 600000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 600000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 600000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 600000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 600000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 600000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 600000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 600000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 600000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 600000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 600000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 600000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 600000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 600000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 780000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 600000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 600000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 600000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 600000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 600000.0 | 10 | Ngày thường |

---

## 💰 Phân Tích Giá


---

## 📋 Chính Sách Đặt Phòng Chi Tiết

_Lưu ý: Phòng này có chính sách riêng._

### ❌ Chính Sách Hủy Phòng

### 🔄 Chính Sách Đổi Lịch

### 🚭 Quy Định Trong Phòng
- **Hút thuốc**: Nghiêm cấm
- **Thú cưng**: Không cho phép

## ⚠️ Chính Sách Phòng

- **Sức chứa tối đa**: 2 người lớn + 0 trẻ em


---

## 📊 Khả Năng Còn Phòng

### 📈 Phân Tích Tình Trạng Phòng

---

## 💰 Thông Tin Giá

> ⚠️ **QUAN TRỌNG: Giá Động Theo Ngày**
> 
> Phòng **Senior Double With Ocean View** có **giá cơ bản** là **600000 VNĐ/đêm**, nhưng giá thực tế bạn phải trả sẽ **thay đổi** tùy vào:
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
> |check_in={date}|check_out={date}}}

---

## 🎯 Phù Hợp Với Ai?


---

## 📸 Hình Ảnh Phòng

  # Source: curl_step_3 -> data.photos[].photos[].url (all except main, limit 10)
![Senior Double With Ocean View](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/10019241-800x518-FIT_AND_TRIM-519e495dd0a4b9e1c786d6cbf2bdb205.jpg)
  # Source: curl_step_3 -> data.photos[].photos[].url (all except main, limit 10)
![Senior Double With Ocean View](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/10019241-1827x1219-FIT_AND_TRIM-a36d9257b8ff3636c8ec151304d1293b.jpeg)

---

## 🎯 Điểm Giải Trí Gần Đây


_Vui lòng xem thông tin khách sạn để biết các điểm giải trí gần đây._

---

## 📞 Hỗ Trợ Đặt Phòng

Tôi có thể giúp bạn:
- ✅ Kiểm tra phòng trống cho ngày cụ thể
- ✅ Tính toán giá chính xác (bao gồm thuế, phí)
- ✅ Tìm mã giảm giá đang có hiệu lực
- ✅ Gợi ý combo tiết kiệm

Hãy cho tôi biết kế hoạch của bạn để được hỗ trợ tốt nhất! 😊

---


