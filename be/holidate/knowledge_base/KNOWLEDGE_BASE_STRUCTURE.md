# Knowledge Base Structure Design for Holidate RAG System

## 1. Directory Architecture

```
knowledge_base/
│
├── metadata/
│   ├── schema.json                      # JSON Schema cho validation
│   └── vibe_mapping.yaml                # Quy tắc suy luận vibe_tags
│
├── vietnam/                             # Country level
│   │
│   ├── da-nang/                         # City level (slug format)
│   │   ├── _city_guide.md              # Overview về Đà Nẵng (destination guide)
│   │   │
│   │   ├── son-tra/                    # District level
│   │   │   ├── hotels/
│   │   │   │   ├── pullman-danang-beach-resort.md
│   │   │   │   └── furama-resort-danang.md
│   │   │   └── rooms/                  # Room details (nếu cần file riêng)
│   │   │       ├── pullman-danang-beach-resort/
│   │   │       │   ├── deluxe-ocean-view.md
│   │   │       │   └── suite-executive.md
│   │   │
│   │   ├── hai-chau/
│   │   │   └── hotels/
│   │   │       ├── novotel-danang-premier-han-river.md
│   │   │       └── brilliant-hotel.md
│   │   │
│   │   └── ngu-hanh-son/
│   │       └── hotels/
│   │           └── vinpearl-resort-spa-danang.md
│   │
│   ├── nha-trang/
│   │   ├── _city_guide.md
│   │   └── nha-trang-city/
│   │       └── hotels/
│   │           ├── sheraton-nha-trang.md
│   │           └── mia-resort-nha-trang.md
│   │
│   ├── ho-chi-minh/
│   │   ├── _city_guide.md
│   │   ├── quan-1/
│   │   │   └── hotels/
│   │   ├── quan-3/
│   │   └── thanh-pho-thu-duc/
│   │
│   ├── ha-noi/
│   │   ├── _city_guide.md
│   │   ├── hoan-kiem/
│   │   ├── ba-dinh/
│   │   └── tay-ho/
│   │
│   ├── vung-tau/
│   └── phan-thiet/
│
├── collections/                         # Thematic collections (không theo địa lý)
│   ├── romantic-getaways.md            # Danh sách khách sạn lãng mạn
│   ├── family-friendly-resorts.md
│   ├── budget-stays-under-1m.md
│   ├── luxury-5star-escapes.md
│   └── beachfront-properties.md
│
└── faqs/                                # Câu hỏi thường gặp
    ├── booking-policies.md
    ├── payment-methods.md
    └── cancellation-guide.md
```

---

## 2. Naming Conventions

### 2.1 Slug Generation Rules
- **City/District**: `to-snake-case(remove_accents(name))`
  - "Thành phố Đà Nẵng" → `da-nang`
  - "Quận Sơn Trà" → `son-tra`
  - "Thành phố Hồ Chí Minh" → `ho-chi-minh`

- **Hotel**: `to-kebab-case(hotel_name)`
  - "Pullman Danang Beach Resort" → `pullman-danang-beach-resort`
  - "Khách sạn Brilliant" → `khach-san-brilliant`

### 2.2 File Naming Priority
1. Use official English name if available
2. Fallback to transliterated Vietnamese
3. Always lowercase, hyphen-separated

---

## 3. Frontmatter Metadata Schema

### 3.1 Common Fields (All doc types)

```yaml
---
# === IDENTIFICATION ===
doc_type: "hotel_profile" | "room_detail" | "destination_guide" | "collection"
doc_id: "uuid-from-database"
slug: "pullman-danang-beach-resort"
last_updated: "2025-11-23T14:30:00Z"

# === LOCATION HIERARCHY ===
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

# === SEARCH TAGS ===
location_tags:
  - "Đà Nẵng"
  - "Sơn Trà"
  - "Bãi biển Mỹ Khê"
  - "Bán đảo Sơn Trà"
  - "Ngũ Hành Sơn"
  - "Non Nước"

amenity_tags:
  - "pool"
  - "spa"
  - "gym"
  - "beachfront"
  - "restaurant"
  - "bar"
  - "free_wifi"
  - "airport_shuttle"
  - "kids_club"

vibe_tags:
  - "luxury"
  - "romantic"
  - "family_friendly"
  - "beach_resort"
  - "business"

# === PRICING INFO (Static Reference) ===
reference_min_price: 2800000  # VNĐ (From cheapest ACTIVE room's base_price)
reference_min_price_room: "Deluxe Garden View"
star_rating: 5

# === BUSINESS DATA ===
hotel_id: "abc-123-uuid"
partner_id: "partner-xyz-uuid"
status: "active"  # active | inactive | maintenance

# === CONTENT METADATA ===
language: "vi"
keywords:
  - "khách sạn đà nẵng"
  - "resort biển mỹ khê"
  - "pullman danang"
  - "nghỉ dưỡng gia đình"
---
```

