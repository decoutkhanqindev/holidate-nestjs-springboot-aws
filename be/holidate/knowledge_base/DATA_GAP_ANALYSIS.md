# Data Gap Analysis & Feasibility Check - Knowledge Base System

**Tác giả:** Senior Software Architect  
**Ngày:** 2024  
**Mục tiêu:** Đánh giá tính khả thi của việc sinh Markdown files từ Database hiện tại

---

## Executive Summary

Sau khi phân tích kỹ lưỡng cấu trúc Database (`entities.md`) và các template (`template_room_detail.md`, `template_hotel_profile.md`), kết luận:

✅ **FEASIBLE** - Hệ thống có thể sinh Markdown từ Database hiện tại với các giải pháp mapping và inference logic.

⚠️ **CRITICAL GAPS IDENTIFIED:**
- Room Entity thiếu field `description` (phải generate từ template)
- Room Entity thiếu `room_type` và `room_category` (phải infer từ `name` tiếng Việt)
- PhotoCategory không có cấu trúc chuẩn để phân biệt main/gallery (phải dựa vào name)
- Cần bảng mapping tĩnh (Static Mapping Table) cho Vietnamese → English tags

---

## 1. GAP ANALYSIS MATRIX - ROOM TEMPLATE

### 1.1. Document Identification & Basic Info

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `doc_id` | `Room.id` | ✅ **Direct** | `Room.getId()` - UUID string |
| `slug` | `Room.name` + `Hotel.name` | 🔄 **Transform** | `SlugService.generateSlug(room.getName() + " " + hotel.getName())` |
| `parent_hotel_slug` | `Hotel.name` | 🔄 **Transform** | `SlugService.generateSlug(hotel.getName())` |
| `parent_hotel_id` | `Room.hotel.id` | ✅ **Direct** | `room.getHotel().getId()` |
| `room_name` | `Room.name` | ✅ **Direct** | `room.getName()` (tiếng Việt, hiển thị trực tiếp) |
| `last_updated` | `Room.updatedAt` | ⚠️ **Nullable** | `room.getUpdatedAt() != null ? room.getUpdatedAt() : LocalDateTime.now()` |

### 1.2. Room Classification (CRITICAL GAPS)

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `room_type` | ❌ **Không có** | 🔴 **Missing** | **INFER từ `Room.name` (VN)**:<br>- Pattern matching: "Phòng Tổng Thống", "Presidential Suite" → `"suite"`<br>- "Phòng Thượng Hạng", "Deluxe", "Cao Cấp" → `"deluxe"`<br>- "Phòng Hạng Trung", "Superior" → `"superior"`<br>- "Villa", "Biệt Thự" → `"villa"`<br>- Default: `"standard"` |
| `room_category` | ❌ **Không có** | 🔴 **Missing** | **INFER từ `maxAdults` + `maxChildren`**:<br>- `maxChildren > 0` → `"family"`<br>- `maxAdults == 1` → `"single"`<br>- `maxAdults == 2` → `"double"`<br>- Default: `"suite"` |

**Risk Level:** ⚠️ **MEDIUM**  
**Rationale:** Logic inference từ tên tiếng Việt có thể không chính xác 100% (ví dụ: "Phòng Gia Đình Thượng Hạng" có thể nhầm thành "suite" thay vì "deluxe"). Cần có fallback và có thể cần manual curation cho các trường hợp đặc biệt.

### 1.3. Room Specifications (Direct Mapping)

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `bed_type` | `Room.bedType.name` | ✅ **Direct** | `room.getBedType().getName()` (tiếng Việt, hiển thị trực tiếp) |
| `bed_type_id` | `Room.bedType.id` | ✅ **Direct** | `room.getBedType().getId()` - UUID |
| `max_adults` | `Room.maxAdults` | ✅ **Direct** | `room.getMaxAdults()` - int |
| `max_children` | `Room.maxChildren` | ✅ **Direct** | `room.getMaxChildren()` - int |
| `area_sqm` | `Room.area` | ✅ **Direct** | `room.getArea()` - double (m²) |
| `view` | `Room.view` | ⚠️ **String** | `room.getView()` - String (tiếng Việt hoặc English, cần normalize) |
| `floor_range` | ❌ **Không có** | 🟡 **Optional Missing** | **Default: `null`**<br>**Future Enhancement:** Có thể thêm field vào Room entity nếu cần |

