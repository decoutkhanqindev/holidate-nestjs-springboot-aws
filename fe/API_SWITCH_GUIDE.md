# 🔄 Hướng dẫn chuyển đổi giữa Production và Local API

## 📋 Tổng quan

File `src/config/api.config.ts` đã được cấu hình để dễ dàng chuyển đổi giữa 2 môi trường:

1. **Production API**: `https://api.holidate.site` (backend đã deploy)
2. **Local API**: `http://localhost:8080` (backend chạy local)

## 🚀 Cách chuyển đổi nhanh

### Chuyển sang Production API

1. Mở file `.env.local` trong thư mục `fe/`
2. Sửa nội dung thành:
   ```env
   NEXT_PUBLIC_API_URL=https://api.holidate.site
   ```
3. **RESTART Next.js dev server** (Ctrl+C rồi chạy lại `npm run dev`)

### Chuyển sang Local API

1. Mở file `.env.local` trong thư mục `fe/`
2. Sửa nội dung thành:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
3. **RESTART Next.js dev server** (Ctrl+C rồi chạy lại `npm run dev`)

## ✅ Kiểm tra đã chuyển đổi thành công

Sau khi restart server, mở browser console (F12), bạn sẽ thấy:

```
============================================================
[API Config] 🔧 API Configuration
============================================================
[API Config] API Base URL: https://api.holidate.site  (hoặc http://localhost:8080)
[API Config] Environment: development
[API Config] Mode: 🌐 PRODUCTION  (hoặc 🔧 LOCAL)
============================================================
```

## 📝 Các trường hợp sử dụng

### 1. Khi backend production bị lỗi, cần test với local

```bash
# 1. Đảm bảo backend local đang chạy ở port 8080
# 2. Sửa .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8080

# 3. Restart Next.js
npm run dev
```

### 2. Khi cần test với backend production

```bash
# 1. Sửa .env.local:
NEXT_PUBLIC_API_URL=https://api.holidate.site

# 2. Restart Next.js
npm run dev
```

### 3. Khi build production (tự động dùng production URL)

File `.env.production` sẽ tự động được load:
```env
NEXT_PUBLIC_API_URL=https://api.holidate.site
```

## 🎯 Logic tự động

Nếu **không có** file `.env.local` hoặc không set `NEXT_PUBLIC_API_URL`:

- **Development mode** (`npm run dev`): Tự động dùng `http://localhost:8080`
- **Production mode** (`npm run build`): Tự động dùng `https://api.holidate.site`

## ⚠️ Lưu ý quan trọng

1. **BẮT BUỘC**: Sau khi sửa `.env.local`, phải **RESTART** Next.js server
2. File `.env.local` đã được ignore bởi git (không commit)
3. Khi chuyển sang production API, đảm bảo backend đã config CORS đúng

## 🔍 Cách kiểm tra trong code

Bạn có thể import và kiểm tra:

```typescript
import { API_BASE_URL, isUsingProductionApi, isUsingLocalApi, API_URLS } from '@/config/api.config';

// Kiểm tra URL hiện tại
console.log('Current API URL:', API_BASE_URL);

// Kiểm tra đang dùng API nào
if (isUsingProductionApi()) {
    console.log('Đang dùng Production API');
} else if (isUsingLocalApi()) {
    console.log('Đang dùng Local API');
}
```

## 📋 Checklist khi chuyển đổi

- [ ] Đã sửa file `.env.local` với URL đúng
- [ ] Đã RESTART Next.js dev server
- [ ] Đã kiểm tra console log xem URL đúng chưa
- [ ] Đã test và verify API calls hoạt động
- [ ] Nếu dùng production API, đảm bảo backend có CORS config đúng

## 💡 Tips

- Giữ sẵn 2 dòng trong comment để copy nhanh:
  ```
  # Production:
  NEXT_PUBLIC_API_URL=https://api.holidate.site
  
  # Local:
  NEXT_PUBLIC_API_URL=http://localhost:8080
  ```

- Có thể tạo 2 file riêng và đổi tên khi cần:
  - `.env.local.production` (chứa URL production)
  - `.env.local.dev` (chứa URL local)
  
  Sau đó copy file cần dùng thành `.env.local`

