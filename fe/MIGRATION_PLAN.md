# KẾ HOẠCH CHUYỂN ĐỔI - RÕ RÀNG VỀ VỊ TRÍ FILE

## 📁 CẤU TRÚC THƯ MỤC (KHÔNG THAY ĐỔI)

```
fe/src/app/(client)/
├── page.tsx              ← SỬA FILE NÀY (Homepage)
├── search/
│   └── page.tsx          ← SỬA FILE NÀY
├── hotels/
│   └── [hotelId]/
│       └── page.tsx      ← SỬA FILE NÀY
└── ... (các thư mục khác giữ nguyên)
```

## 🔧 CÁCH SỬA - VÍ DỤ HOMEPAGE

### BƯỚC 1: Tạo Client Component mới (trong cùng thư mục)

**File mới**: `fe/src/app/(client)/HomePageClient.tsx`

```typescript
// File MỚI: HomePageClient.tsx
// Vị trí: fe/src/app/(client)/HomePageClient.tsx
'use client';

// ✅ COPY TOÀN BỘ CODE HIỆN TẠI từ page.tsx vào đây
// ✅ GIỮ NGUYÊN 100% logic
import { useState, useEffect, useRef } from 'react';
// ... (tất cả imports và code hiện tại)

// ✅ CHỈ THÊM props để nhận initial data
interface HomePageClientProps {
  initialCities?: any[];
  initialFeaturedHotels?: any[];
}

export default function HomePageClient({ 
  initialCities, 
  initialFeaturedHotels 
}: HomePageClientProps) {
  // ✅ TẤT CẢ CODE HIỆN TẠI GIỮ NGUYÊN
  const [selectedLocation, setSelectedLocation] = useState(null);
  // ... (tất cả logic giữ nguyên)
  
  return (
    // ✅ UI giữ nguyên 100%
  );
}
```

### BƯỚC 2: Sửa file page.tsx (Server Component)

**File sửa**: `fe/src/app/(client)/page.tsx`

```typescript
// File SỬA: page.tsx
// Vị trí: fe/src/app/(client)/page.tsx

// ❌ XÓA dòng này: 'use client';

// ✅ THÊM imports cho server-side
import { locationService } from '@/service/locationService';
import { hotelService } from '@/service/hotelService';
import HomePageClient from './HomePageClient'; // Import component mới

// ✅ THÊM config ISR
export const revalidate = 3600; // Cập nhật mỗi giờ

// ✅ SỬA thành async function
export default async function HomePage() {
  // ✅ Fetch data ở SERVER
  const [cities, featuredHotels] = await Promise.all([
    locationService.getCities(),
    hotelService.getFeaturedHotels({ page: 0, size: 10 })
  ]);
  
  // ✅ Truyền data xuống Client Component
  return (
    <HomePageClient 
      initialCities={cities}
      initialFeaturedHotels={featuredHotels}
    />
  );
}
```

## 📊 TÓM TẮT

### File sẽ SỬA (trong `(client)`):
1. ✅ `page.tsx` - Sửa thành Server Component
2. ✅ `search/page.tsx` - Sửa thành Server Component  
3. ✅ `hotels/[hotelId]/page.tsx` - Sửa thành Server Component
4. ✅ `discounts/page.tsx` - Sửa thành Server Component

### File sẽ TẠO MỚI (trong `(client)`):
1. ✅ `HomePageClient.tsx` - Chứa logic tương tác của Homepage
2. ✅ `SearchPageClient.tsx` - Chứa logic tương tác của Search
3. ✅ `HotelDetailClient.tsx` - Chứa logic tương tác của Hotel Detail
4. ✅ `DiscountsPageClient.tsx` - Chứa logic tương tác của Discounts

### File KHÔNG ĐỔI:
- ❌ `layout.tsx` - Giữ nguyên
- ❌ `booking/page.tsx` - Giữ nguyên CSR
- ❌ `auth/*` - Giữ nguyên CSR
- ❌ `account/*` - Giữ nguyên CSR

## 🎯 KẾT LUẬN

**Tất cả thay đổi đều nằm TRONG thư mục `fe/src/app/(client)/`**
- ✅ Sửa các file `page.tsx` hiện có
- ✅ Tạo thêm các file `*Client.tsx` trong cùng thư mục
- ❌ KHÔNG di chuyển code ra ngoài
- ❌ KHÔNG tạo thư mục mới
- ✅ Giữ nguyên cấu trúc `(client)`




















