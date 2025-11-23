Tuyệt vời. **API 5: Phân tích Xu hướng** là tập hợp các chức năng nâng cao nhất, chuyển từ việc báo cáo "cái gì đã xảy ra" sang việc phân tích "tại sao và như thế nào". Chúng ta sẽ phân tích chi tiết từng endpoint trong nhóm này.

---

## Phần 3: Phân tích chi tiết API và Logic Backend (cho Admin)

### API 5: Phân tích Xu hướng (Trend Analysis)

#### Mục tiêu nghiệp vụ

Nhóm API này không chỉ cung cấp dữ liệu mà còn cung cấp **thông tin tình báo kinh doanh (Business Intelligence)**. Chúng được thiết kế để phát hiện các mẫu hình, quy luật và xu hướng ẩn trong dữ liệu lịch sử, giúp ban lãnh đạo và các bộ phận chiến lược đưa ra quyết định dựa trên dữ liệu (data-driven decisions). Cụ thể:

- **Phân tích Mùa vụ:** Giúp bộ phận marketing và pricing xác định các mùa cao điểm (để tối ưu giá) và mùa thấp điểm (để tung ra các chiến dịch kích cầu).
- **Phân tích Địa điểm:** Giúp bộ phận phát triển kinh doanh xác định các thị trường trọng điểm, các khu vực đang phát triển nóng cần tập trung nguồn lực để mở rộng mạng lưới đối tác.
- **Phân tích Sản phẩm:** Giúp bộ phận sản phẩm và marketing hiểu được loại hình lưu trú nào đang được khách hàng ưa chuộng nhất, từ đó định hướng cho việc tuyển chọn đối tác mới và xây dựng các gói sản phẩm hấp dẫn.

#### Kiến trúc và Thiết kế Logic

Đây là một nhóm các API chuyên biệt, mỗi API tập trung vào một chiều phân tích khác nhau. Chúng đều dựa trên nguyên tắc tổng hợp dữ liệu từ các bảng báo cáo đã có để đảm bảo hiệu năng.

---

#### 5.1 Phân tích Mùa vụ (Seasonality)

- **Endpoint:** `GET /admin/reports/trends/seasonality`
- **Parameters:**
  - `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu. Để phân tích mùa vụ hiệu quả, khoảng thời gian này nên kéo dài ít nhất 12 tháng, lý tưởng là 24-36 tháng để so sánh giữa các năm.
  - `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc.
  - `metric` (`string`, optional, enum: `revenue`, `bookings`, default: `bookings`): Chỉ số dùng để phân tích (doanh thu hoặc số lượng booking).
- **Nguồn dữ liệu:** `SystemDailyReport`.
- **Luồng xử lý Backend:**
  1.  **Controller:** **Xác thực và Ủy quyền (Authentication & Authorization):** Xác thực token của người dùng và kiểm tra role là `ADMIN`. Nếu không, trả về lỗi `403 Forbidden`. **Validation:** Kiểm tra tính hợp lệ của tham số.
  2.  **Service:** Gọi phương thức repository tương ứng.
  3.  **Repository:** Thực thi truy vấn tổng hợp theo tháng.
      ```sql
      SELECT
          DATE_TRUNC('month', reportDate)::date AS month,
          -- Xây dựng động dựa trên tham số 'metric'
          SUM(grossRevenue) AS totalRevenue, -- if metric is 'revenue'
          SUM(totalBookingsCreated) AS totalBookings -- if metric is 'bookings'
      FROM
          SystemDailyReport
      WHERE
          reportDate BETWEEN :from AND :to
      GROUP BY
          month
      ORDER BY
          month ASC;
      ```
- **Xử lý nghiệp vụ:** Kết quả trả về là một chuỗi thời gian theo từng tháng, rất lý tưởng để vẽ biểu đồ đường hoặc biểu đồ cột, cho phép Admin nhìn thấy rõ các đỉnh (mùa cao điểm) và đáy (mùa thấp điểm) trong chu kỳ kinh doanh.

---

#### 5.2 Địa điểm Phổ biến (Popular Locations)

- **Endpoint:** `GET /admin/reports/trends/popular-locations`
- **Parameters:**
  - `from`, `to` (`string`, `YYYY-MM-DD`, required).
  - `level` (`string`, optional, enum: `city`, `province`, default: `city`): Cấp độ địa lý cần phân tích.
  - `metric` (`string`, optional, enum: `revenue`, `bookings`, default: `revenue`): Tiêu chí để xếp hạng.
  - `limit` (`int`, optional, default: `10`): Số lượng kết quả hàng đầu cần lấy (ví dụ: top 10).
