# So sánh các cơ chế Render trong Next.js

## 📊 Bảng so sánh

| Cơ chế | Khi nào render? | Dữ liệu | Tốc độ | SEO | Use case |
|--------|----------------|---------|--------|-----|----------|
| **SSR** | Mỗi request | Luôn mới | ⚡⚡⚡ | ✅✅✅ | Admin panel, Dashboard |
| **SSG** | Build time | Cố định | ⚡⚡⚡⚡⚡ | ✅✅✅ | Blog, Landing page |
| **CSR** | Client-side | Luôn mới | ⚡⚡ | ❌ | SPA, Interactive app |
| **ISR** | Build + Background | Tự động cập nhật | ⚡⚡⚡⚡ | ✅✅✅ | Product pages, Hotel pages |
| **RSC** | Server-side | Luôn mới | ⚡⚡⚡ | ✅✅✅ | Modern Next.js App Router |

## 🎯 Code của bạn hiện tại

### ✅ Admin Area - SSR (RSC)
```typescript
// admin-hotels/page.tsx
export const dynamic = 'force-dynamic'; // SSR
export default async function HotelsPage() {
  const data = await getHotels(); // Server-side
  return <HotelsTable hotels={data.hotels} />;
}
```

### ❌ Client Area - CSR
```typescript
// (client)/page.tsx
'use client';
export default function HomePage() {
  const [data, setData] = useState([]);
  useEffect(() => {
    hotelService.searchHotels().then(setData); // Client-side
  }, []);
  return <div>{/* ... */}</div>;
}
```

## 💡 Đề xuất cho dự án của bạn

### Homepage → SSG hoặc ISR
```typescript
// app/(client)/page.tsx
export const revalidate = 3600; // ISR: cập nhật mỗi giờ

export default async function HomePage() {
  const cities = await locationService.getCities();
  const featuredHotels = await hotelService.getFeaturedHotels();
  return <HomePageClient initialData={{ cities, featuredHotels }} />;
}
```

### Search Page → SSR
```typescript
// app/(client)/search/page.tsx
export const dynamic = 'force-dynamic'; // SSR

export default async function SearchPage({ searchParams }) {
  const hotels = await hotelService.searchHotels(searchParams);
  return <SearchPageClient initialHotels={hotels} searchParams={searchParams} />;
}
```

### Hotel Detail → ISR
```typescript
// app/(client)/hotels/[hotelId]/page.tsx
export const revalidate = 1800; // Cập nhật mỗi 30 phút

export async function generateStaticParams() {
  const hotels = await getAllHotelIds();
  return hotels.map(h => ({ hotelId: h.id }));
}

export default async function HotelPage({ params }) {
  const hotel = await hotelService.getHotelById(params.hotelId);
  return <HotelDetailClient initialHotel={hotel} />;
}
```





































