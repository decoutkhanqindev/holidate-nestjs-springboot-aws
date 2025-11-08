# Ví dụ chuyển đổi từ CSR sang SSR - KHÔNG MẤT LOGIC

## ❌ TRƯỚC (CSR) - SearchPage hiện tại

```typescript
// app/(client)/search/page.tsx
'use client';

export default function SearchPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ❌ Fetch data ở CLIENT (chậm, không SEO)
  useEffect(() => {
    setLoading(true);
    hotelService.searchHotels(params)
      .then(data => setHotels(data.content))
      .finally(() => setLoading(false));
  }, [searchParams]);
  
  // ✅ Logic filter - GIỮ NGUYÊN
  const handleAmenityChange = (amenityId, isSelected) => {
    // ... logic của bạn
  };
  
  // ✅ Logic price - GIỮ NGUYÊN
  const handlePriceChange = (min, max) => {
    // ... logic của bạn
  };
  
  // ✅ UI - GIỮ NGUYÊN
  return <div>{/* UI của bạn */}</div>;
}
```

## ✅ SAU (SSR) - Chỉ tách data fetching

```typescript
// app/(client)/search/page.tsx - SERVER COMPONENT
import { hotelService } from '@/service/hotelService';
import { amenityService } from '@/service/amenityService';
import SearchPageClient from './SearchPageClient';

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  // ✅ Fetch data ở SERVER (nhanh, SEO tốt)
  const [hotelsData, amenityCategories] = await Promise.all([
    hotelService.searchHotels(buildApiParams(searchParams)),
    amenityService.getAllAmenityCategories()
  ]);
  
  // ✅ Truyền data xuống Client Component
  return (
    <SearchPageClient
      initialHotels={hotelsData.content}
      initialAmenityCategories={amenityCategories}
      searchParams={searchParams}
    />
  );
}
```

```typescript
// SearchPageClient.tsx - CLIENT COMPONENT
'use client';

export default function SearchPageClient({
  initialHotels,
  initialAmenityCategories,
  searchParams
}: {
  initialHotels: HotelResponse[];
  initialAmenityCategories: AmenityCategory[];
  searchParams: any;
}) {
  // ✅ State - GIỮ NGUYÊN
  const [hotels, setHotels] = useState(initialHotels); // Dùng initial data
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 30000000]);
  
  // ✅ Logic filter - GIỮ NGUYÊN 100%
  const handleAmenityChange = (amenityId: string, isSelected: boolean) => {
    // ... logic của bạn - KHÔNG ĐỔI GÌ
    setSelectedAmenities(prev => {
      const newSet = new Set(prev);
      if (isSelected) newSet.add(amenityId);
      else newSet.delete(amenityId);
      return Array.from(newSet);
    });
  };
  
  // ✅ Logic price - GIỮ NGUYÊN 100%
  const handlePriceChange = (min: number, max: number) => {
    // ... logic của bạn - KHÔNG ĐỔI GÌ
    setPriceRange([min, max]);
  };
  
  // ✅ Chỉ fetch lại khi filter thay đổi (client-side)
  useEffect(() => {
    if (selectedAmenities.length > 0 || priceRange[0] !== 0) {
      // Fetch lại với filter mới
      hotelService.searchHotels({...params, amenities: selectedAmenities})
        .then(data => setHotels(data.content));
    }
  }, [selectedAmenities, priceRange]);
  
  // ✅ UI - GIỮ NGUYÊN 100%
  return (
    <div>
      {/* UI của bạn - KHÔNG ĐỔI GÌ */}
      {hotels.map(hotel => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}
```

## 📊 SO SÁNH

| Aspect | CSR (Hiện tại) | SSR (Sau khi chuyển) |
|--------|----------------|---------------------|
| **Logic xử lý** | ✅ Có | ✅ GIỮ NGUYÊN 100% |
| **UI/JSX** | ✅ Có | ✅ GIỮ NGUYÊN 100% |
| **State management** | ✅ Có | ✅ GIỮ NGUYÊN 100% |
| **Event handlers** | ✅ Có | ✅ GIỮ NGUYÊN 100% |
| **Data fetching** | ❌ Client (chậm) | ✅ Server (nhanh) |
| **SEO** | ❌ Không có | ✅ Có |
| **Initial load** | ❌ Chậm | ✅ Nhanh |

## ✅ KẾT LUẬN

**KHÔNG MẤT LOGIC GÌ CẢ!** Chỉ:
1. Tách data fetching ra Server Component
2. Giữ nguyên tất cả logic trong Client Component
3. Truyền initial data từ Server → Client

