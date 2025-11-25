---
# ============================================================
# YAML FRONTMATTER - METADATA FOR VECTOR DB & FILTERING
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "hotel_profile"
doc_id: "{{doc_id}}"  # UUID from hotels.id
slug: "{{slug}}"
last_updated: "{{last_updated}}"
language: "vi"

# === LOCATION HIERARCHY ===
# Source: Hotel entity → Country/Province/City/District/Ward/Street relationships
location:
  country: "{{location.country}}"
  country_code: "{{location.country_code}}"
  province: "{{location.province}}"
  province_name: "{{location.province_name}}"
  city: "{{location.city}}" 
  city_name: "{{location.city_name}}"
  district: "{{location.district}}"
  district_name: "{{location.district_name}}"
  ward: "{{location.ward}}"
  ward_name: "{{location.ward_name}}"
  street: "{{location.street}}"
  street_name: "{{location.street_name}}"
  address: "{{location.address}}"
  coordinates:
    lat: {{location.coordinates.lat}}
    lng: {{location.coordinates.lng}}

# === SEARCH OPTIMIZATION TAGS ===
# Source: Location entity names + Entertainment venues + Manual curation
location_tags:
{{#location_tags}}
  - "{{.}}"
{{/location_tags}}

# Source: HotelAmenity → Amenity relationship, mapped to English tags
amenity_tags:
{{#amenity_tags}}
  - "{{.}}"
{{/amenity_tags}}

# Source: Inferred from star_rating + amenities + location + price range
vibe_tags:
{{#vibe_tags}}
  - "{{.}}"
{{/vibe_tags}}

# === PRICING REFERENCE (STATIC) ===
# Source: MIN(rooms.base_price_per_night WHERE rooms.status='active')
reference_min_price: {{reference_min_price}}  # VNĐ
reference_min_price_room: "{{reference_min_price_room}}"
reference_max_price: {{reference_max_price}}  # VNĐ (optional, for range display)

# === HOTEL CLASSIFICATION ===
# Source: Hotel.star_rating
star_rating: {{star_rating}}

# === BUSINESS METADATA ===
hotel_id: "{{hotel_id}}"
partner_id: "{{partner_id}}"
status: "{{status}}"  # From Hotel.status

# === PERFORMANCE STATS ===
# Source: Review aggregation (computed field)
total_rooms: {{total_rooms}}
available_room_types: {{available_room_types}}
review_score: {{review_score}}  # From AVG(reviews.score)
review_count: {{review_count}}  # From COUNT(reviews)

# === NEARBY ATTRACTIONS ===
# Source: HotelEntertainmentVenue → EntertainmentVenue relationships
nearby_venues:
{{#nearby_venues}}
  - name: "{{name}}"
    distance: "{{distance}}"
    category: "{{category}}"
    description: "{{description}}"
{{/nearby_venues}}

# === POLICIES ===
# Source: HotelPolicy entity
check_in_time: "{{check_in_time}}"
check_out_time: "{{check_out_time}}"
early_check_in_available: {{early_check_in_available}}
late_check_out_available: {{late_check_out_available}}
cancellation_policy: "{{cancellation_policy}}"  # From CancellationPolicy.name
allows_pay_at_hotel: {{allows_pay_at_hotel}}
smoking_policy: "{{smoking_policy}}"

# === SEO KEYWORDS ===
keywords:
{{#keywords}}
  - "{{.}}"
{{/keywords}}

---

# 🏨 {{name}} - Thiên Đường Nghỉ Dưỡng Bên Bờ Biển Mỹ Khê

![{{name}}]({{mainImageUrl}})

## 📖 Giới Thiệu

{{description}}

> 🌟 **Điểm nổi bật**: Được {{review_count}} du khách đánh giá **{{review_score}}/10** điểm - "Xuất sắc" về dịch vụ, vị trí và tiện nghi.

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

Khách sạn cung cấp {{available_room_types}} loại phòng chính, phù hợp từ kỳ nghỉ gia đình đến chuyến công tác hay honeymoon:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|
{{#rooms}}
| **{{name}}** | {{area}}m²      | {{view}}      | {{max_adults}} người lớn{{#max_children}} + {{max_children}} trẻ em{{/max_children}} | {{#breakfast_included}}Bữa sáng miễn phí{{/breakfast_included}}{{#wifi_available}} WiFi miễn phí{{/wifi_available}} |
{{/rooms}}

> 💡 **Lưu ý**: Tất cả phòng đều được bao gồm:
> - ✅ WiFi tốc độ cao miễn phí
> - ✅ Bữa sáng buffet quốc tế
> - ✅ Nước đóng chai miễn phí hàng ngày
> - ✅ Máy pha cà phê/trà Nespresso

---

## 💰 Thông Tin Giá Tham Khảo

**Giá khởi điểm**: Từ **{{reference_min_price}} VNĐ**/đêm  
*(Áp dụng cho phòng **{{reference_min_price_room}}**, 1-2 khách)*

{{#reference_max_price}}
**Giá cao nhất**: Khoảng **{{reference_max_price}} VNĐ**/đêm  
*({{reference_max_price_room}}, mùa cao điểm)*
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
> Tôi sẽ kiểm tra ngay cho khách sạn này.

---

## 📍 Địa Điểm Lân Cận

{{#nearby_venues}}
- **{{name}}** ({{distance}}): {{description}}
{{/nearby_venues}}

---

## 📋 Chính Sách Khách Sạn

### ⏰ Giờ Nhận/Trả Phòng
- **Check-in**: Từ {{check_in_time}}{{#early_check_in_available}} (Hỗ trợ nhận phòng sớm tùy tình trạng phòng trống - có thể phát sinh phí){{/early_check_in_available}}
- **Check-out**: Trước {{check_out_time}}{{#late_check_out_available}} (Trả phòng muộn đến 18:00 với phụ thu 50% giá phòng){{/late_check_out_available}}

### ❌ Chính Sách Hủy Phòng
**Áp dụng gói "{{cancellation_policy}}"**:
- ✅ **Hủy MIỄN PHÍ** nếu hủy trước **7 ngày** so với ngày check-in
- ⚠️ **Hủy trong vòng 7 ngày**: Giữ lại 100% tiền phòng
- ⚠️ **No-show** (không đến nhận phòng): Không hoàn tiền

> 💡 **Gợi ý**: Một số loại phòng có gói "Không hoàn hủy" giá rẻ hơn 15-20% nếu bạn chắc chắn về kế hoạch.

### 💳 Thanh Toán
- **Phương thức**: 
  - ✅ Thanh toán online qua VNPay (ATM, Visa, Mastercard, QR Pay)
  {{#allows_pay_at_hotel}}
  - ✅ Hỗ trợ thanh toán tại khách sạn
  {{/allows_pay_at_hotel}}
  {{^allows_pay_at_hotel}}
  - ❌ **KHÔNG** hỗ trợ thanh toán tại khách sạn
  {{/allows_pay_at_hotel}}
- **Hóa đơn VAT**: Cung cấp theo yêu cầu (thông báo trước khi đặt phòng)

### 🚭 Quy Định Khác
- **Hút thuốc**: {{smoking_policy}}
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

