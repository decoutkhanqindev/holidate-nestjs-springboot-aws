Chắc chắn rồi. Chúng ta sẽ tiếp tục phân tích sâu vào **Phần 3, API 4: Hiệu suất phòng**, theo định dạng Markdown, với sự tập trung tối đa vào đặc tả nghiệp vụ và logic backend chi tiết.

---

### API 4: Hiệu suất phòng (Room Performance)

#### Mục tiêu nghiệp vụ

API này cung cấp cho đối tác một công cụ phân tích chi tiết, giúp họ "bóc tách" hiệu quả kinh doanh của từng loại phòng. Mục tiêu là để trả lời các câu hỏi mang tính chiến lược:

- **Xác định "Ngôi sao" (Stars):** Loại phòng nào đang mang lại nhiều doanh thu nhất?
- **Xác định "Bò sữa" (Cash Cows):** Loại phòng nào được đặt nhiều đêm nhất, bất kể giá cả? (thể hiện sự ưa chuộng)
- **Xác định "Dấu hỏi" (Question Marks):** Loại phòng nào có hiệu suất thấp cả về doanh thu và số đêm đặt, cần được xem xét cải thiện hoặc thay đổi chiến lược giá/marketing?
- **Tối ưu hóa Doanh thu:** Dữ liệu này là cơ sở để đối tác quyết định điều chỉnh giá, chạy các chương trình khuyến mãi nhắm vào các loại phòng cụ thể, hoặc lên kế hoạch nâng cấp cơ sở vật chất.

#### Endpoint và Parameters

- **Endpoint:** `GET /partner/reports/rooms/performance`
- **Parameters:**
  - `hotelId` (`UUID`, required): ID của khách sạn, được lấy một cách an toàn từ context của người dùng đã được xác thực.
  - `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo.
  - `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo.
  - `sortBy` (`string`, optional, enum: `revenue`, `bookedRoomNights`, default: `revenue`): Tiêu chí để sắp xếp kết quả. Mặc định là sắp xếp theo doanh thu cao nhất.
  - `sortOrder` (`string`, optional, enum: `asc`, `desc`, default: `desc`): Thứ tự sắp xếp. Mặc định là giảm dần để hiển thị các phòng có hiệu suất cao nhất lên đầu.

#### Nguồn dữ liệu

- **Bảng chính:** `RoomDailyPerformance`.
- **Bảng phụ (JOIN):** `Room`. Bảng này là bắt buộc để lấy các thông tin mô tả mà người dùng có thể hiểu được, như `name`, `view`, `area`...
- **Nguyên tắc:** Dữ liệu hiệu suất cốt lõi (`revenue`, `bookedRoomNights`) được tổng hợp từ `RoomDailyPerformance`. API không bao giờ truy vấn trực tiếp vào `Booking`.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - **Xác thực và Ủy quyền (Authentication & Authorization):** Xác thực token của người dùng và kiểm tra role là `PARTNER`. Nếu không, trả về lỗi `403 Forbidden`.
    - **Validation (Kiểm tra tính hợp lệ của tham số):** Kiểm tra định dạng và thứ tự của `from` và `to`. Đặc biệt, cần kiểm tra giá trị của `sortBy` và `sortOrder` phải nằm trong danh sách enum đã định nghĩa để tránh các giá trị không hợp lệ.
    - Nếu hợp lệ, gọi phương thức xử lý trong `Service Layer`.

