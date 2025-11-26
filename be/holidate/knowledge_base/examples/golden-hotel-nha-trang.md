---
# ============================================================
# YAML FRONTMATTER - METADATA FOR VECTOR DB & FILTERING
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "hotel_profile"
doc_id: "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf"  # Source: curl_step_2.1 -> data.id (GET /accommodation/hotels/{id})
slug: "golden-hotel-nha-trang"  # Source: Generated from curl_step_2.1 -> data.name
last_updated: "2025-11-27T01:45:03.5726007Z"  # Source: curl_step_2.1 -> data.updatedAt (fallback to createdAt if null)
language: "vi"

# === LOCATION HIERARCHY ===
# Source: curl_step_2.1 -> data.country/province/city/district/ward/street
location:
  country: "viet-nam"  # Source: curl_step_2.1 -> data.country.name
  country_code: "VN"  # Source: curl_step_2.1 -> data.country.code
  province: "tinh-khanh-hoa"  # Source: curl_step_2.1 -> data.province.name
  province_name: "Tỉnh Khánh Hòa"  # Source: curl_step_2.1 -> data.province.name
  city: "thanh-pho-nha-trang"  # Source: curl_step_2.1 -> data.city.name
  city_name: "Thành phố Nha Trang"  # Source: curl_step_2.1 -> data.city.name
  district: "thanh-pho-nha-trang"  # Source: curl_step_2.1 -> data.district.name
  district_name: "Thành phố Nha Trang"  # Source: curl_step_2.1 -> data.district.name
  ward: "phuong-loc-tho"  # Source: curl_step_2.1 -> data.ward.name
  ward_name: "Phường Lộc Thọ"  # Source: curl_step_2.1 -> data.ward.name
  street: "duong-hung-vuong"  # Source: curl_step_2.1 -> data.street.name
  street_name: "Đường Hùng Vương"  # Source: curl_step_2.1 -> data.street.name
  address: "136"  # Source: curl_step_2.1 -> data.address
  coordinates:
    lat: 0.0  # Source: curl_step_2.1 -> data.latitude
    lng: 0.0  # Source: curl_step_2.1 -> data.longitude

# === SEARCH OPTIMIZATION TAGS ===
# Source: Generated from location + entertainment venues
location_tags:
  - "viet_nam"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "tinh_khanh_hoa"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "thanh_pho_nha_trang"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "beach_city"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "resort_city"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "phuong_loc_tho"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_beach"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_park"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_market"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_museum"  # Generated from: city.name, district.name, + venue names from curl_step_2.4

# Source: curl_step_2.1 -> data.amenities[] -> amenity.name (Vietnamese)
# Mapped to English via AmenityMappingService using curl_step_2.5 (all amenities) as reference
amenity_tags:

# Source: Inferred from star_rating + amenities + location + price range
vibe_tags:
  - "boutique"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "budget_friendly"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags

# === PRICING REFERENCE (STATIC) ===
# Source: curl_step_2.2 -> data.content[] -> MIN(basePricePerNight) where status='active'
reference_min_price: 0  # VNĐ - Source: MIN from curl_step_2.2
reference_min_price_room: "N/A"  # Source: Room.name of cheapest room from curl_step_2.2
reference_max_price: 0  # VNĐ - Source: MAX from curl_step_2.2 (optional)

# === HOTEL CLASSIFICATION ===
# Source: curl_step_2.1 -> data.starRating
star_rating: 4

# === BUSINESS METADATA ===
hotel_id: "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf"  # Source: curl_step_2.1 -> data.id
partner_id: ""  # Source: curl_step_2.1 -> data.partner.id
status: "active"  # Source: curl_step_2.1 -> data.status

# === PERFORMANCE STATS ===
# Source: curl_step_2.2 -> data.content.length (total rooms)
total_rooms: 10  # Source: curl_step_2.2 -> data.totalItems
available_room_types: 10  # Source: curl_step_2.2 -> COUNT(DISTINCT data.content[].name)

# Source: curl_step_2.3 -> Aggregated from reviews
review_score: 7.0  # Source: curl_step_2.3 -> AVG(data.content[].score) or null if empty
review_count: 1  # Source: curl_step_2.3 -> data.totalItems

# === NEARBY ATTRACTIONS ===
# Source: curl_step_2.1 -> data.entertainmentVenues[] OR curl_step_2.4 -> data[].entertainmentVenues[]
nearby_venues:
  - name: "Đường Nguyễn Thiện Thuật Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "162m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Tháp Trầm Hương"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "621m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Giordano Vincom Trần Phú Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "306m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Nhà Nghỉ Phúc Lộc Cảnh"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "212m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "378m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Trần Phú"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "287m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "OASIS"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "22m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Hùng Vương Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "278m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Central Park"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "927m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Nhà thờ Núi Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.5km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Chợ Đầm"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.2km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Biển Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "240m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Vincom Plaza Lê Thánh Tôn, Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "911m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Stay 7 International Hotel Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "226m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Công An Tỉnh Khánh Hòa"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "262m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Sailing Club Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "294m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Alpha Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "363m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Bệnh viện quốc tế Vinmec Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "3.0km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Bảo tàng Không quân Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "290m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Chùa Long Sơn"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.5km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Quảng trường 2 tháng 4"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "498m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "306m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Hội Nông Dân Tỉnh Khánh Hòa"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.3km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Armenia Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "264m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance

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
mainImageUrl: "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[0].url (first photo, or filter by category name="main")
galleryImageUrls:
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-85b3ba41998cace6b8c56e546ad9a0bc.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-b0698f733b24661b9d24b98b30019ca1.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)

