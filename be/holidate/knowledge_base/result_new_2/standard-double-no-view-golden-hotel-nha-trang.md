---
# ============================================================
# YAML FRONTMATTER - ROOM DETAIL METADATA
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "room_detail"
doc_id: "418668e2-147f-4df0-b874-89cbba9f3e71"
slug: "standard-double-no-view-golden-hotel-nha-trang"
parent_hotel_slug: "golden-hotel-nha-trang"
parent_hotel_id: "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf"
last_updated: "2025-11-29T10:25:17.0699943Z"
language: "vi"

# === LOCATION (INHERITED FROM HOTEL) ===
location:
  country: "viet-nam"
  city: "thanh-pho-nha-trang"
  district: "thanh-pho-nha-trang"
  hotel_name: "Golden Hotel Nha Trang"

# === ROOM CLASSIFICATION ===
room_id: "418668e2-147f-4df0-b874-89cbba9f3e71"
room_name: "Standard Double No View"
room_type: "standard"  # INFERRED from curl_step_3 -> data.name using inferRoomType() logic
room_category: "double"  # INFERRED from curl_step_3 -> data.maxAdults + maxChildren using inferRoomCategory() logic

# === ROOM SPECIFICATIONS ===

bed_type: "Giường đôi"
bed_type_id: "78efbec7-a067-11f0-a7b7-0a6aab4924ab"
max_adults: 2
max_children: 0
area_sqm: 18.0
view: "Không có view"
floor_range: ""  # Optional: Not in API response, default null

# === THÔNG SỐ KỸ THUẬT CHI TIẾT ===
specs:
  area_sqm: 18.0  # Float, Ví dụ: 33.0
  has_balcony: false  # Boolean
  has_window: true  # Boolean
  view_type: "no_view"  # Enum: "ocean", "city", "mountain", "no_view"
  bed_configuration:
    - type: "double"
      count: 1  # Integer

# === GIÁ CẢ & TỒN KHO CHI TIẾT ===
pricing:
  base_price_vnd: 350000.0  # Giá cơ bản
  weekend_surcharge_percent: 32.33155598642754  # % phụ thu cuối tuần
  holiday_surcharge_percent: 0.0  # % phụ thu ngày lễ

# === ROOM FEATURES ===

# Mapped to English via AmenityMappingService using curl_step_2.5 (all amenities) as reference
room_amenity_tags:
  - "air_conditioning"
  - "free_bottled_water"
  - "hot_water"
  - "minibar"
  - "private_bathroom"
  - "standing_shower"
  - "toiletries"
  - "tv"

# === ROOM POLICIES ===

smoking_allowed: true
wifi_available: true
breakfast_included: true
cancellation_policy: "Chính sách tiêu chuẩn"
reschedule_policy: "Chính sách tiêu chuẩn"

# === INVENTORY INFO (STATIC) ===

quantity: 10
status: "active"

# === PRICING INFO (STATIC REFERENCE) ===

base_price: 350000
price_note: "Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống"  # Template string: "Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống"

# === ENHANCED: DAILY INVENTORY CALENDAR (NEXT 30 DAYS) ===

