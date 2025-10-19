# API Update - Room Inventory Status Filter & Sorting

## Mô tả

Đã thành công thêm filter theo `status` và bỏ sort by status cho API `GET /accommodation/rooms/inventories`

## Thay đổi đã thực hiện

### 1. Cập nhật RoomInventoryController.java

- Thêm import `CommonParams`
- Thêm parameter `@RequestParam(value = CommonParams.STATUS, required = false) String status`

### 2. Cập nhật RoomInventoryQueries.java

- Thêm query mới `FIND_ALL_BY_ROOM_ID_AND_DATE_BETWEEN_WITH_FILTERS` với điều kiện status filter

```sql
"AND (:status IS NULL OR ri.status = :status)"
```

### 3. Cập nhật RoomInventoryRepository.java

- Thêm method `findAllByRoomIdAndDateBetweenWithFilters` với parameter `@Nullable String status`

### 4. Cập nhật RoomInventoryService.java

- Thêm parameter `String status` vào method `getAllByRoomIdForDateBetween`
- Thêm logic kiểm tra `hasStatusFilter`
- Sử dụng repository method phù hợp dựa trên việc có filter hay không
- **Bỏ `RoomInventoryParams.SORT_BY_STATUS` khỏi danh sách sorting options**
- Cập nhật method `applySorting` để không còn hỗ trợ sort by status

## API Usage

### Endpoint

```
GET /accommodation/rooms/inventories
```

### Các giá trị status hợp lệ (từ RoomInventoryStatusType)

- `available` - Inventory có sẵn để đặt
- `unavailable` - Inventory không có sẵn
- `maintenance` - Inventory đang bảo trì
- `booked` - Inventory đã được đặt

### Các tùy chọn sorting hợp lệ (sau khi bỏ status)

- `date` - Sort theo ngày
- `price` - Sort theo giá
- `available-rooms` - Sort theo số phòng có sẵn

### Ví dụ sử dụng

1. **Lấy tất cả inventory có sẵn:**

```
GET /accommodation/rooms/inventories?room-id=123&start-date=2024-01-01&end-date=2024-01-07&status=available
```

2. **Lấy inventory đang bảo trì, sort theo giá giảm dần:**

```
GET /accommodation/rooms/inventories?room-id=123&start-date=2024-01-01&end-date=2024-01-07&status=maintenance&sort-by=price&sort-dir=desc
```

3. **Lấy inventory đã được đặt, sort theo số phòng có sẵn:**

```
GET /accommodation/rooms/inventories?room-id=123&start-date=2024-01-01&end-date=2024-01-07&status=booked&sort-by=available-rooms&sort-dir=asc
```

4. **Không filter status, sort theo ngày:**

```
GET /accommodation/rooms/inventories?room-id=123&start-date=2024-01-01&end-date=2024-01-07&sort-by=date
```

## Kiến trúc và Pattern

### 🎯 **Pattern tuân theo:**

- **HotelService.getAll()** - Logic filtering ở database level
- **RoomService.getAllByHotelId()** - Cách validate parameters và apply filters

### 🔄 **Flow xử lý:**

1. **Validation** - Kiểm tra parameters (page, size, sortBy, sortDir)
2. **Filtering** - Sử dụng query với status filter nếu có
3. **Sorting** - Apply sorting in-memory sau khi fetch data
4. **Pagination** - Apply pagination cuối cùng

### 🚀 **Cải tiến:**

- **Performance** - Status filter ở database level thay vì in-memory
- **Consistency** - Tuân theo cùng pattern với HotelService và RoomService
- **Type Safety** - Sử dụng enum constants thay vì hardcoded strings
- **Maintainability** - Logic rõ ràng, dễ mở rộng

### ⚠️ **Breaking Changes:**

- **Removed**: `sort-by=status` option (không còn hỗ trợ)
- **Reason**: Status được dùng làm filter thay vì sorting field

## Lưu ý

- Parameter `status` là optional (nullable)
- Nếu không truyền `status`, sẽ trả về tất cả inventory bất kể status
- Status value phải chính xác theo định nghĩa trong enum `RoomInventoryStatusType`
- Không thể sort theo status nữa, thay vào đó sử dụng status filter
- Filter hoạt động kết hợp với date range và các sorting options khác