### 3.2 Hotel Profile Specific

```yaml
# === HOTEL STATS ===
total_rooms: 196
available_room_types: 8
review_score: 8.7
review_count: 1234
commission_rate: 15.0

# === NEARBY ATTRACTIONS (Top 5) ===
nearby_venues:
  - name: "Bãi biển Mỹ Khê"
    distance: "50m"
    category: "beach"
  - name: "Chùa Linh Ứng"
    distance: "3.5km"
    category: "temple"
  - name: "Bà Nà Hills"
    distance: "25km"
    category: "theme_park"

# === POLICIES ===
check_in_time: "14:00"
check_out_time: "12:00"
cancellation_policy: "flexible_7_days"
allows_pay_at_hotel: false
```

### 3.3 Room Detail Specific

```yaml
# === ROOM INFO ===
room_id: "room-uuid-123"
room_name: "Deluxe Ocean View"
room_type: "deluxe"
bed_type: "Giường King (cỡ lớn)"
max_adults: 2
max_children: 1
area_sqm: 45
view: "ocean"

# === ROOM AMENITIES ===
room_features:
  - "balcony"
  - "bathtub"
  - "air_conditioning"
  - "minibar"
  - "coffee_maker"
  - "safe_box"

# === POLICIES ===
smoking_allowed: false
wifi_available: true
breakfast_included: true
cancellation_policy: "flexible_3_days"
reschedule_policy: "flexible_2_days"

# === PRICING (Static) ===
base_price: 3200000  # VNĐ/night (reference only)
quantity: 10
```

---

## 4. Vibe Tags Inference Logic

### Rule-based Mapping (vibe_mapping.yaml)

```yaml
vibe_inference_rules:
  luxury:
    conditions:
      - star_rating >= 5
      - OR amenities CONTAINS ["spa", "pool", "fine_dining"]
      - OR min_price >= 3000000
  
  romantic:
    conditions:
      - amenities CONTAINS ["spa", "couple_massage"]
      - OR location_tags CONTAINS ["beach", "mountain", "lake"]
      - AND star_rating >= 4
  
  family_friendly:
    conditions:
      - amenities CONTAINS ["kids_club", "kids_pool", "playground"]
      - OR max_children >= 2
  
  budget:
    conditions:
      - min_price < 1000000
      - star_rating <= 3
  
  business:
    conditions:
      - amenities CONTAINS ["meeting_room", "business_center", "office_services"]
  
  beach_resort:
    conditions:
      - location_tags CONTAINS "beach"
      - OR amenities CONTAINS "beachfront"
  
  urban:
    conditions:
      - district IN ["quan-1", "hoan-kiem", "hai-chau"]
  
  secluded:
    conditions:
      - location_tags CONTAINS ["mountain", "forest", "countryside"]
```

---

## 5. Reference Min Price Calculation Logic

### SQL Query Example:
```sql
SELECT 
  h.id AS hotel_id,
  h.name AS hotel_name,
  MIN(r.base_price_per_night) AS reference_min_price,
  (SELECT r2.name 
   FROM rooms r2 
   WHERE r2.hotel_id = h.id 
     AND r2.status = 'active' 
     AND r2.base_price_per_night = MIN(r.base_price_per_night)
   LIMIT 1
  ) AS reference_min_price_room
FROM hotels h
JOIN rooms r ON r.hotel_id = h.id
WHERE h.status = 'active'
  AND r.status = 'active'
GROUP BY h.id, h.name;
```

### Python Implementation:
```python
def calculate_reference_min_price(hotel_dto):
    """
    Extract reference_min_price from HotelDetailsResponse DTO
    """
    active_rooms = [
        room for room in hotel_dto.rooms 
        if room.status == 'active'
    ]
    
    if not active_rooms:
        return None, None
    
    min_room = min(active_rooms, key=lambda r: r.base_price_per_night)
    
    return {
        'reference_min_price': min_room.base_price_per_night,
        'reference_min_price_room': min_room.name
    }
```

---

## 6. DTO → Markdown Mapping Table

