---
# ============================================================
# YAML FRONTMATTER - METADATA FOR VECTOR DB & FILTERING
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "hotel_profile"
doc_id: "00d60e60-d366-4d73-b3c0-614ecb95feb7"
slug: "hoang-ngoc-beach-resort"
last_updated: "2025-11-29T10:25:19.7939872Z"
language: "vi"

# === LOCATION HIERARCHY ===

location:
  country: "viet-nam"
  country_code: "VN"
  province: "tinh-binh-thuan"
  province_name: "Tỉnh Bình Thuận"
  city: "thanh-pho-phan-thiet"
  city_name: "Thành phố Phan Thiết"
  district: "thanh-pho-phan-thiet"
  district_name: "Thành phố Phan Thiết"
  ward: "phuong-ham-tien"
  ward_name: "Phường Hàm Tiến"
  street: "duong-nguyen-dinh-chieu"
  street_name: "Đường Nguyễn Đình Chiểu"
  address: "152"

# === ĐỊA CHỈ VÀ VỊ TRÍ CHI TIẾT ===
full_address: "152, Đường Nguyễn Đình Chiểu, Phường Hàm Tiến, Thành phố Phan Thiết, Thành phố Phan Thiết"

# === KHOẢNG CÁCH ĐẾN ĐỊA ĐIỂM QUAN TRỌNG (TÍNH BẰNG MÉT) ===
distances:
  to_beach_meters: 0  # Integer, Ví dụ: 240
  to_city_center_meters: 1320  # Integer
  to_airport_meters: 0  # Integer

# === SEARCH OPTIMIZATION TAGS ===

location_tags:
  - "viet_nam"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "tinh_binh_thuan"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "thanh_pho_phan_thiet"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "phuong_ham_tien"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_beach"  # Generated from: city.name, district.name, + venue names from curl_step_2.4


# Mapped to English via AmenityMappingService using curl_step_2.5 (all amenities) as reference
amenity_tags:
  - "24h_reception"
  - "air_conditioning"
  - "airport_shuttle"
  - "ao_choang_tam"
  - "balcony"
  - "bao_ve_24_gio"
  - "bar"
  - "bathtub"
  - "blackout_curtains"
  - "bua_sang"
  - "bua_trua_voi_thuc_don_goi_mon"
  - "cau_lac_bo_thieu_nhi_thu_phi"
  - "coffee_maker"
  - "concierge"
  - "conference_hall"
  - "cua_hang_qua_tang"
  - "dich_vu_cho_thue_xe_dap"
  - "dich_vu_don_phong"
  - "dich_vu_ho_tro_dat_tour"
  - "dich_vu_luu_trubao_quan_hanh_ly"
  - "dich_vu_thu_doi_ngoai_te"
  - "dich_vu_tra_phong_muon"
  - "dich_vu_van_phong"
  - "du_o_tren_bai_bien"
  - "early_check_in"
  - "elevator"
  - "fan"
  - "fitness_center"
  - "free_bottled_water"
  - "ghe_dai_tam_nang_bai_bien"
  - "hairdryer"
  - "hieu_lam_toc"
  - "hoi_truong_da_chuc_nang"
  - "ket_an_toan"
  - "khong_khoi_thuoc"
  - "khu_am_thuc_rieng_biet"
  - "khu_vuc_hut_thuoc"
  - "kids_club"
  - "laundry_service"
  - "le_tan_hoi_nghi"
  - "loi_di_lai_cho_nguoi_khuyet_tat"
  - "mat_xa"
  - "may_atmngan_hang"
  - "may_chieu"
  - "may_photocopy"
  - "microwave"
  - "minibar"
  - "mo_to_nuoc"
  - "nguoi_gac_cua"
  - "nhan_phong_som"
  - "nhan_vien_gac_cong"
  - "nhan_vien_xach_hanh_ly"
  - "parking"
  - "phong_gia_dinh"
  - "phong_khong_hut_thuoc"
  - "phong_lien_thong"
  - "phong_xong_hoi"
  - "phu_hop_cho_xe_lan"
  - "private_bathroom"
  - "private_beach"
  - "quay_le_tan"
  - "refrigerator"
  - "restaurant"
  - "room_service"
  - "safe_box"
  - "spa"
  - "standing_shower"
  - "swimming_pool"
  - "terrace"
  - "thuc_uong_chao_mung_mien_phi"
  - "tiec_lien_hoan"
  - "tiem_ca_phe"
  - "tien_nghi_hoi_hop"
  - "toiletries"
  - "tra_phong_muon"
  - "tv"
  - "wifi"
  - "work_desk"
  - "xong_hoi_khouot"
  - "xong_hoi_uot"


