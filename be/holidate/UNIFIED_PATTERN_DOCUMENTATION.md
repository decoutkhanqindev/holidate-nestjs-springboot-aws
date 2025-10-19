# Unified Pattern for getAll\_\_\_ Methods

## Mô tả

Đã chuẩn hóa tất cả các methods `getAll___` trong các service theo một pattern thống nhất dựa trên `HotelService.getAll()` để đảm bảo tính nhất quán và dễ hiểu.

## 🎯 **Unified Pattern Structure**

### **9-Step Standard Flow:**

```java
public ResponseType getAllXxx(parameters...) {
  // Step 1: Clean up page and size values (if applicable)
  page = Math.max(0, page);
  size = Math.min(Math.max(1, size), 100);

  // Step 2: Check if sort direction is valid
  boolean hasSortDir = sortDir != null && !sortDir.isEmpty()
    && (PaginationParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir) ||
    PaginationParams.SORT_DIR_DESC.equalsIgnoreCase(sortDir));
  if (!hasSortDir) {
    sortDir = PaginationParams.SORT_DIR_[DEFAULT];
  }

  // Step 3: Check if sort field is valid
  boolean hasSortBy = sortBy != null && !sortBy.isEmpty()
    && (ValidSortFields.contains(sortBy));
  if (!hasSortBy) {
    sortBy = null;
  }

  // Step 4: Check what filters are provided
  boolean hasFilter1 = filter1 != null && !filter1.isEmpty();
  boolean hasFilter2 = filter2 != null;
  // ... other filters

  // Step 5: Determine if any filter is applied
  boolean hasAnyFilter = hasFilter1 || hasFilter2 || ...;

  // Step 6: Get data based on filters
  List<Entity> entities;
  if (hasAnyFilter) {
    entities = getAllEntitiesWithFilters(filters...);
  } else {
    entities = getAllEntitiesWithoutFilters(basicParams...);
  }

  // Step 7: Convert entities to response DTOs
  List<ResponseDTO> responses = entities.stream()
    .map(mapper::toResponse)
    .collect(Collectors.toList());

  // Step 8: Apply sorting if sort field is specified
  if (sortBy != null) {
    responses = applySorting(responses, sortBy, sortDir);
  }

  // Step 9: Apply pagination and return response (if applicable)
  return applyPagination(responses, page, size); // or return responses directly
}
```

### **Helper Methods Pattern:**

```java
// Get all entities when no filters applied
private List<Entity> getAllEntitiesWithoutFilters(basicParams...) {
  return repository.findAllWithDetails(basicParams...);
}

// Handle filtering logic when filters are provided
private List<Entity> getAllEntitiesWithFilters(allParams...) {
  return repository.findAllWithFilters(allParams...);
}

// Apply sorting to responses
private List<ResponseDTO> applySorting(List<ResponseDTO> responses, String sortBy, String sortDir) {
  // Unified sorting logic using Comparator
}

// Apply pagination (if applicable)
private PagedResponse<ResponseDTO> applyPagination(List<ResponseDTO> responses, int page, int size) {
  // Unified pagination logic
}
```

## 📊 **Implementation Comparison**

### 1. **HotelService.getAll()** ✅ **[REFERENCE STANDARD]**

```java
public PagedResponse<HotelResponse> getAll(
  // Location filters
  String countryId, String provinceId, String cityId, String districtId, String wardId, String streetId,
  // Business filters
  List<String> amenityIds, Integer starRating, String status,
  // Date and guest filters
  LocalDate checkinDate, LocalDate checkoutDate, Integer requiredAdults, Integer requiredChildren, Integer requiredRooms,
  // Price filters
  Double minPrice, Double maxPrice,
  // Pagination
  int page, int size, String sortBy, String sortDir
)

// ✅ Full 9-step pattern implementation
// ✅ Complex filtering logic with database optimization
// ✅ PagedResponse return type
// ✅ Multiple filter categories
```

### 2. **RoomService.getAllByHotelId()** ✅ **[STANDARDIZED]**

```java
public List<RoomResponse> getAllByHotelId(
  String hotelId, String status, String sortBy, String sortDir
)

// ✅ Follows 9-step pattern (simplified for List return type)
// ✅ Helper methods: getAllRoomsWithoutFilters(), getAllRoomsWithFilters()
// ✅ Single filter category (status)
// ✅ Consistent step-by-step comments
```