- **Nguồn dữ liệu:** `HotelDailyReport`, `Hotel`, `City`, `Province`.
- **Luồng xử lý Backend:**
  1.  **Controller & Service:** Tương tự các API khác.
  2.  **Repository:** Xây dựng một truy vấn `JOIN` và `GROUP BY` động.
      ```sql
      -- Ví dụ cho level='city', metric='revenue'
      SELECT
          c.id AS locationId,
          c.name AS locationName,
          SUM(hdr.totalRevenue) AS totalRevenue
          -- SUM(hdr.completedBookings) AS totalBookings (nếu metric là 'bookings')
      FROM
          HotelDailyReport hdr
      JOIN
          Hotel h ON hdr.hotelId = h.id
      JOIN
          City c ON h.cityId = c.id
      WHERE
          hdr.reportDate BETWEEN :from AND :to
      GROUP BY
          c.id, c.name
      ORDER BY
          totalRevenue DESC -- Sắp xếp theo chỉ số đã chọn
      LIMIT :limit; -- Giới hạn số lượng kết quả
      ```
- **Xử lý nghiệp vụ:** API này trả về một danh sách xếp hạng rõ ràng. Có thể cân nhắc thêm một bước tính toán tổng của N kết quả hàng đầu và tổng của "Phần còn lại" (Others) để Admin biết được top 10 thành phố đang chiếm bao nhiêu phần trăm tổng doanh thu.

---

#### 5.3 Loại phòng được yêu thích (Popular Room Types)

- **Endpoint:** `GET /admin/reports/trends/popular-room-types`
- **Parameters:**
  - `from`, `to` (`string`, `YYYY-MM-DD`, required).
  - `groupBy` (`string`, optional, enum: `view`, `bedType`, `occupancy`, default: `occupancy`): Thuộc tính của phòng dùng để nhóm.
  - `limit` (`int`, optional, default: `10`).
- **Nguồn dữ liệu:** `RoomDailyPerformance`, `Room`, `BedType`.
- **Luồng xử lý Backend:**
  1.  **Controller & Service:** Tương tự.
  2.  **Repository:** Đây là truy vấn phức tạp nhất, đòi hỏi `JOIN` sâu hơn.
      ```sql
      -- Ví dụ cho groupBy='occupancy'
      SELECT
          -- Nhóm theo sức chứa người lớn và trẻ em
          CONCAT(r.maxAdults, ' Adults, ', r.maxChildren, ' Children') AS roomCategory,
          SUM(rdp.bookedRoomNights) AS totalBookedNights
      FROM
          RoomDailyPerformance rdp
      JOIN
          Room r ON rdp.roomId = r.id
      WHERE
          rdp.reportDate BETWEEN :from AND :to
      GROUP BY
          roomCategory
      ORDER BY
          totalBookedNights DESC
      LIMIT :limit;
      ```
- **Xử lý nghiệp vụ:**
  - **Định nghĩa "Loại phòng":** "Loại phòng" không phải là `room.name` vì tên có thể rất đa dạng. Thay vào đó, chúng ta nhóm theo các thuộc tính chung như `view`, `bedType`, hoặc sức chứa (`maxAdults`, `maxChildren`). Điều này giúp tìm ra các mẫu hình thực sự, ví dụ: "Phòng cho 2 người lớn" là phổ biến nhất, bất kể tên gọi là gì.
  - **Hiệu năng:** Đây có thể là truy vấn nặng nhất trong các API báo cáo. Việc `GROUP BY` trên các chuỗi được tạo động (`CONCAT`) có thể tốn tài nguyên. Cần đảm bảo `RoomDailyPerformance` được đánh index tốt. Có thể cân nhắc việc thêm các trường chuẩn hóa (ví dụ: `occupancyCategory`) vào `Room` để việc nhóm hiệu quả hơn.

#### Xử lý trường hợp biên chung

- **Khoảng thời gian không đủ dữ liệu:** Đối với phân tích mùa vụ, nếu người dùng chọn một khoảng thời gian quá ngắn (ví dụ: 1 tháng), API nên trả về kết quả nhưng có thể kèm theo một cảnh báo hoặc thông báo trong metadata rằng dữ liệu không đủ để phân tích xu hướng dài hạn.
- **Dữ liệu thưa thớt:** Đối với phân tích loại phòng, có thể có rất nhiều loại phòng chỉ được đặt vài lần. Việc sử dụng `LIMIT` là rất quan trọng để chỉ tập trung vào các xu hướng có ý nghĩa thống kê.