| **DTO Field**                          | **Markdown Section**          | **Transformation**                     |
|----------------------------------------|-------------------------------|----------------------------------------|
| `HotelResponse.name`                   | Title (H1)                    | Direct copy                            |
| `HotelResponse.description`            | Introduction paragraph        | Add narrative flair                    |
| `HotelResponse.star_rating`            | Frontmatter + Body            | "⭐⭐⭐⭐⭐ Tiêu chuẩn 5 sao"          |
| `HotelResponse.location.*`             | Frontmatter location block    | Full hierarchy                         |
| `HotelResponse.amenities[]`            | "Tiện nghi nổi bật" section   | Group by category, add icons          |
| `HotelResponse.photos[0]`              | Markdown image                | `![](s3_url)` first photo             |
| `HotelResponse.entertainment_venues[]` | "Địa điểm lân cận" section    | Format as bullet list with distance   |
| `HotelResponse.policy.*`               | "Chính sách" section          | Human-readable format                 |
| `min(rooms[].base_price_per_night)`    | Frontmatter + Price section   | "Từ {price} VNĐ/đêm"                  |
| `RoomResponse.name`                    | Room title (H2)               | Direct copy                            |
| `RoomResponse.area`                    | Room specs                    | "{area} m²"                           |
| `RoomResponse.bed_type`                | Room specs                    | Vietnamese bed type name              |
| `RoomResponse.view`                    | Room specs                    | "Hướng nhìn: {view}"                  |
| `RoomResponse.amenities[]`             | Room features list            | Icon + Vietnamese name                |

---

## 7. Content Quality Guidelines

### 7.1 Writing Style
- **Tone**: Chuyên nghiệp nhưng thân thiện, giống travel influencer
- **POV**: Third-person (Khách sạn này, Phòng này)
- **Length**: Hotel Profile 300-500 từ, Room Detail 150-250 từ

### 7.2 SEO Keywords Density
- Tên khách sạn: 2-3 lần
- Tên thành phố: 3-5 lần
- Target amenities: Mỗi loại 1 lần

### 7.3 Emoji Usage (Subtle)
- 🏖️ Beach/Resort
- 🏊 Pool/Spa
- 🍽️ Restaurant
- 💰 Price
- ⭐ Rating
- 📍 Location

---

## 8. Dynamic Content Placeholders

### Tool Call Syntax:
```markdown
{{TOOL:check_availability|hotel_id={hotel_id}|check_in={date}|check_out={date}|adults={n}|children={n}}}

{{TOOL:get_room_price|room_id={room_id}|date={date}}}

{{TOOL:search_hotels|city={city}|min_price={price}|max_price={price}|amenities=[...]}}
```

### Example Usage in Content:
```markdown
💰 **Giá tham khảo**: Từ **2.800.000 VNĐ**/đêm (Áp dụng cho phòng Deluxe Garden View)

> ⚠️ **Lưu ý**: Giá trên là mức tham khảo từ giá cơ bản. Giá thực tế thay đổi theo:
> - Ngày trong tuần/cuối tuần
> - Mùa cao điểm/thấp điểm  
> - Tình trạng phòng trống

🔍 **Để kiểm tra giá chính xác và tình trạng phòng trống cho kỳ nghỉ của bạn**, 
tôi có thể tra cứu ngay: {{TOOL:check_availability|hotel_id=abc-123|...}}
```

---

## 9. Update Frequency Strategy

| **Data Type**           | **Update Frequency** | **Source**          |
|-------------------------|----------------------|---------------------|
| Hotel name, description | Manual (on edit)     | Hotel service API   |
| Amenities list          | Manual (on edit)     | Hotel service API   |
| Room types              | Manual (on edit)     | Room service API    |
| Reference min price     | Weekly batch job     | Nightly calculation |
| Review score/count      | Daily batch job      | Review service      |
| Photos                  | Manual (on upload)   | S3 upload event     |
| Nearby venues           | Quarterly            | Location service    |

---

## 10. Vector Embedding Strategy

### Fields to Embed:
1. **Primary embedding**: Full markdown content (excluding frontmatter)
2. **Metadata filters**: Frontmatter fields for pre-filtering before vector search

### Chunking Strategy:
- Hotel Profile: Keep as single chunk (≤ 1000 tokens)
- Room Detail: Keep as single chunk (≤ 500 tokens)
- City Guide: Split by sections (H2 headers)

### Embedding Model Recommendation:
- Vietnamese-optimized: `vinai/phobert-base-v2`
- Multilingual: `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`

---

This structure provides a scalable, semantic-search-optimized knowledge base that balances:
- ✅ Geographic organization for efficient retrieval
- ✅ Rich metadata for precise filtering
- ✅ Natural language content for LLM understanding
- ✅ Dynamic safety with tool call placeholders
- ✅ DTO-driven accuracy (no hallucination)