### 1.4. Room Features (Amenity Mapping - CRITICAL)

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `room_amenity_tags` | `Room.amenities` → `RoomAmenity.amenity.name` | 🔄 **Transform** | **CRITICAL: Cần bảng mapping VN → EN**<br>1. Load `Room.amenities` → `RoomAmenity.amenity.name` (tiếng Việt)<br>2. Map qua `AmenityMappingService.mapToEnglish(amenityName)`<br>3. Return list: `["bathtub", "balcony", "tv", ...]`<br><br>**Mapping Table cần có:**<br>- "Bồn tắm" → "bathtub"<br>- "Ban công" → "balcony"<br>- "TV" / "Tivi" → "tv"<br>- "Két sắt" → "safe_box"<br>- ... (xem `AmenityMappingService` hiện có) |

**Risk Level:** ⚠️ **LOW-MEDIUM**  
**Rationale:** `AmenityMappingService` đã có sẵn mapping table, nhưng cần đảm bảo đầy đủ và có fallback cho các amenity mới chưa có trong mapping.

**Helper Flags (derived from amenity_tags):**

| Template Flag | Source | Logic |
|:---|:---|:---|
| `has_balcony` | `room_amenity_tags` | `roomAmenityTags.contains("balcony")` |
| `has_bathtub` | `room_amenity_tags` | `roomAmenityTags.contains("bathtub")` |
| `has_tv` | `room_amenity_tags` | `roomAmenityTags.contains("tv")` |
| `has_bluetooth` | `room_amenity_tags` | `roomAmenityTags.contains("bluetooth")` |
| `has_coffee_maker` | `room_amenity_tags` | `roomAmenityTags.contains("coffee_maker")` |
| `has_minibar` | `room_amenity_tags` | `roomAmenityTags.contains("minibar")` |
| `has_blackout_curtains` | `room_amenity_tags` | `roomAmenityTags.contains("blackout_curtains")` |
| `has_safe_box` | `room_amenity_tags` | `roomAmenityTags.contains("safe_box")` |
| `has_turn_down_service` | `room_amenity_tags` | `roomAmenityTags.contains("turn_down_service")` |

### 1.5. Room Policies

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `smoking_allowed` | `Room.smokingAllowed` | ✅ **Direct** | `room.isSmokingAllowed()` - boolean |
| `wifi_available` | `Room.wifiAvailable` | ✅ **Direct** | `room.isWifiAvailable()` - boolean |
| `breakfast_included` | `Room.breakfastIncluded` | ✅ **Direct** | `room.isBreakfastIncluded()` - boolean |
| `cancellation_policy` | `Room.cancellationPolicy.name` OR `Hotel.policy.cancellationPolicy.name` | 🔄 **Inherit** | `room.getCancellationPolicy() != null`<br>&nbsp;&nbsp;`? room.getCancellationPolicy().getName()`<br>&nbsp;&nbsp;: `hotel.getPolicy().getCancellationPolicy().getName()`<br>(tiếng Việt, hiển thị trực tiếp) |
| `reschedule_policy` | `Room.reschedulePolicy.name` OR `Hotel.policy.reschedulePolicy.name` | 🔄 **Inherit** | Tương tự cancellation_policy |

### 1.6. Inventory & Pricing

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `quantity` | `Room.quantity` | ✅ **Direct** | `room.getQuantity()` - int (tổng số phòng loại này) |
| `status` | `Room.status` | ✅ **Direct** | `room.getStatus()` - String ("active", "inactive", ...) |
| `base_price` | `Room.basePricePerNight` | ✅ **Direct** | `room.getBasePricePerNight()` - double (VNĐ/đêm) |
| `price_note` | ❌ **Không có** | 🟡 **Template String** | Hardcode: `"Giá có thể thay đổi theo ngày trong tuần, mùa cao điểm và tình trạng phòng trống"` |

