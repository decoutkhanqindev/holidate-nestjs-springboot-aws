---
# ============================================================
# YAML FRONTMATTER - METADATA FOR VECTOR DB & FILTERING
# ============================================================

# === DOCUMENT IDENTIFICATION ===
doc_type: "hotel_profile"
doc_id: "4b2d0a2d-cc1f-4030-8c07-5fa09b8229cf"  # Source: curl_step_2.1 -> data.id (GET /accommodation/hotels/{id})
slug: "golden-hotel-nha-trang"  # Source: Generated from curl_step_2.1 -> data.name
last_updated: "2025-11-29T00:01:34.4085395Z"  # Source: curl_step_2.1 -> data.updatedAt (fallback to createdAt if null)
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
  - "near_museum"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_beach"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_park"  # Generated from: city.name, district.name, + venue names from curl_step_2.4
  - "near_market"  # Generated from: city.name, district.name, + venue names from curl_step_2.4

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
  - name: "Nhà Nghỉ Phúc Lộc Cảnh"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "212m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Tháp Trầm Hương"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "621m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Công An Tỉnh Khánh Hòa"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "262m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Quảng trường 2 tháng 4"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "498m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Vincom Plaza Lê Thánh Tôn, Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "911m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Trần Phú"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "287m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Bảo tàng Không quân Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "290m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Stay 7 International Hotel Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "226m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Alpha Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "363m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Hội Nông Dân Tỉnh Khánh Hòa"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.3km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Nguyễn Thiện Thuật Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "162m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "306m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Bệnh viện quốc tế Vinmec Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "3.0km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Biển Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "240m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Giordano Vincom Trần Phú Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "306m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Nhà thờ Núi Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "1.5km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Central Park"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "927m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Đường Hùng Vương Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "278m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Sailing Club Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "294m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Armenia Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "264m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "OASIS"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "22m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "378m"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Địa Điểm Lân Cận"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Chợ Đầm"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.2km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Trung tâm giải trí"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance
  - name: "Chùa Long Sơn"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].name
    distance: "2.5km"  # Source: curl_step_2.1 -> data.entertainmentVenues[].entertainmentVenues[].distance (meters, format: "200m" or "3.5km")
    category: "Khác"  # Source: curl_step_2.1 -> data.entertainmentVenues[].name (parent category)
    description: ""  # Optional: Generated from category + distance

