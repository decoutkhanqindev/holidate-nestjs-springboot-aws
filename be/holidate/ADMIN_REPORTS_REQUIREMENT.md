# Admin Reports Requirement

## Chiến lược cốt lõi: Nền tảng dữ liệu hai cấp độ cho Admin

Các báo cáo của Admin đòi hỏi một góc nhìn vĩ mô trên toàn hệ thống, đồng thời phải có khả năng "khoan sâu" (drill-down) vào từng đơn vị kinh doanh (khách sạn, khu vực). Do đó, chúng ta sẽ xây dựng một nền tảng dữ liệu hai cấp độ:

- **Cấp độ Hệ thống (SystemDailyReport):** Cung cấp các chỉ số tổng quan nhất, cho phép tải dashboard chính của Admin gần như tức thì.
- **Cấp độ Khách sạn (HotelDailyReport):** Đóng vai trò là nguồn dữ liệu chi tiết để phân tích sâu, so sánh và xếp hạng hiệu suất giữa các đối tác.

## Phần 1: Đặc tả chi tiết các Entity Báo cáo mới (cho Admin)

### 1.1. Entity SystemDailyReport (Mới)

**Mô tả:** Đây là entity tổng hợp cấp cao nhất, là trái tim của dashboard Admin, cung cấp các chỉ số hiệu suất kinh doanh (KPIs) chính của toàn bộ nền tảng Holidate theo từng ngày.

**Các trường chính:**

- **reportDate:** `LocalDate` (Primary Key) - Đảm bảo mỗi ngày chỉ có một bản ghi tổng kết duy nhất.

- **grossRevenue:** `double` (not null, default=0)
  
  **Mô tả nghiệp vụ:** Doanh thu gộp (Gross Merchandise Value - GMV). Đây là tổng giá trị finalPrice của tất cả các booking có trạng thái COMPLETED và checkOutDate trong ngày trên toàn hệ thống. Con số này thể hiện quy mô dòng tiền giao dịch qua nền tảng.

- **netRevenue:** `double` (not null, default=0)
  
  **Mô tả nghiệp vụ:** Doanh thu ròng (lợi nhuận) của Holidate. Đây là phần hoa hồng mà Holidate thu được từ các booking. Nó được tính bằng `SUM(booking.finalPrice * hotel.commissionRate / 100)`. Đây là chỉ số tài chính cốt lõi của công ty.

- **totalBookingsCreated:** `int` (not null, default=0)
  
  **Mô tả nghiệp vụ:** Tổng số booking được tạo thành công trên toàn hệ thống trong ngày.

- **totalBookingsCompleted:** `int` (not null, default=0)
  
  **Mô tả nghiệp vụ:** Tổng số booking được hoàn thành trên toàn hệ thống trong ngày.

- **totalBookingsCancelled:** `int` (not null, default=0)
  
  **Mô tả nghiệp vụ:** Tổng số booking bị hủy trên toàn hệ thống trong ngày.

- **newCustomersRegistered:** `int` (not null, default=0)
  
  **Mô tả nghiệp vụ:** Số lượng tài khoản người dùng mới với vai trò CUSTOMER được tạo trong ngày, thể hiện sự tăng trưởng người dùng.

- **newPartnersRegistered:** `int` (not null, default=0)
  
  **Mô tả nghiệp vụ:** Số lượng tài khoản đối tác mới với vai trò PARTNER được tạo trong ngày, thể hiện sự mở rộng mạng lưới khách sạn.

- **systemAverageReviewScore:** `double` (nullable)
  
  **Mô tả nghiệp vụ:** Điểm đánh giá trung bình có trọng số của toàn bộ các đánh giá mới trong ngày. Công thức tính là `SUM(score * reviewCount) / SUM(reviewCount)` từ các khách sạn.

- **totalReviews:** `int` (not null, default=0)
  
  **Mô tả nghiệp vụ:** Tổng số lượng đánh giá mới được gửi trong ngày.

- **updatedAt:** `LocalDateTime` (not null) - Thời điểm bản ghi được cập nhật lần cuối.

### 1.2. Sửa đổi Entity Hotel (Bắt buộc)

**Mô tả:** Để thực hiện các báo cáo tài chính chính xác, hệ thống phải biết tỷ lệ hoa hồng áp dụng cho từng đối tác.