### 1.7. Metadata (Inferred)

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `vibe_tags` | ❌ **Không có** | 🔄 **Infer** | **INFER từ room features**:<br>1. Sea view + bathtub → `["sea_view", "romantic", "honeymoon"]`<br>2. Balcony → `["balcony_room"]`<br>3. Suite/Villa in name → `["luxury"]`<br>4. `maxChildren > 0` → `["family_friendly"]`<br>5. Default: `["standard"]` |
| `keywords` | ❌ **Không có** | 🔄 **Generate** | **GENERATE từ room data**:<br>1. `room.getName().toLowerCase()`<br>2. `"phòng " + city.getName().toLowerCase()`<br>3. View-based: `"phòng view biển " + city.getName().toLowerCase()`<br>4. Bed type: Nếu "King" → `"giường king size"`<br>5. Room type: `"phòng " + inferredRoomType.toLowerCase()` |
| `description` | ❌ **Không có** | 🔴 **CRITICAL MISSING** | **GENERATE từ template string**:<br>`"**{roomName}** là hạng phòng {viewDescription} tại {hotelName}, với diện tích {area}m², phù hợp cho tối đa {maxAdults} người lớn{+maxChildren trẻ em}."` |

**Risk Level:** 🔴 **HIGH** cho `description`  
**Rationale:** Không có description gốc, phải generate từ template đơn giản. Điều này giảm chất lượng content, nhưng vẫn đủ để Knowledge Base hoạt động.

### 1.8. Images

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `mainImageUrl` | `Room.photos` → `RoomPhoto.photo` | 🔄 **Transform** | **Logic hiện tại đã implement**:<br>1. Filter photos có `PhotoCategory.name == "main"`<br>2. Nếu không có, lấy ảnh đầu tiên<br>3. Fallback: `defaultPlaceholderImageUrl` |
| `galleryImageUrls` | `Room.photos` → `RoomPhoto.photo` | 🔄 **Transform** | **Logic hiện tại đã implement**:<br>1. Filter photos có `PhotoCategory.name != "main"`<br>2. Limit 10 images<br>3. Map to URL list |

**Risk Level:** ⚠️ **MEDIUM**  
**Rationale:** Phụ thuộc vào `PhotoCategory.name` có giá trị "main" hay không. Cần đảm bảo data seeding đúng, hoặc có fallback logic.

### 1.9. Location (Inherited from Hotel)

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `location.*` | `Room.hotel` → Location hierarchy | ✅ **Inherit** | Build `LocationHierarchyDto` từ `hotel.getCountry()`, `hotel.getProvince()`, ...<br>**Note:** Đã thêm `hotelName` vào `LocationHierarchyDto` |

---

## 2. GAP ANALYSIS MATRIX - HOTEL TEMPLATE

### 2.1. Document Identification

| Template Field | Entity Field | Trạng thái | Giải pháp |
|:---|:---|:---|:---|
| `doc_id` | `Hotel.id` | ✅ **Direct** | `hotel.getId()` |
| `slug` | `Hotel.name` | 🔄 **Transform** | `SlugService.generateSlug(hotel.getName())` |
| `name` | `Hotel.name` | ✅ **Direct** | `hotel.getName()` (tiếng Việt) |
| `description` | `Hotel.description` | ✅ **Direct** | `hotel.getDescription()` (tiếng Việt, TEXT) |
| `star_rating` | `Hotel.starRating` | ✅ **Direct** | `hotel.getStarRating()` - int (1-5) |
| `status` | `Hotel.status` | ✅ **Direct** | `hotel.getStatus()` - String |

### 2.2. Location Hierarchy

| Template Field | Entity Field | Trạng thái | Giải pháp |
|:---|:---|:---|:---|
| `location.*` | `Hotel.country/province/city/district/ward/street` | ✅ **Direct** | Tất cả đều có sẵn, chỉ cần map vào DTO |
| `location.coordinates` | `Hotel.latitude`, `Hotel.longitude` | ✅ **Direct** | `hotel.getLatitude()`, `hotel.getLongitude()` |

### 2.3. Search Tags

| Template Field | Entity Field | Trạng thái | Giải pháp/Logic đề xuất |
|:---|:---|:---|:---|
| `location_tags` | ❌ **Không có** | 🔄 **Generate** | **GENERATE từ location + venues**:<br>- `city.getName().toLowerCase()`<br>- `district.getName().toLowerCase()`<br>- `"bien " + city.getName()` (nếu có venue biển)<br>- `"resort " + district.getName()` |
| `amenity_tags` | `Hotel.amenities` → `HotelAmenity.amenity.name` | 🔄 **Transform** | Tương tự Room: `AmenityMappingService.mapToEnglish()` |
| `vibe_tags` | ❌ **Không có** | 🔄 **Infer** | **INFER từ star rating + amenities + price**:<br>- Star ≥ 5 → `["luxury"]`<br>- Has "spa" + "pool" → `["romantic"]`<br>- Has "kids_club" → `["family_friendly"]`<br>- Has "business_center" → `["business"]` |