# === ENHANCED: DETAILED ENTERTAINMENT VENUES BY CATEGORY ===
# Source: /location/entertainment-venues/city/{cityId} endpoint with distance calculation
entertainment_venues:
  - category: "Trung tâm giải trí"
    venues:
      - name: "Quảng trường 2 tháng 4"
        address: "Quảng trường 2 tháng 4, Thành phố Nha Trang"
        distance_from_hotel: "752m"
        description: "Quảng trường 2 tháng 4 - Điểm đến phổ biến gần khách sạn"
      - name: "Chợ Đầm"
        address: "Chợ Đầm, Thành phố Nha Trang"
        distance_from_hotel: "1.5m"
        description: "Chợ Đầm - Điểm đến phổ biến gần khách sạn"
      - name: "Tháp Trầm Hương"
        address: "Tháp Trầm Hương, Thành phố Nha Trang"
        distance_from_hotel: "4.8m"
        description: "Tháp Trầm Hương - Điểm đến phổ biến gần khách sạn"
      - name: "Vincom Plaza Lê Thánh Tôn, Nha Trang"
        address: "Vincom Plaza Lê Thánh Tôn, Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "4.9m"
        description: "Vincom Plaza Lê Thánh Tôn, Nha Trang - Điểm đến phổ biến gần khách sạn"
  - category: "Địa Điểm Lân Cận"
    venues:
      - name: "Đường Hùng Vương Nha Trang"
        address: "Đường Hùng Vương Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "244m"
        description: "Đường Hùng Vương Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Ga Nha Trang"
        address: "Ga Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "565m"
        description: "Ga Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Công An Tỉnh Khánh Hòa"
        address: "Công An Tỉnh Khánh Hòa, Thành phố Nha Trang"
        distance_from_hotel: "727m"
        description: "Công An Tỉnh Khánh Hòa - Điểm đến phổ biến gần khách sạn"
      - name: "Công viên nước Phù Đổng"
        address: "Công viên nước Phù Đổng, Thành phố Nha Trang"
        distance_from_hotel: "1.0m"
        description: "Công viên nước Phù Đổng - Điểm đến phổ biến gần khách sạn"
      - name: "Alpha Nha Trang"
        address: "Alpha Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "1.3m"
        description: "Alpha Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Central Park"
        address: "Central Park, Thành phố Nha Trang"
        distance_from_hotel: "1.4m"
        description: "Central Park - Điểm đến phổ biến gần khách sạn"
      - name: "Cảng Nha Trang"
        address: "Cảng Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "1.6m"
        description: "Cảng Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Nhà Nghỉ Phúc Lộc Cảnh"
        address: "Nhà Nghỉ Phúc Lộc Cảnh, Thành phố Nha Trang"
        distance_from_hotel: "2.1m"
        description: "Nhà Nghỉ Phúc Lộc Cảnh - Điểm đến phổ biến gần khách sạn"
      - name: "Tháp Trầm Hương"
        address: "Tháp Trầm Hương, Thành phố Nha Trang"
        distance_from_hotel: "2.3m"
        description: "Tháp Trầm Hương - Điểm đến phổ biến gần khách sạn"
      - name: "Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels"
        address: "Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels, Thành phố Nha Trang"
        distance_from_hotel: "2.3m"
        description: "Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels - Điểm đến phổ biến gần khách sạn"
      - name: "Sailing Club Nha Trang"
        address: "Sailing Club Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "2.3m"
        description: "Sailing Club Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Armenia Nha Trang"
        address: "Armenia Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "2.8m"
        description: "Armenia Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Quảng trường 2 tháng 4"
        address: "Quảng trường 2 tháng 4, Thành phố Nha Trang"
        distance_from_hotel: "3.0m"
        description: "Quảng trường 2 tháng 4 - Điểm đến phổ biến gần khách sạn"
      - name: "Biển Nha Trang"
        address: "Biển Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "3.0m"
        description: "Biển Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Stay 7 International Hotel Nha Trang"
        address: "Stay 7 International Hotel Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "3.2m"
        description: "Stay 7 International Hotel Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Bệnh viện quốc tế Vinmec Nha Trang"
        address: "Bệnh viện quốc tế Vinmec Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "3.4m"
        description: "Bệnh viện quốc tế Vinmec Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "OASIS"
        address: "OASIS, Thành phố Nha Trang"
        distance_from_hotel: "3.4m"
        description: "OASIS - Điểm đến phổ biến gần khách sạn"
      - name: "Quảng trường 2 tháng 4"
        address: "Quảng trường 2 tháng 4, Thành phố Nha Trang"
        distance_from_hotel: "3.6m"
        description: "Quảng trường 2 tháng 4 - Điểm đến phổ biến gần khách sạn"
      - name: "Bảo tàng Không quân Nha Trang"
        address: "Bảo tàng Không quân Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "3.7m"
        description: "Bảo tàng Không quân Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Đường Trần Phú"
        address: "Đường Trần Phú, Thành phố Nha Trang"
        distance_from_hotel: "3.8m"
        description: "Đường Trần Phú - Điểm đến phổ biến gần khách sạn"
      - name: "Bến phà Vinpearl"
        address: "Bến phà Vinpearl, Thành phố Nha Trang"
        distance_from_hotel: "3.8m"
        description: "Bến phà Vinpearl - Điểm đến phổ biến gần khách sạn"
      - name: "Tháp Chàm Po Nagar"
        address: "Tháp Chàm Po Nagar, Thành phố Nha Trang"
        distance_from_hotel: "4.1m"
        description: "Tháp Chàm Po Nagar - Điểm đến phổ biến gần khách sạn"
      - name: "Đường Nguyễn Thiện Thuật Nha Trang"
        address: "Đường Nguyễn Thiện Thuật Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "4.2m"
        description: "Đường Nguyễn Thiện Thuật Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang"
        address: "Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "4.4m"
        description: "Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Vincom Plaza Lê Thánh Tôn, Nha Trang"
        address: "Vincom Plaza Lê Thánh Tôn, Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "4.4m"
        description: "Vincom Plaza Lê Thánh Tôn, Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Giordano Vincom Trần Phú Nha Trang"
        address: "Giordano Vincom Trần Phú Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "4.6m"
        description: "Giordano Vincom Trần Phú Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Tháo Trầm Hương"
        address: "Tháo Trầm Hương, Thành phố Nha Trang"
        distance_from_hotel: "4.8m"
        description: "Tháo Trầm Hương - Điểm đến phổ biến gần khách sạn"
      - name: "Vincom Plaza Lê Thánh Tôn, Nha Trang"
        address: "Vincom Plaza Lê Thánh Tôn, Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "4.9m"
        description: "Vincom Plaza Lê Thánh Tôn, Nha Trang - Điểm đến phổ biến gần khách sạn"
  - category: "Khác"
    venues:
      - name: "Central Park"
        address: "Central Park, Thành phố Nha Trang"
        distance_from_hotel: "1.9m"
        description: "Central Park - Điểm đến phổ biến gần khách sạn"
      - name: "Nhà thờ Núi Nha Trang"
        address: "Nhà thờ Núi Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "3.3m"
        description: "Nhà thờ Núi Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Hội Nông Dân Tỉnh Khánh Hòa"
        address: "Hội Nông Dân Tỉnh Khánh Hòa, Thành phố Nha Trang"
        distance_from_hotel: "3.9m"
        description: "Hội Nông Dân Tỉnh Khánh Hòa - Điểm đến phổ biến gần khách sạn"
      - name: "Bệnh viện quốc tế Vinmec Nha Trang"
        address: "Bệnh viện quốc tế Vinmec Nha Trang, Thành phố Nha Trang"
        distance_from_hotel: "4.6m"
        description: "Bệnh viện quốc tế Vinmec Nha Trang - Điểm đến phổ biến gần khách sạn"
      - name: "Chùa Long Sơn"
        address: "Chùa Long Sơn, Thành phố Nha Trang"
        distance_from_hotel: "4.8m"
        description: "Chùa Long Sơn - Điểm đến phổ biến gần khách sạn"

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