# === SEO KEYWORDS ===
keywords:
  - "golden hotel nha trang"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "khách sạn thành phố nha trang"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "thành phố nha trang"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags

---

# 🏨 Golden Hotel Nha Trang

![Golden Hotel Nha Trang](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg)

## 📖 Giới Thiệu

Hãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Golden Hotel Nha Trang, một nơi nghỉ tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.&#10;&#10;Khách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Golden Hotel Nha Trang&#10;&#10;Nếu dự định có một kỳ nghỉ dài, thì Golden Hotel Nha Trang chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, Golden Hotel Nha Trang sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.&#10;&#10;Golden Hotel Nha Trang là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.&#10;&#10;Du lịch một mình cũng không hề kém phần thú vị và Golden Hotel Nha Trang là nơi thích hợp dành riêng cho những ai đề cao sự riêng tư trong kỳ lưu trú.&#10;&#10;Dịch vụ tuyệt vời, cơ sở vật chất hoàn chỉnh và các tiện nghi nơi nghỉ cung cấp sẽ khiến quý khách không thể phàn nàn trong suốt kỳ lưu trú tại Golden Hotel Nha Trang.&#10;&#10;Quầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.&#10;&#10;Tận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Golden Hotel Nha Trang chỉ dành riêng cho quý khách.&#10;&#10;Sóng WiFi phủ khắp các khu vực chung của nơi nghỉ cho phép quý khách luôn kết nối với gia đình và bè bạn.&#10;&#10;Golden Hotel Nha Trang là nơi nghỉ sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.&#10;&#10;Với những tiện nghi sẵn có Golden Hotel Nha Trang thực sự là một nơi lưu trú hoàn hảo.  # Source: curl_step_2.1 -> data.description

> 🌟 **Điểm nổi bật**: Được 1 du khách đánh giá **7.0/10** điểm - "Tốt" về dịch vụ, vị trí và tiện nghi.

---

## ⭐ Đặc Điểm Nổi Bật

### 🏖️ 1. Vị Trí
- **136**, Đường Hùng Vương, Phường Lộc Thọ, Thành phố Nha Trang, Thành phố Nha Trang
- **Đường Nguyễn Thiện Thuật Nha Trang**: 162m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Tháp Trầm Hương**: 621m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Giordano Vincom Trần Phú Nha Trang**: 306m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Nhà Nghỉ Phúc Lộc Cảnh**: 212m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang**: 378m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Đường Trần Phú**: 287m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **OASIS**: 22m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Đường Hùng Vương Nha Trang**: 278m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Central Park**: 927m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Nhà thờ Núi Nha Trang**: 1.5km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Chợ Đầm**: 2.2km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Biển Nha Trang**: 240m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Vincom Plaza Lê Thánh Tôn, Nha Trang**: 911m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Stay 7 International Hotel Nha Trang**: 226m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Công An Tỉnh Khánh Hòa**: 262m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Sailing Club Nha Trang**: 294m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Alpha Nha Trang**: 363m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Bệnh viện quốc tế Vinmec Nha Trang**: 3.0km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Bảo tàng Không quân Nha Trang**: 290m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Chùa Long Sơn**: 2.5km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Quảng trường 2 tháng 4**: 498m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels**: 306m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Hội Nông Dân Tỉnh Khánh Hòa**: 2.3km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Armenia Nha Trang**: 264m  # Source: curl_step_2.1 -> data.entertainmentVenues

### 💎 2. Tiện Nghi Khách Sạn

### 👨‍👩‍👧‍👦 3. Thân Thiện Với Gia Đình

---

## 🛏️ Hạng Phòng Đa Dạng

Khách sạn cung cấp 10 loại phòng chính:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|
  # Source: curl_step_2.2 -> data.content[]
| **Senior Balcony City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Senior Double With City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Senior Twin With City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Deluxe Triple With City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Senior Double With Ocean View** | 25.0m²      | Hướng mặt biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Superior Double City View** | 18.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Deluxe Without Balcony City View** | 32.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Senior Balcony Ocean View** | 25.0m²      | Hướng mặt biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Deluxe Twin With City View** | 33.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Standard Double No View** | 18.0m²      | Không có view      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

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
> Tôi sẽ kiểm tra ngay: {{TOOL:check_availability|hotel_id=4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf|check_in={date}|check_out={date}}}

---

## 📍 Địa Điểm Lân Cận

  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Đường Nguyễn Thiện Thuật Nha Trang** (162m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Tháp Trầm Hương** (621m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Giordano Vincom Trần Phú Nha Trang** (306m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Nhà Nghỉ Phúc Lộc Cảnh** (212m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang** (378m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Đường Trần Phú** (287m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **OASIS** (22m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Đường Hùng Vương Nha Trang** (278m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Central Park** (927m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Nhà thờ Núi Nha Trang** (1.5km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Chợ Đầm** (2.2km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Biển Nha Trang** (240m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Vincom Plaza Lê Thánh Tôn, Nha Trang** (911m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Stay 7 International Hotel Nha Trang** (226m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Công An Tỉnh Khánh Hòa** (262m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Sailing Club Nha Trang** (294m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Alpha Nha Trang** (363m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Bệnh viện quốc tế Vinmec Nha Trang** (3.0km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Bảo tàng Không quân Nha Trang** (290m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Chùa Long Sơn** (2.5km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Quảng trường 2 tháng 4** (498m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels** (306m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Hội Nông Dân Tỉnh Khánh Hòa** (2.3km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Armenia Nha Trang** (264m): 

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