2.  **Service Layer (Tầng nghiệp vụ):**

    - Logic ở tầng này tương đối đơn giản, chủ yếu là điều phối.
    - **Gọi Repository:** Gọi một phương thức duy nhất trong `Repository Layer`, ví dụ `repository.getRoomPerformance(hotelId, from, to, sortBy, sortOrder)`. Toàn bộ logic tổng hợp, nối bảng và sắp xếp được ủy thác cho tầng cơ sở dữ liệu để đạt hiệu năng tối ưu.
    - **Xử lý kết quả:** Repository sẽ trả về một danh sách các đối tượng (ví dụ: `List<RoomPerformanceDto>`) đã được tính toán và sắp xếp sẵn. Service Layer có thể thực hiện thêm các bước làm giàu dữ liệu nếu cần (ví dụ: tính toán thêm chỉ số `averageRevenuePerNight = totalRevenue / totalBookedNights`) trước khi trả về.
    - **Định dạng Dữ liệu trả về:** Đóng gói danh sách kết quả vào cấu trúc phản hồi cuối cùng.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    - Đây là nơi thực thi truy vấn tổng hợp phức tạp và quan trọng nhất.
    - **Xây dựng truy vấn động:** Truy vấn cần được xây dựng một cách linh hoạt để xử lý việc sắp xếp theo các tiêu chí khác nhau.
      ```sql
      SELECT
          r.id AS roomId,
          r.name AS roomName,
          r.view AS roomView, -- Lấy thêm các thông tin mô tả khác nếu cần
          SUM(rdp.revenue) AS totalRevenue,
          SUM(rdp.bookedRoomNights) AS totalBookedNights
      FROM
          RoomDailyPerformance rdp
      JOIN
          Room r ON rdp.roomId = r.id
      WHERE
          r.hotelId = :hotelId AND rdp.reportDate BETWEEN :from AND :to
      GROUP BY
          r.id, r.name, r.view
      ORDER BY
          -- Mệnh đề ORDER BY này được xây dựng động trong code
          CASE WHEN :sortBy = 'revenue' THEN SUM(rdp.revenue) END DESC,
          CASE WHEN :sortBy = 'bookedRoomNights' THEN SUM(rdp.bookedRoomNights) END DESC;
      ```
    - **Lưu ý an ninh:** Việc xây dựng mệnh đề `ORDER BY` động phải được thực hiện một cách an toàn, chỉ sử dụng các giá trị đã được kiểm tra (từ enum `sortBy`) để tránh lỗ hổng SQL Injection.

#### Xử lý nghiệp vụ và các trường hợp biên

- **Phòng không có hoạt động:** Các phòng có tồn tại trong hệ thống nhưng không có bất kỳ doanh thu hay đêm đặt nào trong kỳ báo cáo sẽ **không** xuất hiện trong kết quả trả về. Điều này là hợp lý về mặt nghiệp vụ vì đối tác chỉ quan tâm đến những phòng có phát sinh hiệu suất. Truy vấn sử dụng `JOIN` (mặc định là `INNER JOIN`) sẽ tự động xử lý việc này.

- **Độ chi tiết của "Phòng":** Cần làm rõ rằng báo cáo này phân tích hiệu suất của **loại phòng** (ví dụ: "Deluxe King Sea View") chứ không phải từng **phòng vật lý** (ví dụ: "Phòng số 101", "Phòng số 102"). Toàn bộ logic được nhóm theo `roomId`, vốn là định danh cho một loại phòng.

- **Không có dữ liệu (No Data Found):** Nếu khách sạn không có bất kỳ hoạt động nào cho tất cả các phòng trong kỳ, API sẽ trả về `200 OK` với một mảng rỗng.

#### Tái sử dụng cho chức năng so sánh

- Việc so sánh hiệu suất phòng giữa các kỳ phức tạp hơn so với các chỉ số đơn lẻ. Logic wrapper sẽ cần:
  1.  Gọi phương thức `getRoomPerformance(...)` hai lần để lấy hai danh sách (`currentPeriodList` và `previousPeriodList`).
  2.  Trong Service Layer, thực hiện một thao tác "merge" hai danh sách này dựa trên `roomId`.
  3.  Với mỗi phòng, tạo một đối tượng DTO mới chứa cả hiệu suất của kỳ hiện tại, hiệu suất của kỳ trước (có thể là 0 nếu phòng đó không có hoạt động trong kỳ trước), và các chỉ số so sánh (`difference`, `percentageChange`) cho cả `totalRevenue` và `totalBookedNights`.
  4.  Kết quả cuối cùng là một danh sách duy nhất, được làm giàu với dữ liệu so sánh.