# === ENHANCED: DETAILED POLICY RULES ===
# Source: /policy/cancellation-policies and /policy/reschedule-policies endpoints
policies_detail:

# === ENHANCED: COMPREHENSIVE REVIEW STATISTICS ===
# Source: /reviews?hotel-id={id} endpoint
reviews_summary:
  total_reviews: 1
  average_score: 7.0
  score_distribution:
    - bucket: "9-10"
      count: 0
    - bucket: "7-8"
      count: 1
    - bucket: "5-6"
      count: 0
    - bucket: "3-4"
      count: 0
    - bucket: "1-2"
      count: 0
  recent_reviews:
    - score: 7
      comment_snippet: "abc comment"
      date: "2025-11-02T18:06:50.819199"

# === ENHANCED: ACTIVE DISCOUNTS ===
# Source: /discounts?hotel-id={id}&currently-valid=true endpoint
active_discounts:

# === IMAGES ===
mainImageUrl: "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[0].url (first photo, or filter by category name="main")
galleryImageUrls:
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-b0698f733b24661b9d24b98b30019ca1.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-85b3ba41998cace6b8c56e546ad9a0bc.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)
  - "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg"  # Source: curl_step_2.1 -> data.photos[].photos[].url (limit 5, exclude main)

# === SEO KEYWORDS ===
keywords:
  - "golden hotel nha trang"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "khách sạn thành phố nha trang"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags
  - "thành phố nha trang"  # Generated from: hotel.name, city.name, district.name, star_rating, amenity_tags