vibe_tags:
  - "business"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "romantic"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "boutique"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "family_friendly"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "luxury"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags

# === PRICING REFERENCE (STATIC) ===

reference_min_price: 0  # VNĐ - Source: MIN from curl_step_2.2
reference_min_price_room: "N/A"
reference_max_price: 0  # VNĐ - Source: MAX from curl_step_2.2 (optional)

# === HOTEL CLASSIFICATION ===

star_rating: 5

# === BUSINESS METADATA ===
hotel_id: "00d60e60-d366-4d73-b3c0-614ecb95feb7"
partner_id: ""
status: "active"

# === PERFORMANCE STATS ===

total_rooms: 10
available_room_types: 10


review_score: 9.0
review_count: 2

# === NEARBY ATTRACTIONS ===

nearby_venues:
  - name: "Sunflower Spa"
    distance: "1.3km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Vipol resort"
    distance: "1.5km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Nhà Phi Thuyền Việt Nam"
    distance: "1.8km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Nhà Hàng Tâm Cọt"
    distance: "2.1km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Mui Ne Bay Kite School"
    distance: "1.3km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Long Beach Pearl - Showroom Mũi Né"
    distance: "1.0km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Sailing Club"
    distance: "1.1km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Sea Links Golf Country Club"
    distance: "2.6km"
    category: "Trung tâm giải trí"
    description: ""  # Optional: Generated from category + distance
  - name: "Lâu đài Rượu Vang"
    distance: "2.6km"
    category: "Trung tâm giải trí"
    description: ""  # Optional: Generated from category + distance
  - name: "Rainbow restaurant"
    distance: "1.3km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Nguyễn Đình Chiểu Mũi Né"
    distance: "610m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Bãi đá Ông Địa 2"
    distance: "2.7km"
    category: "Trung tâm giải trí"
    description: ""  # Optional: Generated from category + distance
  - name: "Khu Nghỉ Dưỡng Và Spa Đồi Xanh"
    distance: "815m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Mana Kite Center"
    distance: "1.3km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Bãi đá Ông Địa"
    distance: "2.8km"
    category: "Trung tâm giải trí"
    description: ""  # Optional: Generated from category + distance
  - name: "Sunset on the beach"
    distance: "1.7km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Botanica Spa"
    distance: "239m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Mui Ne Bay Kite School 2"
    distance: "1.6km"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance
  - name: "Mana Kite Center Category 2"
    distance: "1.3km"
    category: "Trung tâm giải trí"
    description: ""  # Optional: Generated from category + distance
  - name: "Mui Ne Cooking School"
    distance: "296m"
    category: "Địa Điểm Lân Cận"
    description: ""  # Optional: Generated from category + distance

# === ENHANCED: DETAILED ENTERTAINMENT VENUES BY CATEGORY ===

entertainment_venues:

# === POLICIES ===

check_in_time: "14:00"
check_out_time: "12:00"
early_check_in_available: true
late_check_out_available: true
cancellation_policy: "Không hoàn hủy"
reschedule_policy: "Không được đổi"
allows_pay_at_hotel: false
smoking_policy: "Khu vực hút thuốc riêng"

# === CHÍNH SÁCH NHẬN/TRẢ PHÒNG ===
check_in_policy:
  earliest_time: "14:00"
  latest_time: "22:00"
