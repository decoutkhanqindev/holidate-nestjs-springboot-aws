# TODO LIST - FIX TEMPLATE IMPLEMENTATION ISSUES

## Tổng Quan
Danh sách các vấn đề cần fix để đảm bảo kết quả từ S3 đúng với template specification.

---

## 🔴 PRIORITY 1: CRITICAL FIXES

### Fix 1: Price Analytics Empty
**File**: `src/main/java/com/webapp/holidate/service/knowledgebase/KnowledgeBaseUploadService.java`  
**Method**: `buildRoomTemplateContext()`  
**Vấn đề**: `priceAnalytics` có trong DTO nhưng không được map vào context  
**Cần làm**:
- [ ] Thêm code map `dto.getPriceAnalytics()` vào context với key `priceAnalytics`
- [ ] Map các fields: `minPriceNext30Days`, `maxPriceNext30Days`, `avgPriceNext30Days`, `priceVolatility`, `weekendPriceMultiplier`
- [ ] Map các boolean flags: `isHighVolatility`, `isMediumVolatility`, `isLowVolatility`
- [ ] Test với room có inventory calendar data

**Code location**: Sau line 864 (sau pricing map), trước line 866

---

### Fix 2: Room Policies Detail Empty
**File**: `src/main/java/com/webapp/holidate/service/knowledgebase/KnowledgeBaseUploadService.java`  
**Method**: `buildRoomTemplateContext()`  
**Vấn đề**: `roomPolicies` (PolicyDetailDto) và `policiesInherited` không được map vào context  
**Cần làm**:
- [ ] Map `dto.getRoomPolicies()` vào context với key `roomPolicies`
- [ ] Map `dto.getPoliciesInherited()` vào context với key `policiesInherited`
- [ ] Build nested structure cho `cancellationPolicy` và `reschedulePolicy` với rules
- [ ] Đảm bảo format đúng với template: `room_policies_detail.policies_inherited`, `room_policies_detail.roomPolicies.checkInTime`, etc.

**Code location**: Sau line 892 (sau room_policies map), trước line 894

---

### Fix 3: Bed Configuration Display Issue
**File**: `src/main/java/com/webapp/holidate/service/knowledgebase/KnowledgeBaseUploadService.java`  
**Method**: `buildRoomTemplateContext()`  
**Vấn đề**: Template sử dụng `{{specs.bed_configuration.0.count}}` nhưng có thể không có data  
**Cần làm**:
- [ ] Kiểm tra `specs.bed_configuration` có được populate đúng không (đã có ở line 824-836)
- [ ] Đảm bảo `bed_configuration` list không empty trước khi template access `.0`
- [ ] Thêm fallback nếu `bed_configuration` empty: hiển thị từ `bed_type` field
- [ ] Test với room có và không có bed_configuration

**Code location**: Line 824-836 (specs.bed_configuration mapping)

---

### Fix 4: Inventory Calendar 7 Days Empty
**File**: `src/main/java/com/webapp/holidate/service/knowledgebase/KnowledgeBaseUploadService.java`  
**Method**: `buildRoomTemplateContext()`  
**Vấn đề**: Template sử dụng `{{#limit_7}}` nhưng context không có logic này  
**Cần làm**:
- [ ] Tạo 2 lists riêng: `inventoryCalendar` (30 ngày) và `inventoryCalendar7Days` (7 ngày đầu)
- [ ] Map `inventoryCalendar7Days` vào context với key phù hợp
- [ ] Hoặc thêm flag `limit_7` vào mỗi item trong list (7 items đầu tiên)
- [ ] Update template nếu cần để sử dụng list riêng cho bảng 7 ngày

**Code location**: Line 895-920 (inventory calendar mapping)

**Note**: Hiện tại code có `.limit(7)` nhưng template cần logic `{{#limit_7}}` - cần thêm helper hoặc tách list

---

## 🟡 PRIORITY 2: DATA POPULATION FIXES

### Fix 5: Entertainment Venues Empty
**File**: `src/main/java/com/webapp/holidate/service/knowledgebase/KnowledgeBaseGenerationService.java`  
**Method**: `buildRoomKB()` hoặc helper method  
**Vấn đề**: `nearbyEntertainment` và `entertainment_venues` empty trong result  
**Cần làm**:
- [ ] Kiểm tra endpoint `/location/entertainment-venues/city/{cityId}` có được gọi không
- [ ] Kiểm tra `KnowledgeBaseDataService.fetchEntertainmentVenuesByCity()` có được gọi không
- [ ] Đảm bảo data được map vào DTO: `dto.setNearbyEntertainment(...)`
- [ ] Kiểm tra logic tính distance và filter venues (5km max)