---

# 🏨 Golden Hotel Nha Trang - 

![Golden Hotel Nha Trang](https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg)

## 📖 Giới Thiệu

Hãy tận hưởng thời gian vui vẻ cùng cả gia đình với hàng loạt tiện nghi giải trí tại Golden Hotel Nha Trang, một nơi nghỉ tuyệt vời phù hợp cho mọi kỳ nghỉ bên người thân.&#10;&#10;Khách sạn này là lựa chọn hoàn hảo cho các kỳ nghỉ mát lãng mạn hay tuần trăng mật của các cặp đôi. Quý khách hãy tận hưởng những đêm đáng nhớ nhất cùng người thương của mình tại Golden Hotel Nha Trang&#10;&#10;Nếu dự định có một kỳ nghỉ dài, thì Golden Hotel Nha Trang chính là lựa chọn dành cho quý khách. Với đầy đủ tiện nghi với chất lượng dịch vụ tuyệt vời, Golden Hotel Nha Trang sẽ khiến quý khách cảm thấy thoải mái như đang ở nhà vậy.&#10;&#10;Golden Hotel Nha Trang là lựa chọn sáng giá dành cho những ai đang tìm kiếm một trải nghiệm xa hoa đầy thú vị trong kỳ nghỉ của mình. Lưu trú tại đây cũng là cách để quý khách chiều chuộng bản thân với những dịch vụ xuất sắc nhất và khiến kỳ nghỉ của mình trở nên thật đáng nhớ.&#10;&#10;Du lịch một mình cũng không hề kém phần thú vị và Golden Hotel Nha Trang là nơi thích hợp dành riêng cho những ai đề cao sự riêng tư trong kỳ lưu trú.&#10;&#10;Dịch vụ tuyệt vời, cơ sở vật chất hoàn chỉnh và các tiện nghi nơi nghỉ cung cấp sẽ khiến quý khách không thể phàn nàn trong suốt kỳ lưu trú tại Golden Hotel Nha Trang.&#10;&#10;Quầy tiếp tân 24 giờ luôn sẵn sàng phục vụ quý khách từ thủ tục nhận phòng đến trả phòng hay bất kỳ yêu cầu nào. Nếu cần giúp đỡ xin hãy liên hệ đội ngũ tiếp tân, chúng tôi luôn sẵn sàng hỗ trợ quý khách.&#10;&#10;Tận hưởng những món ăn yêu thích với phong cách ẩm thực đặc biệt từ Golden Hotel Nha Trang chỉ dành riêng cho quý khách.&#10;&#10;Sóng WiFi phủ khắp các khu vực chung của nơi nghỉ cho phép quý khách luôn kết nối với gia đình và bè bạn.&#10;&#10;Golden Hotel Nha Trang là nơi nghỉ sở hữu đầy đủ tiện nghi và dịch vụ xuất sắc theo nhận định của hầu hết khách lưu trú.&#10;&#10;Với những tiện nghi sẵn có Golden Hotel Nha Trang thực sự là một nơi lưu trú hoàn hảo.  # Source: curl_step_2.1 -> data.description

> 🌟 **Điểm nổi bật**: Được 1 du khách đánh giá **7.0/10** điểm - "Tốt" về dịch vụ, vị trí và tiện nghi.

---

## ⭐ Đặc Điểm Nổi Bật

