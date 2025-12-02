# 🔄 Cơ chế Tự động Fallback: Production → Local

## 🎯 Mục đích

Khi FE local đang gọi backend production (`https://api.holidate.site`), nếu backend production bị lỗi/hư/bảo trì, hệ thống sẽ **tự động chuyển sang** backend local (`http://localhost:8080`) để tiếp tục hoạt động.

## ⚡ Cách hoạt động

### 1. Khi Production API hoạt động bình thường

- FE gọi API đến `https://api.holidate.site`
- Request thành công → Trả về data bình thường

### 2. Khi Production API bị lỗi

Hệ thống tự động phát hiện các lỗi sau:
- ❌ Network error (không kết nối được)
- ❌ Timeout (quá thời gian chờ)
- ❌ Server error (500, 502, 503, 504)

**Tự động thực hiện:**
1. ⚠️ Log cảnh báo: "Production API lỗi, tự động fallback sang Local API"
2. 🔄 Tự động retry request với Local API (`http://localhost:8080`)
3. 💾 Lưu trạng thái "production down" vào localStorage
4. ✅ Nếu Local API thành công → Trả về data từ Local

### 3. Sau khi fallback

- Tất cả các request tiếp theo sẽ tự động dùng Local API
- Sau **5 phút**, hệ thống sẽ tự động thử lại Production API
- Nếu Production hoạt động lại → Tự động chuyển về Production

## 📋 Ví dụ

### Scenario 1: Production bị lỗi network

```
1. User gọi API: GET /location/cities
2. Request đến: https://api.holidate.site/location/cities
3. ❌ Lỗi: Network Error (không kết nối được)
4. ⚠️ Hệ thống phát hiện lỗi
5. 🔄 Tự động retry: http://localhost:8080/location/cities
6. ✅ Thành công với Local API
7. 💾 Lưu trạng thái: "production down"
8. ✅ Trả về data cho user
```

### Scenario 2: Production bị timeout

```
1. User gọi API: POST /auth/login
2. Request đến: https://api.holidate.site/auth/login
3. ❌ Lỗi: Timeout (quá 65 giây)
4. ⚠️ Hệ thống phát hiện lỗi
5. 🔄 Tự động retry: http://localhost:8080/auth/login
6. ✅ Thành công với Local API
7. ✅ User login thành công
```

## 🔍 Kiểm tra trạng thái

### Trong Browser Console

Khi fallback xảy ra, bạn sẽ thấy:
```
⚠️ [API Client] Production API lỗi, tự động fallback sang Local API
   Error: Network Error
   URL: /location/cities
🔄 [API Client] Retrying với Local API: http://localhost:8080/location/cities
```

### Kiểm tra localStorage

Mở DevTools → Application → Local Storage:
- `api_fallback_to_local`: `"true"` (nếu production đang down)
- `api_fallback_timestamp`: Timestamp khi fallback xảy ra

## ⚙️ Cấu hình

### Thời gian check lại Production

Mặc định: **5 phút** (300,000ms)

Có thể thay đổi trong `api.config.ts`:
```typescript
const FALLBACK_CHECK_INTERVAL = 5 * 60 * 1000; // 5 phút
```

### Các lỗi trigger fallback

- Network errors (ERR_NETWORK)
- Timeout (ECONNABORTED)
- Server errors: 500, 502, 503, 504

## 🚨 Lưu ý quan trọng

### 1. Backend Local phải đang chạy

Để fallback hoạt động, bạn **PHẢI** có backend local đang chạy ở `http://localhost:8080`

### 2. Local API cũng lỗi

Nếu cả Production và Local đều lỗi, hệ thống sẽ trả về lỗi gốc (từ Production)

### 3. Chỉ hoạt động ở Client-side

Fallback chỉ hoạt động khi chạy ở browser (client-side), không hoạt động ở server-side rendering

### 4. Reset thủ công

Nếu muốn reset và thử lại Production ngay:
```javascript
// Trong browser console
localStorage.removeItem('api_fallback_to_local');
localStorage.removeItem('api_fallback_timestamp');
// Refresh trang
```

## 📊 Flow Diagram

```
User Request
    ↓
Production API (https://api.holidate.site)
    ↓
    ├─ ✅ Success → Return Data
    │
    └─ ❌ Error (Network/Timeout/500)
           ↓
        Detect Error
           ↓
        Mark Production Down
           ↓
        Retry với Local API (http://localhost:8080)
           ↓
           ├─ ✅ Success → Return Data + Save State
           │
           └─ ❌ Error → Return Original Error
```

## ✅ Checklist

- [ ] Backend local đang chạy ở `http://localhost:8080`
- [ ] FE đang config để gọi Production API
- [ ] Đã test fallback khi Production down
- [ ] Đã verify Local API hoạt động khi fallback

## 💡 Tips

1. **Test fallback**: Tắt backend production hoặc block network để test
2. **Monitor**: Xem console logs để biết khi nào fallback xảy ra
3. **Backend Local**: Luôn giữ backend local sẵn sàng khi production bảo trì