check_out_policy:
  latest_time: "12:00"
  late_checkout_available: true  # Boolean
  late_checkout_fee: "50% giá phòng"

# === TIỆN NGHI THEO DANH MỤC (CẤU TRÚC CHI TIẾT) ===
amenities_by_category:
  other:
    - name: "Phù hợp cho xe lăn"
      available: true
    - name: "Áo choàng tắm"
      available: true
    - name: "Tiện nghi hội họp"
      available: true
    - name: "Nhà hàng phục vụ bữa sáng"
      available: true
    - name: "Nhà hàng"
      available: true
    - name: "Tiệc liên hoan"
      available: true
    - name: "Hiệu làm tóc"
      available: true
    - name: "Dịch vụ cho thuê xe đạp"
      available: true
    - name: "Mô-tô nước"
      available: true
    - name: "Tiệm cà phê"
      available: true
    - name: "Xông hơi khô/ướt"
      available: true
    - name: "Máy lạnh"
      available: true
    - name: "Bữa trưa với thực đơn gọi món"
      available: true
    - name: "Lối đi lại cho người khuyết tật"
      available: true
    - name: "Bữa sáng"
      available: true
    - name: "Két an toàn"
      available: true
    - name: "Hội trường đa chức năng"
      available: true
    - name: "Trung tâm thể dục thể hình"
      available: true
    - name: "Quầy bar bên bãi biển"
      available: true
    - name: "Máy pha cà phê / trà"
      available: true
    - name: "Thang máy"
      available: true
    - name: "Wifi"
      available: true
    - name: "Đưa đón sân bay"
      available: true
    - name: "Nước đóng chai miễn phí"
      available: true
    - name: "Dịch vụ spa"
      available: true
    - name: "Bãi đậu xe an ninh"
      available: true
    - name: "Bãi đậu xe"
      available: true
    - name: "Tủ lạnh"
      available: true
    - name: "Quầy bar mini"
      available: true
    - name: "Máy sấy tóc"
      available: true
    - name: "Máy photocopy"
      available: true
    - name: "Khu vui chơi trẻ em"
      available: true
    - name: "Trả phòng muộn"
      available: true
    - name: "BLACKOUT_CURTAINS"
      available: true
    - name: "Bãi biển riêng"
      available: true
    - name: "Khu ẩm thực riêng biệt"
      available: true
    - name: "Phòng tắm riêng"
      available: true
    - name: "Không khói thuốc"
      available: true
    - name: "Máy chiếu"
      available: true
    - name: "Ban công / sân hiên"
      available: true
    - name: "Hồ bơi trẻ em"
      available: true
    - name: "TV"
      available: true
    - name: "Xông hơi ướt"
      available: true
    - name: "Nhà hàng phục vụ bữa tối"
      available: true
    - name: "Két an toàn tại phòng"
      available: true
    - name: "Câu lạc bộ thiếu nhi (thu phí)"
      available: true
    - name: "Lễ tân hội nghị"
      available: true
    - name: "Phòng gia đình"
      available: true
    - name: "Máy ATM/Ngân hàng"
      available: true
    - name: "Hồ bơi ngoài trời"
      available: true
    - name: "Phòng xông hơi"
      available: true
    - name: "Quầy bar bên hồ bơi"
      available: true
    - name: "Phòng không hút thuốc"
      available: true
    - name: "Dù (ô) trên bãi biển"
      available: true
    - name: "Khu vực hút thuốc"
      available: true
    - name: "Quầy bar"
      available: true
    - name: "Ghế dài tắm nắng bãi biển"
      available: true
    - name: "Bộ vệ sinh cá nhân"
      available: true
    - name: "Hồ bơi"
      available: true
    - name: "Phòng hội nghị"
      available: true
    - name: "Dịch vụ phòng 24 giờ"
      available: true
    - name: "Lò vi sóng"
      available: true
    - name: "Dịch vụ văn phòng"
      available: true
    - name: "Nhà hàng phục vụ bữa trưa"
      available: true
    - name: "Mát-xa"
      available: true
    - name: "Sân thượng/sân hiên"
      available: true
    - name: "Vòi tắm đứng"
      available: true
    - name: "Phòng liên thông"
      available: true
    - name: "Nhận phòng sớm"
      available: true
    - name: "Bồn tắm"
      available: true
    - name: "Dịch vụ dọn phòng"
      available: true
    - name: "Quạt"
      available: true
    - name: "WiFi tại khu vực chung"
      available: true
    - name: "Bàn làm việc"
      available: true
    - name: "Cửa hàng quà tặng"
      available: true
  service:
    - name: "Nhân viên xách hành lý"
      available: true
    - name: "Quầy lễ tân"
      available: true
    - name: "Thức uống chào mừng miễn phí"
      available: true
    - name: "Dịch vụ lưu trữ/bảo quản hành lý"
      available: true
    - name: "Người gác cửa"
      available: true
    - name: "Dịch vụ trả phòng muộn"
      available: true
    - name: "EARLY_CHECK_IN"
      available: true
    - name: "Bảo vệ 24 giờ"
      available: true
    - name: "Dịch vụ thu đổi ngoại tệ"
      available: true
    - name: "Dịch vụ hỗ trợ đặt Tour"
      available: true
    - name: "Lễ tân 24h"
      available: true
    - name: "Nhân viên gác cổng"
      available: true
    - name: "Dịch vụ giặt ủi"
      available: true
    - name: "Dịch vụ concierge/hỗ trợ khách"
      available: true

