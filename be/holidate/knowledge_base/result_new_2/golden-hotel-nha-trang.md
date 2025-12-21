---
# ============================================================
# YAML FRONTMATTER - METADATA FOR VECTOR DB & FILTERING
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "hotel_profile"
doc_id: "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf"
slug: "golden-hotel-nha-trang"
last_updated: "2025-11-29T10:25:15.9649872Z"
language: "vi"

# === LOCATION HIERARCHY ===

location:
  country: "viet-nam"
  country_code: "VN"
  province: "tinh-khanh-hoa"
  province_name: "Tỉnh Khánh Hòa"
  city: "thanh-pho-nha-trang"
  city_name: "Thành phố Nha Trang"
  district: "thanh-pho-nha-trang"
  district_name: "Thành phố Nha Trang"
  ward: "phuong-loc-tho"
  ward_name: "Phường Lộc Thọ"
  street: "duong-hung-vuong"
  street_name: "Đường Hùng Vương"
  address: "136"

# === ĐỊA CHỈ VÀ VỊ TRÍ CHI TIẾT ===
full_address: "136, Đường Hùng Vương, Phường Lộc Thọ, Thành phố Nha Trang, Thành phố Nha Trang"

# === KHOẢNG CÁCH ĐẾN ĐỊA ĐIỂM QUAN TRỌNG (TÍNH BẰNG MÉT) ===
distances:
  to_beach_meters: 0  # Integer, Ví dụ: 240
  to_city_center_meters: 498  # Integer
  to_airport_meters: 0  # Integer

# === SEARCH OPTIMIZATION TAGS ===

location_tags:
  - "viet_nam"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "tinh_khanh_hoa"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "thanh_pho_nha_trang"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "beach_city"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "resort_city"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "phuong_loc_tho"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_beach"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_market"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_park"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_museum"  # Generated from: city.name, district.name, + venue names from curl_step_2.4


# Mapped to English via AmenityMappingService using curl_step_2.5 (all amenities) as reference
amenity_tags:


vibe_tags:
  - "boutique"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "budget_friendly"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags

# === PRICING REFERENCE (STATIC) ===

reference_min_price: 0  # VNĐ - Source: MIN from curl_step_2.2
reference_min_price_room: "N/A"
reference_max_price: 0  # VNĐ - Source: MAX from curl_step_2.2 (optional)

# === HOTEL CLASSIFICATION ===

star_rating: 4

# === BUSINESS METADATA ===
hotel_id: "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf"
partner_id: ""
status: "active"

# === PERFORMANCE STATS ===

total_rooms: 10
available_room_types: 10


review_score: 7.0
review_count: 1

# === NEARBY ATTRACTIONS ===

nearby_venues:
  - name: "Hội Nông Dân Tỉnh Khánh Hòa"
    distance: "2.3km"
    category: "Khác"
    description: ""  # Optional: Generated from category + distance
  - name: "Công An Tỉnh Khánh Hòa"
    distance: "262m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Biển Nha Trang"
    distance: "240m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Nhà thờ Núi Nha Trang"
    distance: "1.5km"
    category: "Khác"
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Hùng Vương Nha Trang"
    distance: "278m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Chợ Đầm"
    distance: "2.2km"
    category: "Trung tâm giải trí"
    description: ""  # Optional: Generated from category + distance
  - name: "Bệnh viện quốc tế Vinmec Nha Trang"
    distance: "3.0km"
    category: "Khác"
    description: ""  # Optional: Generated from category + distance
  - name: "Stay 7 International Hotel Nha Trang"
    distance: "226m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Tháp Trầm Hương"
    distance: "621m"
    category: "Trung tâm giải trí"
    description: ""  # Optional: Generated from category + distance
  - name: "Giordano Vincom Trần Phú Nha Trang"
    distance: "306m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Central Park"
    distance: "927m"
    category: "Khác"
    description: ""  # Optional: Generated from category + distance
  - name: "Alpha Nha Trang"
    distance: "363m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels"
    distance: "306m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Chùa Long Sơn"
    distance: "2.5km"
    category: "Khác"
    description: ""  # Optional: Generated from category + distance
  - name: "Nhà Nghỉ Phúc Lộc Cảnh"
    distance: "212m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Bảo tàng Không quân Nha Trang"
    distance: "290m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Sailing Club Nha Trang"
    distance: "294m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Quảng trường 2 tháng 4"
    distance: "498m"
    category: "Trung tâm giải trí"
    description: ""  # Optional: Generated from category + distance
  - name: "Armenia Nha Trang"
    distance: "264m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "OASIS"
    distance: "22m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Nguyễn Thiện Thuật Nha Trang"
    distance: "162m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Trần Phú"
    distance: "287m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Vincom Plaza Lê Thánh Tôn, Nha Trang"
    distance: "911m"
    category: "Trung tâm giải trí"
    description: ""  # Optional: Generated from category + distance
  - name: "Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang"
    distance: "378m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance

