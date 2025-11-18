Chắc chắn rồi. Dưới đây là bản phân tích chi tiết cho **Phần 3, API 1: Báo cáo Doanh thu**, được viết lại theo định dạng Markdown với sự tập trung sâu vào đặc tả nghiệp vụ và logic backend.

---

## Phần 3: Phân tích chi tiết API và Logic Backend

### API 1: Báo cáo Doanh thu

#### Mục tiêu nghiệp vụ

API này là công cụ tài chính cơ bản và quan trọng nhất cho đối tác. Nó phải trả lời một cách nhanh chóng và chính xác câu hỏi: "Tôi đã kiếm được bao nhiêu tiền trong một khoảng thời gian nhất định?". Mục tiêu không chỉ là cung cấp một con số tổng, mà còn là trực quan hóa xu hướng doanh thu theo thời gian (ngày, tuần, tháng), giúp đối tác nhận diện các giai đoạn kinh doanh hiệu quả hoặc cần cải thiện.

#### Endpoint và Parameters

-   **Endpoint:** `GET /partner/reports/revenue`
-   **Parameters:**
    -   `hotelId` (`UUID`, required): ID của khách sạn. Tham số này nên được lấy từ context của người dùng đã xác thực (ví dụ: JWT token) để đảm bảo một đối tác không thể truy vấn dữ liệu của người khác.
    -   `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo.
    -   `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo.
    -   `groupBy` (`string`, optional, enum: `day`, `week`, `month`, default: `day`): Đơn vị thời gian để nhóm dữ liệu. Nếu không được cung cấp, hệ thống sẽ mặc định là `day`.

#### Nguồn dữ liệu

-   **Bảng chính:** `HotelDailyReport`.
-   **Tuyệt đối không:** API này **KHÔNG BAO GIỜ** được phép truy vấn trực tiếp vào các bảng giao dịch như `Booking` hoặc `Payment`. Toàn bộ logic tính toán doanh thu đã được Tác vụ nền xử lý trước. Nhiệm vụ của API chỉ là đọc, tổng hợp và định dạng lại dữ liệu đã được tối ưu từ `HotelDailyReport`.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**
    -   Tiếp nhận yêu cầu HTTP `GET`.
    -   **Xác thực và Ủy quyền (Authentication & Authorization):**
        -   Xác thực token của người dùng.
        -   Lấy `partnerId` từ token.
        -   **Kiểm tra quyền sở hữu:** Thực hiện một truy vấn nhanh để đảm bảo `hotelId` được cung cấp trong yêu cầu thuộc về `partnerId` đã xác thực. Nếu không, trả về lỗi `403 Forbidden` hoặc `404 Not Found`.
    -   **Validation (Kiểm tra tính hợp lệ của tham số):**
        -   Kiểm tra định dạng của `from` và `to` phải là `YYYY-MM-DD`.
        -   Kiểm tra `from` phải nhỏ hơn hoặc bằng `to`. Nếu không, trả về lỗi `400 Bad Request` với thông báo rõ ràng.
        -   Kiểm tra `groupBy` (nếu có) phải thuộc danh sách cho phép (`day`, `week`, `month`).
    -   Nếu tất cả đều hợp lệ, gọi phương thức tương ứng trong `Service Layer` và truyền các tham số đã được làm sạch.

2.  **Service Layer (Tầng nghiệp vụ):**
    -   Đây là nơi chứa logic chính để xử lý yêu cầu.
    -   Dựa vào giá trị của `groupBy`, Service sẽ gọi phương thức tương ứng trong `Repository Layer`.
        -   **Nếu `groupBy` là `day`:** Gọi `repository.getDailyRevenue(hotelId, from, to)`. Logic này đơn giản là lấy ra các bản ghi `HotelDailyReport` trong khoảng thời gian.
        -   **Nếu `groupBy` là `week` hoặc `month`:** Gọi một phương thức phức tạp hơn như `repository.getAggregatedRevenue(hotelId, from, to, groupBy)`. Logic tổng hợp này nên được thực hiện ở tầng cơ sở dữ liệu để đạt hiệu năng cao nhất (sử dụng các hàm như `DATE_TRUNC` trong PostgreSQL).
    -   **Tính toán Dữ liệu tóm tắt (Summary Data):** Sau khi nhận được kết quả từ Repository, Service sẽ tính toán tổng doanh thu (`totalRevenue`) cho toàn bộ kỳ báo cáo bằng cách lặp qua kết quả hoặc thực hiện một truy vấn tổng hợp riêng.
    -   **Định dạng Dữ liệu trả về (Format Response):** Tạo một đối tượng DTO (Data Transfer Object) để đóng gói dữ liệu theo cấu trúc đã định nghĩa, bao gồm cả dữ liệu chi tiết theo từng đơn vị thời gian và dữ liệu tóm tắt.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    -   Chịu trách nhiệm xây dựng và thực thi các truy vấn SQL.
    -   Ví dụ, phương thức `getAggregatedRevenue` cho `groupBy=month` sẽ thực thi một truy vấn tương tự như:
        ```sql
        SELECT
            DATE_TRUNC('month', reportDate)::date AS period,
            SUM(totalRevenue) AS revenue
        FROM
            HotelDailyReport
        WHERE
            hotelId = :hotelId AND reportDate BETWEEN :from AND :to
        GROUP BY
            period
        ORDER BY
            period ASC;
        ```

#### Xử lý nghiệp vụ và các trường hợp biên

-   **Không có dữ liệu (No Data Found):** Nếu truy vấn không trả về bản ghi nào cho khoảng thời gian đã chọn, API phải trả về `200 OK` với một cấu trúc dữ liệu hợp lệ: một mảng `data` rỗng và `summary.totalRevenue` bằng `0`. **Không** trả về `404 Not Found`, vì tài nguyên (báo cáo) vẫn tồn tại, chỉ là nó không có dữ liệu trong kỳ đó.
-   **Khoảng thời gian lớn (Large Date Range):** Nhờ vào kiến trúc bảng tổng hợp, việc truy vấn trên một khoảng thời gian dài (ví dụ: 1 năm) vẫn đảm bảo hiệu năng. API không cần giới hạn khoảng thời gian, nhưng có thể cân nhắc nếu cần thiết trong tương lai.
-   **Tính nhất quán dữ liệu:** Dữ liệu doanh thu được hiển thị là dữ liệu "tính đến hết ngày hôm qua" do Tác vụ nền chạy vào ban đêm. Điều này cần được làm rõ cho đối tác (nếu cần) để họ hiểu rằng nó không bao gồm các giao dịch phát sinh trong ngày hiện tại.

#### Tái sử dụng cho chức năng so sánh (Reusability for Comparison Feature)

-   Logic nghiệp vụ trong `Service Layer` để lấy dữ liệu doanh thu cho một kỳ (`getRevenueData(hotelId, from, to)`) nên được thiết kế như một phương thức riêng biệt và có thể tái sử dụng.
-   Khi triển khai API so sánh các kỳ, API đó sẽ chỉ cần gọi phương thức `getRevenueData` này hai lần với hai khoảng thời gian khác nhau (`currentPeriod` và `previousPeriod`).
-   Sau đó, nó sẽ tự tính toán các chỉ số so sánh (`difference`, `percentageChange`) và đóng gói kết quả cuối cùng. Thiết kế này tuân thủ nguyên tắc **DRY (Don't Repeat Yourself)** và giúp logic được tổ chức rõ ràng, dễ bảo trì.