# === CHÍNH SÁCH ĐẶC BIỆT ===
policies:
  pets_allowed: false  # Boolean
  smoking_allowed: true  # Boolean
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
mainImageUrl: "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg"
galleryImageUrls:
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-b0698f733b24661b9d24b98b30019ca1.jpeg"
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg"
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg"

# === SEO KEYWORDS ===
keywords:
  - "hoang ngoc beach resort"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "khách sạn thành phố phan thiết"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "thành phố phan thiết"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "khách sạn 5 sao"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "resort spa"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "nghỉ dưỡng gia đình"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "honeymoon"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags

---

# 🏨 Hoang Ngoc Beach Resort -

![Hoang Ngoc Beach Resort](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg)

## 📖 Giới Thiệu

Dù bạn đang lên kế hoạch cho một sự kiện hay những dịp đặc biệt khác, Hoang Ngoc Beach Resort là một lựa chọn tuyệt vời dành cho bạn với một phòng chức năng lớn và được trang bị đầy đủ để đáp ứng các yêu cầu của bạn.

> 🌟 **Điểm nổi bật**: Được 2 du khách đánh giá **9.0/10** điểm - "Xuất sắc" về dịch vụ, vị trí và tiện nghi.

---

## 📍 Vị Trí & Liên Hệ

**Địa chỉ đầy đủ**: 152, Đường Nguyễn Đình Chiểu, Phường Hàm Tiến, Thành phố Phan Thiết, Thành phố Phan Thiết


**Cách biển Nha Trang**: 0 mét (~ km)

- **Sunflower Spa**: 1.3km
- **Vipol resort**: 1.5km
- **Nhà Phi Thuyền Việt Nam**: 1.8km
- **Nhà Hàng Tâm Cọt**: 2.1km
- **Mui Ne Bay Kite School**: 1.3km
- **Long Beach Pearl - Showroom Mũi Né**: 1.0km
- **Sailing Club**: 1.1km
- **Sea Links Golf Country Club**: 2.6km
- **Lâu đài Rượu Vang**: 2.6km
- **Rainbow restaurant**: 1.3km
- **Đường Nguyễn Đình Chiểu Mũi Né**: 610m
- **Bãi đá Ông Địa 2**: 2.7km
- **Khu Nghỉ Dưỡng Và Spa Đồi Xanh**: 815m
- **Mana Kite Center**: 1.3km
- **Bãi đá Ông Địa**: 2.8km
- **Sunset on the beach**: 1.7km
- **Botanica Spa**: 239m
- **Mui Ne Bay Kite School 2**: 1.6km
- **Mana Kite Center Category 2**: 1.3km
- **Mui Ne Cooking School**: 296m

