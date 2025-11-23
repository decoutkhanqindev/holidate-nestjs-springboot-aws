# ĐẶC TẢ CÁC ENTITY TRONG HỆ THỐNG HOLIDATE

## BẢNG THAM CHIẾU NHANH: ENTITY → TABLE NAME

| STT | Entity Class | Table Name | Loại |
|-----|-------------|------------|------|
| 1 | User | `users` | Entity |
| 2 | Role | `roles` | Entity |
| 3 | UserAuthInfo | `user_auth_info` | Entity |
| 4 | InvalidToken | `invalid_tokens` | Entity |
| 5 | Hotel | `hotels` | Entity |
| 6 | Room | `rooms` | Entity |
| 7 | RoomInventory | `room_inventories` | Entity |
| 8 | RoomInventoryId | _(Embeddable)_ | Composite Key |
| 9 | BedType | `bed_types` | Entity |
| 10 | Booking | `bookings` | Entity |
| 11 | Payment | `payments` | Entity |
| 12 | Review | `reviews` | Entity |
| 13 | Country | `countries` | Entity |
| 14 | Province | `provinces` | Entity |
| 15 | City | `cities` | Entity |
| 16 | District | `districts` | Entity |
| 17 | Ward | `wards` | Entity |
| 18 | Street | `streets` | Entity |
| 19 | EntertainmentVenue | `entertainment_venues` | Entity |
| 20 | EntertainmentVenueCategory | `entertainment_venue_categories` | Entity |
| 21 | HotelEntertainmentVenue | `hotel_entertainment_venues` | Join Table |
| 22 | Photo | `photos` | Entity |
| 23 | PhotoCategory | `photo_categories` | Entity |
| 24 | HotelPhoto | `hotel_photos` | Join Table |
| 25 | RoomPhoto | `room_photos` | Join Table |
| 26 | ReviewPhoto | `review_photos` | Join Table |
| 27 | Amenity | `amenities` | Entity |
| 28 | AmenityCategory | `amenity_categories` | Entity |
| 29 | HotelAmenity | `hotel_amenities` | Join Table |
| 30 | RoomAmenity | `room_amenities` | Join Table |
| 31 | Discount | `discounts` | Entity |
| 32 | HotelDiscount | `hotel_discounts` | Join Table |
| 33 | SpecialDayDiscount | `special_day_discounts` | Join Table |
| 34 | SpecialDay | `special_days` | Entity |
| 35 | HotelPolicy | `hotel_policies` | Entity |
| 36 | CancellationPolicy | `cancellation_policies` | Entity |
| 37 | CancellationRule | `cancellation_rules` | Entity |
| 38 | ReschedulePolicy | `reschedule_policies` | Entity |
| 39 | RescheduleRule | `reschedule_rules` | Entity |
| 40 | IdentificationDocument | `identification_documents` | Entity |
| 41 | HotelPolicyIdentificationDocument | `hotel_policy_identification_documents` | Join Table |
| 42 | HotelDailyReport | `hotel_daily_reports` | Entity |
| 43 | HotelDailyReportId | _(Embeddable)_ | Composite Key |
| 44 | SystemDailyReport | `system_daily_reports` | Entity |
| 45 | RoomDailyPerformance | `room_daily_performances` | Entity |
| 46 | RoomDailyPerformanceId | _(Embeddable)_ | Composite Key |

**Ghi chú:**
- **Entity:** Bảng dữ liệu chính trong database
- **Join Table:** Bảng trung gian cho quan hệ many-to-many
- **Embeddable:** Class được nhúng vào entity khác, không có bảng riêng
- **Composite Key:** Class định nghĩa khóa chính tổng hợp

---

## 1. ENTITY NGƯỜI DÙNG (USER)

### 1.1. User

**Mô tả:** Entity đại diện cho người dùng trong hệ thống (khách hàng, đối tác, admin)

**Tên bảng:** `users`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **email:** `String` (unique, not null) - Email đăng nhập
- **password:** `String` (not null) - Mật khẩu đã mã hóa
- **fullName:** `String` (not null) - Họ và tên
- **phoneNumber:** `String` (unique, length=11, nullable) - Số điện thoại
- **address:** `String` (nullable) - Địa chỉ chi tiết
- **gender:** `String` (nullable) - Giới tính
- **dateOfBirth:** `LocalDateTime` (nullable) - Ngày sinh
- **avatarUrl:** `String` (nullable) - URL ảnh đại diện
- **createdAt:** `LocalDateTime` (not null, default = now) - Thời gian tạo
- **updatedAt:** `LocalDateTime` (nullable) - Thời gian cập nhật

**Quan hệ:**

- ManyToOne với Role: Mỗi user có một role
- ManyToOne với Country, Province, City, District, Ward, Street: Địa chỉ của user
- OneToOne với UserAuthInfo: Thông tin xác thực
- OneToMany với Review: Danh sách đánh giá của user

### 1.2. Role

**Mô tả:** Vai trò của người dùng trong hệ thống (Admin, Partner, Customer, ...)

**Tên bảng:** `roles`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên vai trò
  - → Enum Type: `RoleType` (USER="user", ADMIN="admin", PARTNER="partner")
- **description:** `String` (not null) - Mô tả vai trò

**Quan hệ:**

- OneToMany với User: Nhiều user có thể có cùng một role