### 3. **RoomInventoryService.getAllByRoomIdForDateBetween()** ✅ **[STANDARDIZED]**

```java
public PagedResponse<RoomInventoryResponse> getAllByRoomIdForDateBetween(
  String roomId, LocalDate startDate, LocalDate endDate, String status,
  int page, int size, String sortBy, String sortDir
)

// ✅ Follows full 9-step pattern
// ✅ Helper methods: getAllInventoriesWithoutFilters(), getAllInventoriesWithFilters()
// ✅ PagedResponse return type
// ✅ Date range + status filtering
// ✅ Consistent step-by-step comments
```

## 🔧 **Key Standardization Features**

### **1. Consistent Step Numbering**

- Mỗi step được đánh số và comment rõ ràng
- Logic flow giống nhau cho tất cả services

### **2. Unified Validation Logic**

```java
// Sort direction validation - IDENTICAL across all services
boolean hasSortDir = sortDir != null && !sortDir.isEmpty()
  && (PaginationParams.SORT_DIR_ASC.equalsIgnoreCase(sortDir) ||
  PaginationParams.SORT_DIR_DESC.equalsIgnoreCase(sortDir));

// Sort field validation - SIMILAR pattern, different constants
boolean hasSortBy = sortBy != null && !sortBy.isEmpty()
  && (ServiceParams.VALID_SORT_FIELDS.contains(sortBy));
```

### **3. Standardized Helper Methods**

- `getAllXxxWithoutFilters()` - No filter case
- `getAllXxxWithFilters()` - Filter applied case
- `applySorting()` - In-memory sorting
- `applyPagination()` - Pagination logic (where applicable)

### **4. Filter Detection Pattern**

```java
// Step 4: Check what filters are provided
boolean hasFilter1 = filter1 != null && !filter1.isEmpty();
boolean hasFilter2 = filter2 != null;

// Step 5: Determine if any filter is applied
boolean hasAnyFilter = hasFilter1 || hasFilter2;
```

### **5. Consistent Data Flow**

```
Parameters → Validation → Filter Detection → Data Fetching →
DTO Conversion → Sorting → Pagination → Response
```

## 🎨 **Benefits of Unified Pattern**

### **1. Readability & Maintainability**

- Cùng một structure cho tất cả getAll methods
- Dễ dàng hiểu và modify
- Code review nhanh hơn

### **2. Performance Consistency**

- Database filtering trước, in-memory sorting sau
- Pagination cuối cùng để optimize memory

### **3. Debugging & Testing**

- Cùng flow logic = cùng cách debug
- Test cases có thể follow cùng pattern

### **4. Extension Flexibility**

- Thêm filter mới chỉ cần modify Step 4 & 5
- Thêm sort field chỉ cần modify Step 3
- Pattern không thay đổi

## 📝 **Usage Examples**

### **Hotel Search:**

```
GET /accommodation/hotels?status=active&starRating=5&sort-by=price&sort-dir=desc&page=0&size=10
```

### **Room Search:**

```
GET /accommodation/rooms?hotel-id=123&status=active&sort-by=price&sort-dir=asc
```

### **Room Inventory Search:**

```
GET /accommodation/rooms/inventories?room-id=456&start-date=2024-01-01&end-date=2024-01-07&status=available&sort-by=date&sort-dir=asc&page=0&size=20
```

## 🔄 **Pattern Compliance Checklist**

✅ **Step 1:** Page/Size validation (if applicable)  
✅ **Step 2:** Sort direction validation  
✅ **Step 3:** Sort field validation  
✅ **Step 4:** Filter detection  
✅ **Step 5:** hasAnyFilter logic  
✅ **Step 6:** Data fetching with filter branching  
✅ **Step 7:** Entity → DTO conversion  
✅ **Step 8:** Conditional sorting  
✅ **Step 9:** Pagination/Response return

✅ **Helper Methods:** Separated filter vs no-filter logic  
✅ **Comments:** Clear step-by-step documentation  
✅ **Constants:** Use parameter constants instead of hardcoded strings  
✅ **Null Safety:** Proper null checks for optional parameters

---

**Tất cả các services giờ đây đều tuân theo cùng một pattern thống nhất, dễ hiểu và maintain!** 🎉