## ⏰ Giờ Nhận/Trả Phòng

- **Nhận phòng**: Từ 14:00 đến 22:00

- **Trả phòng**: Trước 12:00

- **Trả phòng muộn**: Có thể sắp xếp với phí 50% giá phòng

## ⭐ Đặc Điểm Nổi Bật

### 🏖️ 1. Vị Trí
- **152**, Đường Nguyễn Đình Chiểu, Phường Hàm Tiến, Thành phố Phan Thiết, Thành phố Phan Thiết

### ✨ Tiện Nghi Nổi Bật
### Other

✅ Phù hợp cho xe lăn
✅ Áo choàng tắm
✅ Tiện nghi hội họp
✅ Nhà hàng phục vụ bữa sáng
✅ Nhà hàng
✅ Tiệc liên hoan
✅ Hiệu làm tóc
✅ Dịch vụ cho thuê xe đạp
✅ Mô-tô nước
✅ Tiệm cà phê
✅ Xông hơi khô/ướt
✅ Máy lạnh
✅ Bữa trưa với thực đơn gọi món
✅ Lối đi lại cho người khuyết tật
✅ Bữa sáng
✅ Két an toàn
✅ Hội trường đa chức năng
✅ Trung tâm thể dục thể hình
✅ Quầy bar bên bãi biển
✅ Máy pha cà phê / trà
✅ Thang máy
✅ Wifi
✅ Đưa đón sân bay
✅ Nước đóng chai miễn phí
✅ Dịch vụ spa
✅ Bãi đậu xe an ninh
✅ Bãi đậu xe
✅ Tủ lạnh
✅ Quầy bar mini
✅ Máy sấy tóc
✅ Máy photocopy
✅ Khu vui chơi trẻ em
✅ Trả phòng muộn
✅ BLACKOUT_CURTAINS
✅ Bãi biển riêng
✅ Khu ẩm thực riêng biệt
✅ Phòng tắm riêng
✅ Không khói thuốc
✅ Máy chiếu
✅ Ban công / sân hiên
✅ Hồ bơi trẻ em
✅ TV
✅ Xông hơi ướt
✅ Nhà hàng phục vụ bữa tối
✅ Két an toàn tại phòng
✅ Câu lạc bộ thiếu nhi (thu phí)
✅ Lễ tân hội nghị
✅ Phòng gia đình
✅ Máy ATM/Ngân hàng
✅ Hồ bơi ngoài trời
✅ Phòng xông hơi
✅ Quầy bar bên hồ bơi
✅ Phòng không hút thuốc
✅ Dù (ô) trên bãi biển
✅ Khu vực hút thuốc
✅ Quầy bar
✅ Ghế dài tắm nắng bãi biển
✅ Bộ vệ sinh cá nhân
✅ Hồ bơi
✅ Phòng hội nghị
✅ Dịch vụ phòng 24 giờ
✅ Lò vi sóng
✅ Dịch vụ văn phòng
✅ Nhà hàng phục vụ bữa trưa
✅ Mát-xa
✅ Sân thượng/sân hiên
✅ Vòi tắm đứng
✅ Phòng liên thông
✅ Nhận phòng sớm
✅ Bồn tắm
✅ Dịch vụ dọn phòng
✅ Quạt
✅ WiFi tại khu vực chung
✅ Bàn làm việc
✅ Cửa hàng quà tặng

### Service

✅ Nhân viên xách hành lý
✅ Quầy lễ tân
✅ Thức uống chào mừng miễn phí
✅ Dịch vụ lưu trữ/bảo quản hành lý
✅ Người gác cửa
✅ Dịch vụ trả phòng muộn
✅ EARLY_CHECK_IN
✅ Bảo vệ 24 giờ
✅ Dịch vụ thu đổi ngoại tệ
✅ Dịch vụ hỗ trợ đặt Tour
✅ Lễ tân 24h
✅ Nhân viên gác cổng
✅ Dịch vụ giặt ủi
✅ Dịch vụ concierge/hỗ trợ khách