### 1.3. UserAuthInfo

**Mô tả:** Thông tin xác thực và bảo mật của user

**Tên bảng:** `user_auth_info`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **authProvider:** `String` (not null) - Nhà cung cấp xác thực
  - → Enum Type: `AuthProviderType` (LOCAL="local", GOOGLE="google")
- **authProviderId:** `String` (nullable) - ID từ nhà cung cấp bên thứ 3
- **otp:** `String` (nullable) - Mã OTP hiện tại
- **otpAttempts:** `int` (not null) - Số lần thử OTP
- **otpExpirationTime:** `LocalDateTime` (nullable) - Thời gian hết hạn OTP
- **otpBlockedUntil:** `LocalDateTime` (nullable) - Thời gian bị khóa đến khi nào
- **refreshToken:** `String` (nullable, TEXT) - Refresh token để làm mới access token
- **active:** `boolean` (not null) - Trạng thái kích hoạt tài khoản

**Quan hệ:**

- OneToOne với User: Mỗi user có một UserAuthInfo

### 1.4. InvalidToken

**Mô tả:** Lưu trữ các token đã bị vô hiệu hóa (logout, blacklist)

**Tên bảng:** `invalid_tokens`

**Các trường chính:**

- **id:** `String` (Primary Key) - ID của token (thường là jti - JWT ID)
- **token:** `String` (not null, TEXT) - Toàn bộ token đã bị vô hiệu hóa

**Quan hệ:** Không có quan hệ với entity khác

---

## 2. ENTITY CHỖ Ở (ACCOMMODATION)

### 2.1. Hotel

**Mô tả:** Entity đại diện cho khách sạn/nơi lưu trú

**Tên bảng:** `hotels`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên khách sạn
- **description:** `String` (not null, TEXT) - Mô tả chi tiết
- **address:** `String` (not null) - Địa chỉ
- **latitude:** `double` (nullable) - Vĩ độ
- **longitude:** `double` (nullable) - Kinh độ
- **starRating:** `int` (nullable, default=0) - Hạng sao (1-5)
- **commissionRate:** `double` (not null, default=15.0) - Tỷ lệ hoa hồng (phần trăm) mà Holidate thu trên mỗi booking thành công
- **status:** `String` (not null) - Trạng thái khách sạn
  - → Enum Type: `AccommodationStatusType`
    - ACTIVE="active" - Khách sạn đang hoạt động và có thể đặt phòng
    - INACTIVE="inactive" - Khách sạn không hoạt động (không nhận đặt phòng mới)
    - MAINTENANCE="maintenance" - Khách sạn đang bảo trì
    - CLOSED="closed" - Khách sạn đã đóng cửa
- **createdAt:** `LocalDateTime` (not null, default = now)
- **updatedAt:** `LocalDateTime` (nullable)

**Quan hệ:**

- ManyToOne với User (partner): Chủ sở hữu/đối tác của khách sạn
- ManyToOne với Country, Province, City, District, Ward, Street: Địa chỉ
- OneToOne với HotelPolicy: Chính sách của khách sạn
- OneToMany với Room: Danh sách phòng
- OneToMany với HotelPhoto: Danh sách ảnh
- OneToMany với HotelAmenity: Danh sách tiện ích
- OneToMany với Review: Danh sách đánh giá
- OneToMany với HotelDiscount: Danh sách giảm giá
- OneToMany với HotelEntertainmentVenue: Địa điểm giải trí gần đó

### 2.2. Room

**Mô tả:** Entity đại diện cho phòng trong khách sạn

**Tên bảng:** `rooms`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (not null) - Tên phòng
- **view:** `String` (not null) - Hướng nhìn (sea view, city view, ...)
- **area:** `double` (not null) - Diện tích (m²)
- **maxAdults:** `int` (not null) - Số người lớn tối đa
- **maxChildren:** `int` (not null) - Số trẻ em tối đa
- **basePricePerNight:** `double` (not null) - Giá cơ bản mỗi đêm
- **smokingAllowed:** `boolean` (not null) - Cho phép hút thuốc
- **wifiAvailable:** `boolean` (not null) - Có WiFi
- **breakfastIncluded:** `boolean` (not null) - Bao gồm bữa sáng
- **quantity:** `int` (not null) - Số lượng phòng
- **status:** `String` (not null) - Trạng thái phòng
  - → Enum Type: `AccommodationStatusType` (cùng enum với Hotel)
    - ACTIVE="active" - Phòng đang hoạt động
    - INACTIVE="inactive" - Phòng không hoạt động
    - MAINTENANCE="maintenance" - Phòng đang bảo trì
    - CLOSED="closed" - Phòng đã đóng
- **createdAt:** `LocalDateTime` (not null, default = now)
- **updatedAt:** `LocalDateTime` (nullable)

**Quan hệ:**

- ManyToOne với Hotel: Phòng thuộc khách sạn nào
- ManyToOne với BedType: Loại giường
- ManyToOne với CancellationPolicy: Chính sách hủy
- ManyToOne với ReschedulePolicy: Chính sách đổi lịch
- OneToMany với RoomPhoto: Danh sách ảnh phòng
- OneToMany với RoomAmenity: Danh sách tiện ích phòng
- OneToMany với RoomInventory: Tồn kho theo ngày

### 2.3. RoomInventory