**Thêm trường mới vào Hotel:**

- **commissionRate:** `double` (not null, default=15.0)
  
  **Mô tả nghiệp vụ:** Tỷ lệ hoa hồng (dưới dạng phần trăm, ví dụ: 15.0) mà Holidate thu trên mỗi booking thành công của khách sạn này. Trường này là cơ sở để tính netRevenue.

## Phần 2: Luồng nghiệp vụ của Tác vụ nền (Mở rộng cho Admin)

Tác vụ nền hàng đêm sẽ được bổ sung một bước cuối cùng để tổng hợp dữ liệu toàn hệ thống. Bước này phải được thực hiện sau khi tác vụ đã tính toán và lưu thành công dữ liệu vào HotelDailyReport cho tất cả các khách sạn trong ngày D.

### Luồng xử lý chi tiết (bước bổ sung cho ngày D):

#### Tổng hợp từ HotelDailyReport:

1. Truy vấn tất cả các bản ghi HotelDailyReport có reportDate = D.
2. Tính `SUM(totalRevenue)` để lấy grossRevenue.
3. Tính `SUM(createdBookings)`, `SUM(completedBookings)`, `SUM(cancelledBookings)`, `SUM(reviewCount)`.

   > **Lưu ý:** HotelDailyReport còn có các field trạng thái chi tiết khác (pendingPaymentBookings, confirmedBookings, checkedInBookings, rescheduledBookings) có thể được sử dụng cho các báo cáo phân tích chi tiết theo trạng thái booking nếu cần.

4. Tính systemAverageReviewScore bằng công thức trung bình có trọng số: `SUM(averageReviewScore * reviewCount) / SUM(reviewCount)`.

#### Tính netRevenue (Lợi nhuận):

Thực hiện một truy vấn riêng, phức tạp hơn:

```sql
SELECT SUM(B.finalPrice * H.commissionRate / 100) 
FROM Booking B 
JOIN Hotel H ON B.hotelId = H.id 
WHERE B.checkOutDate = D AND B.status = 'COMPLETED'
```

#### Tổng hợp từ User:

Thực hiện hai truy vấn COUNT trên bảng User để đếm số lượng tài khoản mới được tạo trong ngày D, phân loại theo roleId (CUSTOMER và PARTNER).

#### Lưu vào Database:

Thực hiện một lệnh UPSERT (INSERT ... ON CONFLICT UPDATE) duy nhất vào bảng SystemDailyReport với khóa chính là reportDate = D và các giá trị đã tính toán ở trên.

## Phần 3: Phân tích chi tiết API và Logic Backend (cho Admin)

### API 1: Báo cáo Doanh thu tổng hợp

**Endpoint:** `GET /admin/reports/revenue`

**Logic Nghiệp vụ API:** API này cung cấp một cái nhìn đa chiều về doanh thu.

- **Mặc định (không có filterBy):** API sẽ tổng hợp grossRevenue từ SystemDailyReport trong khoảng thời gian đã chọn. Đây là con số nhanh nhất và tổng quan nhất.

- **Khi có filterBy (hotel, city, province):** Logic trở nên phức tạp hơn. API sẽ truy vấn vào HotelDailyReport, JOIN với các bảng cần thiết (Hotel, City, Province...) để lấy thông tin cho việc nhóm. Ví dụ, với filterBy=city, API sẽ GROUP BY hotel.cityId, sau đó SUM(totalRevenue) để trả về doanh thu theo từng thành phố.

**Xử lý trường hợp biên:** API cần xử lý mượt mà việc JOIN qua nhiều cấp địa lý và đảm bảo hiệu năng không bị suy giảm nghiêm trọng.

### API 2 & 3: Thống kê Đặt phòng và Hiệu suất Khách sạn

**Endpoint:** `GET /admin/reports/hotel-performance`

**Logic Nghiệp vụ API:** API này là công cụ chính để Admin đánh giá và xếp hạng các đối tác.

Nó sẽ truy vấn trên HotelDailyReport, nhóm theo hotelId, và tổng hợp các chỉ số cần thiết trong khoảng thời gian đã chọn.

Các chỉ số dẫn xuất như averageOccupancyRate và cancellationRate phải được tính động từ các tổng đã tính toán để đảm bảo độ chính xác:

