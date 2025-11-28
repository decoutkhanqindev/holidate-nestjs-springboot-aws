---
# ============================================================
# YAML FRONTMATTER - METADATA FOR VECTOR DB & FILTERING
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "hotel_profile"
doc_id: "00d60e60-d366-4d73-b3c0-614ecb95feb7"  # Source: curl_step_2.1 -> data.id (GET /accommodation/hotels/{id})
slug: "hoang-ngoc-beach-resort"  # Source: Generated from curl_step_2.1 -> data.name
last_updated: "2025-11-28T23:18:44.3204026Z"  # Source: curl_step_2.1 -> data.updatedAt (fallback to createdAt if null)
language: "vi"

# === LOCATION HIERARCHY ===
# Source: curl_step_2.1 -> data.country/province/city/district/ward/street
location:
  country: "viet-nam"  # Source: curl_step_2.1 -> data.country.name
  country_code: "VN"  # Source: curl_step_2.1 -> data.country.code
  province: "tinh-binh-thuan"  # Source: curl_step_2.1 -> data.province.name
  province_name: "Tỉnh Bình Thuận"  # Source: curl_step_2.1 -> data.province.name
  city: "thanh-pho-phan-thiet"  # Source: curl_step_2.1 -> data.city.name
  city_name: "Thành phố Phan Thiết"  # Source: curl_step_2.1 -> data.city.name
  district: "thanh-pho-phan-thiet"  # Source: curl_step_2.1 -> data.district.name
  district_name: "Thành phố Phan Thiết"  # Source: curl_step_2.1 -> data.district.name
  ward: "phuong-ham-tien"  # Source: curl_step_2.1 -> data.ward.name
  ward_name: "Phường Hàm Tiến"  # Source: curl_step_2.1 -> data.ward.name
  street: "duong-nguyen-dinh-chieu"  # Source: curl_step_2.1 -> data.street.name
  street_name: "Đường Nguyễn Đình Chiểu"  # Source: curl_step_2.1 -> data.street.name
  address: "152"  # Source: curl_step_2.1 -> data.address
  coordinates:
    lat: 0.0  # Source: curl_step_2.1 -> data.latitude
    lng: 0.0  # Source: curl_step_2.1 -> data.longitude

# === SEARCH OPTIMIZATION TAGS ===
# Source: Generated from location + entertainment venues
location_tags:
  - "viet_nam"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "tinh_binh_thuan"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "thanh_pho_phan_thiet"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "phuong_ham_tien"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_beach"  # Generated from: city.name, district.name, + venue names from curl_step_2.4

# Source: curl_step_2.1 -> data.amenities[] -> amenity.name (Vietnamese)
# Mapped to English via AmenityMappingService using curl_step_2.5 (all amenities) as reference
amenity_tags:
  - "24h_reception"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "air_conditioning"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "airport_shuttle"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "ao_choang_tam"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "balcony"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "bao_ve_24_gio"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "bar"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "bathtub"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "blackout_curtains"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "bua_sang"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "bua_trua_voi_thuc_don_goi_mon"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "cau_lac_bo_thieu_nhi_thu_phi"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "coffee_maker"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "concierge"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "conference_hall"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "cua_hang_qua_tang"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "dich_vu_cho_thue_xe_dap"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "dich_vu_don_phong"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "dich_vu_ho_tro_dat_tour"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "dich_vu_luu_trubao_quan_hanh_ly"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "dich_vu_thu_doi_ngoai_te"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "dich_vu_tra_phong_muon"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "dich_vu_van_phong"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "du_o_tren_bai_bien"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "early_check_in"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "elevator"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "fan"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "fitness_center"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "free_bottled_water"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "ghe_dai_tam_nang_bai_bien"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "hairdryer"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "hieu_lam_toc"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "hoi_truong_da_chuc_nang"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "ket_an_toan"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "khong_khoi_thuoc"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "khu_am_thuc_rieng_biet"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "khu_vuc_hut_thuoc"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "kids_club"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "laundry_service"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "le_tan_hoi_nghi"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "loi_di_lai_cho_nguoi_khuyet_tat"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "mat_xa"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "may_atmngan_hang"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "may_chieu"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "may_photocopy"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "microwave"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "minibar"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "mo_to_nuoc"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "nguoi_gac_cua"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "nhan_phong_som"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "nhan_vien_gac_cong"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "nhan_vien_xach_hanh_ly"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "parking"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "phong_gia_dinh"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "phong_khong_hut_thuoc"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "phong_lien_thong"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "phong_xong_hoi"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "phu_hop_cho_xe_lan"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "private_bathroom"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "private_beach"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "quay_le_tan"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "refrigerator"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "restaurant"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "room_service"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "safe_box"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "spa"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "standing_shower"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "swimming_pool"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "terrace"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "thuc_uong_chao_mung_mien_phi"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "tiec_lien_hoan"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "tiem_ca_phe"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "tien_nghi_hoi_hop"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "toiletries"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "tra_phong_muon"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "tv"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "wifi"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "work_desk"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "xong_hoi_khouot"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English
  - "xong_hoi_uot"  # Source: curl_step_2.1 -> data.amenities[].amenities[].name -> mapped to English