inventory_calendar:
  - date: "2025-11-29"  # ISO format: 2025-11-29
    day_of_week: "saturday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-11-30"  # ISO format: 2025-11-29
    day_of_week: "sunday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-01"  # ISO format: 2025-11-29
    day_of_week: "monday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-02"  # ISO format: 2025-11-29
    day_of_week: "tuesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-03"  # ISO format: 2025-11-29
    day_of_week: "wednesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-04"  # ISO format: 2025-11-29
    day_of_week: "thursday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-05"  # ISO format: 2025-11-29
    day_of_week: "friday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-06"  # ISO format: 2025-11-29
    day_of_week: "saturday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-07"  # ISO format: 2025-11-29
    day_of_week: "sunday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-08"  # ISO format: 2025-11-29
    day_of_week: "monday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-09"  # ISO format: 2025-11-29
    day_of_week: "tuesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-10"  # ISO format: 2025-11-29
    day_of_week: "wednesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-11"  # ISO format: 2025-11-29
    day_of_week: "thursday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-12"  # ISO format: 2025-11-29
    day_of_week: "friday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 308000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-13"  # ISO format: 2025-11-29
    day_of_week: "saturday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-14"  # ISO format: 2025-11-29
    day_of_week: "sunday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-15"  # ISO format: 2025-11-29
    day_of_week: "monday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-16"  # ISO format: 2025-11-29
    day_of_week: "tuesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-17"  # ISO format: 2025-11-29
    day_of_week: "wednesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-18"  # ISO format: 2025-11-29
    day_of_week: "thursday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-19"  # ISO format: 2025-11-29
    day_of_week: "friday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-20"  # ISO format: 2025-11-29
    day_of_week: "saturday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-21"  # ISO format: 2025-11-29
    day_of_week: "sunday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-22"  # ISO format: 2025-11-29
    day_of_week: "monday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-23"  # ISO format: 2025-11-29
    day_of_week: "tuesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-24"  # ISO format: 2025-11-29
    day_of_week: "wednesday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-25"  # ISO format: 2025-11-29
    day_of_week: "thursday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 262500.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-26"  # ISO format: 2025-11-29
    day_of_week: "friday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-27"  # ISO format: 2025-11-29
    day_of_week: "saturday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-28"  # ISO format: 2025-11-29
    day_of_week: "sunday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: true  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 455000.0  # Giá thực tế cho ngày này
    available_rooms: 10  # Số phòng còn trống
    status: "available"  # "available", "limited", "sold_out"
  - date: "2025-12-29"  # ISO format: 2025-11-29
    day_of_week: "monday"  # "monday", "tuesday", ..., "sunday"
    is_weekend: false  # Boolean
    is_holiday: false  # Boolean
    price_vnd: 350000.0  # Giá thực tế cho ngày này
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
  min_price_next_30_days: 262500.0
  max_price_next_30_days: 455000.0
  avg_price_next_30_days: 379693.5483870968
  price_volatility: "high"  # low/medium/high
  weekend_price_multiplier: 1.3233155598642754

# === ENHANCED: DETAILED ROOM POLICIES ===

room_policies_detail:
  policies_inherited: true
  check_in_time: ""
  check_out_time: ""
  allows_pay_at_hotel: false
  cancellation_policy:
  reschedule_policy:

# === ENHANCED: NEARBY ENTERTAINMENT (SIMPLIFIED FOR ROOM VIEW) ===

nearby_entertainment:
  - name: "Đường Hùng Vương Nha Trang"
    category: "Địa Điểm Lân Cận"
    distance: "244m"
    short_description: "Địa Điểm Lân Cận"
  - name: "Ga Nha Trang"
    category: "Địa Điểm Lân Cận"
    distance: "565m"
    short_description: "Địa Điểm Lân Cận"
  - name: "Công An Tỉnh Khánh Hòa"
    category: "Địa Điểm Lân Cận"
    distance: "727m"
    short_description: "Địa Điểm Lân Cận"
  - name: "Quảng trường 2 tháng 4"
    category: "Trung tâm giải trí"
    distance: "752m"
    short_description: "Trung tâm giải trí"
  - name: "Công viên nước Phù Đổng"
    category: "Địa Điểm Lân Cận"
    distance: "1.0km"
    short_description: "Địa Điểm Lân Cận"

# === VIBE TAGS (ROOM-SPECIFIC) ===
# INFERRED from room features: view, amenities, room_type, max_children
vibe_tags:
  - "standard"  # Inferred from: view contains "biển"/"ocean" → "sea_view", has bathtub + sea_view → "romantic", maxChildren > 0 → "family_friendly"

