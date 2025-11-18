Chắc chắn rồi. Chúng ta sẽ cùng nhau phân tích chi tiết **Phần 3, API 5: Thống kê Khách hàng**, tuân thủ định dạng Markdown và tập trung vào các khía cạnh nghiệp vụ và logic backend.

---

### API 5: Thống kê Khách hàng (Customer Statistics)

#### Mục tiêu nghiệp vụ

API này cung cấp cho đối tác một cái nhìn sâu sắc về tệp khách hàng của họ, giúp trả lời các câu hỏi kinh doanh quan trọng:

- **Mức độ thu hút khách hàng mới:** "Chiến dịch marketing gần đây có giúp tôi thu hút nhiều khách hàng lần đầu đến ở không?"
- **Mức độ giữ chân khách hàng:** "Tỷ lệ khách hàng quay lại của tôi là bao nhiêu? Chất lượng dịch vụ có đủ tốt để họ quay lại lần nữa không?"
- **Đánh giá lòng trung thành:** So sánh tỷ lệ khách mới và khách quay lại giúp đối tác hiểu được mô hình kinh doanh của mình đang phụ thuộc vào việc tìm kiếm khách mới liên tục hay dựa trên một lượng khách hàng trung thành ổn định.

Dữ liệu từ API này là nền tảng để đối tác xây dựng các chương trình khách hàng thân thiết hoặc các chiến dịch nhắm vào việc thu hút khách hàng mới.

#### Endpoint và Parameters

- **Endpoint:** `GET /partner/reports/customers/summary`
- **Parameters:**
  - `hotelId` (`UUID`, required): ID của khách sạn, được bảo vệ và lấy từ context của người dùng đã xác thực.
  - `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo.
  - `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo.

#### Nguồn dữ liệu

- **Bảng chính:** `HotelDailyReport`.
- **Nguyên tắc:** API này cực kỳ hiệu năng vì nó chỉ thực hiện một thao tác tổng hợp đơn giản trên dữ liệu đã được tính toán rất phức tạp từ trước bởi Tác vụ nền. Logic để phân biệt khách hàng mới và khách hàng quay lại là một trong những logic tốn kém nhất, và việc tiền xử lý nó là yếu tố then chốt.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - Thực hiện các bước **Xác thực & Ủy quyền** và **Validation** tham số một cách tiêu chuẩn.
    - Nếu hợp lệ, gọi phương thức tương ứng trong `Service Layer`.

2.  **Service Layer (Tầng nghiệp vụ):**

    - Logic tại tầng này rất gọn gàng và rõ ràng.
    - **Gọi Repository:** Gọi một phương thức duy nhất, ví dụ `repository.getCustomerSummary(hotelId, from, to)`.
    - **Tính toán Chỉ số Dẫn xuất:**
      - Sau khi nhận được `totalNewCustomerBookings` và `totalReturningCustomerBookings` từ Repository, Service sẽ tính tổng `totalCompletedBookingsInPeriod = totalNewCustomerBookings + totalReturningCustomerBookings`.
      - Tính toán các tỷ lệ phần trăm:
        ```java
        // Pseudocode
        double newCustomerPercentage = 0.0;
        double returningCustomerPercentage = 0.0;
        if (totalCompletedBookingsInPeriod > 0) {
            newCustomerPercentage = ((double) totalNewCustomerBookings / totalCompletedBookingsInPeriod) * 100.0;
            returningCustomerPercentage = ((double) totalReturningCustomerBookings / totalCompletedBookingsInPeriod) * 100.0;
        }
        ```
    - **Định dạng Dữ liệu trả về:** Tạo một đối tượng DTO để đóng gói các con số tổng hợp và các tỷ lệ phần trăm đã tính toán.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    - Thực thi một truy vấn tổng hợp cực kỳ nhanh.
      ```sql
      SELECT
          SUM(newCustomerBookings) AS totalNewCustomerBookings,
          SUM(returningCustomerBookings) AS totalReturningCustomerBookings
      FROM
          HotelDailyReport
      WHERE
          hotelId = :hotelId AND reportDate BETWEEN :from AND :to;
      ```
    - Truy vấn này trả về một hàng duy nhất chứa hai giá trị tổng, tối ưu hóa việc truyền dữ liệu giữa các tầng.

#### Xử lý nghiệp vụ và các trường hợp biên

- **Định nghĩa "Khách hàng":** Cần làm rõ rằng báo cáo này thống kê theo **lượt booking** chứ không phải **số lượng khách hàng duy nhất**. Ví dụ: một khách hàng quay lại đặt 2 phòng trong cùng một kỳ sẽ được đếm là 2 lượt `returningCustomerBookings`. Việc đếm số khách hàng duy nhất (`COUNT(DISTINCT userId)`) là một thao tác rất tốn kém và không phù hợp cho một API báo cáo nhanh, như đã ghi chú trong yêu cầu.

- **Phạm vi "Khách quay lại":** Định nghĩa "khách quay lại" là những khách đã từng có booking `COMPLETED` tại **chính khách sạn này** trong quá khứ. Một khách hàng có thể là "khách quay lại" ở khách sạn A nhưng vẫn là "khách mới" ở khách sạn B. Logic này đã được xử lý trong Tác vụ nền.

- **Không có dữ liệu:** Nếu không có booking nào được hoàn thành trong kỳ, truy vấn `SUM` sẽ trả về `null`. Service Layer phải xử lý trường hợp này bằng cách coi `null` là `0` cho tất cả các chỉ số và tỷ lệ. API sẽ trả về `200 OK` với các giá trị bằng không.

- **Tính nhất quán:** Dữ liệu này chỉ tính trên các booking có trạng thái `COMPLETED` và có `checkOutDate` nằm trong kỳ báo cáo. Điều này đảm bảo rằng việc phân loại khách hàng chỉ dựa trên các giao dịch đã hoàn thành và mang lại doanh thu thực tế.

#### Tái sử dụng cho chức năng so sánh

- Phương thức `getCustomerSummary(hotelId, from, to)` trong Service Layer là một đơn vị logic hoàn hảo để tái sử dụng.
- Logic wrapper cho API so sánh sẽ:
  1.  Gọi `getCustomerSummary` hai lần cho kỳ hiện tại và kỳ so sánh.
  2.  Nhận về hai đối tượng tóm tắt.
  3.  Tính toán sự thay đổi (tuyệt đối và phần trăm) cho `newCustomerBookings` và `returningCustomerBookings`.
  4.  Đóng gói tất cả thông tin này vào một đối tượng phản hồi so sánh duy nhất.