### 🏖️ 1. Vị Trí
- **136**, Đường Hùng Vương, Phường Lộc Thọ, Thành phố Nha Trang, Thành phố Nha Trang
- **Nhà Nghỉ Phúc Lộc Cảnh**: 212m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Tháp Trầm Hương**: 621m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Công An Tỉnh Khánh Hòa**: 262m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Quảng trường 2 tháng 4**: 498m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Vincom Plaza Lê Thánh Tôn, Nha Trang**: 911m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Đường Trần Phú**: 287m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Bảo tàng Không quân Nha Trang**: 290m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Stay 7 International Hotel Nha Trang**: 226m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Alpha Nha Trang**: 363m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Hội Nông Dân Tỉnh Khánh Hòa**: 2.3km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Đường Nguyễn Thiện Thuật Nha Trang**: 162m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels**: 306m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Bệnh viện quốc tế Vinmec Nha Trang**: 3.0km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Biển Nha Trang**: 240m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Giordano Vincom Trần Phú Nha Trang**: 306m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Nhà thờ Núi Nha Trang**: 1.5km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Central Park**: 927m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Đường Hùng Vương Nha Trang**: 278m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Sailing Club Nha Trang**: 294m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Armenia Nha Trang**: 264m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **OASIS**: 22m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang**: 378m  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Chợ Đầm**: 2.2km  # Source: curl_step_2.1 -> data.entertainmentVenues
- **Chùa Long Sơn**: 2.5km  # Source: curl_step_2.1 -> data.entertainmentVenues

### 💎 2. Tiện Nghi Khách Sạn

### 👨‍👩‍👧‍👦 3. Thân Thiện Với Gia Đình

---

## 🛏️ Hạng Phòng Đa Dạng

Khách sạn cung cấp 10 loại phòng chính:

| Hạng Phòng               | Diện tích | View      | Sức chứa       | Đặc điểm nổi bật           |
|--------------------------|-----------|-----------|----------------|----------------------------|
  # Source: curl_step_2.2 -> data.content[]
| **Senior Double With City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Senior Balcony City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Superior Double City View** | 18.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Deluxe Twin With City View** | 33.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Senior Double With Ocean View** | 25.0m²      | Hướng mặt biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Senior Balcony Ocean View** | 25.0m²      | Hướng mặt biển      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Deluxe Triple With City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Senior Twin With City View** | 25.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
  # Source: curl_step_2.2 -> data.content[]
| **Deluxe Without Balcony City View** | 32.0m²      | Hướng thành phố      | 2 người lớn + 0 trẻ em | Bữa sáng miễn phí WiFi miễn phí |
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
> Tôi sẽ kiểm tra ngay: }}

---

