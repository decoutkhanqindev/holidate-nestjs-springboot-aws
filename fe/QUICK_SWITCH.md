# ⚡ Chuyển đổi nhanh giữa Production và Local API

## 🔄 2 Môi trường có sẵn

1. **Production**: `https://api.holidate.site`
2. **Local**: `http://localhost:8080`

## 📝 Cách chuyển đổi (3 bước)

### Bước 1: Mở file `.env.local`
Mở file `fe/.env.local`

### Bước 2: Sửa URL

**Để dùng Production API:**
```env
NEXT_PUBLIC_API_URL=https://api.holidate.site
```

**Để dùng Local API:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Bước 3: RESTART server
```bash
# Dừng server (Ctrl+C)
# Chạy lại
npm run dev
```

## ✅ Kiểm tra

Mở browser console (F12), sẽ thấy:
```
[API Config] Mode: 🌐 PRODUCTION  (hoặc 🔧 LOCAL)
[API Config] API Base URL: https://api.holidate.site  (hoặc http://localhost:8080)
```

## 💡 Tips

- Copy nhanh để dán vào `.env.local`:
  - Production: `NEXT_PUBLIC_API_URL=https://api.holidate.site`
  - Local: `NEXT_PUBLIC_API_URL=http://localhost:8080`

- Nhớ RESTART server sau khi sửa!

