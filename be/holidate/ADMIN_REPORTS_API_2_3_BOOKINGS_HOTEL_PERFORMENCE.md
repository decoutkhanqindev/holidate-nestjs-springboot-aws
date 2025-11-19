Chắc chắn rồi. Chúng ta sẽ cùng nhau phân tích chi tiết **Phần 3, API 2 & 3: Thống kê Đặt phòng và Hiệu suất Khách sạn**. Tôi sẽ gộp hai mục này làm một vì chúng có cùng mục tiêu cốt lõi: đánh giá và so sánh hiệu suất giữa các đối tác.

---

## Phần 3: Phân tích chi tiết API và Logic Backend (cho Admin)

### API 2 & 3: Báo cáo Hiệu suất Khách sạn

#### Mục tiêu nghiệp vụ

Đây là API quản trị cốt lõi, cung cấp cho Admin một "bảng xếp hạng" (leaderboard) toàn diện về tất cả các đối tác trên nền tảng. Mục tiêu của nó là biến dữ liệu thô thành công cụ quản lý hiệu quả, giúp Admin:

- **Xác định Đối tác Hàng đầu (Top Performers):** Nhanh chóng nhận diện các khách sạn đang mang lại nhiều doanh thu nhất, có tỷ lệ lấp đầy cao nhất, hoặc có nhiều lượt đặt phòng nhất.
- **Phát hiện Đối tác cần Hỗ trợ (Underperformers):** Dễ dàng lọc ra các khách sạn có hiệu suất thấp, tỷ lệ hủy phòng cao, để đội ngũ quản lý đối tác có thể tiếp cận và hỗ trợ kịp thời.
- **So sánh và Phân tích Cạnh tranh:** Cho phép so sánh hiệu suất giữa các khách sạn trong cùng một thành phố hoặc cùng một phân khúc sao.
- **Đánh giá Sức khỏe Toàn diện:** Cung cấp một bộ chỉ số đa dạng (tài chính, vận hành, khách hàng) thay vì chỉ nhìn vào doanh thu, giúp có một cái nhìn toàn diện về hiệu quả hoạt động của từng đối tác.

#### Endpoint và Parameters

- **Endpoint:** `GET /admin/reports/hotel-performance`
- **Parameters:**
  - `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo.
  - `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo.
  - `sortBy` (`string`, optional, enum: `revenue`, `occupancy`, `bookings`, `cancellationRate`, default: `revenue`): Tiêu chí chính để sắp xếp bảng xếp hạng.
  - `sortOrder` (`string`, optional, enum: `asc`, `desc`, default: `desc`): Thứ tự sắp xếp.
  - `page` (`int`, optional, default: `0`): Số trang (dành cho phân trang).
  - `size` (`int`, optional, default: `20`): Số lượng kết quả mỗi trang.
  - `cityId`, `provinceId` (`UUID`, optional): Các tham số lọc để chỉ xem hiệu suất của các khách sạn trong một khu vực địa lý cụ thể.

#### Nguồn dữ liệu

- **Bảng chính:** `HotelDailyReport`.
- **Bảng phụ (JOIN):** `Hotel` (để lấy `hotelName` và các thông tin mô tả khác).
- **Nguyên tắc:** Toàn bộ logic tính toán đều dựa trên dữ liệu đã được tổng hợp ở cấp độ khách sạn. API này tận dụng triệt để sức mạnh của `HotelDailyReport` để thực hiện các phép tính tổng hợp phức tạp một cách hiệu quả.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - **Xác thực và Ủy quyền (Authentication & Authorization):** Xác thực token của người dùng và kiểm tra role là `ADMIN`. Nếu không, trả về lỗi `403 Forbidden`.
    - **Validation:** Kiểm tra tính hợp lệ của tất cả các tham số, bao gồm cả các tham số phân trang, sắp xếp và lọc.
    - Gọi phương thức trong `Service Layer`.