### 2.4. Pricing Reference

| Template Field | Entity Field | Trạng thái | Giải pháp |
|:---|:---|:---|:---|
| `reference_min_price` | `MIN(Room.basePricePerNight)` | 🔄 **Aggregate** | Query: `SELECT MIN(r.basePricePerNight) FROM Room r WHERE r.hotel.id = ? AND r.status = 'active'` |
| `reference_min_price_room` | `Room.name` của phòng min price | 🔄 **Aggregate** | Query tương tự, lấy `roomName` |
| `reference_max_price` | `MAX(Room.basePricePerNight)` | 🔄 **Aggregate** | Query tương tự |

### 2.5. Performance Stats

| Template Field | Entity Field | Trạng thái | Giải pháp |
|:---|:---|:---|:---|
| `total_rooms` | `COUNT(Room)` | 🔄 **Aggregate** | `hotel.getRooms().size()` |
| `available_room_types` | `COUNT(DISTINCT Room.name)` | 🔄 **Aggregate** | `hotel.getRooms().stream().map(Room::getName).distinct().count()` |
| `review_score` | `AVG(Review.score)` | 🔄 **Aggregate** | Query: `SELECT AVG(r.score) FROM Review r WHERE r.hotel.id = ?` |
| `review_count` | `COUNT(Review)` | 🔄 **Aggregate** | `hotel.getReviews().size()` hoặc query |

### 2.6. Nearby Venues

| Template Field | Entity Field | Trạng thái | Giải pháp |
|:---|:---|:---|:---|
| `nearby_venues[]` | `Hotel.entertainmentVenues` → `HotelEntertainmentVenue` | ✅ **Direct** | Map từ `hotel.getEntertainmentVenues()`:<br>- `name`: `hev.getEntertainmentVenue().getName()` (tiếng Việt)<br>- `distance`: `hev.getDistance()` (double meters) → format "200m" or "3.5km"<br>- `category`: `hev.getEntertainmentVenue().getCategory().getName()` (tiếng Việt) |

### 2.7. Policies

| Template Field | Entity Field | Trạng thái | Giải pháp |
|:---|:---|:---|:---|
| `check_in_time` | `Hotel.policy.checkInTime` | ✅ **Direct** | `hotel.getPolicy().getCheckInTime()` - LocalTime |
| `check_out_time` | `Hotel.policy.checkOutTime` | ✅ **Direct** | `hotel.getPolicy().getCheckOutTime()` - LocalTime |
| `cancellation_policy` | `Hotel.policy.cancellationPolicy.name` | ✅ **Direct** | `hotel.getPolicy().getCancellationPolicy().getName()` (tiếng Việt) |
| `allows_pay_at_hotel` | `Hotel.policy.allowsPayAtHotel` | ✅ **Direct** | `hotel.getPolicy().isAllowsPayAtHotel()` - boolean |

### 2.8. Images

| Template Field | Entity Field | Trạng thái | Giải pháp |
|:---|:---|:---|:---|
| `mainImageUrl` | `Hotel.photos` → `HotelPhoto.photo` | 🔄 **Transform** | Tương tự Room: Filter by category "main", fallback to first photo |
| `galleryImageUrls` | `Hotel.photos` → `HotelPhoto.photo` | 🔄 **Transform** | Filter non-main photos, limit 5 |

---

## 3. INFERENCE LOGIC - DETAILED IMPLEMENTATION

### 3.1. `inferRoomType(String vietnameseName)` Logic

