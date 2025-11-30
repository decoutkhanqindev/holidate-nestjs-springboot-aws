# 📋 USE CASE: LỌC VÀ LẤY DANH SÁCH ĐÁNH GIÁ

## 🎯 TỔNG QUAN

API hỗ trợ **5 tiêu chí lọc** chính và **2 cách sắp xếp**:

---

## 🔍 CÁC TIÊU CHÍ LỌC (FILTER)

### 1. **Lọc theo Khách sạn** (hotelId)
- **Mô tả**: Lấy tất cả đánh giá của một khách sạn cụ thể
- **Kiểu dữ liệu**: `string` (UUID)
- **Bắt buộc**: Không (optional)
- **Ví dụ**: `hotelId=123e4567-e89b-12d3-a456-426614174000`
- **Hiện tại đang dùng**: ✅ CÓ (trong HotelDetailPageClient)

### 2. **Lọc theo Người dùng** (userId)
- **Mô tả**: Lấy tất cả đánh giá của một user cụ thể
- **Kiểu dữ liệu**: `string` (UUID)
- **Bắt buộc**: Không (optional)
- **Ví dụ**: `userId=123e4567-e89b-12d3-a456-426614174001`
- **Hiện tại đang dùng**: ❌ KHÔNG

### 3. **Lọc theo Booking** (bookingId)
- **Mô tả**: Lấy đánh giá của một booking cụ thể
- **Kiểu dữ liệu**: `string` (UUID)
- **Bắt buộc**: Không (optional)
- **Ví dụ**: `bookingId=123e4567-e89b-12d3-a456-426614174002`
- **Hiện tại đang dùng**: ❌ KHÔNG

### 4. **Lọc theo Điểm tối thiểu** (minScore) ⭐
- **Mô tả**: Chỉ lấy đánh giá có điểm >= minScore
- **Kiểu dữ liệu**: `integer` (1-10)
- **Bắt buộc**: Không (optional)
- **Ví dụ**: 
  - `minScore=8` → Lấy đánh giá từ 8-10 sao
  - `minScore=5` → Lấy đánh giá từ 5-10 sao
- **Hiện tại đang dùng**: ❌ KHÔNG

### 5. **Lọc theo Điểm tối đa** (maxScore) ⭐
- **Mô tả**: Chỉ lấy đánh giá có điểm <= maxScore
- **Kiểu dữ liệu**: `integer` (1-10)
- **Bắt buộc**: Không (optional)
- **Ví dụ**: 
  - `maxScore=3` → Lấy đánh giá từ 1-3 sao
  - `maxScore=7` → Lấy đánh giá từ 1-7 sao
- **Hiện tại đang dùng**: ❌ KHÔNG

### 6. **Kết hợp minScore và maxScore** ⭐⭐
- **Mô tả**: Lọc đánh giá trong khoảng điểm cụ thể
- **Ví dụ**: 
  - `minScore=8&maxScore=10` → Chỉ lấy đánh giá 8-10 sao (tốt)
  - `minScore=1&maxScore=3` → Chỉ lấy đánh giá 1-3 sao (kém)
  - `minScore=5&maxScore=7` → Chỉ lấy đánh giá 5-7 sao (trung bình)

---

## 📊 SẮP XẾP (SORT)

### 1. **Sắp xếp theo Ngày tạo** (createdAt)
- **Mô tả**: Sắp xếp theo thời gian tạo đánh giá
- **Giá trị**: `"createdAt"`
- **Mặc định**: ✅ CÓ (đang dùng)
- **Hướng**: 
  - `DESC` → Mới nhất trước (đang dùng)
  - `ASC` → Cũ nhất trước

### 2. **Sắp xếp theo Điểm** (score)
- **Mô tả**: Sắp xếp theo điểm đánh giá
- **Giá trị**: `"score"`
- **Mặc định**: ❌ KHÔNG
- **Hướng**: 
  - `DESC` → Điểm cao nhất trước
  - `ASC` → Điểm thấp nhất trước

---

## 📄 PHÂN TRANG (PAGINATION)

- **page**: Số trang (bắt đầu từ 0)
- **size**: Số lượng đánh giá mỗi trang (mặc định: 10, tối đa: 100)

---

## 🔄 LUỒNG HIỆN TẠI TRONG CODE

### Trang Chi tiết Khách sạn (`HotelDetailPageClient.tsx`)

```typescript
// Chỉ lọc theo hotelId, sắp xếp theo createdAt DESC
const params: GetReviewsParams = {
    hotelId: hotelIdStr,        // ✅ Lấy từ URL params
    page: 0,                    // ✅ Trang đầu tiên
    size: 10,                   // ✅ 10 đánh giá mỗi trang
    sortBy: 'createdAt',        // ✅ Sắp xếp theo ngày
    sortDir: 'DESC',            // ✅ Mới nhất trước
    // ❌ KHÔNG có minScore
    // ❌ KHÔNG có maxScore
    // ❌ KHÔNG có userId
    // ❌ KHÔNG có bookingId
};
```