# === SEO KEYWORDS ===
keywords:
  - "standard double no view"  # Generated from: room.name, city.name, view, bed_type, room_type
  - "phòng thành phố nha trang"  # Generated from: room.name, city.name, view, bed_type, room_type
  - "phòng standard"  # Generated from: room.name, city.name, view, bed_type, room_type

---

# 🛏️ Standard Double No View - **Standard Double No View** là hạng phòng tại Golden Hotel Nha Trang, với diện tích 18.0m², phù hợp cho tối đa 2 người lớn.

![Standard Double No View](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/10019241-800x518-FIT_AND_TRIM-519e495dd0a4b9e1c786d6cbf2bdb205.jpg)

## 📏 Thông Số Phòng

- **Diện tích**: 18.0 m²

- **Ban công**: Không

- **Cửa sổ**: Có

- **Hướng nhìn**: Không có view

- **Giường**:  giường

## 📐 Thông Số Phòng (Chi Tiết)

| Đặc điểm              | Thông tin chi tiết                       |
|-----------------------|------------------------------------------|
| **Diện tích**         | 18.0 m²                         |
| **Loại giường**       | Giường đôi                            |
| **Sức chứa**          | Tối đa 2 người lớn + 0 trẻ em |
| **Hướng nhìn**        | Không có view                                 |

---

## 💎 Mô Tả Không Gian

**Standard Double No View** là hạng phòng  tại Golden Hotel Nha Trang, với diện tích 18.0m², phù hợp cho tối đa 2 người lớn và 0 trẻ em.


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

---

## 🍽️ Ăn Sáng & Dịch Vụ Ăn Uống

### Bữa Sáng Buffet (Đã Bao Gồm)
- ⏰ **Thời gian**: 06:00 - 10:00
- 🍳 **Menu**: Buffet quốc tế với nhiều món Á - Âu

---

## 💰 Giá & Tình Trạng Trong 7 Ngày Tới

| Ngày | Thứ | Giá (VNĐ) | Tình trạng |
|------|-----|-----------|------------|
| 2025-11-29 | saturday | 455000.0 | ✅ Còn 10 phòng |
| 2025-11-30 | sunday | 455000.0 | ✅ Còn 10 phòng |
| 2025-12-01 | monday | 350000.0 | ✅ Còn 10 phòng |
| 2025-12-02 | tuesday | 350000.0 | ✅ Còn 10 phòng |
| 2025-12-03 | wednesday | 350000.0 | ✅ Còn 10 phòng |
| 2025-12-04 | thursday | 350000.0 | ✅ Còn 10 phòng |
| 2025-12-05 | friday | 350000.0 | ✅ Còn 10 phòng |

## 📅 Lịch Tồn Kho & Giá (30 Ngày Tới)

### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |
### 📆 Thông Tin Theo Ngày
| Ngày | Thứ | Giá (VNĐ/đêm) | Phòng Trống | Loại Ngày |
|------|-----|---------------|-------------|-----------|
| 2025-11-29 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-11-30 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-01 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-02 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-03 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-04 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-05 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-06 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-07 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-08 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-09 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-10 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-11 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-12 | friday | 308000.0 | 10 | Ngày thường |
| 2025-12-13 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-14 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-15 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-16 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-17 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-18 | thursday | 350000.0 | 10 | Ngày thường |
| 2025-12-19 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-20 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-21 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-22 | monday | 350000.0 | 10 | Ngày thường |
| 2025-12-23 | tuesday | 350000.0 | 10 | Ngày thường |
| 2025-12-24 | wednesday | 350000.0 | 10 | Ngày thường |
| 2025-12-25 | thursday | 262500.0 | 10 | Ngày thường |
| 2025-12-26 | friday | 350000.0 | 10 | Ngày thường |
| 2025-12-27 | saturday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-28 | sunday | 455000.0 | 10 | 🌟 Cuối tuần |
| 2025-12-29 | monday | 350000.0 | 10 | Ngày thường |