# Source: Inferred from star_rating + amenities + location + price range
vibe_tags:
  - "business"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "romantic"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "boutique"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "family_friendly"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags
  - "luxury"  # Inferred from: curl_step_2.1 -> data.starRating + amenity_tags + location_tags

# === PRICING REFERENCE (STATIC) ===
# Source: curl_step_2.2 -> data.content[] -> MIN(basePricePerNight) where status='active'
reference_min_price: 0  # VNĐ - Source: MIN from curl_step_2.2
reference_min_price_room: "N/A"  # Source: Room.name of cheapest room from curl_step_2.2
reference_max_price: 0  # VNĐ - Source: MAX from curl_step_2.2 (optional)

# === HOTEL CLASSIFICATION ===
# Source: curl_step_2.1 -> data.starRating
star_rating: 5

# === BUSINESS METADATA ===
hotel_id: "00d60e60-d366-4d73-b3c0-614ecb95feb7"  # Source: curl_step_2.1 -> data.id
partner_id: ""  # Source: curl_step_2.1 -> data.partner.id
status: "active"  # Source: curl_step_2.1 -> data.status

# === PERFORMANCE STATS ===
# Source: curl_step_2.2 -> data.content.length (total rooms)
total_rooms: 10  # Source: curl_step_2.2 -> data.totalItems
available_room_types: 10  # Source: curl_step_2.2 -> COUNT(DISTINCT data.content[].name)

# Source: curl_step_2.3 -> Aggregated from reviews
review_score: 9.0  # Source: curl_step_2.3 -> AVG(data.content[].score) or null if empty
review_count: 2  # Source: curl_step_2.3 -> data.totalItems

# === NEARBY ATTRACTIONS ===
# Source: curl_step_2.1 -> data.entertainmentVenues[] OR curl_step_2.4 -> data[].entertainmentVenues[]
nearby_venues:
  - name: "Rainbow restaurant"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.3km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Botanica Spa"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "239m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Mui Ne Bay Kite School 2"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.6km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Lâu đài Rượu Vang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.6km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Nhà Phi Thuyền Việt Nam"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.8km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Sunflower Spa"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.3km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Mana Kite Center"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.3km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Nhà Hàng Tâm Cọt"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.1km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Bãi đá Ông Địa"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.8km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Mui Ne Bay Kite School"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.3km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Sunset on the beach"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.7km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Mana Kite Center Category 2"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.3km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Nguyễn Đình Chiểu Mũi Né"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "610m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Khu Nghỉ Dưỡng Và Spa Đồi Xanh"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "815m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Long Beach Pearl - Showroom Mũi Né"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.0km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Mui Ne Cooking School"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "296m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Sailing Club"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.1km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Vipol resort"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.5km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Bãi đá Ông Địa 2"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.7km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Sea Links Golf Country Club"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.6km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance

# === POLICIES ===
# Source: curl_step_2.1 -> data.policy
check_in_time: "14:00"  # Source: curl_step_2.1 -> data.policy.checkInTime (format: "HH:mm:ss")
check_out_time: "12:00"  # Source: curl_step_2.1 -> data.policy.checkOutTime
early_check_in_available: true  # Source: Check if amenity "EARLY_CHECK_IN" exists in curl_step_2.1 -> data.amenities
late_check_out_available: true  # Source: Check if amenity "Trả phòng muộn" exists
cancellation_policy: "Không hoàn hủy"  # Source: curl_step_2.1 -> data.policy.cancellationPolicy.name
reschedule_policy: "Không được đổi"  # Source: curl_step_2.1 -> data.policy.reschedulePolicy.name
allows_pay_at_hotel: false  # Source: curl_step_2.1 -> data.policy.allowsPayAtHotel
smoking_policy: "Khu vực hút thuốc riêng"  # Source: Inferred from hotel-level amenities or default "Không hút thuốc"

# === ENHANCED: DETAILED POLICY RULES ===
# Source: /policy/cancellation-policies and /policy/reschedule-policies endpoints
policies_detail:

# === ENHANCED: COMPREHENSIVE REVIEW STATISTICS ===
# Source: /reviews?hotel-id={id} endpoint
reviews_summary:

# === ENHANCED: ACTIVE DISCOUNTS ===
# Source: /discounts?hotel-id={id}&currently-valid=true endpoint
active_discounts:

# === IMAGES ===
mainImageUrl: "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[0].url (first photo, or filter by category name="main")
galleryImageUrls:
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-b0698f733b24661b9d24b98b30019ca1.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)

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

![Hoang Ngoc Beach Resort](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg)

## 📖 Giới Thiệu

Dù bạn đang lên kế hoạch cho một sự kiện hay những dịp đặc biệt khác, Hoang Ngoc Beach Resort là một lựa chọn tuyệt vời dành cho bạn với một phòng chức năng lớn và được trang bị đầy đủ để đáp ứng các yêu cầu của bạn.  # Source: curl_step_2.1 -> data.description

> 🌟 **Điểm nổi bật**: Được 2 du khách đánh giá **9.0/10** điểm - "Xuất sắc" về dịch vụ, vị trí và tiện nghi.

---

## ⭐ Đặc Điểm Nổi Bật

### 🏖️ 1. Vị Trí
- **152**, Đường Nguyễn Đình Chiểu, Phường Hàm Tiến, Thành phố Phan Thiết, Thành phố Phan Thiết
- **Rainbow restaurant**: 1.3km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Botanica Spa**: 239m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Mui Ne Bay Kite School 2**: 1.6km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Lâu đài Rượu Vang**: 2.6km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Nhà Phi Thuyền Việt Nam**: 1.8km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Sunflower Spa**: 1.3km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Mana Kite Center**: 1.3km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Nhà Hàng Tâm Cọt**: 2.1km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Bãi đá Ông Địa**: 2.8km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Mui Ne Bay Kite School**: 1.3km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Sunset on the beach**: 1.7km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Mana Kite Center Category 2**: 1.3km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Đường Nguyễn Đình Chiểu Mũi Né**: 610m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Khu Nghỉ Dưỡng Và Spa Đồi Xanh**: 815m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Long Beach Pearl - Showroom Mũi Né**: 1.0km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Mui Ne Cooking School**: 296m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Sailing Club**: 1.1km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Vipol resort**: 1.5km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Bãi đá Ông Địa 2**: 2.7km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Sea Links Golf Country Club**: 2.6km  # Source: curl_step_2.1 -> data.entertainmentVenues

