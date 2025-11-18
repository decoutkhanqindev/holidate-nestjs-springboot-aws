Chắc chắn rồi. Dựa trên file yêu cầu cho Admin, tôi sẽ phân tích và đặc tả chi tiết lại **Phần 2: Luồng nghiệp vụ của Tác vụ nền (Mở rộng cho Admin)** theo đúng định dạng Markdown, tập trung vào việc làm rõ các bước, lý do đằng sau các quyết định thiết kế và các yêu cầu nghiệp vụ chi tiết.

---

## Phần 2: Luồng nghiệp vụ của Tác vụ nền (Mở rộng cho Admin)

### Tổng quan và Vị trí trong Hệ thống

Tác vụ tổng hợp dữ liệu cho Admin là bước cuối cùng và quan trọng nhất trong chuỗi xử lý báo cáo hàng đêm. Nó được thiết kế để chạy **sau khi** Tác vụ nền cho Partner đã hoàn thành việc tính toán và điền dữ liệu vào `HotelDailyReport` cho tất cả các khách sạn. Luồng dữ liệu có thể được hình dung như sau:

`Bảng Giao dịch (Booking, Review, User)` → `Tác vụ Partner` → `HotelDailyReport` → `Tác vụ Admin` → `SystemDailyReport`

Sự tách biệt này đảm bảo tính module hóa, dễ dàng gỡ lỗi và cho phép chạy lại tác vụ của Admin một cách độc lập nếu cần, miễn là dữ liệu ở cấp độ `HotelDailyReport` đã chính xác.

### Nguyên tắc thiết kế

Tác vụ này tuân thủ các nguyên tắc kỹ thuật nghiêm ngặt để đảm bảo sự ổn định và chính xác của dữ liệu báo cáo cấp cao nhất:

- **Tính Phụ thuộc (Dependency):** Tác vụ chỉ được phép bắt đầu khi tác vụ của Partner cho cùng ngày báo cáo đã chạy thành công. Cần có một cơ chế kiểm tra trạng thái hoặc cờ hiệu (flag) để đảm bảo điều này.
- **Tính Toàn vẹn Giao dịch (Transactional Integrity):** Toàn bộ quá trình tính toán và ghi dữ liệu vào `SystemDailyReport` cho một ngày phải được bao bọc trong một **giao dịch (transaction)** duy nhất. Nếu bất kỳ lỗi nào xảy ra, toàn bộ giao dịch sẽ được `ROLLBACK`, đảm bảo `SystemDailyReport` không bao giờ ở trạng thái dữ liệu không nhất quán.
- **Tính Idempotent (Idempotency):** Việc chạy lại tác vụ cho cùng một ngày phải luôn ghi đè kết quả cũ, đảm bảo kết quả cuối cùng luôn chính xác. Logic `UPSERT` dựa trên khóa chính `reportDate` là bắt buộc.
- **Hiệu năng (Performance):** Tác vụ được tối ưu để thực hiện các phép tính tổng hợp trên các tập dữ liệu lớn một cách hiệu quả, chủ yếu dựa vào sức mạnh xử lý của cơ sở dữ liệu thay vì xử lý logic trong mã ứng dụng.

### Luồng xử lý chi tiết cho ngày `D`

#### Bước 0: Kiểm tra Điều kiện tiên quyết và Bắt đầu Giao dịch

- **Kiểm tra:** Xác minh rằng tác vụ của Partner cho ngày `D` đã hoàn thành thành công.
- **Khởi tạo:** Xác định ngày báo cáo `D` (ví dụ: `LocalDate.now().minusDays(1)`).
- **Bắt đầu Giao dịch:** Mở một giao dịch cơ sở dữ liệu mới.

#### Bước 1: Tổng hợp Dữ liệu từ `HotelDailyReport`

- **Mục tiêu:** Tính toán tất cả các chỉ số có thể suy ra trực tiếp từ dữ liệu đã được tổng hợp sẵn ở cấp khách sạn.
- **Logic:** Thực hiện một truy vấn tổng hợp duy nhất trên bảng `HotelDailyReport` với điều kiện `WHERE reportDate = D`.
  - `grossRevenue` ← `SUM(totalRevenue)`
  - `totalBookingsCreated` ← `SUM(createdBookings)`
  - `totalBookingsCompleted` ← `SUM(completedBookings)`
  - `totalBookingsCancelled` ← `SUM(cancelledBookings)`
  - `totalReviews` ← `SUM(reviewCount)`
  - **Trung bình có trọng số cho điểm đánh giá:**
    - Tính `totalWeightedScore` ← `SUM(averageReviewScore * reviewCount)`
    - `systemAverageReviewScore` sẽ được tính ở tầng ứng dụng sau khi có `totalReviews`: `totalWeightedScore / totalReviews`. Phải xử lý trường hợp `totalReviews` bằng 0.

