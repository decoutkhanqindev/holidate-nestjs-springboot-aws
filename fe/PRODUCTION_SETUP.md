# 🚀 Hướng dẫn Setup Production

## 📁 Files Environment

Project này sử dụng 2 file environment chính:

### 1. `.env.local` - Cho Development (Local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. `.env.production` - Cho Production
```
NEXT_PUBLIC_API_URL=https://api.holidate.site
```

## 🔄 Cách Next.js load Environment Variables

Next.js tự động load environment variables theo thứ tự ưu tiên:

1. **`.env.local`** - Luôn được load (override tất cả)
2. **`.env.development`** - Khi chạy `npm run dev`
3. **`.env.production`** - Khi chạy `npm run build` hoặc `npm start`
4. **`.env`** - Load cho tất cả môi trường

### ⚠️ Lưu ý quan trọng:

- **Khi build production**: Next.js sẽ tự động load `.env.production`
- **`.env.local` sẽ override** `.env.production` nếu có cùng biến
- **Để đảm bảo production dùng đúng URL**, có 2 cách:

#### Cách 1: Xóa hoặc đổi tên `.env.local` trước khi build production
```bash
# Trước khi build
mv .env.local .env.local.backup

# Build production
npm run build

# Sau khi build xong, có thể restore lại
mv .env.local.backup .env.local
```

#### Cách 2: Không commit `.env.local` vào git (đã được ignore)
- Khi deploy lên server production, chỉ cần có `.env.production`
- Server sẽ tự động dùng `.env.production`

## 🏗️ Build Production

### Bước 1: Đảm bảo file `.env.production` có nội dung:
```
NEXT_PUBLIC_API_URL=https://api.holidate.site
```

### Bước 2: Đảm bảo không có `.env.local` hoặc có nội dung production
```bash
# Option 1: Xóa tạm thời
rm .env.local

# Option 2: Hoặc đổi tên
mv .env.local .env.local.dev
```

### Bước 3: Build production
```bash
cd fe
npm run build
```

### Bước 4: Start production server
```bash
npm start
```

## ✅ Kiểm tra Production đã dùng đúng URL

Sau khi build và start, kiểm tra:

1. Mở browser console (F12)
2. Vào tab Network
3. Xem các API request phải đi đến: `https://api.holidate.site/...`

## 📋 Checklist Production

- [ ] File `.env.production` có `NEXT_PUBLIC_API_URL=https://api.holidate.site`
- [ ] Không có `.env.local` hoặc đã xóa/đổi tên trước khi build
- [ ] Đã chạy `npm run build`
- [ ] Đã test và verify API calls đi đến `https://api.holidate.site`
- [ ] OAuth login hoạt động với production URL

## 🔄 Chuyển đổi giữa Local và Production

### Chạy Local Development:
```bash
# Đảm bảo .env.local có:
NEXT_PUBLIC_API_URL=http://localhost:8080

# Chạy dev server
npm run dev
```

### Build Production:
```bash
# Đảm bảo .env.production có:
NEXT_PUBLIC_API_URL=https://api.holidate.site

# Xóa hoặc đổi tên .env.local
rm .env.local  # hoặc mv .env.local .env.local.dev

# Build
npm run build

# Start
npm start
```