**Code location**: `KnowledgeBaseGenerationService.buildRoomKB()` - tìm nơi gọi entertainment venues service

---

### Fix 6: Amenity Tags Empty
**File**: `src/main/java/com/webapp/holidate/service/knowledgebase/KnowledgeBaseGenerationService.java`  
**Method**: `buildHotelKB()` hoặc `buildRoomKB()`  
**Vấn đề**: `amenity_tags` empty trong hotel profile result  
**Cần làm**:
- [ ] Kiểm tra `AmenityMappingService.mapAmenitiesToEnglish()` có được gọi không
- [ ] Kiểm tra hotel có amenities trong database không
- [ ] Đảm bảo mapping từ Vietnamese sang English hoạt động đúng
- [ ] Log để debug nếu amenities không được map

**Code location**: `KnowledgeBaseGenerationService.buildHotelKB()` - tìm nơi map amenities

---

### Fix 7: Coordinates = 0.0
**File**: `src/main/java/com/webapp/holidate/service/knowledgebase/KnowledgeBaseGenerationService.java`  
**Method**: `buildHotelKB()` hoặc `buildLocationHierarchy()`  
**Vấn đề**: `coordinates.lat` và `coordinates.lng` = 0.0 trong result  
**Cần làm**:
- [ ] Kiểm tra data từ API: `hotel.getLatitude()`, `hotel.getLongitude()` có null/0 không
- [ ] Thêm validation: nếu coordinates = 0.0 hoặc null, không hiển thị hoặc hiển thị "N/A"
- [ ] Hoặc tính coordinates từ address nếu có (geocoding - optional)
- [ ] Update template để handle null coordinates gracefully

**Code location**: `KnowledgeBaseGenerationService.buildLocationHierarchy()` hoặc `buildHotelKB()`

---

## 🟢 PRIORITY 3: TEMPLATE SYNCHRONIZATION

### Fix 8: Sync Templates Between Folders
**File**: N/A (Manual sync hoặc script)  
**Vấn đề**: 2 thư mục templates có thể không đồng bộ  
**Cần làm**:
- [ ] Quyết định: chỉ giữ 1 thư mục (`src/main/resources/templates/`) hoặc tự động sync
- [ ] Nếu giữ 2 thư mục: tạo script hoặc documentation để đảm bảo đồng bộ
- [ ] Update README để giải thích cấu trúc thư mục templates

---

## 📋 TESTING CHECKLIST

Sau khi fix tất cả issues, cần test:

- [ ] Test API sync full KB: `POST /admin/kb/sync/full`
- [ ] Download file từ S3 và đối chiếu với template
- [ ] Kiểm tra YAML frontmatter: tất cả fields đã có data
- [ ] Kiểm tra Price Analytics: có min/max/avg/volatility/weekend multiplier
- [ ] Kiểm tra Room Policies Detail: có policiesInherited, cancellation/reschedule rules
- [ ] Kiểm tra Bed Configuration: hiển thị đúng count và type
- [ ] Kiểm tra Inventory Calendar 7 Days: bảng có 7 rows
- [ ] Kiểm tra Entertainment Venues: có data nếu hotel có venues nearby
- [ ] Kiểm tra Amenity Tags: có tags nếu hotel có amenities
- [ ] Kiểm tra Coordinates: không hiển thị 0.0 nếu không có data

---

## 📝 NOTES

1. **Price Analytics**: Method `calculatePriceAnalytics()` đã có trong `KnowledgeBaseDataService`, chỉ cần map vào context
2. **Room Policies**: `PolicyDetailDto` đã có trong DTO, chỉ cần map vào context với format đúng
3. **Bed Configuration**: Code đã có ở line 824-836, có thể chỉ cần fix format hoặc thêm fallback
4. **Inventory Calendar 7 Days**: Có thể cần tách thành 2 lists hoặc thêm helper method
5. **Entertainment Venues**: Cần kiểm tra service call và data mapping
6. **Amenity Tags**: Cần kiểm tra mapping service và data flow

---

**Ngày tạo**: 2025-11-29  
**Status**: Ready to start fixing