### 💎 2. Tiện Nghi Khách Sạn
- 24h_reception  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- air_conditioning  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- airport_shuttle  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- ao_choang_tam  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- balcony  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- bao_ve_24_gio  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- bar  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- bathtub  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- blackout_curtains  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- bua_sang  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- bua_trua_voi_thuc_don_goi_mon  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- cau_lac_bo_thieu_nhi_thu_phi  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- coffee_maker  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- concierge  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- conference_hall  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- cua_hang_qua_tang  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- dich_vu_cho_thue_xe_dap  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- dich_vu_don_phong  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- dich_vu_ho_tro_dat_tour  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- dich_vu_luu_trubao_quan_hanh_ly  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- dich_vu_thu_doi_ngoai_te  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- dich_vu_tra_phong_muon  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- dich_vu_van_phong  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- du_o_tren_bai_bien  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- early_check_in  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- elevator  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- fan  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- fitness_center  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- free_bottled_water  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- ghe_dai_tam_nang_bai_bien  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- hairdryer  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- hieu_lam_toc  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- hoi_truong_da_chuc_nang  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- ket_an_toan  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- khong_khoi_thuoc  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- khu_am_thuc_rieng_biet  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- khu_vuc_hut_thuoc  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- kids_club  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- laundry_service  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- le_tan_hoi_nghi  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- loi_di_lai_cho_nguoi_khuyet_tat  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- mat_xa  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- may_atmngan_hang  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- may_chieu  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- may_photocopy  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- microwave  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- minibar  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- mo_to_nuoc  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- nguoi_gac_cua  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- nhan_phong_som  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- nhan_vien_gac_cong  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- nhan_vien_xach_hanh_ly  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- parking  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- phong_gia_dinh  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- phong_khong_hut_thuoc  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- phong_lien_thong  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- phong_xong_hoi  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- phu_hop_cho_xe_lan  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- private_bathroom  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- private_beach  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- quay_le_tan  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- refrigerator  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- restaurant  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- room_service  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- safe_box  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- spa  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- standing_shower  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- swimming_pool  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- terrace  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- thuc_uong_chao_mung_mien_phi  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- tiec_lien_hoan  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- tiem_ca_phe  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- tien_nghi_hoi_hop  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- toiletries  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- tra_phong_muon  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- tv  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- wifi  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- work_desk  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- xong_hoi_khouot  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)
- xong_hoi_uot  # Source: curl_step_2.1 -> data.amenities (mapped to readable format)

### 👨‍👩‍👧‍👦 3. Thân Thiện Với Gia Đình
- Phù hợp cho gia đình có trẻ em

---

## 🛏️ Hạng Phòng Đa Dạng

Khách sạn cung cấp 10 loại phòng chính:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|
  # Source: curl_step_2.2 -> data.content[]
| **Superior Twins City View** | 30.0m²      | Hướng phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Superior Twin Ocean View** | 30.0m²      | Hướng biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Superior Twin Garden View** | 30.0m²      | Hướng sân vườn      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Suite Ocean View** | 60.0m²      | Hướng biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Superior Double City View** | 30.0m²      | Hướng phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Bungalow Beach Front** | 60.0m²      | Hướng mặt biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Deluxe Double Garden View** | 40.0m²      | Hướng sân vườn      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Superior Double With Pool View** | 30.0m²      | Hướng biển      | 1 người lớn + 1 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Deluxe Twin Garden View** | 40.0m²      | Hướng sân vườn      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Superior Double Garden View** | 30.0m²      | Hướng sân vườn      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |

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
> Tôi sẽ kiểm tra ngay: }}

---

## 📍 Địa Điểm Lân Cận

  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Rainbow restaurant** (1.3km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Botanica Spa** (239m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Mui Ne Bay Kite School 2** (1.6km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Lâu đài Rượu Vang** (2.6km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Nhà Phi Thuyền Việt Nam** (1.8km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Sunflower Spa** (1.3km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Mana Kite Center** (1.3km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Nhà Hàng Tâm Cọt** (2.1km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Bãi đá Ông Địa** (2.8km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Mui Ne Bay Kite School** (1.3km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Sunset on the beach** (1.7km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Mana Kite Center Category 2** (1.3km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Đường Nguyễn Đình Chiểu Mũi Né** (610m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Khu Nghỉ Dưỡng Và Spa Đồi Xanh** (815m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Long Beach Pearl - Showroom Mũi Né** (1.0km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Mui Ne Cooking School** (296m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Sailing Club** (1.1km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Vipol resort** (1.5km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Bãi đá Ông Địa 2** (2.7km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Sea Links Golf Country Club** (2.6km): 

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

---

