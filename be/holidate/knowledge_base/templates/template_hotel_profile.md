---
# ============================================================
# YAML FRONTMATTER - METADATA FOR VECTOR DB & FILTERING
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "hotel_profile"
doc_id: "00d60e60-d366-4d73-b3c0-614ecb95feb7"  # UUID from hotels.id
slug: "grand-mercure-danang"
last_updated: "2025-11-23T14:30:00Z"
language: "vi"

# === LOCATION HIERARCHY ===
# Source: Hotel entity → Country/Province/City/District/Ward/Street relationships
location:
  country: "vietnam"
  country_code: "VN"
  province: "da-nang"
  province_name: "Đà Nẵng"
  city: "da-nang" 
  city_name: "Thành phố Đà Nẵng"
  district: "son-tra"
  district_name: "Quận Sơn Trà"
  ward: "tho-quang"
  ward_name: "Phường Thọ Quang"
  street: "vo-nguyen-giap"
  street_name: "Võ Nguyên Giáp"
  address: "Lô A1, Đường Võ Nguyên Giáp, Phường Thọ Quang"
  coordinates:
    lat: 16.0544
    lng: 108.2442

# === SEARCH OPTIMIZATION TAGS ===
# Source: Location entity names + Entertainment venues + Manual curation
location_tags:
  - "Đà Nẵng"
  - "Sơn Trà"
  - "Bãi biển Mỹ Khê"
  - "Bán đảo Sơn Trà"
  - "Ngũ Hành Sơn"
  - "Chùa Linh Ứng"
  - "Biển Đà Nẵng"
  - "Phố biển"

# Source: HotelAmenity → Amenity relationship, mapped to English tags
amenity_tags:
  - "outdoor_pool"
  - "spa"
  - "fitness_center"
  - "beachfront"
  - "restaurant"
  - "beach_bar"
  - "free_wifi"
  - "airport_shuttle"
  - "24h_reception"
  - "room_service"
  - "kids_pool"
  - "parking"
  - "breakfast_buffet"
  - "meeting_rooms"
  - "laundry"
  - "concierge"

# Source: Inferred from star_rating + amenities + location + price range
vibe_tags:
  - "luxury"
  - "romantic"
  - "family_friendly"
  - "beach_resort"
  - "business"
  - "wedding_venue"

# === PRICING REFERENCE (STATIC) ===
# Source: MIN(rooms.base_price_per_night WHERE rooms.status='active')
reference_min_price: 1445000  # VNĐ
reference_min_price_room: "Superior Garden View"
reference_max_price: 4725000  # VNĐ (optional, for range display)

# === HOTEL CLASSIFICATION ===
# Source: Hotel.star_rating
star_rating: 5

# === BUSINESS METADATA ===
hotel_id: "00d60e60-d366-4d73-b3c0-614ecb95feb7"
partner_id: "510639ce-df36-4666-9d26-101388127029"
status: "active"  # From Hotel.status

# === PERFORMANCE STATS ===
# Source: Review aggregation (computed field)
total_rooms: 12
available_room_types: 4
review_score: 9.2  # From AVG(reviews.score)
review_count: 187  # From COUNT(reviews)

# === NEARBY ATTRACTIONS ===
# Source: HotelEntertainmentVenue → EntertainmentVenue relationships
nearby_venues:
  - name: "Bãi biển Mỹ Khê"
    distance: "200m"
    category: "beach"
    description: "Bãi biển đẹp nhất Việt Nam"
  - name: "Chùa Linh Ứng"
    distance: "5km"
    category: "temple"
    description: "Tượng Phật Quan Âm cao 67m"
  - name: "Asia Park Danang"
    distance: "8km"
    category: "theme_park"
    description: "Công viên giải trí Sun Wheel"
  - name: "Ngũ Hành Sơn"
    distance: "10km"
    category: "cultural"
    description: "Quần thể núi đá với hang động"
  - name: "Bà Nà Hills"
    distance: "30km"
    category: "theme_park"
    description: "Cầu Vàng và khu du lịch núi"

# === POLICIES ===
# Source: HotelPolicy entity
check_in_time: "14:00"
check_out_time: "12:00"
early_check_in_available: true
late_check_out_available: true
cancellation_policy: "Linh hoạ 7 ngày"  # From CancellationPolicy.name
allows_pay_at_hotel: false
smoking_policy: "Khu vực hút thuốc riêng"