### 👨‍👩‍👧‍👦 3. Thân Thiện Với Gia Đình
- Phù hợp cho gia đình có trẻ em

---

## 🛏️ Hạng Phòng Đa Dạng

Khách sạn cung cấp 10 loại phòng chính:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|

| **Superior Double Garden View** | 30.0m²      | Hướng sân vườn      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Superior Twins City View** | 30.0m²      | Hướng phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Deluxe Twin Garden View** | 40.0m²      | Hướng sân vườn      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Superior Twin Ocean View** | 30.0m²      | Hướng biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Bungalow Beach Front** | 60.0m²      | Hướng mặt biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Suite Ocean View** | 60.0m²      | Hướng biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Deluxe Double Garden View** | 40.0m²      | Hướng sân vườn      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Superior Double City View** | 30.0m²      | Hướng phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Superior Double With Pool View** | 30.0m²      | Hướng biển      | 1 người lớn + 1 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

| **Superior Twin Garden View** | 30.0m²      | Hướng sân vườn      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

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
> Tôi sẽ kiểm tra ngay: {{TOOL:check_availability|hotel_id&#61;00d60e60-d366-4d73-b3c0-614ecb95feb7|check_in&#61;{date}|check_out&#61;{date}}}

---

## 📍 Địa Điểm Lân Cận


- **Sunflower Spa** (1.3km):

- **Vipol resort** (1.5km):

- **Nhà Phi Thuyền Việt Nam** (1.8km):

- **Nhà Hàng Tâm Cọt** (2.1km):

- **Mui Ne Bay Kite School** (1.3km):

- **Long Beach Pearl - Showroom Mũi Né** (1.0km):

- **Sailing Club** (1.1km):

- **Sea Links Golf Country Club** (2.6km):

- **Lâu đài Rượu Vang** (2.6km):

- **Rainbow restaurant** (1.3km):

- **Đường Nguyễn Đình Chiểu Mũi Né** (610m):

- **Bãi đá Ông Địa 2** (2.7km):

- **Khu Nghỉ Dưỡng Và Spa Đồi Xanh** (815m):

- **Mana Kite Center** (1.3km):

- **Bãi đá Ông Địa** (2.8km):

- **Sunset on the beach** (1.7km):

- **Botanica Spa** (239m):

- **Mui Ne Bay Kite School 2** (1.6km):

- **Mana Kite Center Category 2** (1.3km):

- **Mui Ne Cooking School** (296m):

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

- **Hút thuốc**: Được phép ở khu vực chỉ định

- **Trẻ em**: Trẻ em dưới 6 tuổi được ở miễn phí khi ngủ chung giường với bố mẹ

### ❌ Chính Sách Hủy Phòng Chi Tiết

### 🔄 Chính Sách Đổi Lịch Chi Tiết

### 💳 Thanh Toán
- **Phương thức**:
  - ✅ Thanh toán online qua VNPay (ATM, Visa, Mastercard, QR Pay)
  - ❌ **KHÔNG** hỗ trợ thanh toán tại khách sạn

---

## 🎯 Phù Hợp Với Ai?

✅ **Gia đình có trẻ nhỏ**: Phù hợp cho kỳ nghỉ gia đình
✅ **Cặp đôi honeymoon**: View đẹp, không gian lãng mạn
✅ **Khách công tác**: Tiện nghi phục vụ công việc

---

## 📞 Liên Hệ & Hỗ Trợ

Bạn có câu hỏi về khách sạn này? Tôi có thể giúp bạn:
- 🔍 Kiểm tra phòng trống cho ngày cụ thể
- 💰 So sánh giá các loại phòng
- 🎁 Tìm mã giảm giá đang có hiệu lực
- 📧 Liên hệ trực tiếp với khách sạn về yêu cầu đặc biệt

Hãy cho tôi biết kế hoạch của bạn! 😊