**Mô tả:** Quản lý tồn kho và giá phòng theo từng ngày

**Tên bảng:** `room_inventories`

**Các trường chính:**

- **id:** `RoomInventoryId` (Composite Primary Key)
  - roomId: `String` (not null)
  - date: `LocalDate` (not null)
- **price:** `double` (not null) - Giá phòng cho ngày cụ thể
- **availableRooms:** `int` (not null) - Số phòng còn trống
- **status:** `String` (not null) - Trạng thái tồn kho phòng
  - → Enum Type: `RoomInventoryStatusType`
    - AVAILABLE="available" - Phòng còn trống
    - UNAVAILABLE="unavailable" - Phòng không còn trống
    - MAINTENANCE="maintenance" - Phòng đang bảo trì
    - BOOKED="booked" - Phòng đã được đặt

**Quan hệ:**

- ManyToOne với Room: Phòng tương ứng

### 2.4. RoomInventoryId

**Mô tả:** Composite key cho RoomInventory (Embeddable)

**Tên bảng:** _(Không có bảng riêng, đây là Embeddable class)_

**Các trường:**

- **roomId:** `String` (not null)
- **date:** `LocalDate` (not null)

### 2.5. BedType

**Mô tả:** Loại giường (Single, Double, Queen, King, ...)

**Tên bảng:** `bed_types`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên loại giường

**Quan hệ:**

- OneToMany với Room: Nhiều phòng có thể có cùng loại giường

---

## 3. ENTITY ĐẶT PHÒNG (BOOKING)

### 3.1. Booking

**Mô tả:** Entity đại diện cho đơn đặt phòng

**Tên bảng:** `bookings`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **checkInDate:** `LocalDate` (not null) - Ngày nhận phòng
- **checkOutDate:** `LocalDate` (not null) - Ngày trả phòng
- **numberOfNights:** `int` (not null) - Số đêm
- **numberOfRooms:** `int` (not null) - Số phòng đặt
- **numberOfAdults:** `int` (not null) - Số người lớn
- **numberOfChildren:** `int` (not null, default=0) - Số trẻ em
- **originalPrice:** `double` (not null) - Giá gốc
- **discountAmount:** `double` (nullable) - Số tiền giảm giá
- **finalPrice:** `double` (not null) - Giá cuối cùng sau giảm giá
- **contactFullName:** `String` (not null) - Tên người liên hệ
- **contactEmail:** `String` (not null) - Email liên hệ
- **contactPhone:** `String` (not null) - Số điện thoại liên hệ
- **status:** `String` (not null) - Trạng thái đặt phòng
  - → Enum Type: `BookingStatusType`
    - PENDING_PAYMENT="pending_payment" - Đang chờ thanh toán
    - CONFIRMED="confirmed" - Đã xác nhận sau khi thanh toán
    - CHECKED_IN="checked_in" - Khách đã nhận phòng
    - CANCELLED="cancelled" - Đã hủy
    - COMPLETED="completed" - Đã hoàn thành (khách đã trả phòng)
    - RESCHEDULED="rescheduled" - Đã đổi lịch
- **createdAt:** `LocalDateTime` (not null, default = now)
- **updatedAt:** `LocalDateTime` (nullable)

**Quan hệ:**

- ManyToOne với User: Người đặt phòng
- ManyToOne với Room: Phòng được đặt
- ManyToOne với Hotel: Khách sạn được đặt
- ManyToOne với Discount: Mã giảm giá áp dụng (nếu có)
- OneToOne với Payment: Thông tin thanh toán
- OneToOne với Review: Đánh giá sau khi ở (nếu có)

### 3.2. Payment

**Mô tả:** Entity đại diện cho giao dịch thanh toán

**Tên bảng:** `payments`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **amount:** `double` (not null) - Số tiền thanh toán
- **paymentMethod:** `String` (not null) - Phương thức thanh toán (vnpay, ...)
- **status:** `String` (not null) - Trạng thái thanh toán
  - → Enum Type: `PaymentStatusType`
    - PENDING="pending" - Đang chờ thanh toán
    - SUCCESS="success" - Thanh toán thành công
    - FAILED="failed" - Thanh toán thất bại
- **transactionId:** `String` (unique, nullable) - ID giao dịch từ cổng thanh toán
- **createdAt:** `LocalDateTime` (not null, default = now)
- **completedAt:** `LocalDateTime` (nullable) - Thời gian hoàn thành

**Quan hệ:**

- OneToOne với Booking: Mỗi booking có một payment

### 3.3. Review

**Mô tả:** Entity đại diện cho đánh giá của khách hàng về khách sạn

**Tên bảng:** `reviews`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **score:** `int` (not null) - Điểm đánh giá (1-10)
- **comment:** `String` (nullable, TEXT) - Bình luận chi tiết
- **createdAt:** `LocalDateTime` (not null, default = now)
- **updatedAt:** `LocalDateTime` (nullable)

**Quan hệ:**

- ManyToOne với Hotel: Khách sạn được đánh giá
- ManyToOne với User: Người đánh giá
- OneToOne với Booking: Đánh giá từ booking nào
- OneToMany với ReviewPhoto: Ảnh kèm theo đánh giá

---

## 4. ENTITY ĐỊA ĐIỂM (LOCATION)

### 4.1. Country

**Mô tả:** Quốc gia