- `avgOccupancy = (SUM(occupiedRoomNights) * 100.0) / SUM(totalRoomNights)`
- `cancelRate = (SUM(cancelledBookings) * 100.0) / SUM(createdBookings)`

**Yêu cầu bắt buộc:** API phải được phân trang (pagination) và cho phép sắp xếp (sorting) theo nhiều tiêu chí (revenue, occupancy, bookings...) vì số lượng khách sạn có thể rất lớn.

**Xử lý trường hợp biên:** Cần xử lý cẩn thận trường hợp chia cho 0 khi tính các tỷ lệ nếu mẫu số (ví dụ SUM(createdBookings)) bằng 0, trong trường hợp này kết quả phải trả về 0.

### API 4: Thống kê Người dùng và Hoạt động Đối tác

**Endpoint:** `GET /admin/reports/users/summary`

**Logic Nghiệp vụ API:** API này đo lường sự tăng trưởng của hệ thống về mặt cộng đồng.

- **Dữ liệu theo kỳ:** API sẽ SUM các cột newCustomersRegistered và newPartnersRegistered từ SystemDailyReport để báo cáo số lượng người dùng mới trong kỳ.

- **Dữ liệu tổng thể:** API sẽ thực hiện các truy vấn COUNT trực tiếp trên bảng User tại thời điểm gọi để lấy tổng số người dùng và đối tác hiện có. Điều này đảm bảo con số luôn là mới nhất và chính xác nhất.

### API 5: Phân tích Xu hướng

**Logic Nghiệp vụ API:** Các API này cung cấp thông tin chiến lược, giúp Admin đưa ra các quyết định kinh doanh dài hạn.

#### .../trends/seasonality (Phân tích mùa vụ)

**Logic:** Truy vấn SystemDailyReport trên một khoảng thời gian dài (tối thiểu 12-24 tháng), lấy totalBookingsCreated và grossRevenue, sau đó nhóm theo tháng (`GROUP BY DATE_TRUNC('month', reportDate)`). Kết quả giúp xác định các tháng cao điểm và thấp điểm trong năm.

#### .../trends/popular-locations (Địa điểm phổ biến)

**Logic:** Tương tự logic filterBy=city của API doanh thu, nhưng sắp xếp kết quả theo `SUM(totalRevenue)` hoặc `SUM(completedBookings)` giảm dần để tìm ra top 10-20 thành phố/tỉnh hot nhất.

#### .../trends/popular-room-types (Loại phòng được yêu thích)

**Logic:** Đây là truy vấn phức tạp. Nó cần tổng hợp bookedRoomNights từ RoomDailyPerformance, JOIN với Room để lấy các thuộc tính chung (ví dụ view, maxAdults), sau đó nhóm theo các thuộc tính này để tìm ra loại phòng nào (ví dụ: "Phòng 2 người lớn, view biển") được đặt nhiều nhất trên toàn hệ thống.

### API 6: Báo cáo Tài chính

**Endpoint:** `GET /admin/reports/financials`

**Logic Nghiệp vụ API:** API này cung cấp báo cáo tài chính cốt lõi của Holidate.

Nó tổng hợp dữ liệu từ các cột grossRevenue (doanh thu gộp) và netRevenue (lợi nhuận Holidate) của SystemDailyReport.

Chi phí trả cho đối tác (partnerPayout) không được lưu trữ mà được tính toán động tại API: `partnerPayout = grossRevenue - netRevenue`. Việc này đảm bảo tính nhất quán và không dư thừa dữ liệu.

**Xử lý trường hợp biên:** API cần làm tròn các giá trị tiền tệ đến đơn vị phù hợp (ví dụ: 2 chữ số thập phân) để tránh sai số trong tính toán và hiển thị.

### API 7: So sánh hiệu suất giữa các kỳ

**Logic Nghiệp vụ API:** Cơ chế này được triển khai như một tầng logic (wrapper) áp dụng cho tất cả các API báo cáo của Admin. Khi các tham số compareFrom và compareTo được cung cấp, service tương ứng sẽ gọi logic lấy dữ liệu gốc hai lần, một lần cho kỳ hiện tại và một lần cho kỳ so sánh, sau đó tính toán sự chênh lệch và phần trăm thay đổi trước khi trả về. Thiết kế này giúp tối đa hóa việc tái sử dụng code và giữ cho logic báo cáo cốt lõi được độc lập.