#### Bước 2: Tính toán `netRevenue` (Lợi nhuận)

- **Mục tiêu:** Tính toán doanh thu ròng của Holidate, một chỉ số tài chính cốt lõi.
- **Lý do cần truy vấn riêng:** Việc tính toán này yêu cầu thông tin `commissionRate` từ bảng `Hotel`, vốn không có trong `HotelDailyReport` để tránh dư thừa dữ liệu. Do đó, một truy vấn riêng biệt vào các bảng giao dịch là cần thiết và hợp lý.
- **Logic:** Thực thi một truy vấn JOIN hiệu năng cao:
  ```sql
  SELECT SUM(B.finalPrice * H.commissionRate / 100)
  FROM Booking B
  JOIN Hotel H ON B.hotelId = H.id
  WHERE B.checkOutDate = D AND B.status = 'COMPLETED';
  ```
- **Yêu cầu về hiệu năng:** Cần đảm bảo các cột `Booking.checkOutDate`, `Booking.status`, và các cột khóa ngoại đã được đánh index để truy vấn này chạy nhanh ngay cả trên bảng `Booking` lớn.

#### Bước 3: Tổng hợp Dữ liệu Người dùng Mới

- **Mục tiêu:** Đo lường sự tăng trưởng người dùng và đối tác của nền tảng.
- **Lý do cần truy vấn riêng:** Việc đăng ký người dùng là một sự kiện hệ thống, độc lập với hoạt động của từng khách sạn, do đó không thể suy ra từ `HotelDailyReport`.
- **Logic:** Thực hiện hai truy vấn `COUNT` riêng biệt và hiệu quả trên bảng `User`:
  1.  `newCustomersRegistered` ← `SELECT COUNT(id) FROM User WHERE roleId = [CUSTOMER_ROLE_ID] AND createdAt >= D AND createdAt < D+1`
  2.  `newPartnersRegistered` ← `SELECT COUNT(id) FROM User WHERE roleId = [PARTNER_ROLE_ID] AND createdAt >= D AND createdAt < D+1`
- **Yêu cầu về hiệu năng:** Cần có một index kết hợp trên các cột `(createdAt, roleId)` của bảng `User` để tối ưu hóa các truy vấn này.

#### Bước 4: Ghi Dữ liệu vào `SystemDailyReport` (UPSERT)

- **Tổng hợp kết quả:** Tập hợp tất cả các giá trị đã tính toán từ Bước 1, 2, và 3 vào một đối tượng `SystemDailyReport` duy nhất cho ngày `D`.
- **Thực thi `UPSERT`:**
  - Sử dụng một lệnh `UPSERT` (ví dụ: `INSERT ... ON CONFLICT (reportDate) DO UPDATE SET ...`) để ghi đối tượng này vào cơ sở dữ liệu.
  - Mệnh đề `ON CONFLICT` đảm bảo nếu tác vụ được chạy lại, bản ghi của ngày `D` sẽ được cập nhật thay vì tạo mới, đảm bảo tính idempotent.

#### Bước 5: Hoàn tất Giao dịch và Xử lý Lỗi

- **Thành công:** Nếu Bước 4 thực thi mà không có lỗi, tiến hành `COMMIT` giao dịch. Dữ liệu báo cáo tổng hợp cho ngày `D` chính thức được xác nhận và sẵn sàng để các API của Admin sử dụng.
- **Thất bại:** Nếu có bất kỳ ngoại lệ nào xảy ra ở bất kỳ bước nào, toàn bộ giao dịch sẽ được `ROLLBACK`.
  - **Ghi log:** Hệ thống phải ghi lại một log lỗi chi tiết, bao gồm ngày báo cáo (`D`), thông báo lỗi cụ thể, và stack trace.
  - **Thông báo:** Cân nhắc việc gửi thông báo (email, Slack, etc.) đến đội ngũ kỹ thuật để họ có thể điều tra và khắc phục sự cố kịp thời.