**Tên bảng:** `countries`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên quốc gia
- **code:** `String` (unique, not null) - Mã quốc gia (VN, US, ...)

**Quan hệ:**

- OneToMany với Province: Danh sách tỉnh/thành
- OneToMany với Hotel: Danh sách khách sạn

### 4.2. Province

**Mô tả:** Tỉnh/Thành phố

**Tên bảng:** `provinces`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên tỉnh/thành
- **code:** `String` (unique, not null) - Mã tỉnh/thành

**Quan hệ:**

- ManyToOne với Country: Thuộc quốc gia nào
- OneToMany với City: Danh sách thành phố/quận
- OneToMany với Hotel: Danh sách khách sạn

### 4.3. City

**Mô tả:** Thành phố/Quận

**Tên bảng:** `cities`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên thành phố/quận
- **code:** `String` (nullable) - Mã thành phố/quận

**Quan hệ:**

- ManyToOne với Province: Thuộc tỉnh/thành nào
- OneToMany với District: Danh sách quận/huyện
- OneToMany với Hotel: Danh sách khách sạn
- OneToMany với EntertainmentVenue: Địa điểm giải trí

### 4.4. District

**Mô tả:** Quận/Huyện

**Tên bảng:** `districts`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (not null) - Tên quận/huyện
- **code:** `String` (nullable) - Mã quận/huyện

**Quan hệ:**

- ManyToOne với City: Thuộc thành phố/quận nào
- OneToMany với Ward: Danh sách phường/xã
- OneToMany với Hotel: Danh sách khách sạn

### 4.5. Ward

**Mô tả:** Phường/Xã

**Tên bảng:** `wards`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (not null) - Tên phường/xã
- **code:** `String` (nullable) - Mã phường/xã

**Quan hệ:**

- ManyToOne với District: Thuộc quận/huyện nào
- OneToMany với Street: Danh sách đường/phố
- OneToMany với Hotel: Danh sách khách sạn

### 4.6. Street

**Mô tả:** Đường/Phố

**Tên bảng:** `streets`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (not null) - Tên đường/phố
- **code:** `String` (nullable) - Mã đường/phố

**Quan hệ:**

- ManyToOne với Ward: Thuộc phường/xã nào
- OneToMany với Hotel: Danh sách khách sạn

### 4.7. EntertainmentVenue

**Mô tả:** Địa điểm giải trí gần khách sạn (nhà hàng, bảo tàng, công viên, ...)

**Tên bảng:** `entertainment_venues`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (not null) - Tên địa điểm

**Quan hệ:**

- ManyToOne với City: Thuộc thành phố nào
- ManyToOne với EntertainmentVenueCategory: Loại địa điểm
- OneToMany với HotelEntertainmentVenue: Liên kết với khách sạn

### 4.8. EntertainmentVenueCategory

**Mô tả:** Danh mục địa điểm giải trí (Restaurant, Museum, Park, Shopping Mall, ...)

**Tên bảng:** `entertainment_venue_categories`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên danh mục

**Quan hệ:**

- OneToMany với EntertainmentVenue: Danh sách địa điểm

### 4.9. HotelEntertainmentVenue

**Mô tả:** Bảng liên kết giữa khách sạn và địa điểm giải trí (many-to-many)

**Tên bảng:** `hotel_entertainment_venues`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **distance:** `double` (not null) - Khoảng cách từ khách sạn đến địa điểm (mét)

**Quan hệ:**

- ManyToOne với Hotel: Khách sạn
- ManyToOne với EntertainmentVenue: Địa điểm giải trí

---

## 5. ENTITY HÌNH ẢNH (IMAGE)

### 5.1. Photo

**Mô tả:** Entity cơ bản lưu trữ thông tin ảnh

**Tên bảng:** `photos`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **url:** `String` (not null, TEXT) - URL của ảnh

**Quan hệ:**

- ManyToOne với PhotoCategory: Danh mục ảnh

### 5.2. PhotoCategory

**Mô tả:** Danh mục ảnh (Hotel, Room, Review, ...)

**Tên bảng:** `photo_categories`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên danh mục

**Quan hệ:**

- OneToMany với Photo: Danh sách ảnh

### 5.3. HotelPhoto

**Mô tả:** Bảng liên kết giữa Hotel và Photo (many-to-many)

**Tên bảng:** `hotel_photos`

**Các trường chính:**

- **id:** `UUID` (Primary Key)

**Quan hệ:**

- ManyToOne với Hotel: Khách sạn
- ManyToOne với Photo: Ảnh

### 5.4. RoomPhoto

**Mô tả:** Bảng liên kết giữa Room và Photo (many-to-many)

**Tên bảng:** `room_photos`

**Các trường chính:**

- **id:** `UUID` (Primary Key)

**Quan hệ:**

- ManyToOne với Room: Phòng
- ManyToOne với Photo: Ảnh

### 5.5. ReviewPhoto

**Mô tả:** Bảng liên kết giữa Review và Photo (many-to-many)

**Tên bảng:** `review_photos`

**Các trường chính:**

- **id:** `UUID` (Primary Key)

**Quan hệ:**

- ManyToOne với Review: Đánh giá
- ManyToOne với Photo: Ảnh

---

## 6. ENTITY TIỆN ÍCH (AMENITY)

### 6.1. Amenity