---

## 💰 Phân Tích Giá

### 📊 Thống Kê Giá 30 Ngày Tới
- **Giá thấp nhất**: 262500.0 VNĐ/đêm
- **Giá cao nhất**: 455000.0 VNĐ/đêm
- **Giá trung bình**: 379693.5483870968 VNĐ/đêm
- **Mức độ biến động giá**: high
- **Hệ số giá cuối tuần**: x1.3233155598642754

### 📌 Lời Khuyên Đặt Phòng
- 💡 Giá biến động mạnh theo ngày. Nên đặt sớm để có giá tốt!

---

## 📋 Chính Sách Đặt Phòng Chi Tiết

_Lưu ý: Phòng này áp dụng chính sách của khách sạn._

### ❌ Chính Sách Hủy Phòng

### 🔄 Chính Sách Đổi Lịch

### 🚭 Quy Định Trong Phòng
- **Hút thuốc**: Cho phép
- **Thú cưng**: Không cho phép

## ⚠️ Chính Sách Phòng

- **Sức chứa tối đa**: 2 người lớn + 0 trẻ em


---

## 📊 Khả Năng Còn Phòng

### 📈 Phân Tích Tình Trạng Phòng
- Ngày **2025-11-29**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-11-30**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-01**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-02**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-03**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-04**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-05**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-06**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-07**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-08**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-09**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-10**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-11**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-12**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-13**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-14**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-15**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-16**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-17**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-18**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-19**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-20**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-21**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-22**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-23**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-24**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-25**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-26**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-27**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-28**: ✅ Còn nhiều phòng (10 phòng)
- Ngày **2025-12-29**: ✅ Còn nhiều phòng (10 phòng)

---

## 💰 Thông Tin Giá

> ⚠️ **QUAN TRỌNG: Giá Động Theo Ngày**
>
> Phòng **Standard Double No View** có **giá cơ bản** là **350000 VNĐ/đêm**, nhưng giá thực tế bạn phải trả sẽ **thay đổi** tùy vào:
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
> {{TOOL:get_room_price|room_id&#61;418668e2-147f-4df0-b874-89cbba9f3e71|check_in&#61;{date}|check_out&#61;{date}}}

---

## 🎯 Phù Hợp Với Ai?


---

## 📸 Hình Ảnh Phòng


![Standard Double No View](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/10019241-1827x1219-FIT_AND_TRIM-a36d9257b8ff3636c8ec151304d1293b.jpeg)

![Standard Double No View](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/10019241-2514x1699-FIT_AND_TRIM-b1fe75c115f7045ae38f6a9b9785ef62.jpeg)

---

## 🎯 Điểm Giải Trí Gần Đây

• **Đường Hùng Vương Nha Trang** (Địa Điểm Lân Cận): Địa Điểm Lân Cận - _Cách 244m_

• **Ga Nha Trang** (Địa Điểm Lân Cận): Địa Điểm Lân Cận - _Cách 565m_

• **Công An Tỉnh Khánh Hòa** (Địa Điểm Lân Cận): Địa Điểm Lân Cận - _Cách 727m_

• **Quảng trường 2 tháng 4** (Trung tâm giải trí): Trung tâm giải trí - _Cách 752m_

• **Công viên nước Phù Đổng** (Địa Điểm Lân Cận): Địa Điểm Lân Cận - _Cách 1.0km_



---

## 📞 Hỗ Trợ Đặt Phòng

Tôi có thể giúp bạn:
- ✅ Kiểm tra phòng trống cho ngày cụ thể
- ✅ Tính toán giá chính xác (bao gồm thuế, phí)
- ✅ Tìm mã giảm giá đang có hiệu lực
- ✅ Gợi ý combo tiết kiệm

Hãy cho tôi biết kế hoạch của bạn để được hỗ trợ tốt nhất! 😊