```java
private String inferRoomType(String roomName) {
    if (roomName == null || roomName.trim().isEmpty()) {
        return "standard";
    }
    
    String lowerName = roomName.toLowerCase()
        .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
        .replaceAll("[èéẹẻẽêềếệểễ]", "e")
        .replaceAll("[ìíịỉĩ]", "i")
        .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
        .replaceAll("[ùúụủũưừứựửữ]", "u")
        .replaceAll("[ỳýỵỷỹ]", "y")
        .replaceAll("đ", "d");
    
    // Priority order: More specific → Less specific
    
    // Suite / Presidential
    if (lowerName.contains("presidential") || 
        lowerName.contains("tong thong") ||
        lowerName.contains("suite tong thong") ||
        lowerName.contains("executive suite")) {
        return "suite";
    }
    
    // Villa
    if (lowerName.contains("villa") || 
        lowerName.contains("biet thu") ||
        lowerName.contains("bietthu")) {
        return "villa";
    }
    
    // Deluxe / Premium / Superior
    if (lowerName.contains("deluxe") || 
        lowerName.contains("cao cap") ||
        lowerName.contains("premium") ||
        lowerName.contains("thuong hang")) {
        return "deluxe";
    }
    
    if (lowerName.contains("superior") || 
        lowerName.contains("hang trung")) {
        return "superior";
    }
    
    // Suite (các trường hợp khác)
    if (lowerName.contains("suite")) {
        return "suite";
    }
    
    // Default
    return "standard";
}
```

**Accuracy Estimation:** ~85-90%  
**Edge Cases:**
- "Phòng Gia Đình Thượng Hạng" → có thể nhầm là "suite" (thực tế là "deluxe")
- "Phòng Standard View Biển" → OK, trả về "standard"

**Mitigation:** Log các trường hợp không match để manual review sau.

### 3.2. `inferRoomCategory(Room room)` Logic

```java
private String inferRoomCategory(Room room) {
    // Family: Has children capacity
    if (room.getMaxChildren() > 0) {
        return "family";
    }
    
    // Single: Only 1 adult
    if (room.getMaxAdults() == 1) {
        return "single";
    }
    
    // Double: Exactly 2 adults
    if (room.getMaxAdults() == 2) {
        return "double";
    }
    
    // Suite: More than 2 adults (assumed luxury/group)
    return "suite";
}
```

**Accuracy Estimation:** ~95%  
**Rationale:** Logic này dựa trên số lượng người, rất chính xác.

### 3.3. `inferVibeTags(Room room)` Logic

```java
private List<String> inferRoomVibeTags(Room room) {
    List<String> vibes = new ArrayList<>();
    
    // Rule 1: Sea/Ocean view
    String view = room.getView() != null ? room.getView().toLowerCase() : "";
    if (view.contains("ocean") || view.contains("sea") || 
        view.contains("bien") || view.contains("biển")) {
        vibes.add("sea_view");
    }
    
    // Rule 2: Romantic (bathtub + ocean view)
    if (hasRoomAmenity(room, "bathtub") && vibes.contains("sea_view")) {
        vibes.add("romantic");
        vibes.add("honeymoon");
    }
    
    // Rule 3: Balcony
    if (hasRoomAmenity(room, "balcony")) {
        vibes.add("balcony_room");
    }
    
    // Rule 4: Luxury (from room type)
    String roomType = inferRoomType(room.getName());
    if (roomType.contains("suite") || roomType.contains("villa") || 
        roomType.contains("premium") || roomType.contains("deluxe")) {
        vibes.add("luxury");
    }
    
    // Rule 5: Family friendly
    if (room.getMaxChildren() > 0) {
        vibes.add("family_friendly");
    }
    
    return vibes.isEmpty() ? List.of("standard") : vibes;
}
```

**Accuracy Estimation:** ~80-85%  
**Rationale:** Phụ thuộc vào accuracy của `inferRoomType()` và `hasRoomAmenity()`.

### 3.4. `buildRoomDescription(Room room, Hotel hotel)` Logic

```java
private String buildRoomDescription(Room room, Hotel hotel) {
    StringBuilder desc = new StringBuilder();
    
    // Title
    desc.append("**").append(room.getName()).append("**");
    
    // View description
    String view = room.getView();
    if (view != null && !view.trim().isEmpty()) {
        desc.append(" là hạng phòng");
        String viewLower = view.toLowerCase();
        if (viewLower.contains("ocean") || viewLower.contains("sea") || 
            viewLower.contains("bien") || viewLower.contains("biển")) {
            desc.append(" hướng biển");
        } else if (viewLower.contains("garden") || viewLower.contains("vuon") || 
                   viewLower.contains("vườn")) {
            desc.append(" hướng vườn");
        } else if (viewLower.contains("city") || viewLower.contains("thanh pho") ||
                   viewLower.contains("thành phố")) {
            desc.append(" hướng thành phố");
        }
    }
    
    desc.append(" tại ").append(hotel.getName());
    
    // Area
    if (room.getArea() > 0) {
        desc.append(", với diện tích ").append(room.getArea()).append("m²");
    }
    
    // Capacity
    if (room.getMaxAdults() > 0) {
        desc.append(", phù hợp cho tối đa ").append(room.getMaxAdults()).append(" người lớn");
        if (room.getMaxChildren() > 0) {
            desc.append(" và ").append(room.getMaxChildren()).append(" trẻ em");
        }
    }
    
    desc.append(".");
    
    return desc.toString();
}
```