### API Request
```
GET /reviews?hotelId=xxx&page=0&size=10&sortBy=createdAt&sortDir=DESC
```

### Database Query
```sql
SELECT DISTINCT r FROM Review r
LEFT JOIN FETCH r.user u
LEFT JOIN FETCH r.hotel h
LEFT JOIN FETCH r.booking b
LEFT JOIN FETCH r.photos rp
WHERE r.hotel.id = :hotelId
ORDER BY r.createdAt DESC
```

---

## 💡 USE CASE CÓ THỂ THÊM

### Use Case 1: Lọc đánh giá theo số sao
**Mô tả**: User muốn xem chỉ đánh giá tốt (8-10 sao) hoặc chỉ đánh giá kém (1-3 sao)

**API Call**:
```
GET /reviews?hotelId=xxx&minScore=8&maxScore=10&sortBy=createdAt&sortDir=DESC
```

**UI Component cần thêm**:
- Dropdown hoặc buttons để chọn:
  - "Tất cả" (không filter)
  - "Tốt (8-10 sao)"
  - "Trung bình (5-7 sao)"
  - "Kém (1-4 sao)"

### Use Case 2: Sắp xếp theo điểm
**Mô tả**: User muốn xem đánh giá điểm cao nhất trước

**API Call**:
```
GET /reviews?hotelId=xxx&sortBy=score&sortDir=DESC
```

**UI Component cần thêm**:
- Dropdown sắp xếp:
  - "Mới nhất"
  - "Điểm cao nhất"
  - "Điểm thấp nhất"

### Use Case 3: Xem đánh giá của user
**Mô tả**: User muốn xem lịch sử đánh giá của mình

**API Call**:
```
GET /reviews?userId=xxx&sortBy=createdAt&sortDir=DESC
```

### Use Case 4: Xem đánh giá của booking
**Mô tả**: Xem đánh giá cụ thể của một booking

**API Call**:
```
GET /reviews?bookingId=xxx
```

---

## 📝 TÓM TẮT

### Hiện tại đang dùng:
- ✅ **Lọc theo**: `hotelId`
- ✅ **Sắp xếp theo**: `createdAt DESC`
- ✅ **Phân trang**: `page=0, size=10`

### Chưa dùng nhưng API hỗ trợ:
- ❌ **Lọc theo số sao**: `minScore`, `maxScore`
- ❌ **Lọc theo user**: `userId`
- ❌ **Lọc theo booking**: `bookingId`
- ❌ **Sắp xếp theo điểm**: `sortBy=score`

### Đề xuất thêm vào UI:
1. **Filter theo số sao** (dropdown/buttons)
2. **Sort by** (dropdown: Mới nhất / Điểm cao nhất / Điểm thấp nhất)
3. **Stats đánh giá** (hiển thị: Tổng số đánh giá, Điểm trung bình, Phân bố điểm)

---

## 🎨 VÍ DỤ UI FILTER

```
┌─────────────────────────────────────────┐
│ Đánh giá từ khách hàng                  │
├─────────────────────────────────────────┤
│ [Tất cả] [8-10 sao] [5-7 sao] [1-4 sao]│ ← Filter buttons
│ Sắp xếp: [Mới nhất ▼]                   │ ← Sort dropdown
├─────────────────────────────────────────┤
│ ⭐⭐⭐⭐⭐ (10/10) - Nguyễn Văn A         │
│ Rất tốt, phòng sạch sẽ...               │
│ ─────────────────────────────────────── │
│ ⭐⭐⭐⭐⭐ (9/10) - Trần Thị B            │
│ Khách sạn đẹp, view đẹp...              │
└─────────────────────────────────────────┘
```

---

## 🔗 API ENDPOINT

```
GET /reviews
```

**Query Parameters**:
- `hotelId` (optional): Lọc theo khách sạn
- `userId` (optional): Lọc theo user
- `bookingId` (optional): Lọc theo booking
- `minScore` (optional): Điểm tối thiểu (1-10)
- `maxScore` (optional): Điểm tối đa (1-10)
- `page` (optional, default: 0): Số trang
- `size` (optional, default: 10): Số lượng mỗi trang
- `sortBy` (optional, default: "createdAt"): Sắp xếp theo ("createdAt" hoặc "score")
- `sortDir` (optional, default: "DESC"): Hướng sắp xếp ("ASC" hoặc "DESC")

---

## 📊 RESPONSE STRUCTURE

```json
{
  "statusCode": 200,
  "message": "",
  "data": {
    "content": [
      {
        "id": "string",
        "user": {
          "id": "string",
          "fullName": "string",
          "avatarUrl": "string"
        },
        "score": 10,
        "comment": "string",
        "photos": [
          {
            "id": "string",
            "url": "string",
            "category": "string"
          }
        ],
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 50,
    "totalPages": 5,
    "first": true,
    "last": false,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

**Tóm lại**: Hiện tại chỉ lọc theo `hotelId`, nhưng API hỗ trợ đầy đủ filter theo số sao (`minScore`, `maxScore`), user, booking và sort theo điểm. Có thể thêm UI để user filter và sort theo nhu cầu.



