2.  **Service Layer (Tầng nghiệp vụ):**

    - **Gọi Repository:** Gọi một phương thức duy nhất trong Repository, ví dụ `repository.getHotelPerformance(filterDto)`, trong đó `filterDto` là một đối tượng chứa tất cả các tham số (phân trang, sắp xếp, lọc).
    - **Tính toán Chỉ số Dẫn xuất:**
      - Mặc dù phần lớn việc tính toán được thực hiện ở tầng DB, Service Layer có thể chịu trách nhiệm tính toán cuối cùng các tỷ lệ từ các giá trị `SUM` mà Repository trả về. Điều này đôi khi giúp mã nguồn rõ ràng hơn.
      - Ví dụ, Repository trả về `sumOccupiedRoomNights` và `sumTotalRoomNights`, Service sẽ tính `averageOccupancyRate`.
    - **Đóng gói Dữ liệu Phân trang:** Tạo một đối tượng phản hồi chuẩn cho việc phân trang, bao gồm danh sách dữ liệu cho trang hiện tại và các thông tin meta như `page`, `size`, `totalPages`, `totalElements`.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    - Đây là nơi xử lý logic truy vấn phức tạp nhất.
    - **Bước 1: Xây dựng truy vấn con (CTE - Common Table Expression) để tổng hợp chỉ số:**
      ```sql
      WITH HotelPerformanceSummary AS (
          SELECT
              hdr.hotelId,
              SUM(hdr.totalRevenue) AS totalRevenue,
              SUM(hdr.completedBookings) AS totalCompletedBookings,
              SUM(hdr.cancelledBookings) AS totalCancelledBookings,
              SUM(hdr.createdBookings) AS totalCreatedBookings,
              SUM(hdr.occupiedRoomNights) AS sumOccupiedRoomNights,
              SUM(hdr.totalRoomNights) AS sumTotalRoomNights
          FROM
              HotelDailyReport hdr
          WHERE
              hdr.reportDate BETWEEN :from AND :to
          GROUP BY
              hdr.hotelId
      )
      ```
    - **Bước 2: Truy vấn chính để tính toán, lọc, sắp xếp và phân trang:**
      ````sql
      SELECT
          h.id AS hotelId,
          h.name AS hotelName,
          s.totalRevenue,
          s.totalCompletedBookings,
          -- Tính toán các chỉ số dẫn xuất
          (s.sumOccupiedRoomNights * 100.0 / NULLIF(s.sumTotalRoomNights, 0)) AS averageOccupancyRate,
          (s.totalCancelledBookings * 100.0 / NULLIF(s.totalCreatedBookings, 0)) AS cancellationRate
      FROM
          HotelPerformanceSummary s
      JOIN
          Hotel h ON s.hotelId = h.id
      WHERE
          -- Áp dụng các điều kiện lọc (ví dụ: h.cityId = :cityId)
          (:cityId IS NULL OR h.cityId = :cityId)
      ORDER BY
          -- Áp dụng sắp xếp động
          CASE WHEN :sortBy = 'revenue' THEN s.totalRevenue END DESC,
          CASE WHEN :sortBy = 'occupancy' THEN averageOccupancyRate END DESC,
          ...
      LIMIT :size OFFSET :page * :size;
      ```    -   **Truy vấn đếm tổng số phần tử:** Cần một truy vấn riêng (không có `LIMIT`/`OFFSET`) để đếm tổng số khách sạn thỏa mãn điều kiện lọc, phục vụ cho việc tính `totalPages`.
      ````

#### Xử lý nghiệp vụ và các trường hợp biên

- **Sử dụng `NULLIF`:** Việc sử dụng `NULLIF(denominator, 0)` trong các phép chia là một kỹ thuật quan trọng trong SQL để tự động xử lý trường hợp chia cho 0. Nếu mẫu số bằng 0, `NULLIF` trả về `NULL`, và kết quả của toàn bộ phép chia cũng là `NULL`. Service Layer sau đó có thể chuyển đổi `NULL` thành `0.0`.
- **Phân trang (Pagination) là Bắt buộc:** Do số lượng khách sạn có thể rất lớn, việc thiếu phân trang sẽ dẫn đến các vấn đề nghiêm trọng về hiệu năng và bộ nhớ.
- **Hiệu năng Sắp xếp:** Việc sắp xếp trên các cột được tính toán động (`averageOccupancyRate`, `cancellationRate`) có thể ảnh hưởng đến hiệu năng. Cơ sở dữ liệu thường có thể xử lý tốt việc này, nhưng cần được theo dõi. CTE giúp tổ chức truy vấn sạch sẽ và thường được tối ưu hóa tốt bởi query planner.
- **Tính nhất quán của Dữ liệu:** Kết quả của API này phản ánh hiệu suất trong khoảng thời gian đã chọn dựa trên dữ liệu đã được tổng hợp đến hết ngày hôm qua.

#### Tái sử dụng cho chức năng so sánh

- Việc so sánh hiệu suất của một danh sách khách sạn rất phức tạp và thường không được thực hiện trong một API duy nhất.
- Cách tiếp cận phổ biến hơn là cho phép người dùng xem báo cáo hiệu suất của hai kỳ khác nhau (bằng cách gọi API này hai lần với hai bộ tham số ngày), và giao diện người dùng sẽ hiển thị hai bảng xếp hạng song song để so sánh.
- Một giải pháp nâng cao có thể là tạo một API so sánh chuyên dụng, thực hiện logic "merge" hai danh sách hiệu suất và tính toán sự thay đổi thứ hạng (`rankChange`) cho mỗi khách sạn, nhưng điều này đòi hỏi xử lý logic phức tạp ở Service Layer.
