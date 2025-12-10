# TÀI LIỆU CÂU HỎI VÀ TRẢ LỜI - ĐỒ ÁN TỐT NGHIỆP
## Hệ thống đặt phòng khách sạn Holidate - Frontend

---

## 📋 MỤC LỤC

1. [Cơ chế bảo vệ JWT Token](#1-cơ-chế-bảo-vệ-jwt-token)
2. [Luồng hoạt động của Web Client](#2-luồng-hoạt-động-của-web-client)
3. [Cơ chế Rendering (SSR, CSR, SSG)](#3-cơ-chế-rendering-ssr-csr-ssg)
4. [Dynamic Routing](#4-dynamic-routing)
5. [Giao tiếp với Backend và Fetch Data](#5-giao-tiếp-với-backend-và-fetch-data)
6. [Kịch bản quay demo video](#6-kịch-bản-quay-demo-video)
7. [Các câu hỏi bổ sung](#7-các-câu-hỏi-bổ-sung)

---

## 1. CƠ CHẾ BẢO VỆ JWT TOKEN

### ❓ Câu hỏi 1.1: Hệ thống sử dụng cơ chế nào để bảo vệ JWT token?

**Trả lời:**

Hệ thống sử dụng **JWT (JSON Web Token)** với cơ chế **Access Token + Refresh Token**:

1. **Access Token**: 
   - Lưu trong `localStorage` với key `accessToken`
   - Thời gian sống ngắn (thường vài giờ)
   - Được gửi kèm mỗi request qua header `Authorization: Bearer <token>`
   - Tự động refresh khi sắp hết hạn (5 phút trước khi expire)

2. **Refresh Token**:
   - Lưu trong `localStorage` với key `refreshToken`
   - Thời gian sống dài hơn (7 ngày)
   - Dùng để lấy access token mới khi access token hết hạn

3. **Bảo vệ token**:
   - Token được decode bằng `jwt-decode` để kiểm tra `exp` (expiration time)
   - Tự động xóa token khi phát hiện hết hạn
   - Xóa token khi nhận lỗi 401 (Unauthorized) từ backend
   - Không gửi token cho các endpoint `/auth/*` khi đang OAuth login (dùng cookie thay thế)

**File liên quan:**
- `src/contexts/AuthContext.tsx` - Quản lý authentication state
- `src/lib/utils.ts` - Các hàm kiểm tra token (isTokenValid, isTokenExpiringSoon, etc.)
- `src/service/apiClient.tsx` - Interceptor tự động gắn token vào request

---

### ❓ Câu hỏi 1.2: Làm thế nào hệ thống tự động refresh token?

**Trả lời:**

Hệ thống tự động refresh token thông qua **interval checking**:

1. **Kiểm tra định kỳ**: Mỗi 60 giây, hệ thống kiểm tra xem access token có sắp hết hạn không (5 phút trước khi expire)

2. **Quy trình refresh**:
   ```typescript
   // Kiểm tra token sắp hết hạn
   if (isTokenExpiringSoon(accessToken, 5)) {
       // Gọi API refresh token
       const response = await refreshToken(refreshToken);
       // Cập nhật token mới vào localStorage
       localStorage.setItem('accessToken', newAccessToken);
       localStorage.setItem('refreshToken', newRefreshToken);
   }
   ```

3. **Xử lý lỗi**:
   - Nếu refresh token hết hạn → Tự động logout
   - Nếu refresh token không hợp lệ → Tự động logout
   - Tránh refresh đồng thời bằng flag `isRefreshingRef`

**File liên quan:**
- `src/contexts/AuthContext.tsx` (dòng 398-515) - Logic auto refresh
- `src/service/authService.tsx` - API refresh token

---

### ❓ Câu hỏi 1.3: Hệ thống xử lý OAuth (Google Login) như thế nào?

**Trả lời:**

Hệ thống hỗ trợ **OAuth login qua cookie**:

1. **Quy trình OAuth**:
   - User click "Đăng nhập bằng Google"
   - Redirect đến backend OAuth endpoint
   - Backend xử lý và set cookie `accessToken`
   - Frontend nhận callback và kiểm tra cookie

2. **Xử lý cookie**:
   - Sử dụng `withCredentials: true` trong axios config
   - Gọi `/auth/me` để lấy token từ cookie
   - Không gửi Authorization header khi đang OAuth login
   - Chuyển token từ cookie sang localStorage sau khi nhận được

3. **Retry mechanism**:
   - Nếu backend trả lỗi 500, tự động retry 5 lần với delay tăng dần
   - Delay: 3s → 3.9s → 5s (max)

**File liên quan:**
- `src/contexts/AuthContext.tsx` (dòng 117-396) - Logic OAuth
- `src/service/api.tsx` - Interceptor xử lý OAuth requests

---

### ❓ Câu hỏi 1.4: Làm thế nào phân biệt authentication cho Client và Admin?

**Trả lời:**

Hệ thống có **2 context riêng biệt**:

1. **Client Authentication** (`AuthContext.tsx`):
   - Dành cho user role thông thường
   - Token lưu trong `localStorage` với key `accessToken`, `refreshToken`, `userId`
   - Tự động redirect admin/partner về `/admin-login`

2. **Admin Authentication** (`AuthContextAdmin.tsx`):
   - Dành cho admin và partner role
   - User data lưu trong `localStorage` với key `adminUser`
   - Hỗ trợ impersonation (super admin có thể xem như hotel admin)
   - Tách biệt hoàn toàn với client context

3. **Phân quyền**:
   - Client: Chỉ truy cập routes trong `(client)` folder
   - Admin: Chỉ truy cập routes trong `(admin_area)` folder
   - Tự động redirect nếu đăng nhập sai context

**File liên quan:**
- `src/contexts/AuthContext.tsx` - Client auth
- `src/components/Admin/AuthContext_Admin/AuthContextAdmin.tsx` - Admin auth

---

## 2. LUỒNG HOẠT ĐỘNG CỦA WEB CLIENT

### ❓ Câu hỏi 2.1: Mô tả luồng hoạt động từ khi user truy cập trang web đến khi hiển thị nội dung?

**Trả lời:**

**Luồng hoạt động chính:**

1. **Initial Load**:
   ```
   User truy cập → Next.js Server render root layout → 
   Client Layout được mount → AuthProvider khởi tạo → 
   Kiểm tra token trong localStorage → 
   Nếu có token: Decode và validate → Set user state → 
   Render page content
   ```

2. **Authentication Flow**:
   ```
   Không có token → Kiểm tra OAuth cookie → 
   Nếu có cookie: Gọi /auth/me → Nhận token → 
   Lưu vào localStorage → Set user state
   ```

3. **Page Rendering**:
   ```
   Server Component (nếu có) → Fetch initial data → 
   Pass props to Client Component → 
   Client Component mount → Fetch additional data → 
   Render UI
   ```

**File liên quan:**
- `src/app/layout.tsx` - Root layout
- `src/app/(client)/layout.tsx` - Client layout với AuthProvider
- `src/contexts/AuthContext.tsx` - Auth initialization

---

### ❓ Câu hỏi 2.2: Luồng đăng nhập/đăng xuất hoạt động như thế nào?

**Trả lời:**

**Đăng nhập:**

1. User nhập email/password → Gọi `loginUser()` API
2. Backend trả về `accessToken`, `refreshToken`, user info
3. Lưu token vào `localStorage`
4. Decode token để lấy user info
5. Kiểm tra role:
   - Nếu `admin` hoặc `partner` → Redirect đến `/admin-login`
   - Nếu `user` → Set user state → Redirect về home hoặc giữ nguyên trang

**Đăng xuất:**

1. Gọi `logoutUser()` API với token
2. Xóa tất cả token khỏi `localStorage`:
   - `accessToken`
   - `refreshToken`
   - `userId`
3. Set session flags để tránh auto-login:
   - `justLoggedOut: true`
   - `skipOAuthCheck: true`
   - `lastLogoutTime: timestamp`
4. Clear user state
5. Redirect về home page

**File liên quan:**
- `src/contexts/AuthContext.tsx` (dòng 520-577) - Login/logout functions
- `src/service/authService.tsx` - API calls

---

### ❓ Câu hỏi 2.3: Luồng tìm kiếm và đặt phòng khách sạn?

**Trả lời:**

**Tìm kiếm:**

1. User nhập thông tin tìm kiếm (địa điểm, ngày, số khách)
2. Click "Tìm kiếm" → Build query params
3. Navigate đến `/search?params`
4. SearchPage fetch data từ API:
   ```typescript
   hotelService.searchHotels({
     'city-id': cityId,
     'checkin': checkInDate,
     'nights': numNights,
     'adults': adults,
     'children': children,
     'rooms': rooms
   })
   ```
5. Hiển thị danh sách khách sạn với pagination

**Đặt phòng:**

1. User chọn khách sạn → Navigate đến `/hotels/[hotelId]`
2. Fetch hotel detail và rooms
3. User chọn phòng → Navigate đến `/booking`
4. Nhập thông tin khách hàng
5. Chọn phương thức thanh toán
6. Submit booking → Gọi API tạo booking
7. Redirect đến `/payment` → Xử lý thanh toán
8. Sau khi thanh toán thành công → Redirect đến `/payment/success`

**File liên quan:**
- `src/app/(client)/search/page.tsx` - Search page
- `src/app/(client)/hotels/[hotelId]/page.tsx` - Hotel detail
- `src/app/(client)/booking/page.tsx` - Booking page
- `src/service/bookingService.tsx` - Booking API

---

## 3. CƠ CHẾ RENDERING (SSR, CSR, SSG)

### ❓ Câu hỏi 3.1: Hệ thống sử dụng cơ chế rendering nào?

**Trả lời:**

Hệ thống sử dụng **hybrid rendering** với Next.js 15 App Router:

1. **Server Components (mặc định)**:
   - Tất cả components trong `app/` folder mặc định là Server Components
   - Fetch data trên server trước khi render
   - Không có JavaScript bundle gửi về client
   - Ví dụ: `app/(client)/page.tsx` - Homepage fetch cities trên server

2. **Client Components**:
   - Components có `'use client'` directive
   - Chạy trên browser, có thể dùng hooks, state, event handlers
   - Ví dụ: `AuthContext.tsx`, `HomePageClient.tsx`

3. **ISR (Incremental Static Regeneration)**:
   - Một số pages có `revalidate` config
   - Ví dụ: Homepage revalidate mỗi 1 giờ (3600 giây)
   ```typescript
   export const revalidate = 3600; // 1 giờ
   ```

4. **Dynamic Rendering**:
   - Pages với dynamic routes `[hotelId]` render theo request
   - Metadata được generate động từ data

**File liên quan:**
- `src/app/(client)/page.tsx` - Server Component với ISR
- `src/app/(client)/HomePageClient.tsx` - Client Component
- `src/app/(client)/hotels/[hotelId]/page.tsx` - Dynamic route

---

### ❓ Câu hỏi 3.2: Tại sao một số pages không fetch data trên server?

**Trả lời:**

Một số pages **không fetch data trên server** vì:

1. **Performance**:
   - Tránh blocking navigation khi server chậm
   - User có thể thấy UI ngay lập tức
   - Data fetch song song trên client

2. **Error Handling**:
   - Server timeout có thể làm page không render được
   - Client có thể retry và hiển thị error message tốt hơn

3. **Ví dụ cụ thể**:
   ```typescript
   // Hotel detail page - KHÔNG fetch trên server
   export default function HotelDetailPage() {
       return (
           <HotelDetailPageClient
               initialHotel={null}  // Luôn null
               initialRooms={[]}
           />
       );
   }
   ```
   - Server chỉ render shell
   - Client component fetch data ngay sau khi mount
   - User thấy loading state thay vì blank page

**File liên quan:**
- `src/app/(client)/hotels/[hotelId]/page.tsx` - Không fetch trên server
- `src/app/(client)/hotels/[hotelId]/HotelDetailPageClient.tsx` - Client fetch

---

### ❓ Câu hỏi 3.3: Metadata và SEO được xử lý như thế nào?

**Trả lời:**

**Metadata được generate động** từ data:

1. **Static Metadata**:
   ```typescript
   export const metadata: Metadata = {
     title: 'Holidate - Đặt phòng khách sạn',
     description: 'Đặt phòng khách sạn giá tốt nhất',
   };
   ```

2. **Dynamic Metadata**:
   ```typescript
   export async function generateMetadata({ params }: MetadataProps) {
       const { hotelId } = await params;
       const hotel = await getHotelForMetadata(hotelId);
       
       return {
           title: `${hotel.name} - ${address} | Holidate`,
           description: hotel.description || `Đặt phòng tại ${hotel.name}`,
           openGraph: {
               title: `${hotel.name}`,
               images: [hotel.mainImage],
           },
       };
   }
   ```

3. **SEO Features**:
   - Open Graph tags cho social sharing
   - Twitter Card metadata
   - Robots meta tags
   - Structured data (có thể thêm)

**File liên quan:**
- `src/app/(client)/page.tsx` - Homepage metadata
- `src/app/(client)/hotels/[hotelId]/page.tsx` - Dynamic metadata

---

## 4. DYNAMIC ROUTING

### ❓ Câu hỏi 4.1: Hệ thống sử dụng dynamic routing như thế nào?

**Trả lời:**

Hệ thống sử dụng **Next.js App Router với dynamic segments**:

1. **Dynamic Routes**:
   - `[hotelId]` - Route động cho hotel detail
   - `[slug]` - Route động cho help pages, contact pages
   - Ví dụ: `/hotels/123`, `/help/faq`, `/contact/tuyen-dung-doi-tac`

2. **Route Groups**:
   - `(client)` - Routes cho client users
   - `(admin_area)` - Routes cho admin
   - `(admin)` - Routes cho hotel admin
   - `(super_admin)` - Routes cho super admin
   - Groups không ảnh hưởng URL, chỉ dùng để tổ chức code

3. **Nested Dynamic Routes**:
   ```
   /admin-hotels/[hotelId]/page.tsx
   /admin-hotels/[hotelId]/edit/page.tsx
   ```

4. **Accessing Params**:
   ```typescript
   // Server Component
   export default async function Page({ params }: { params: Promise<{ hotelId: string }> }) {
       const { hotelId } = await params;
   }
   
   // Client Component
   const params = useParams();
   const hotelId = params.hotelId;
   ```

**File liên quan:**
- `src/app/(client)/hotels/[hotelId]/page.tsx`
- `src/app/(admin_area)/(admin)/admin-hotels/[hotelId]/page.tsx`
- `src/app/(client)/help/[slug]/page.tsx`

---

### ❓ Câu hỏi 4.2: Làm thế nào hệ thống phân biệt routes cho client và admin?

**Trả lời:**

**Phân biệt bằng Route Groups và Layouts**:

1. **Route Structure**:
   ```
   app/
   ├── (client)/          # Client routes
   │   ├── layout.tsx      # Client layout với AuthProvider
   │   ├── page.tsx       # Homepage
   │   ├── hotels/
   │   └── booking/
   │
   └── (admin_area)/      # Admin routes
       ├── layout.tsx      # Admin layout với AdminAuthProvider
       ├── admin-login/
       ├── (admin)/        # Hotel admin routes
       └── (super_admin)/ # Super admin routes
   ```

2. **Layout Protection**:
   - Client layout: Wrap với `AuthProvider` (client context)
   - Admin layout: Wrap với `AdminAuthProvider` (admin context)
   - Mỗi layout có middleware riêng để check authentication

3. **Automatic Redirect**:
   - Client login với admin role → Redirect đến `/admin-login`
   - Admin login với user role → Không thể (backend reject)

**File liên quan:**
- `src/app/(client)/layout.tsx` - Client layout
- `src/app/(admin_area)/layout.tsx` - Admin layout

---

## 5. GIAO TIẾP VỚI BACKEND VÀ FETCH DATA

### ❓ Câu hỏi 5.1: Hệ thống giao tiếp với backend như thế nào?

**Trả lời:**

Hệ thống sử dụng **Axios** với **centralized API client**:

1. **API Client Setup**:
   ```typescript
   const apiClient = axios.create({
       baseURL: API_BASE_URL,  // https://api.holidate.site hoặc localhost:8080
       timeout: 65000,
       withCredentials: true,  // Cho phép gửi cookies (OAuth)
       headers: {
           'Content-Type': 'application/json',
       },
   });
   ```

2. **Request Interceptor**:
   - Tự động gắn `Authorization: Bearer <token>` vào mỗi request
   - Xử lý đặc biệt cho `/auth/*` endpoints (không gắn token khi OAuth)

3. **Response Interceptor**:
   - Xử lý lỗi 401: Xóa token và redirect
   - Fallback mechanism: Nếu production API down → Tự động chuyển sang local API
   - Retry logic cho network errors

4. **API Base URL**:
   - Production: `https://api.holidate.site`
   - Local: `http://localhost:8080`
   - Tự động chọn dựa trên `NODE_ENV` hoặc `NEXT_PUBLIC_API_URL`

**File liên quan:**
- `src/service/apiClient.tsx` - Main API client
- `src/config/api.config.ts` - API configuration
- `src/service/api.tsx` - Alternative API client

---

### ❓ Câu hỏi 5.2: Có những cách nào để fetch data?

**Trả lời:**

Hệ thống có **3 cách fetch data**:

1. **Server-Side Fetching** (Server Components):
   ```typescript
   // app/page.tsx (Server Component)
   export default async function Page() {
       const cities = await getCitiesServer();  // Fetch trên server
       return <HomePageClient initialCities={cities} />;
   }
   ```
   - Chạy trên server
   - Không có access token từ localStorage
   - Dùng axios trực tiếp hoặc server API client

2. **Client-Side Fetching** (Client Components):
   ```typescript
   'use client';
   useEffect(() => {
       const fetchData = async () => {
           const hotels = await hotelService.searchHotels(params);
           setHotels(hotels.content);
       };
       fetchData();
   }, []);
   ```
   - Chạy trên browser
   - Có access token từ localStorage
   - Dùng `apiClient` với interceptor

3. **Server Actions** (Form submissions):
   ```typescript
   'use server';
   export async function createHotel(formData: FormData) {
       const apiClient = await createServerApiClient();  // Lấy token từ cookies
       const response = await apiClient.post('/hotels', data);
       return response.data;
   }
   ```
   - Chạy trên server nhưng có access token từ cookies
   - Dùng cho form submissions, mutations

**File liên quan:**
- `src/lib/AdminAPI/serverApiClient.ts` - Server API client
- `src/service/hotelService.tsx` - Client service
- `src/lib/AdminAPI/locationService.ts` - Server + Client services

---

### ❓ Câu hỏi 5.3: Hệ thống xử lý lỗi và retry như thế nào?

**Trả lời:**

**Error Handling Strategy**:

1. **Network Errors**:
   - Timeout: 65 giây
   - Network error → Fallback sang local API nếu đang dùng production
   - Retry với exponential backoff cho OAuth login

2. **HTTP Errors**:
   - 401 (Unauthorized): Xóa token → Redirect đến login
   - 500 (Server Error): Retry cho OAuth (5 lần)
   - 404, 403: Hiển thị error message

3. **Error Display**:
   - Toast notifications (react-toastify)
   - Error states trong components
   - Fallback UI khi không có data

4. **Retry Logic**:
   ```typescript
   // OAuth retry với delay tăng dần
   for (let attempt = 1; attempt <= 5; attempt++) {
       await new Promise(resolve => setTimeout(resolve, retryDelay));
       const response = await getMyProfile();
       if (response) break;
       retryDelay = Math.min(retryDelay * 1.3, 5000);
   }
   ```

**File liên quan:**
- `src/service/apiClient.tsx` - Error interceptor
- `src/contexts/AuthContext.tsx` - OAuth retry logic

---

## 6. KỊCH BẢN QUAY DEMO VIDEO

### ❓ Câu hỏi 6.1: Kịch bản demo cho Client (User thông thường)?

**Trả lời:**

**Kịch bản demo Client (15-20 phút)**:

1. **Trang chủ (2 phút)**:
   - Giới thiệu giao diện homepage
   - Tìm kiếm nhanh: Chọn thành phố, ngày check-in, số đêm
   - Click "Tìm kiếm"
   - Highlight: Responsive design, UI/UX

2. **Tìm kiếm và lọc (3 phút)**:
   - Hiển thị kết quả tìm kiếm
   - Demo các filter: Giá, sao, tiện ích
   - Sort: Giá tăng/giảm, đánh giá
   - Pagination

3. **Chi tiết khách sạn (3 phút)**:
   - Click vào một khách sạn
   - Xem ảnh, mô tả, tiện ích
   - Xem danh sách phòng
   - Xem đánh giá và review
   - Highlight: Dynamic routing, metadata SEO

4. **Đặt phòng (4 phút)**:
   - Chọn phòng
   - Nhập thông tin khách hàng
   - Chọn phương thức thanh toán
   - Submit booking
   - Highlight: Form validation, error handling

5. **Thanh toán (2 phút)**:
   - Xem thông tin booking
   - Thanh toán (demo với test payment)
   - Xem trang success

6. **Tài khoản (2 phút)**:
   - Đăng ký/Đăng nhập
   - Xem thông tin cá nhân
   - Xem lịch sử đặt phòng
   - Đăng xuất

7. **Tính năng bổ sung (2 phút)**:
   - Chatbot hỗ trợ
   - Xem khuyến mãi
   - Đánh giá khách sạn

---

### ❓ Câu hỏi 6.2: Kịch bản demo cho Admin?

**Trả lời:**

**Kịch bản demo Admin (15-20 phút)**:

1. **Đăng nhập Admin (1 phút)**:
   - Truy cập `/admin-login`
   - Đăng nhập với tài khoản admin/partner
   - Highlight: Phân quyền, redirect

2. **Dashboard (2 phút)**:
   - Xem thống kê: Số booking, doanh thu, đánh giá
   - Charts và graphs
   - Quick actions

3. **Quản lý khách sạn (4 phút)**:
   - Xem danh sách khách sạn
   - Thêm khách sạn mới: Form với nhiều fields
   - Upload ảnh (multiple files)
   - Chỉnh sửa khách sạn
   - Xem chi tiết khách sạn
   - Highlight: CRUD operations, file upload

4. **Quản lý phòng (3 phút)**:
   - Xem danh sách phòng của khách sạn
   - Thêm phòng mới
   - Chỉnh sửa phòng
   - Quản lý inventory

5. **Quản lý booking (3 phút)**:
   - Xem danh sách booking
   - Filter theo trạng thái
   - Xem chi tiết booking
   - Cập nhật trạng thái booking

6. **Quản lý đánh giá (2 phút)**:
   - Xem danh sách reviews
   - Phản hồi review
   - Xóa review không phù hợp

7. **Báo cáo (2 phút)**:
   - Xem báo cáo doanh thu
   - Export Excel
   - Charts và analytics

---

### ❓ Câu hỏi 6.3: Kịch bản demo cho Super Admin?

**Trả lời:**

**Kịch bản demo Super Admin (10-15 phút)**:

1. **Đăng nhập Super Admin (1 phút)**:
   - Đăng nhập với role `admin`
   - Redirect đến `/super-admin`

2. **Quản lý Admin (3 phút)**:
   - Xem danh sách hotel admins
   - Tạo admin mới cho khách sạn
   - Phân quyền
   - Xóa admin

3. **Quản lý khách sạn toàn hệ thống (3 phút)**:
   - Xem tất cả khách sạn
   - Duyệt khách sạn mới (approve/reject)
   - Chỉnh sửa bất kỳ khách sạn nào
   - Impersonation: Xem như hotel admin

4. **Quản lý khuyến mãi (2 phút)**:
   - Tạo khuyến mãi toàn hệ thống
   - Quản lý special days
   - Xem thống kê khuyến mãi

5. **Quản lý thanh toán (2 phút)**:
   - Xem tất cả transactions
   - Filter và search
   - Export reports

6. **Báo cáo tổng quan (2 phút)**:
   - Dashboard với metrics toàn hệ thống
   - Charts: Revenue, bookings, users
   - Export reports

7. **Quản lý support tickets (2 phút)**:
   - Xem support requests
   - Phản hồi tickets
   - Đóng tickets

---

## 7. CÁC CÂU HỎI BỔ SUNG

### ❓ Câu hỏi 7.1: Hệ thống xử lý state management như thế nào?

**Trả lời:**

Hệ thống sử dụng **React Context API** cho global state:

1. **AuthContext**: Quản lý authentication state (user, token, login/logout)
2. **AdminAuthContext**: Quản lý admin authentication state
3. **Local State**: Mỗi component quản lý state riêng bằng `useState`, `useReducer`
4. **Server State**: Data từ API được cache trong component state, không dùng thư viện như React Query

**Lý do không dùng Redux/Zustand**:
- State không quá phức tạp
- Context API đủ cho nhu cầu
- Giảm bundle size

---

### ❓ Câu hỏi 7.2: Hệ thống xử lý file upload như thế nào?

**Trả lời:**

**File upload sử dụng FormData**:

1. **Client-side**:
   ```typescript
   const formData = new FormData();
   formData.append('files', file);
   formData.append('hotelId', hotelId);
   
   await apiClient.post('/hotels/upload-photos', formData);
   ```

2. **Axios tự động set Content-Type**:
   - Khi dùng FormData, axios tự động set `Content-Type: multipart/form-data` với boundary
   - Không cần set header manually

3. **Multiple files**:
   - Có thể append nhiều files vào FormData
   - Backend xử lý array of files

**File liên quan:**
- `src/lib/AdminAPI/hotelService.ts` - Upload photos
- `src/lib/AdminAPI/serverApiClient.ts` - FormData handling

---

### ❓ Câu hỏi 7.3: Hệ thống có những tính năng bảo mật nào?

**Trả lời:**

**Các tính năng bảo mật**:

1. **JWT Token Security**:
   - Token lưu trong localStorage (có thể cải thiện bằng httpOnly cookies)
   - Tự động xóa token khi hết hạn
   - Refresh token mechanism

2. **CORS**:
   - Backend config CORS để chỉ cho phép frontend domain
   - `withCredentials: true` để gửi cookies

3. **Input Validation**:
   - Client-side validation với form validation
   - Backend validation (server-side)

4. **XSS Protection**:
   - React tự động escape HTML
   - Không dùng `dangerouslySetInnerHTML` trừ khi cần thiết

5. **CSRF Protection**:
   - Dùng SameSite cookies
   - Token-based authentication

---

### ❓ Câu hỏi 7.4: Hệ thống tối ưu performance như thế nào?

**Trả lời:**

**Các tối ưu performance**:

1. **Code Splitting**:
   - Next.js tự động code splitting theo routes
   - Dynamic imports cho heavy components

2. **Image Optimization**:
   - Next.js Image component tự động optimize
   - Lazy loading images

3. **ISR (Incremental Static Regeneration)**:
   - Một số pages có revalidate để cache và update định kỳ

4. **Client-side Caching**:
   - Data được cache trong component state
   - Tránh fetch lại không cần thiết

5. **Lazy Loading**:
   - Components load khi cần
   - Routes được split tự động

6. **Bundle Optimization**:
   - Tree shaking
   - Minification
   - Turbopack (Next.js 15)

---

### ❓ Câu hỏi 7.5: Hệ thống xử lý responsive design như thế nào?

**Trả lời:**

**Responsive design sử dụng**:

1. **Bootstrap 5**:
   - Grid system: `container`, `row`, `col-md-*`
   - Responsive utilities
   - Mobile-first approach

2. **Tailwind CSS**:
   - Utility classes: `md:`, `lg:`, `xl:`
   - Responsive breakpoints

3. **CSS Modules**:
   - Custom CSS với media queries
   - Component-scoped styles

4. **Next.js Image**:
   - Responsive images với `sizes` prop
   - Automatic srcset generation

**Ví dụ**:
```tsx
<div className="container">
    <div className="row">
        <div className="col-12 col-md-6 col-lg-4">
            {/* Responsive column */}
        </div>
    </div>
</div>
```

---

### ❓ Câu hỏi 7.6: Hệ thống có những tính năng UX/UI nào nổi bật?

**Trả lời:**

**Tính năng UX/UI**:

1. **Loading States**:
   - Skeleton loaders
   - Spinner khi fetch data
   - Progress indicators

2. **Error Handling**:
   - Toast notifications (react-toastify)
   - Error messages rõ ràng
   - Fallback UI

3. **Form Validation**:
   - Real-time validation
   - Error messages inline
   - Disable submit khi invalid

4. **Search & Filter**:
   - Debounced search input
   - Auto-complete suggestions
   - Filter với URL params (shareable links)

5. **Navigation**:
   - Smooth transitions
   - Breadcrumbs
   - Back button handling

6. **Accessibility**:
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation

---

### ❓ Câu hỏi 7.7: Hệ thống deploy như thế nào?

**Trả lời:**

**Deployment Strategy**:

1. **Build Process**:
   ```bash
   npm run build  # Next.js build với Turbopack
   npm start      # Production server
   ```

2. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` - API base URL
   - `NODE_ENV` - Environment (production/development)

3. **Static Assets**:
   - Images: CDN hoặc Next.js Image Optimization
   - Fonts: Google Fonts (Inter)

4. **Deployment Platforms**:
   - Có thể deploy lên Vercel, Netlify, hoặc self-hosted
   - Next.js hỗ trợ cả static export và server-side rendering

5. **API Fallback**:
   - Tự động fallback sang local API nếu production down
   - Giúp development dễ dàng hơn

---

## 📝 KẾT LUẬN

Tài liệu này cung cấp cái nhìn tổng quan về:
- Cơ chế authentication và bảo mật JWT
- Luồng hoạt động của ứng dụng
- Cơ chế rendering và routing
- Giao tiếp với backend
- Kịch bản demo

**Lưu ý khi trình bày**:
- Chuẩn bị demo environment sẵn sàng
- Test tất cả flows trước khi trình bày
- Có backup plan nếu có lỗi
- Highlight các điểm mạnh của hệ thống
- Sẵn sàng trả lời câu hỏi về technical decisions

---

**Tài liệu được tạo tự động từ source code**
**Ngày tạo: 2024**
**Phiên bản: 1.0**