# === SEO KEYWORDS ===
keywords:
  - "khách sạn 5 sao đà nẵng"
  - "resort biển mỹ khê"
  - "grand mercure danang"
  - "nghỉ dưỡng gia đình đà nẵng"
  - "khách sạn gần biển đà nẵng"
  - "resort spa đà nẵng"
  - "khách sạn tổ chức tiệc cưới"

---

# 🏨 Grand Mercure Danang - Thiên Đường Nghỉ Dưỡng Bên Bờ Biển Mỹ Khê

![Grand Mercure Danang](https://holidate-s3-bucket.s3.ap-southeast-1.amazonaws.com/hotels/grand-mercure/main-view.jpg)

## 📖 Giới Thiệu

**Grand Mercure Danang** là một trong những resort 5 sao hàng đầu tại Đà Nẵng, tọa lạc trên đoạn đường "Hoàng hôn đẹp nhất hành tinh" - Võ Nguyên Giáp, cách bãi biển Mỹ Khê chỉ vài bước chân. Với thiết kế hiện đại pha trộn nét kiến trúc Á Đông, khách sạn sở hữu 200 phòng và suite sang trọng, tất cả đều hướng biển hoặc view vườn nhiệt đới xanh mát.

Nơi đây là lựa chọn hoàn hảo cho những ai tìm kiếm sự kết hợp giữa nghỉ dưỡng thư giãn và khám phá thành phố năng động. Từ khách sạn, du khách có thể dễ dàng di chuyển đến các địa danh nổi tiếng như Bán đảo Sơn Trà, Ngũ Hành Sơn, hay Bà Nà Hills chỉ trong vòng 30 phút.

> 🌟 **Điểm nổi bật**: Được 187 du khách đánh giá **9.2/10** điểm - "Xuất sắc" về dịch vụ, vị trí và tiện nghi.

---

## ⭐ Đặc Điểm Nổi Bật

### 🏖️ 1. Vị Trí "Vàng" Ngay Sát Biển
- **200m đến bãi biển Mỹ Khê**: Được CNN bình chọn là một trong 6 bãi biển đẹp nhất hành tinh
- Nằm trên tuyến đường ven biển lãng mạn nhất Đà Nẵng
- Thuận tiện di chuyển: 10 phút đến trung tâm thành phố, 15 phút đến sân bay Đà Nẵng

### 💎 2. Tiện Nghi Resort Đẳng Cấp
- **Hồ bơi ngoài trời**: View biển panorama, kết nối với khu vực hồ bơi trẻ em
- **Ocean Spa & Wellness**: Phòng massage, xông hơi khô, phòng xông hơi ướt, jacuzzi
- **Phòng gym 24/7**: Trang bị máy móc hiện đại Technogym
- **3 nhà hàng & 2 quầy bar**: 
  - **The Sail Restaurant**: Buffet quốc tế với gần 100 món
  - **Maison Vie**: Ẩm thực Pháp fine dining
  - **Beach Bar**: Cocktail & BBQ seafood bên bờ biển

### 👨‍👩‍👧‍👦 3. Thân Thiện Với Gia Đình
- **Kids Club miễn phí**: Khu vui chơi trẻ em với hoạt động giám sát
- Hồ bơi trẻ em riêng biệt
- Menu trẻ em đặc biệt tại nhà hàng
- Dịch vụ trông trẻ theo yêu cầu

---

## 🛏️ Hạng Phòng Đa Dạng

Khách sạn cung cấp 4 loại phòng chính, phù hợp từ kỳ nghỉ gia đình đến chuyến công tác hay honeymoon:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|
| **Superior Garden View** | 42m²      | Vườn      | 2 người lớn + 1 trẻ em | Ban công riêng, phòng tắm đứng |
| **Deluxe Ocean View**    | 45m²      | Biển      | 2 người lớn + 1 trẻ em | Bồn tắm, view biển trực diện   |
| **Premium Suite**        | 72m²      | Biển      | 2 người lớn + 2 trẻ em | Phòng khách riêng, minibar miễn phí |
| **Presidential Suite**   | 120m²     | Biển      | 4 người lớn | 2 phòng ngủ, bồn tắm jacuzzi    |

> 💡 **Lưu ý**: Tất cả phòng đều được bao gồm:
> - ✅ WiFi tốc độ cao miễn phí
> - ✅ Bữa sáng buffet quốc tế
> - ✅ Nước đóng chai miễn phí hàng ngày
> - ✅ Máy pha cà phê/trà Nespresso

---

## 💰 Thông Tin Giá Tham Khảo

**Giá khởi điểm**: Từ **1.445.000 VNĐ**/đêm  
*(Áp dụng cho phòng **Superior Garden View**, 1-2 khách)*

**Giá cao nhất**: Khoảng **4.725.000 VNĐ**/đêm  
*(Presidential Suite, mùa cao điểm)*

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
> Tôi sẽ kiểm tra ngay: {{TOOL:check_availability|hotel_id=00d60e60-d366-4d73-b3c0-614ecb95feb7}}

---

## 📍 Địa Điểm Lân Cận

### 🏖️ Biển & Thiên Nhiên
- **Bãi biển Mỹ Khê** (200m): Bơi lội, lướt sóng, tắm biển
- **Bán đảo Sơn Trà** (5km): Trekking, ngắm khỉ hoang dã, Chùa Linh Ứng
- **Ngũ Hành Sơn** (10km): Khám phá hang động, chùa núi

### 🎡 Vui Chơi & Giải Trí
- **Asia Park** (8km): Công viên giải trí với vòng quay Sun Wheel cao nhất Việt Nam
- **Bà Nà Hills** (30km): Cầu Vàng, làng Pháp, cáp treo dài nhất thế giới

### 🍜 Ẩm Thực & Mua Sắm
- **Chợ Hàn** (6km): Chợ truyền thống, mua quà lưu niệm
- **Phố đi bộ An Thượng** (7km): Khu ẩm thực - bar - cafe sôi động về đêm
- **Vincom Plaza** (9km): Trung tâm thương mại hiện đại

---

## 📋 Chính Sách Khách Sạn

### ⏰ Giờ Nhận/Trả Phòng
- **Check-in**: Từ 14:00 (Hỗ trợ nhận phòng sớm tùy tình trạng phòng trống - có thể phát sinh phí)
- **Check-out**: Trước 12:00 (Trả phòng muộn đến 18:00 với phụ thu 50% giá phòng)

### ❌ Chính Sách Hủy Phòng
**Áp dụng gói "Linh hoạt 7 ngày"**:
- ✅ **Hủy MIỄN PHÍ** nếu hủy trước **7 ngày** so với ngày check-in
- ⚠️ **Hủy trong vòng 7 ngày**: Giữ lại 100% tiền phòng
- ⚠️ **No-show** (không đến nhận phòng): Không hoàn tiền

> 💡 **Gợi ý**: Một số loại phòng có gói "Không hoàn hủy" giá rẻ hơn 15-20% nếu bạn chắc chắn về kế hoạch.

### 💳 Thanh Toán
- **Phương thức**: 
  - ✅ Thanh toán online qua VNPay (ATM, Visa, Mastercard, QR Pay)
  - ❌ **KHÔNG** hỗ trợ thanh toán tại khách sạn
- **Hóa đơn VAT**: Cung cấp theo yêu cầu (thông báo trước khi đặt phòng)

### 🚭 Quy Định Khác
- **Hút thuốc**: Không cho phép hút thuốc trong phòng. Có khu vực hút thuốc riêng tại sân thượng.
- **Thú cưng**: Không cho phép
- **Trẻ em**: 
  - Trẻ dưới 6 tuổi ngủ chung giường bố mẹ: **Miễn phí**
  - Trẻ 6-12 tuổi: Phụ thu giường phụ **500.000 VNĐ/đêm**
  - Trên 12 tuổi: Tính như người lớn

### 📄 Giấy Tờ Yêu Cầu
- **Bắt buộc** khi check-in:
  - CMND/CCCD/Hộ chiếu (bản gốc)
  - Thẻ tín dụng/thẻ ghi nợ để giữ deposit (hoàn trả khi check-out)

---

## 🎯 Phù Hợp Với Ai?

✅ **Gia đình có trẻ nhỏ**: Kids club, hồ bơi trẻ em, menu trẻ em, phòng rộng  
✅ **Cặp đôi honeymoon**: View biển lãng mạn, spa couple, bữa tối riêng tư trên bãi biển  
✅ **Nhóm bạn**: Gần phố đi bộ, nhiều hoạt động thể thao nước  
✅ **Khách công tác**: Phòng họp, wifi tốc độ cao, gần sân bay  
✅ **Tổ chức sự kiện**: Hội trường 500 khách, dịch vụ tiệc cưới chuyên nghiệp  

---

## 📞 Liên Hệ & Hỗ Trợ

Bạn có câu hỏi về khách sạn này? Tôi có thể giúp bạn:
- 🔍 Kiểm tra phòng trống cho ngày cụ thể
- 💰 So sánh giá các loại phòng
- 🎁 Tìm mã giảm giá đang có hiệu lực
- 📧 Liên hệ trực tiếp với khách sạn về yêu cầu đặc biệt

Hãy cho tôi biết kế hoạch của bạn! 😊

---

## 🏷️ Tags liên quan
`#khachsan5sao` `#danangresort` `#nghidưỡngbiển` `#giađìnhviệtnam` `#honeymoon` `#mykhếbeach` `#luxuryhotel` `#việtnamtravel`

---

<!-- 
====================================================================
DTO MAPPING REFERENCE (For AI Training)
====================================================================

FRONTMATTER MAPPING:
- doc_id → Hotel.id
- slug → Slugify(Hotel.name)
- location.* → Hotel.country/province/city/district/ward/street (all entities)
- location.address → Hotel.address
- location.coordinates → Hotel.latitude, Hotel.longitude
- location_tags → Manual curation + HotelEntertainmentVenue.entertainment_venue.name
- amenity_tags → HotelAmenity → Amenity.name (mapped to English keys)
- vibe_tags → Inferred from star_rating + amenity_tags + location_tags + min_price
- reference_min_price → MIN(Room.base_price_per_night WHERE Room.status='active')
- reference_min_price_room → Room.name of cheapest active room
- star_rating → Hotel.star_rating
- hotel_id → Hotel.id
- partner_id → Hotel.partner_id
- status → Hotel.status
- total_rooms → COUNT(Room WHERE Room.hotel_id = Hotel.id)
- review_score → AVG(Review.score WHERE Review.hotel_id = Hotel.id)
- review_count → COUNT(Review WHERE Review.hotel_id = Hotel.id)
- nearby_venues[] → HotelEntertainmentVenue → EntertainmentVenue (name, distance calculated)
- check_in_time → HotelPolicy.check_in_time
- check_out_time → HotelPolicy.check_out_time
- cancellation_policy → HotelPolicy.cancellation_policy.name
- allows_pay_at_hotel → HotelPolicy.allows_pay_at_hotel

BODY CONTENT MAPPING:
- H1 Title → Hotel.name
- Introduction paragraph → Hotel.description (enhanced with location context)
- "Vị Trí" section → Hotel.location + distance to entertainment_venues
- "Tiện Nghi" section → HotelAmenity[] grouped by AmenityCategory
- "Hạng Phòng" table → Room[] (name, area, view, max_adults, max_children)
- "Giá Tham Khảo" → reference_min_price + disclaimer + tool call placeholder
- "Địa Điểm Lân Cận" → HotelEntertainmentVenue → EntertainmentVenue (with category)
- "Chính Sách" section → HotelPolicy (check in/out time, cancellation rules, payment)

DYNAMIC PLACEHOLDERS:
- {{TOOL:check_availability}} → Triggered when user asks about specific dates
- {{TOOL:get_room_price}} → Triggered when user asks about specific room price
- {{TOOL:compare_rooms}} → Triggered when user wants to compare room types

DTO SOURCES:
- Primary: HotelDetailsResponse (from HotelController.getById)
- Secondary: HotelResponse (from HotelController.getAll - for listing)
- Related: RoomResponse[], AmenityResponse[], PolicyResponse, ReviewSummary

DATA FRESHNESS:
- Static data (name, description, amenities): Updated on hotel edit
- Reference prices: Recalculated weekly via batch job
- Review scores: Updated daily via scheduler
- Availability: NEVER hardcoded, always via tool call

PROHIBITED DATA:
- DO NOT include: commission_rate, partner contact info, internal IDs
- DO NOT hardcode: exact prices for specific dates, current availability
- DO NOT expose: Admin-only fields, Partner-only metrics

====================================================================
-->