# === ENHANCED: DETAILED ENTERTAINMENT VENUES BY CATEGORY ===

entertainment_venues:

# === POLICIES ===

check_in_time: "14:00"
check_out_time: "12:00"
early_check_in_available: true
late_check_out_available: true
cancellation_policy: "Chính sách tiêu chuẩn"
reschedule_policy: "Chính sách tiêu chuẩn"
allows_pay_at_hotel: false
smoking_policy: "Khu vực hút thuốc riêng"

# === CHÍNH SÁCH NHẬN/TRẢ PHÒNG ===
check_in_policy:
  earliest_time: "14:00"
  latest_time: "22:00"
check_out_policy:
  latest_time: "12:00"
  late_checkout_available: false  # Boolean
  late_checkout_fee: "50% giá phòng"

# === TIỆN NGHI THEO DANH MỤC (CẤU TRÚC CHI TIẾT) ===
amenities_by_category:

# === CHÍNH SÁCH ĐẶC BIỆT ===
policies:
  pets_allowed: false  # Boolean
  smoking_allowed: false  # Boolean
  children_policy: "Trẻ em dưới 6 tuổi được ở miễn phí khi ngủ chung giường với bố mẹ"

# === ENHANCED: DETAILED POLICY RULES ===

policies_detail:
  check_in_time: ""
  check_out_time: ""
  allows_pay_at_hotel:
  cancellation_policy:
  reschedule_policy:

# === ENHANCED: COMPREHENSIVE REVIEW STATISTICS ===

reviews_summary:

# === ENHANCED: ACTIVE DISCOUNTS ===

active_discounts:

# === IMAGES ===
mainImageUrl: "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg"
galleryImageUrls:
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg"
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg"
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-b0698f733b24661b9d24b98b30019ca1.jpeg"
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-85b3ba41998cace6b8c56e546ad9a0bc.jpeg"

# === SEO KEYWORDS ===
keywords:
  - "golden hotel nha trang"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "khách sạn thành phố nha trang"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "thành phố nha trang"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags

---

# 🏨 Golden Hotel Nha Trang -

![Golden Hotel Nha Trang](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg)

## 📖 Giới Thiệu

Hãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Golden Hotel Nha Trang, một nơi nghỉ tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.&#10;&#10;Khách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Golden Hotel Nha Trang&#10;&#10;Nếu dự định có một kỳ nghỉ dài, thì Golden Hotel Nha Trang chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, Golden Hotel Nha Trang sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.&#10;&#10;Golden Hotel Nha Trang là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.&#10;&#10;Du lịch một mình cũng không hề kém phần thú vị và Golden Hotel Nha Trang là nơi thích hợp dành riêng cho những ai đề cao sự riêng tư trong kỳ lưu trú.&#10;&#10;Dịch vụ tuyệt vời, cơ sở vật chất hoàn chỉnh và các tiện nghi nơi nghỉ cung cấp sẽ khiến quý khách không thể phàn nàn trong suốt kỳ lưu trú tại Golden Hotel Nha Trang.&#10;&#10;Quầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.&#10;&#10;Tận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Golden Hotel Nha Trang chỉ dành riêng cho quý khách.&#10;&#10;Sóng WiFi phủ khắp các khu vực chung của nơi nghỉ cho phép quý khách luôn kết nối với gia đình và bè bạn.&#10;&#10;Golden Hotel Nha Trang là nơi nghỉ sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.&#10;&#10;Với những tiện nghi sẵn có Golden Hotel Nha Trang thực sự là một nơi lưu trú hoàn hảo.

> 🌟 **Điểm nổi bật**: Được 1 du khách đánh giá **7.0/10** điểm - "Tốt" về dịch vụ, vị trí và tiện nghi.

---

## 📍 Vị Trí & Liên Hệ

**Địa chỉ đầy đủ**: 136, Đường Hùng Vương, Phường Lộc Thọ, Thành phố Nha Trang, Thành phố Nha Trang


**Cách biển Nha Trang**: 0 mét (~ km)

