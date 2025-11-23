Chắc chắn rồi. Dựa trên đề xuất trước đó và tuân thủ nghiêm ngặt theo cấu trúc file Markdown bạn đã cung cấp, dưới đây là bản đặc tả chi tiết cho API mới: **Bảng điều khiển Vận hành Tổng quan**.

---

## Phần 3: Phân tích chi tiết API và Logic Backend

### API 8: Bảng điều khiển Vận hành Tổng quan (Operational Dashboard)

#### Mục tiêu nghiệp vụ

API này đóng vai trò là "trung tâm chỉ huy" hàng ngày cho đối tác, cung cấp một cái nhìn tổng quan, **gần như thời gian thực**, về các hoạt động vận hành cốt lõi của khách sạn. Khác với các API báo cáo lịch sử, mục tiêu của nó không phải là phân tích quá khứ mà là hỗ trợ ra quyết định **ngay lập tức**, giúp đối tác trả lời các câu hỏi:

-   "Hôm nay có bao nhiêu khách đến, bao nhiêu khách đi?"
-   "Tình hình các đặt phòng hiện tại như thế nào (chờ thanh toán, đã xác nhận...)?"
-   "Tình trạng sẵn sàng của các phòng ra sao?"
-   "Tôi cần chuẩn bị cho lượng khách như thế nào trong vài ngày tới?"

Dữ liệu từ API này là cơ sở để đối tác điều phối nhân sự (lễ tân, buồng phòng), quản lý tồn kho phòng và chuẩn bị dịch vụ một cách hiệu quả.

#### Endpoint và Parameters

-   **Endpoint:** `GET /partner/dashboard/summary`
-   **Parameters:**
    -   `hotelId` (`UUID`, required): ID của khách sạn. Tham số này phải được lấy từ context của người dùng đã xác thực (JWT token) và không được phép truyền qua query param để đảm bảo an ninh.
    -   `forecastDays` (`int`, optional, default: `7`): Số ngày dự báo sắp tới mà đối tác muốn xem. Giá trị nên được giới hạn (ví dụ: tối đa 30 ngày) để tránh các truy vấn quá nặng.

#### Nguồn dữ liệu

-   **Bảng chính:** `Booking`, `Room`.
-   **Quyết định thiết kế:** API này **BẮT BUỘC** phải truy vấn trực tiếp vào các bảng giao dịch. Lý do là vì các chỉ số vận hành (khách sắp đến, tình trạng phòng...) đòi hỏi dữ liệu mới nhất, không thể chờ Tác vụ nền chạy vào ban đêm.
-   **Đảm bảo hiệu năng:** Hiệu năng vẫn được đảm bảo vì tất cả các truy vấn đều được lọc chặt chẽ theo một `hotelId` duy nhất và các cột được truy vấn (`status`, `checkInDate`, `checkOutDate`) phải được **đánh index** cẩn thận.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    -   Tiếp nhận yêu cầu HTTP `GET`.
    -   **Xác thực và Ủy quyền (Authentication & Authorization):**
        -   Xác thực token và kiểm tra vai trò `PARTNER`.
    -   **Validation (Kiểm tra tính hợp lệ của tham số):**
        -   Kiểm tra `forecastDays` (nếu có) phải là một số nguyên dương và nằm trong giới hạn cho phép (ví dụ: 1 đến 30).
    -   Gọi một phương thức cấp cao duy nhất trong `Service Layer`, ví dụ `getDashboardSummary(hotelId, forecastDays)`.