**Quality Assessment:** ⚠️ **MEDIUM**  
**Rationale:** Template description đơn giản, không mô tả được cảm xúc hay trải nghiệm. Nhưng đủ để Knowledge Base hoạt động.

---

## 4. RISK ASSESSMENT & MITIGATION

### 4.1. Critical Risks

| Risk | Severity | Probability | Impact | Mitigation |
|:---|:---|:---|:---|:---|
| **Room.description missing** | 🔴 HIGH | 100% | Template-generated descriptions thiếu chi tiết, không hấp dẫn | **Accept:** Template string đủ cho MVP. **Future:** Thêm `Room.description` field vào DB nếu cần quality cao hơn. |
| **inferRoomType() accuracy** | ⚠️ MEDIUM | 15-20% | Một số phòng bị phân loại sai type | **Mitigation:**<br>1. Log các trường hợp không match để manual review<br>2. Có thể thêm `Room.roomType` enum field nếu accuracy < 90%<br>3. Tạo admin tool để manual override |
| **Amenity mapping incomplete** | ⚠️ MEDIUM | 10-15% | Amenity mới chưa có trong mapping table → fallback to snake_case | **Mitigation:**<br>1. Review mapping table định kỳ<br>2. Auto-log các amenity chưa có mapping<br>3. Batch update mapping table monthly |
| **PhotoCategory.name not standardized** | ⚠️ MEDIUM | 20-30% | Photo không phân biệt được main/gallery | **Mitigation:**<br>1. Standardize PhotoCategory names: "main", "gallery", "exterior", etc.<br>2. Fallback: Lấy ảnh đầu tiên làm main, còn lại là gallery<br>3. Data migration script để normalize existing data |

### 4.2. Medium Risks

| Risk | Severity | Probability | Impact | Mitigation |
|:---|:---|:---|:---|:---|
| **View field inconsistency** | 🟡 LOW | 30-40% | `Room.view` có thể là tiếng Việt hoặc English, format không nhất quán | **Mitigation:**<br>1. Normalize view values: "ocean view", "sea view", "city view"<br>2. Hoặc chấp nhận hiển thị tiếng Việt trực tiếp trong template |
| **Vibe tags too generic** | 🟡 LOW | N/A | Vibe tags được infer có thể không đủ chi tiết | **Accept:** Basic vibe tags đủ cho filtering. Có thể enhance sau. |
| **Keywords quality** | 🟡 LOW | N/A | Auto-generated keywords có thể không tối ưu SEO | **Accept:** Basic keywords đủ. SEO optimization là separate task. |

### 4.3. Low Risks

| Risk | Severity | Probability | Impact | Mitigation |
|:---|:---|:---|:---|:---|
| **Slug collision** | 🟢 VERY LOW | <1% | Hai phòng cùng tên → slug trùng | **Mitigation:**<br>`SlugService.generateSlug(roomName + " " + hotelName)` giảm thiểu collision |
| **Nullable fields** | 🟢 VERY LOW | 5-10% | Một số field nullable có thể gây NPE | **Mitigation:**<br>Null-safe checks trong code, default values trong template |

---

## 5. STATIC DATA MAPPING - RECOMMENDATIONS

### 5.1. Vietnamese → English Mapping Table

**Location:** `AmenityMappingService` (đã có sẵn)

**Cần bổ sung thêm các mappings:**

```java
// Room-specific amenities
"Bồn tắm nằm" → "bathtub"
"Bồn tắm Jacuzzi" → "jacuzzi"
"Vòi sen" → "shower"
"Ban công riêng" → "balcony"
"TV màn hình phẳng" → "tv"
"Smart TV" → "tv"
"Bluetooth speaker" → "bluetooth"
"Máy pha cà phê" → "coffee_maker"
"Minibar" → "minibar"
"Két sắt" → "safe_box"
"Rèm che sáng" → "blackout_curtains"
"Dịch vụ turn-down" → "turn_down_service"
```

