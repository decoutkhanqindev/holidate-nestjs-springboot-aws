Tuyệt vời. Chúng ta sẽ tiếp tục đi sâu vào phân tích chi tiết cho **Phần 3, API 2: Thống kê Đặt phòng**, tuân thủ nghiêm ngặt định dạng Markdown và tập trung vào các khía cạnh nghiệp vụ và logic backend.

---

### API 2: Thống kê Đặt phòng

#### Mục tiêu nghiệp vụ

API này cung cấp cho đối tác một "bảng điều khiển" tổng quan về toàn bộ hoạt động đặt phòng trong một kỳ. Nó không chỉ đưa ra con số tổng, mà còn phân tích "phễu" đặt phòng (booking funnel) bằng cách chia nhỏ theo từng trạng thái quan trọng. Mục tiêu là giúp đối tác trả lời các câu hỏi như:

- "Trong tháng này, tôi có bao nhiêu lượt đặt phòng mới?"
- "Tỷ lệ chuyển đổi từ `PENDING_PAYMENT` sang `CONFIRMED` có tốt không?" (suy ra từ số liệu)
- "Tỷ lệ hủy phòng của tôi đang ở mức nào?"
- "Hoạt động kinh doanh tổng thể (đã hoàn thành, đã hủy, đang chờ...) diễn ra như thế nào?"

Đây là một công cụ chẩn đoán quan trọng để đối tác hiểu rõ sức khỏe kinh doanh của mình.

#### Endpoint và Parameters

- **Endpoint:** `GET /partner/reports/bookings/summary`
- **Parameters:**
  - `hotelId` (`UUID`, required): ID của khách sạn, được lấy từ context của người dùng đã xác thực để đảm bảo an ninh.
  - `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo.
  - `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo.

#### Nguồn dữ liệu

- **Bảng chính:** `HotelDailyReport`.
- **Nguyên tắc:** API này tuân thủ nghiêm ngặt quy tắc chỉ đọc từ bảng tổng hợp. Toàn bộ việc đếm và phân loại booking theo trạng thái đã được Tác vụ nền xử lý trước. Điều này đảm bảo API phản hồi gần như tức thì, ngay cả khi truy vấn trên khoảng thời gian dài.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - **Xác thực và Ủy quyền (Authentication & Authorization):** Xác thực token của người dùng và kiểm tra role là `PARTNER`. Nếu không, trả về lỗi `403 Forbidden`.
    - **Validation (Kiểm tra tính hợp lệ của tham số):**
      - Kiểm tra định dạng và thứ tự của `from` và `to`.
    - Nếu hợp lệ, gọi phương thức tương ứng trong `Service Layer`.

2.  **Service Layer (Tầng nghiệp vụ):**

    - Đây là nơi tập trung logic chính của API.
    - **Gọi Repository:** Gọi một phương thức duy nhất trong `Repository Layer`, ví dụ `repository.getBookingSummary(hotelId, from, to)`. Phương thức này sẽ thực hiện một truy vấn để tính tổng (SUM) của tất cả các cột liên quan đến booking trong bảng `HotelDailyReport` trong khoảng thời gian đã cho.
    - **Tính toán Chỉ số Dẫn xuất (Derived Metrics):** Sau khi nhận được kết quả tổng hợp từ Repository (ví dụ: `totalCreated`, `totalCancelled`...), Service sẽ tính toán các chỉ số nghiệp vụ quan trọng.
      - **`cancellationRate` (Tỷ lệ hủy):** Đây là chỉ số quan trọng nhất. Logic tính toán phải được xử lý cẩn thận:
        ```java
        // Pseudocode
        long totalCreated = summary.getTotalCreatedBookings();
        long totalCancelled = summary.getTotalCancelledBookings();
        double cancellationRate = 0.0;
        if (totalCreated > 0) {
            cancellationRate = ((double) totalCancelled / totalCreated) * 100.0;
        }
        // Làm tròn đến 2 chữ số thập phân nếu cần
        summary.setCancellationRate(round(cancellationRate, 2));
        ```
    - **Định dạng Dữ liệu trả về:** Tạo một đối tượng DTO (Data Transfer Object) để đóng gói tất cả các con số tổng hợp và chỉ số dẫn xuất thành một cấu trúc rõ ràng, dễ hiểu để trả về cho client.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    - Chịu trách nhiệm thực thi một truy vấn tổng hợp hiệu năng cao duy nhất.
    - Truy vấn sẽ có dạng:
      ```sql
      SELECT
          SUM(createdBookings) AS totalCreated,
          SUM(completedBookings) AS totalCompleted,
          SUM(cancelledBookings) AS totalCancelled
      FROM
          HotelDailyReport
      WHERE
          hotelId = :hotelId AND reportDate BETWEEN :from AND :to;
      ```
    - Kết quả của truy vấn này là một hàng duy nhất chứa tất cả các giá trị tổng mà Service Layer cần.

#### Xử lý nghiệp vụ và các trường hợp biên

- **Logic Thời gian Khác biệt:** Một điểm nghiệp vụ cực kỳ quan trọng cần làm rõ là sự khác biệt trong cách tính của các chỉ số.

  - `createdBookings`: Được tính dựa trên **ngày tạo (`createdAt`)** của booking. Nó trả lời câu hỏi "Trong ngày D, có bao nhiêu booking được tạo ra?".
  - `completedBookings`: Được tính dựa trên **ngày trả phòng (`checkOutDate`)**. Nó trả lời câu hỏi "Trong ngày D, có bao nhiêu khách đã hoàn thành việc lưu trú?".
  - `cancelledBookings`: Được tính dựa trên **ngày cập nhật (`updatedAt`)** sang trạng thái `CANCELLED`.
  - API phải trả về các con số này một cách minh bạch. Người dùng (đối tác) cần hiểu rằng đây là một "bản chụp" (snapshot) các hoạt động diễn ra trong kỳ, chứ không phải là vòng đời của một tập hợp booking cụ thể.

- **Chia cho Không (Divide by Zero):** Như đã đề cập trong logic của Service Layer, nếu `SUM(createdBookings)` là 0, thì `cancellationRate` phải được trả về là 0. Đây là một trường hợp biên bắt buộc phải xử lý để tránh lỗi và đảm bảo tính nhất quán.

- **Không có dữ liệu (No Data Found):** Nếu không có hoạt động nào trong kỳ, truy vấn tổng hợp sẽ trả về `null` cho tất cả các cột `SUM`. Service Layer phải xử lý trường hợp này bằng cách chuyển đổi tất cả các giá trị `null` thành `0` trước khi trả về cho client. API sẽ trả về `200 OK` với tất cả các chỉ số bằng 0.

#### Tái sử dụng cho chức năng so sánh

- Phương thức cốt lõi trong Service Layer, ví dụ `getBookingSummary(hotelId, from, to)`, được thiết kế để có thể tái sử dụng hoàn toàn.
- Khi triển khai API so sánh, logic wrapper sẽ gọi phương thức này hai lần:
  1.  `currentPeriodSummary = getBookingSummary(hotelId, currentFrom, currentTo)`
  2.  `previousPeriodSummary = getBookingSummary(hotelId, previousFrom, previousTo)`
- Sau đó, wrapper sẽ tính toán sự chênh lệch (`difference`) và phần trăm thay đổi (`percentageChange`) cho từng chỉ số (ví dụ: `createdBookings`, `cancellationRate`) và đóng gói chúng vào một đối tượng phản hồi duy nhất.
