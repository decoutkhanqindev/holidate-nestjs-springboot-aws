# API Enhancement - Room Controller Status Filter and Sorting

## Mô tả

Đã thành công refactor method `getAllByHotelId` trong `RoomController` và `RoomService` để hỗ trợ:

- **Filter theo status** (sử dụng `AccommodationStatusType`)
- **Sorting theo price và name**

## Thay đổi đã thực hiện

### 1. Cập nhật RoomParams.java

- Thêm constants `SORT_BY_PRICE = "price"` và `SORT_BY_NAME = "name"`

### 2. Cập nhật RoomController.java

- Thêm import `CommonParams` và `PaginationParams`
- Thêm parameters vào method `getAllByHotelId`:
  - `@RequestParam(name = CommonParams.STATUS, required = false) String status`
  - `@RequestParam(name = PaginationParams.SORT_BY, required = false) String sortBy`
  - `@RequestParam(name = PaginationParams.SORT_DIR, defaultValue = PaginationParams.SORT_DIR_ASC) String sortDir`

### 3. Cập nhật RoomQueries.java

- Thêm query `FIND_ALL_BY_HOTEL_ID_WITH_FILTERS` với điều kiện status filter

### 4. Cập nhật RoomRepository.java

- Thêm method `findAllByHotelIdWithFilters(String hotelId, @Nullable String status)`

### 5. Refactor RoomService.java

- Cập nhật method `getAllByHotelId` để hỗ trợ filtering và sorting
- Thêm method helper `applySorting` để xử lý sorting logic
- Sử dụng constants thay vì hardcoded strings
- Thêm validation cho sort direction và sort field

## API Usage

### Endpoint

```
GET /accommodation/rooms/hotel
```

### Parameters

#### Bắt buộc:

- `hotel-id`: ID của hotel cần lấy rooms

#### Tùy chọn:

- `status`: Filter theo status (từ AccommodationStatusType)

  - `active` - Room đang hoạt động
  - `inactive` - Room tạm ngừng hoạt động
  - `maintenance` - Room đang bảo trì
  - `closed` - Room đã đóng cửa

- `sort-by`: Trường để sort

  - `price` - Sort theo base price per night
  - `name` - Sort theo tên room

- `sort-dir`: Hướng sort (mặc định: `asc`)
  - `asc` - Tăng dần
  - `desc` - Giảm dần

### Ví dụ sử dụng

1. **Lấy tất cả rooms của hotel:**

```
GET /accommodation/rooms/hotel?hotel-id=hotel123
```

2. **Lấy rooms đang hoạt động, sort theo price tăng dần:**

```
GET /accommodation/rooms/hotel?hotel-id=hotel123&status=active&sort-by=price&sort-dir=asc
```

3. **Lấy rooms đang bảo trì, sort theo name giảm dần:**

```
GET /accommodation/rooms/hotel?hotel-id=hotel123&status=maintenance&sort-by=name&sort-dir=desc
```

4. **Chỉ filter theo status:**

```
GET /accommodation/rooms/hotel?hotel-id=hotel123&status=active
```

5. **Chỉ sort theo price:**

```
GET /accommodation/rooms/hotel?hotel-id=hotel123&sort-by=price&sort-dir=desc
```

## Logic Implementation

### Filtering Logic

- Nếu `status` parameter được cung cấp → sử dụng `findAllByHotelIdWithFilters`
- Nếu không có `status` → sử dụng `findAllByHotelIdWithDetails` (trả về tất cả)

### Sorting Logic

- Validate `sort-dir`: phải là `asc` hoặc `desc`, mặc định `asc`
- Validate `sort-by`: phải là `price` hoặc `name`
- Áp dụng sorting sau khi convert entity sang response DTO
- Sử dụng `Comparator.nullsLast()` để xử lý null values

### Pattern Integration

- Follow pattern của `HotelService.getAll()` method
- Sử dụng constants thay vì hardcoded strings
- Proper validation và error handling
- Clean separation of concerns

## Lưu ý kỹ thuật

- Method này không có pagination (khác với HotelService)
- Sorting được thực hiện in-memory sau khi query database
- Status filter được thực hiện ở database level để tối ưu performance
- Tương thích với existing client code (backward compatible)