- **Hội Nông Dân Tỉnh Khánh Hòa**: 2.3km
- **Công An Tỉnh Khánh Hòa**: 262m
- **Biển Nha Trang**: 240m
- **Nhà thờ Núi Nha Trang**: 1.5km
- **Đường Hùng Vương Nha Trang**: 278m
- **Chợ Đầm**: 2.2km
- **Bệnh viện quốc tế Vinmec Nha Trang**: 3.0km
- **Stay 7 International Hotel Nha Trang**: 226m
- **Tháp Trầm Hương**: 621m
- **Giordano Vincom Trần Phú Nha Trang**: 306m
- **Central Park**: 927m
- **Alpha Nha Trang**: 363m
- **Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels**: 306m
- **Chùa Long Sơn**: 2.5km
- **Nhà Nghỉ Phúc Lộc Cảnh**: 212m
- **Bảo tàng Không quân Nha Trang**: 290m
- **Sailing Club Nha Trang**: 294m
- **Quảng trường 2 tháng 4**: 498m
- **Armenia Nha Trang**: 264m
- **OASIS**: 22m
- **Đường Nguyễn Thiện Thuật Nha Trang**: 162m
- **Đường Trần Phú**: 287m
- **Vincom Plaza Lê Thánh Tôn, Nha Trang**: 911m
- **Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang**: 378m

## ⏰ Giờ Nhận/Trả Phòng

- **Nhận phòng**: Từ 14:00 đến 22:00

- **Trả phòng**: Trước 12:00


## ⭐ Đặc Điểm Nổi Bật

### 🏖️ 1. Vị Trí
- **136**, Đường Hùng Vương, Phường Lộc Thọ, Thành phố Nha Trang, Thành phố Nha Trang

### ✨ Tiện Nghi Nổi Bật

### 👨‍👩‍👧‍👦 3. Thân Thiện Với Gia Đình

---

## 🛏️ Hạng Phòng Đa Dạng

Khách sạn cung cấp 10 loại phòng chính:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|

| **Deluxe Triple With City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Senior Balcony Ocean View** | 25.0m²      | Hướng mặt biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Standard Double No View** | 18.0m²      | Không có view      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Superior Double City View** | 18.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Deluxe Twin With City View** | 33.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Senior Double With Ocean View** | 25.0m²      | Hướng mặt biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Senior Twin With City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Senior Double With City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Deluxe Without Balcony City View** | 32.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Senior Balcony City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

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
> Tôi sẽ kiểm tra ngay: {{TOOL:check_availability|hotel_id&#61;4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf|check_in&#61;{date}|check_out&#61;{date}}}

---

## 📍 Địa Điểm Lân Cận


- **Hội Nông Dân Tỉnh Khánh Hòa** (2.3km):

- **Công An Tỉnh Khánh Hòa** (262m):

- **Biển Nha Trang** (240m):

- **Nhà thờ Núi Nha Trang** (1.5km):

- **Đường Hùng Vương Nha Trang** (278m):

- **Chợ Đầm** (2.2km):

- **Bệnh viện quốc tế Vinmec Nha Trang** (3.0km):

- **Stay 7 International Hotel Nha Trang** (226m):

- **Tháp Trầm Hương** (621m):

- **Giordano Vincom Trần Phú Nha Trang** (306m):

- **Central Park** (927m):

- **Alpha Nha Trang** (363m):

- **Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels** (306m):

- **Chùa Long Sơn** (2.5km):

- **Nhà Nghỉ Phúc Lộc Cảnh** (212m):

- **Bảo tàng Không quân Nha Trang** (290m):

- **Sailing Club Nha Trang** (294m):

- **Quảng trường 2 tháng 4** (498m):

- **Armenia Nha Trang** (264m):

- **OASIS** (22m):

- **Đường Nguyễn Thiện Thuật Nha Trang** (162m):

- **Đường Trần Phú** (287m):

- **Vincom Plaza Lê Thánh Tôn, Nha Trang** (911m):

- **Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang** (378m):

---

## 🎯 Địa Điểm Giải Trí Gần Đây


_Thông tin địa điểm giải trí sẽ được cập nhật sớm._

---

## ⭐ Đánh Giá Khách Hàng


---

## 🎁 Khuyến Mãi Đang Có

_Hiện tại không có khuyến mãi nào._

---

## 📋 Chính Sách Khách Sạn Chi Tiết

### ⏰ Giờ Nhận/Trả Phòng
- **Check-in**: Từ 14:00 (Hỗ trợ nhận phòng sớm tùy tình trạng phòng trống - có thể phát sinh phí)
- **Check-out**: Trước 12:00 (Trả phòng muộn đến 18:00 với phụ thu 50% giá phòng)

## 📜 Chính Sách Đặc Biệt

- **Thú cưng**: Không được phép

- **Hút thuốc**: Không được phép

- **Trẻ em**: Trẻ em dưới 6 tuổi được ở miễn phí khi ngủ chung giường với bố mẹ

### ❌ Chính Sách Hủy Phòng Chi Tiết

### 🔄 Chính Sách Đổi Lịch Chi Tiết

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