2.  **Service Layer (Tầng nghiệp vụ):**

    -   Đây là nơi dàn dựng việc thu thập dữ liệu từ nhiều nguồn và tổng hợp chúng lại.
    -   **Thực thi song song:** Service sẽ thực hiện nhiều lời gọi đến `Repository Layer` để lấy từng khối thông tin. Để tối ưu hóa thời gian phản hồi, các lời gọi này nên được thực thi song song (ví dụ: sử dụng `CompletableFuture` trong Java):
        -   `getTodaysActivity(hotelId)`
        -   `getLiveBookingStatusCounts(hotelId)`
        -   `getLiveRoomStatusCounts(hotelId)`
        -   `getOccupancyForecast(hotelId, forecastDays)`
    -   **Tổng hợp kết quả:** Sau khi tất cả các lời gọi bất đồng bộ hoàn tất, Service Layer sẽ tập hợp kết quả từ chúng.
    -   **Định dạng Dữ liệu trả về:** Tạo một đối tượng DTO `DashboardSummaryDto` lớn, chứa các đối tượng con tương ứng với từng khối thông tin và trả về.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    -   Chứa các phương thức riêng biệt cho từng khối dữ liệu, mỗi phương thức thực thi một truy vấn được tối ưu.
    -   **`getTodaysActivity`:** Sẽ thực thi 3 truy vấn `COUNT` riêng biệt:
        -   `-- Check-ins today`
        -   `SELECT COUNT(id) FROM Booking WHERE hotelId = :hotelId AND checkInDate = CURDATE() AND status = 'CONFIRMED';`
        -   `-- Check-outs today`
        -   `SELECT COUNT(id) FROM Booking WHERE hotelId = :hotelId AND checkOutDate = CURDATE() AND status = 'CHECKED_IN';`
        -   `-- In-House guests`
        -   `SELECT COUNT(id) FROM Booking WHERE hotelId = :hotelId AND status = 'CHECKED_IN';`
    -   **`getLiveBookingStatusCounts`:** Thực thi một truy vấn `GROUP BY` hiệu quả:
        ```sql
        SELECT status, COUNT(id)
        FROM Booking
        WHERE hotelId = :hotelId AND status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN')
        GROUP BY status;
        ```
    -   **`getLiveRoomStatusCounts`:** Tương tự, một truy vấn `GROUP BY` trên bảng `Room`:
        ```sql
        SELECT status, SUM(quantity)
        FROM Room
        WHERE hotelId = :hotelId
        GROUP BY status;
        ```    -   **`getOccupancyForecast`:** Thực thi một truy vấn phức tạp hơn để đếm số phòng đã đặt cho N ngày tới.

#### Xử lý nghiệp vụ và các trường hợp biên

-   **Tính thời gian thực:** Cần làm rõ với người dùng rằng dữ liệu này là "live" và có thể thay đổi bất kỳ lúc nào, khác với các báo cáo phân tích có dữ liệu được chốt theo ngày.
-   **Định nghĩa "Phòng đã đặt":** Trong phần dự báo, "phòng đã đặt" được định nghĩa là các phòng có booking ở trạng thái `CONFIRMED` hoặc `CHECKED_IN`. Các booking `PENDING_PAYMENT` không được tính là chắc chắn.
-   **Không có dữ liệu:** Nếu một truy vấn không trả về kết quả (ví dụ: không có khách check-in hôm nay), API phải trả về `0` cho chỉ số đó, không phải `null`, để đảm bảo cấu trúc dữ liệu nhất quán.
-   **Hiệu năng:** Sự tồn tại của các **index** trên các cột `Booking(hotelId, status, checkInDate, checkOutDate)` và `Room(hotelId, status)` là yếu tố sống còn để đảm bảo API này có thể hoạt động hiệu quả.

#### Khả năng mở rộng (Extensibility)

-   Kiến trúc này rất dễ mở rộng. Nếu trong tương lai cần thêm một "widget" mới vào bảng điều khiển (ví dụ: "Số lượng yêu cầu đặc biệt từ khách hàng"), chỉ cần:
    1.  Tạo một phương thức mới trong `Repository Layer` để truy vấn dữ liệu đó.
    2.  Thêm một lời gọi bất đồng bộ đến phương thức này trong `Service Layer`.
    3.  Thêm một trường mới vào `DashboardSummaryDto` để chứa kết quả.
-   Thiết kế này giữ cho logic được tách biệt, dễ kiểm thử và không ảnh hưởng đến các phần hiện có.