**Mô tả:** Tiện ích cơ bản (WiFi, Pool, Gym, Parking, ...)

**Tên bảng:** `amenities`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên tiện ích
- **free:** `boolean` (not null) - Miễn phí hay có phí

**Quan hệ:**

- ManyToOne với AmenityCategory: Danh mục tiện ích

### 6.2. AmenityCategory

**Mô tả:** Danh mục tiện ích (General, Room, Service, ...)

**Tên bảng:** `amenity_categories`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên danh mục

**Quan hệ:**

- OneToMany với Amenity: Danh sách tiện ích

### 6.3. HotelAmenity

**Mô tả:** Bảng liên kết giữa Hotel và Amenity (many-to-many)

**Tên bảng:** `hotel_amenities`

**Các trường chính:**

- **id:** `UUID` (Primary Key)

**Quan hệ:**

- ManyToOne với Hotel: Khách sạn
- ManyToOne với Amenity: Tiện ích

### 6.4. RoomAmenity

**Mô tả:** Bảng liên kết giữa Room và Amenity (many-to-many)

**Tên bảng:** `room_amenities`

**Các trường chính:**

- **id:** `UUID` (Primary Key)

**Quan hệ:**

- ManyToOne với Room: Phòng
- ManyToOne với Amenity: Tiện ích

---

## 7. ENTITY GIẢM GIÁ (DISCOUNT)

### 7.1. Discount

**Mô tả:** Mã giảm giá/chương trình khuyến mãi

**Tên bảng:** `discounts`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **code:** `String` (unique, not null) - Mã giảm giá
- **description:** `String` (not null, TEXT) - Mô tả
- **percentage:** `double` (not null) - Phần trăm giảm giá (ví dụ: 10.0 = 10%)
- **usageLimit:** `int` (not null) - Giới hạn số lần sử dụng
- **timesUsed:** `int` (not null, default=0) - Số lần đã sử dụng
- **minBookingPrice:** `int` (not null) - Giá đặt phòng tối thiểu để áp dụng
- **minBookingCount:** `int` (not null) - Số đêm tối thiểu để áp dụng
- **validFrom:** `LocalDate` (not null) - Ngày bắt đầu hiệu lực
- **validTo:** `LocalDate` (not null) - Ngày kết thúc hiệu lực
- **active:** `boolean` (not null, default=true) - Trạng thái kích hoạt
- **createdAt:** `LocalDateTime` (not null, default = now)
- **updatedAt:** `LocalDateTime` (nullable)

**Quan hệ:**

- OneToMany với Booking: Các booking đã sử dụng mã này
- OneToMany với HotelDiscount: Áp dụng cho khách sạn nào
- OneToMany với SpecialDayDiscount: Áp dụng cho ngày đặc biệt nào

### 7.2. HotelDiscount

**Mô tả:** Bảng liên kết giữa Hotel và Discount (many-to-many)

**Tên bảng:** `hotel_discounts`

**Các trường chính:**

- **id:** `UUID` (Primary Key)

**Quan hệ:**

- ManyToOne với Hotel: Khách sạn
- ManyToOne với Discount: Mã giảm giá

### 7.3. SpecialDayDiscount

**Mô tả:** Bảng liên kết giữa SpecialDay và Discount (many-to-many)

**Tên bảng:** `special_day_discounts`

**Các trường chính:**

- **id:** `UUID` (Primary Key)

**Quan hệ:**

- ManyToOne với SpecialDay: Ngày đặc biệt
- ManyToOne với Discount: Mã giảm giá

---

## 8. ENTITY NGÀY ĐẶC BIỆT (SPECIAL DAY)

### 8.1. SpecialDay

**Mô tả:** Ngày đặc biệt (lễ, tết, sự kiện) có thể áp dụng giảm giá

**Tên bảng:** `special_days`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **date:** `LocalDate` (unique, not null) - Ngày đặc biệt
- **name:** `String` (not null) - Tên ngày đặc biệt (Tết Nguyên Đán, Giáng Sinh, ...)

**Quan hệ:**

- OneToMany với SpecialDayDiscount: Danh sách mã giảm giá áp dụng

---

## 9. ENTITY CHÍNH SÁCH (POLICY)

### 9.1. HotelPolicy

**Mô tả:** Chính sách tổng quát của khách sạn

**Tên bảng:** `hotel_policies`

**Các trường chính:**

- **id:** `String` (Primary Key, sử dụng hotel_id)
- **checkInTime:** `LocalTime` (not null) - Giờ nhận phòng
- **checkOutTime:** `LocalTime` (not null) - Giờ trả phòng
- **allowsPayAtHotel:** `boolean` (not null, default=false) - Cho phép thanh toán tại khách sạn

**Quan hệ:**

- OneToOne với Hotel: Mỗi hotel có một policy
- ManyToOne với CancellationPolicy: Chính sách hủy
- ManyToOne với ReschedulePolicy: Chính sách đổi lịch
- OneToMany với HotelPolicyIdentificationDocument: Tài liệu định danh yêu cầu

### 9.2. CancellationPolicy

**Mô tả:** Chính sách hủy đặt phòng (Linh hoạt, Nghiêm ngặt, Không hoàn hủy, ...)

**Tên bảng:** `cancellation_policies`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên chính sách
- **description:** `String` (nullable, TEXT) - Mô tả chi tiết