## 📍 Địa Điểm Lân Cận

  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Nhà Nghỉ Phúc Lộc Cảnh** (212m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Tháp Trầm Hương** (621m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Công An Tỉnh Khánh Hòa** (262m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Quảng trường 2 tháng 4** (498m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Vincom Plaza Lê Thánh Tôn, Nha Trang** (911m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Đường Trần Phú** (287m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Bảo tàng Không quân Nha Trang** (290m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Stay 7 International Hotel Nha Trang** (226m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Alpha Nha Trang** (363m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Hội Nông Dân Tỉnh Khánh Hòa** (2.3km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Đường Nguyễn Thiện Thuật Nha Trang** (162m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels** (306m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Bệnh viện quốc tế Vinmec Nha Trang** (3.0km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Biển Nha Trang** (240m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Giordano Vincom Trần Phú Nha Trang** (306m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Nhà thờ Núi Nha Trang** (1.5km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Central Park** (927m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Đường Hùng Vương Nha Trang** (278m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Sailing Club Nha Trang** (294m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Armenia Nha Trang** (264m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **OASIS** (22m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang** (378m): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Chợ Đầm** (2.2km): 
  # Source: curl_step_2.1 -> data.entertainmentVenues OR curl_step_2.4
- **Chùa Long Sơn** (2.5km): 

---

## 🎯 Địa Điểm Giải Trí Gần Đây

### 🌟 Trung tâm giải trí

• **Quảng trường 2 tháng 4** (752m): Quảng trường 2 tháng 4 - Điểm đến phổ biến gần khách sạn  
  📍 Quảng trường 2 tháng 4, Thành phố Nha Trang

• **Chợ Đầm** (1.5m): Chợ Đầm - Điểm đến phổ biến gần khách sạn  
  📍 Chợ Đầm, Thành phố Nha Trang

• **Tháp Trầm Hương** (4.8m): Tháp Trầm Hương - Điểm đến phổ biến gần khách sạn  
  📍 Tháp Trầm Hương, Thành phố Nha Trang

• **Vincom Plaza Lê Thánh Tôn, Nha Trang** (4.9m): Vincom Plaza Lê Thánh Tôn, Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Vincom Plaza Lê Thánh Tôn, Nha Trang, Thành phố Nha Trang

### 🌟 Địa Điểm Lân Cận

• **Đường Hùng Vương Nha Trang** (244m): Đường Hùng Vương Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Đường Hùng Vương Nha Trang, Thành phố Nha Trang

• **Ga Nha Trang** (565m): Ga Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Ga Nha Trang, Thành phố Nha Trang

• **Công An Tỉnh Khánh Hòa** (727m): Công An Tỉnh Khánh Hòa - Điểm đến phổ biến gần khách sạn  
  📍 Công An Tỉnh Khánh Hòa, Thành phố Nha Trang

• **Công viên nước Phù Đổng** (1.0m): Công viên nước Phù Đổng - Điểm đến phổ biến gần khách sạn  
  📍 Công viên nước Phù Đổng, Thành phố Nha Trang

• **Alpha Nha Trang** (1.3m): Alpha Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Alpha Nha Trang, Thành phố Nha Trang

• **Central Park** (1.4m): Central Park - Điểm đến phổ biến gần khách sạn  
  📍 Central Park, Thành phố Nha Trang

• **Cảng Nha Trang** (1.6m): Cảng Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Cảng Nha Trang, Thành phố Nha Trang

• **Nhà Nghỉ Phúc Lộc Cảnh** (2.1m): Nhà Nghỉ Phúc Lộc Cảnh - Điểm đến phổ biến gần khách sạn  
  📍 Nhà Nghỉ Phúc Lộc Cảnh, Thành phố Nha Trang

• **Tháp Trầm Hương** (2.3m): Tháp Trầm Hương - Điểm đến phổ biến gần khách sạn  
  📍 Tháp Trầm Hương, Thành phố Nha Trang

• **Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels** (2.3m): Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels - Điểm đến phổ biến gần khách sạn  
  📍 Massage &amp; Spa HOÀN HẢO ( Perfect ) Ibis Styles Hotels, Thành phố Nha Trang

• **Sailing Club Nha Trang** (2.3m): Sailing Club Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Sailing Club Nha Trang, Thành phố Nha Trang

• **Armenia Nha Trang** (2.8m): Armenia Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Armenia Nha Trang, Thành phố Nha Trang

• **Quảng trường 2 tháng 4** (3.0m): Quảng trường 2 tháng 4 - Điểm đến phổ biến gần khách sạn  
  📍 Quảng trường 2 tháng 4, Thành phố Nha Trang

• **Biển Nha Trang** (3.0m): Biển Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Biển Nha Trang, Thành phố Nha Trang

• **Stay 7 International Hotel Nha Trang** (3.2m): Stay 7 International Hotel Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Stay 7 International Hotel Nha Trang, Thành phố Nha Trang

• **Bệnh viện quốc tế Vinmec Nha Trang** (3.4m): Bệnh viện quốc tế Vinmec Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Bệnh viện quốc tế Vinmec Nha Trang, Thành phố Nha Trang

• **OASIS** (3.4m): OASIS - Điểm đến phổ biến gần khách sạn  
  📍 OASIS, Thành phố Nha Trang

• **Quảng trường 2 tháng 4** (3.6m): Quảng trường 2 tháng 4 - Điểm đến phổ biến gần khách sạn  
  📍 Quảng trường 2 tháng 4, Thành phố Nha Trang

• **Bảo tàng Không quân Nha Trang** (3.7m): Bảo tàng Không quân Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Bảo tàng Không quân Nha Trang, Thành phố Nha Trang

• **Đường Trần Phú** (3.8m): Đường Trần Phú - Điểm đến phổ biến gần khách sạn  
  📍 Đường Trần Phú, Thành phố Nha Trang

• **Bến phà Vinpearl** (3.8m): Bến phà Vinpearl - Điểm đến phổ biến gần khách sạn  
  📍 Bến phà Vinpearl, Thành phố Nha Trang

• **Tháp Chàm Po Nagar** (4.1m): Tháp Chàm Po Nagar - Điểm đến phổ biến gần khách sạn  
  📍 Tháp Chàm Po Nagar, Thành phố Nha Trang

• **Đường Nguyễn Thiện Thuật Nha Trang** (4.2m): Đường Nguyễn Thiện Thuật Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Đường Nguyễn Thiện Thuật Nha Trang, Thành phố Nha Trang

• **Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang** (4.4m): Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Long Beach Pearl - Nguyễn Thị Minh Khai, Nha Trang, Thành phố Nha Trang

• **Vincom Plaza Lê Thánh Tôn, Nha Trang** (4.4m): Vincom Plaza Lê Thánh Tôn, Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Vincom Plaza Lê Thánh Tôn, Nha Trang, Thành phố Nha Trang

• **Giordano Vincom Trần Phú Nha Trang** (4.6m): Giordano Vincom Trần Phú Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Giordano Vincom Trần Phú Nha Trang, Thành phố Nha Trang

• **Tháo Trầm Hương** (4.8m): Tháo Trầm Hương - Điểm đến phổ biến gần khách sạn  
  📍 Tháo Trầm Hương, Thành phố Nha Trang

• **Vincom Plaza Lê Thánh Tôn, Nha Trang** (4.9m): Vincom Plaza Lê Thánh Tôn, Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Vincom Plaza Lê Thánh Tôn, Nha Trang, Thành phố Nha Trang

### 🌟 Khác

• **Central Park** (1.9m): Central Park - Điểm đến phổ biến gần khách sạn  
  📍 Central Park, Thành phố Nha Trang

• **Nhà thờ Núi Nha Trang** (3.3m): Nhà thờ Núi Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Nhà thờ Núi Nha Trang, Thành phố Nha Trang

• **Hội Nông Dân Tỉnh Khánh Hòa** (3.9m): Hội Nông Dân Tỉnh Khánh Hòa - Điểm đến phổ biến gần khách sạn  
  📍 Hội Nông Dân Tỉnh Khánh Hòa, Thành phố Nha Trang

• **Bệnh viện quốc tế Vinmec Nha Trang** (4.6m): Bệnh viện quốc tế Vinmec Nha Trang - Điểm đến phổ biến gần khách sạn  
  📍 Bệnh viện quốc tế Vinmec Nha Trang, Thành phố Nha Trang

• **Chùa Long Sơn** (4.8m): Chùa Long Sơn - Điểm đến phổ biến gần khách sạn  
  📍 Chùa Long Sơn, Thành phố Nha Trang



---

## ⭐ Đánh Giá Khách Hàng

### 📊 Tổng Quan Đánh Giá
- **Tổng số đánh giá**: 1 đánh giá
- **Điểm trung bình**: 7.0/10

### 📈 Phân Bố Điểm Số
- **9-10 điểm**: 0 đánh giá
- **7-8 điểm**: 1 đánh giá
- **5-6 điểm**: 0 đánh giá
- **3-4 điểm**: 0 đánh giá
- **1-2 điểm**: 0 đánh giá

### 💬 Đánh Giá Gần Đây
- **7/10** - "abc comment" _(2025-11-02T18:06:50.819199)_

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


---

## 📞 Liên Hệ & Hỗ Trợ

Bạn có câu hỏi về khách sạn này? Tôi có thể giúp bạn:
- 🔍 Kiểm tra phòng trống cho ngày cụ thể
- 💰 So sánh giá các loại phòng
- 🎁 Tìm mã giảm giá đang có hiệu lực
- 📧 Liên hệ trực tiếp với khách sạn về yêu cầu đặc biệt

Hãy cho tôi biết kế hoạch của bạn! 😊

---