### 5.2. Room Type Inference Keywords

**Tạo static map cho các keywords tiếng Việt:**

```java
private static final Map<String, String> ROOM_TYPE_KEYWORDS = Map.of(
    // Suite
    "tong thong", "suite",
    "presidential", "suite",
    "executive suite", "suite",
    "suite", "suite",
    
    // Villa
    "villa", "villa",
    "biet thu", "villa",
    
    // Deluxe
    "deluxe", "deluxe",
    "cao cap", "deluxe",
    "premium", "deluxe",
    "thuong hang", "deluxe",
    
    // Superior
    "superior", "superior",
    "hang trung", "superior"
);
```

---

## 6. DATABASE SCHEMA ENHANCEMENT PROPOSALS

### 6.1. Optional Enhancements (Not Critical for MVP)

| Enhancement | Priority | Rationale | Implementation |
|:---|:---|:---|:---|
| **Add `Room.description` field** | 🟡 **MEDIUM** | Nâng cao chất lượng content, nhưng template generation đủ cho MVP | `ALTER TABLE rooms ADD COLUMN description TEXT;` |
| **Add `Room.roomType` enum field** | 🟡 **LOW** | Nếu accuracy của inference < 90%, có thể thêm field này | `ALTER TABLE rooms ADD COLUMN room_type VARCHAR(20);` (standard|superior|deluxe|suite|villa) |
| **Add `Room.floorRange` field** | 🟢 **VERY LOW** | Optional field, chỉ cần nếu có yêu cầu chi tiết | `ALTER TABLE rooms ADD COLUMN floor_range VARCHAR(20);` (e.g., "5-12") |

### 6.2. Data Standardization Requirements

**CRITICAL:** Cần đảm bảo:

1. **PhotoCategory names standardized:**
   - Main photo: `"main"` hoặc `"Main"` hoặc `"Ảnh chính"`
   - Gallery: `"gallery"` hoặc bất kỳ tên khác
   
2. **Room.view values normalized:**
   - Recommend: Enum values hoặc validation
   - Acceptable: Free text (có thể hiển thị trực tiếp)

3. **Amenity names consistent:**
   - Đảm bảo không có duplicate với tên khác nhau (ví dụ: "WiFi" vs "Wi-Fi")
   - Nên có admin tool để merge/standardize amenities

---

## 7. FEASIBILITY CONCLUSION

### ✅ **FEASIBLE** - Có thể implement với các điều kiện sau:

1. **Accept template-generated descriptions** (không cần `Room.description` field)
2. **Implement robust inference logic** với fallback và logging
3. **Maintain comprehensive mapping tables** cho Vietnamese → English
4. **Handle edge cases** với null-safe checks và default values

### 📊 **Accuracy Estimations:**

- **Room Type Inference:** ~85-90% accuracy
- **Room Category Inference:** ~95% accuracy
- **Vibe Tags Inference:** ~80-85% accuracy
- **Amenity Mapping:** ~90-95% accuracy (với mapping table đầy đủ)

### 🎯 **Recommendation:**

**PROCEED với implementation**, nhưng:

1. **Phase 1 (MVP):** Sử dụng template-generated descriptions và inference logic
2. **Phase 2 (Enhancement):** 
   - Thêm `Room.description` field nếu cần content quality cao hơn
   - Tạo admin tool để manual override room_type nếu inference sai
   - Continuous monitoring và improvement mapping tables

---

## 8. IMPLEMENTATION PRIORITY

### Priority 1: Critical (Must Have)
- ✅ Amenity mapping service (đã có)
- ✅ Room type inference logic
- ✅ Room description template generation
- ✅ Photo main/gallery extraction logic

### Priority 2: Important (Should Have)
- ⚠️ Logging system để track inference accuracy
- ⚠️ Fallback values cho nullable fields
- ⚠️ Vibe tags inference

### Priority 3: Nice to Have
- 🟡 Admin tool để manual override
- 🟡 Analytics dashboard để track mapping gaps
- 🟡 Auto-update mapping tables từ logs

---

**Kết luận:** Hệ thống hiện tại **CÓ ĐỦ DỮ LIỆU** để sinh Markdown files với độ chính xác ~85-90%. Các gaps đã được identify và có giải pháp cụ thể. Implementation có thể bắt đầu ngay với Phase 1 (MVP).