**Quan hệ:**

- OneToMany với CancellationRule: Danh sách quy tắc hủy
- OneToMany với HotelPolicy: Áp dụng cho hotel nào
- OneToMany với Room: Áp dụng cho phòng nào

### 9.3. CancellationRule

**Mô tả:** Quy tắc cụ thể trong chính sách hủy

**Tên bảng:** `cancellation_rules`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **daysBeforeCheckIn:** `int` (not null) - Số ngày trước ngày nhận phòng
- **penaltyPercentage:** `int` (not null) - Phần trăm phạt (0-100)

**Quan hệ:**

- ManyToOne với CancellationPolicy: Thuộc chính sách nào

**Ví dụ:**

- daysBeforeCheckIn = 7, penaltyPercentage = 0: Hủy trước 7 ngày → miễn phí
- daysBeforeCheckIn = 3, penaltyPercentage = 50: Hủy 3-7 ngày trước → phạt 50%
- daysBeforeCheckIn = 0, penaltyPercentage = 100: Hủy trong 3 ngày → không hoàn tiền

### 9.4. ReschedulePolicy

**Mô tả:** Chính sách đổi lịch đặt phòng

**Tên bảng:** `reschedule_policies`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên chính sách
- **description:** `String` (nullable, TEXT) - Mô tả chi tiết

**Quan hệ:**

- OneToMany với RescheduleRule: Danh sách quy tắc đổi lịch
- OneToMany với HotelPolicy: Áp dụng cho hotel nào
- OneToMany với Room: Áp dụng cho phòng nào

### 9.5. RescheduleRule

**Mô tả:** Quy tắc cụ thể trong chính sách đổi lịch

**Tên bảng:** `reschedule_rules`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **daysBeforeCheckin:** `int` (nullable) - Số ngày trước ngày check-in
- **feePercentage:** `int` (not null) - Phần trăm phí đổi lịch (0-100)

**Quan hệ:**

- ManyToOne với ReschedulePolicy: Thuộc chính sách nào

---

## 10. ENTITY TÀI LIỆU (DOCUMENT)

### 10.1. IdentificationDocument

**Mô tả:** Loại tài liệu định danh (CMND, CCCD, Passport, ...)

**Tên bảng:** `identification_documents`

**Các trường chính:**

- **id:** `UUID` (Primary Key)
- **name:** `String` (unique, not null) - Tên tài liệu

**Quan hệ:**

- OneToMany với HotelPolicyIdentificationDocument: Yêu cầu bởi hotel nào

### 10.2. HotelPolicyIdentificationDocument

**Mô tả:** Bảng liên kết giữa HotelPolicy và IdentificationDocument (many-to-many)

**Tên bảng:** `hotel_policy_identification_documents`

**Các trường chính:**

- **id:** `UUID` (Primary Key)

**Quan hệ:**

- ManyToOne với HotelPolicy: Chính sách của hotel
- ManyToOne với IdentificationDocument: Loại tài liệu yêu cầu

---

## 11. ENTITY BÁO CÁO (REPORT)

### 11.1. HotelDailyReport

**Mô tả:** Entity lưu trữ bản tóm tắt các chỉ số hoạt động kinh doanh của một khách sạn theo từng ngày

**Tên bảng:** `hotel_daily_reports`

**Các trường chính:**

- **id:** `HotelDailyReportId` (Composite Primary Key)
  - hotelId: `String` (not null)
  - reportDate: `LocalDate` (not null)
- **totalRevenue:** `double` (not null, default=0) - Tổng doanh thu thực nhận trong ngày
- **createdBookings:** `int` (not null, default=0) - Tổng số booking mới được tạo trong ngày
- **pendingPaymentBookings:** `int` (not null, default=0) - Số booking có trạng thái PENDING_PAYMENT
- **confirmedBookings:** `int` (not null, default=0) - Số booking có trạng thái CONFIRMED
- **checkedInBookings:** `int` (not null, default=0) - Số booking có trạng thái CHECKED_IN
- **completedBookings:** `int` (not null, default=0) - Số booking được hoàn thành trong ngày
- **cancelledBookings:** `int` (not null, default=0) - Số booking bị hủy trong ngày
- **rescheduledBookings:** `int` (not null, default=0) - Số booking có trạng thái RESCHEDULED
- **occupiedRoomNights:** `int` (not null, default=0) - Tổng số "phòng-đêm" đã được bán
- **totalRoomNights:** `int` (not null, default=0) - Tổng số "phòng-đêm" có sẵn để bán
- **newCustomerBookings:** `int` (not null, default=0) - Số booking từ khách hàng mới
- **returningCustomerBookings:** `int` (not null, default=0) - Số booking từ khách hàng quay lại
- **averageReviewScore:** `Double` (nullable) - Điểm đánh giá trung bình trong ngày
- **reviewCount:** `int` (not null, default=0) - Số lượng Review mới được tạo
- **updatedAt:** `LocalDateTime` (not null) - Thời điểm cập nhật lần cuối

**Quan hệ:**

- ManyToOne với Hotel: Khách sạn tương ứng

### 11.2. HotelDailyReportId

**Mô tả:** Composite key cho HotelDailyReport (Embeddable)

**Tên bảng:** _(Không có bảng riêng, đây là Embeddable class)_

**Các trường:**

- **hotelId:** `String` (not null)
- **reportDate:** `LocalDate` (not null)

### 11.3. SystemDailyReport

**Mô tả:** Entity tổng hợp các chỉ số hiệu suất kinh doanh của toàn hệ thống theo từng ngày

**Tên bảng:** `system_daily_reports`

**Các trường chính:**

- **reportDate:** `LocalDate` (Primary Key) - Ngày báo cáo
- **grossRevenue:** `double` (not null, default=0) - Doanh thu gộp (GMV)
- **netRevenue:** `double` (not null, default=0) - Doanh thu ròng (lợi nhuận Holidate)
- **totalBookingsCreated:** `int` (not null, default=0) - Tổng số booking được tạo trên toàn hệ thống
- **totalBookingsCompleted:** `int` (not null, default=0) - Tổng số booking được hoàn thành
- **totalBookingsCancelled:** `int` (not null, default=0) - Tổng số booking bị hủy
- **newCustomersRegistered:** `int` (not null, default=0) - Số lượng tài khoản CUSTOMER mới
- **newPartnersRegistered:** `int` (not null, default=0) - Số lượng tài khoản PARTNER mới
- **systemAverageReviewScore:** `Double` (nullable) - Điểm đánh giá trung bình có trọng số
- **totalReviews:** `int` (not null, default=0) - Tổng số lượng đánh giá mới
- **updatedAt:** `LocalDateTime` (not null) - Thời điểm cập nhật lần cuối

**Quan hệ:** Không có quan hệ với entity khác (tổng hợp từ các nguồn khác)

### 11.4. RoomDailyPerformance

**Mô tả:** Entity phân tích hiệu suất của từng loại phòng cụ thể theo ngày

**Tên bảng:** `room_daily_performances`

**Các trường chính:**

- **id:** `RoomDailyPerformanceId` (Composite Primary Key)
  - roomId: `String` (not null)
  - reportDate: `LocalDate` (not null)
- **revenue:** `double` (not null, default=0) - Doanh thu mà loại phòng này mang lại
- **bookedRoomNights:** `int` (not null, default=0) - Tổng số "phòng-đêm" đã được bán
- **updatedAt:** `LocalDateTime` (not null) - Thời điểm cập nhật lần cuối

**Quan hệ:**

- ManyToOne với Room: Phòng tương ứng
- ManyToOne với Hotel: Khách sạn (để tiện truy vấn)

### 11.5. RoomDailyPerformanceId

**Mô tả:** Composite key cho RoomDailyPerformance (Embeddable)

**Tên bảng:** _(Không có bảng riêng, đây là Embeddable class)_

**Các trường:**

- **roomId:** `String` (not null)
- **reportDate:** `LocalDate` (not null)

---

## ENUM TYPES (CÁC KIỂU LIỆT KÊ)

> **LƯU Ý QUAN TRỌNG:**
>
> - Trong database, các trường status/authProvider/role name được lưu dưới dạng String
> - Khi xử lý nghiệp vụ trong code, sử dụng enum class tương ứng để đảm bảo type-safe
> - Mỗi enum có method getValue() để lấy giá trị String tương ứng để lưu vào database
> - Sử dụng enum giúp tránh lỗi typo và dễ dàng refactor

### 1. USER & AUTHENTICATION ENUMS

#### 1.1. AuthProviderType

**Package:** `com.webapp.holidate.type.user`

**Mô tả:** Nhà cung cấp dịch vụ xác thực

**Các giá trị:**

- LOCAL("local") - Xác thực nội bộ (email/password)
- GOOGLE("google") - Xác thực qua Google OAuth

**Sử dụng trong:**

- UserAuthInfo.authProvider

#### 1.2. RoleType

**Package:** `com.webapp.holidate.type.user`

**Mô tả:** Vai trò của người dùng trong hệ thống

**Các giá trị:**

- USER("user") - Người dùng thông thường (khách hàng)
- ADMIN("admin") - Quản trị viên hệ thống
- PARTNER("partner") - Đối tác (chủ khách sạn)

**Sử dụng trong:**

- Role.name (tên role được lưu trong database)

---

### 2. ACCOMMODATION ENUMS

#### 2.1. AccommodationStatusType

**Package:** `com.webapp.holidate.type.accommodation`

**Mô tả:** Trạng thái của khách sạn và phòng

**Các giá trị:**

- ACTIVE("active") - Đang hoạt động và có thể đặt phòng
- INACTIVE("inactive") - Không hoạt động (không nhận đặt phòng mới)
- MAINTENANCE("maintenance") - Đang bảo trì
- CLOSED("closed") - Đã đóng cửa

**Sử dụng trong:**

- Hotel.status
- Room.status

#### 2.2. RoomInventoryStatusType

**Package:** `com.webapp.holidate.type.accommodation`

**Mô tả:** Trạng thái tồn kho phòng theo ngày

**Các giá trị:**

- AVAILABLE("available") - Phòng còn trống
- UNAVAILABLE("unavailable") - Phòng không còn trống
- MAINTENANCE("maintenance") - Phòng đang bảo trì
- BOOKED("booked") - Phòng đã được đặt

**Sử dụng trong:**

- RoomInventory.status

---

### 3. BOOKING ENUMS

#### 3.1. BookingStatusType

**Package:** `com.webapp.holidate.type.booking`

**Mô tả:** Trạng thái của đơn đặt phòng

**Các giá trị:**

- PENDING_PAYMENT("pending_payment") - Đang chờ thanh toán
- CONFIRMED("confirmed") - Đã xác nhận sau khi thanh toán thành công
- CHECKED_IN("checked_in") - Khách đã nhận phòng
- CANCELLED("cancelled") - Đã hủy đặt phòng
- COMPLETED("completed") - Đã hoàn thành (khách đã trả phòng)
- RESCHEDULED("rescheduled") - Đã đổi lịch đặt phòng

**Sử dụng trong:**

- Booking.status

**Luồng trạng thái:**

```
PENDING_PAYMENT → CONFIRMED → CHECKED_IN → COMPLETED
                  ↓
               CANCELLED
                  ↓
            RESCHEDULED → CONFIRMED → ...
```

#### 3.2. PaymentStatusType

**Package:** `com.webapp.holidate.type.booking`

**Mô tả:** Trạng thái của giao dịch thanh toán

**Các giá trị:**

- PENDING("pending") - Đang chờ thanh toán
- SUCCESS("success") - Thanh toán thành công
- FAILED("failed") - Thanh toán thất bại

**Sử dụng trong:**

- Payment.status

**Luồng trạng thái:**

```
PENDING → SUCCESS (hoặc FAILED)
```

---

### 4. EMAIL ENUMS

#### 4.1. EmailType

**Package:** `com.webapp.holidate.type.email`

**Mô tả:** Loại email template được sử dụng trong hệ thống

**Các giá trị:**

- EMAIL_VERIFICATION("email-verification-otp", "Mã OTP xác thực Email - Holidate")
- PASSWORD_RESET("password-reset-otp", "Mã OTP đặt lại mật khẩu - Holidate")
- REFUND_NOTIFICATION("refund-notification", "Thông báo hoàn tiền đơn đặt phòng - Holidate")
- RESCHEDULE_NOTIFICATION("reschedule-notification", "Thông báo đổi lịch đặt phòng - Holidate")
- BOOKING_CONFIRMATION("booking-confirmation", "Xác nhận đặt phòng thành công - Holidate")
- CHECKIN_NOTIFICATION("checkin-notification", "Xác nhận nhận phòng - Holidate")
- CHECKOUT_NOTIFICATION("checkout-notification", "Xác nhận trả phòng - Holidate")

**Các trường:**

- templateName: String - Tên template email
- emailSubject: String - Tiêu đề email

**Sử dụng trong:**

- Email service để gửi các loại email khác nhau

---

## TỔNG KẾT

### Tổng số entity: **40**

### Phân loại theo chức năng:

- **User & Authentication:** 4 entities
- **Accommodation:** 5 entities
- **Booking:** 3 entities
- **Location:** 9 entities
- **Image:** 5 entities
- **Amenity:** 4 entities
- **Discount:** 3 entities
- **Special Day:** 1 entity
- **Policy:** 5 entities
- **Document:** 2 entities
- **Report:** 5 entities

### Các quan hệ chính:

- User ↔ Hotel (Partner relationship)
- User ↔ Booking (Customer relationship)
- Hotel ↔ Room (One-to-Many)
- Booking ↔ Payment (One-to-One)
- Booking ↔ Review (One-to-One)
- Hotel ↔ Location (Hierarchical: Country → Province → City → District → Ward → Street)
- Hotel ↔ Discount (Many-to-Many through HotelDiscount)
- Room ↔ RoomInventory (One-to-Many with composite key)
- Policy entities (CancellationPolicy, ReschedulePolicy) với các Rule tương ứng

### Lưu ý quan trọng:

- RoomInventory sử dụng composite key (roomId + date) để quản lý tồn kho theo ngày
- HotelPolicy sử dụng shared primary key với Hotel (id = hotel_id)
- Các bảng liên kết many-to-many: HotelPhoto, RoomPhoto, ReviewPhoto, HotelAmenity, RoomAmenity, HotelDiscount, SpecialDayDiscount, HotelEntertainmentVenue, HotelPolicyIdentificationDocument
- Tất cả entity đều sử dụng UUID làm primary key (trừ các composite key: RoomInventoryId, HotelDailyReportId, RoomDailyPerformanceId, và SystemDailyReport sử dụng LocalDate làm primary key)
- Các entity có timestamp: createdAt, updatedAt (một số có thêm completedAt, otpExpirationTime, ...)
- Report entities (HotelDailyReport, SystemDailyReport, RoomDailyPerformance) được tạo bởi background job hàng đêm để tổng hợp dữ liệu từ các bảng nghiệp vụ, tối ưu cho việc đọc báo cáo

### ENUM TYPES TỔNG KẾT:

- **Tổng số enum types:** 6
- **User & Authentication:** 2 enums (AuthProviderType, RoleType)
- **Accommodation:** 2 enums (AccommodationStatusType, RoomInventoryStatusType)
- **Booking:** 2 enums (BookingStatusType, PaymentStatusType)
- **Email:** 1 enum (EmailType)

- Tất cả các trường status/authProvider/role name trong entity được lưu dưới dạng String
- Khi xử lý nghiệp vụ, luôn sử dụng enum class tương ứng để đảm bảo type-safe
- Mỗi enum có method getValue() để lấy giá trị String để lưu vào database
