Chắc chắn rồi. Dựa trên yêu cầu của bạn về một API Dashboard Summary cho Admin và tuân thủ nghiêm ngặt theo cấu trúc file Markdown đã được cung cấp, dưới đây là bản đặc tả chi tiết cho API này.

---

## Phần 3: Phân tích chi tiết API và Logic Backend (cho Admin)

### API 8: Bảng điều khiển Vận hành Tổng quan (Operational Dashboard)

#### Mục tiêu nghiệp vụ

API này đóng vai trò là "trung tâm chỉ huy" của Admin, cung cấp một "bản chụp sức khỏe hệ thống" (System Health Snapshot) một cách cô đọng và tức thì. Khác với các API báo cáo phân tích sâu, mục tiêu của nó là cung cấp thông tin vận hành quan trọng nhất để trả lời câu hỏi: **"Tình hình Holidate ngay bây giờ và hôm nay như thế nào?"**. Cụ thể:

-   **Giám sát Thời gian thực:** Cung cấp các chỉ số chính về hoạt động đặt phòng và tăng trưởng người dùng trong ngày.
-   **Tổng quan Nhanh:** Trình bày các chỉ số tài chính và hiệu suất cốt lõi của tháng hiện tại mà không cần phải chạy các báo cáo phức tạp.
-   **Phát hiện Xu hướng Nổi bật:** Nhanh chóng xác định các đối tác đang hoạt động hiệu quả nhất trong thời gian gần đây.

Đây là công cụ giúp ban lãnh đạo và các trưởng bộ phận ra quyết định nhanh, phát hiện vấn đề sớm và nắm bắt nhịp đập của toàn bộ nền tảng.

#### Endpoint và Parameters

-   **Endpoint:** `GET /admin/dashboard/summary`
-   **Parameters:** API này được thiết kế để không yêu cầu tham số. Nó luôn trả về một bộ dữ liệu được định nghĩa trước cho các khoảng thời gian cố định (ví dụ: "hôm nay", "tháng này đến hiện tại", "7 ngày qua") để đảm bảo tính đơn giản và tốc độ phản hồi nhanh nhất.

#### Nguồn dữ liệu (Kiến trúc Hybrid)

API này áp dụng một kiến trúc truy cập dữ liệu lai để cân bằng giữa tính thời gian thực và hiệu năng:

-   **Bảng tổng hợp (`SystemDailyReport`, `HotelDailyReport`):** Được sử dụng cho các chỉ số yêu cầu tổng hợp trên nhiều ngày (ví dụ: "doanh thu tháng này", "top khách sạn 7 ngày qua"). Việc này đảm bảo tốc độ cực nhanh.
-   **Bảng giao dịch (`Booking`, `User`, `Hotel`):** Được sử dụng cho các chỉ số đòi hỏi tính chính xác tại thời điểm hiện tại (ví dụ: "booking mới hôm nay", "tổng số khách sạn đang hoạt động"). Các truy vấn này được tối ưu hóa bằng index và luôn được lọc theo một khoảng thời gian rất hẹp (hôm nay) hoặc là các truy vấn `COUNT` đơn giản.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    -   Tiếp nhận yêu cầu HTTP `GET`.
    -   **Xác thực và Ủy quyền (Authentication & Authorization):**
        -   Xác thực token của người dùng và kiểm tra vai trò là `ADMIN`.
    -   Gọi một phương thức cấp cao duy nhất trong `Service Layer`, ví dụ `getAdminDashboardSummary()`.

2.  **Service Layer (Tầng nghiệp vụ):**

    -   Đây là nơi dàn dựng việc thu thập đồng thời nhiều khối thông tin khác nhau.
    -   **Thực thi song song (Parallel Execution):** Service sẽ thực hiện nhiều lời gọi đến `Repository Layer` một cách bất đồng bộ để tối ưu hóa thời gian phản hồi. Mỗi lời gọi chịu trách nhiệm cho một "widget" trên dashboard.
        -   `getRealtimeFinancialsForToday()`
        -   `getAggregatedFinancialsForMonthToDate()`
        -   `getRealtimeBookingActivityForToday()`
        -   `getRealtimeEcosystemGrowthForToday()`
        -   `getAggregatedTopPerformingHotels()`
    -   **Tổng hợp kết quả:** Sau khi tất cả các lời gọi bất đồng bộ hoàn tất (sử dụng `CompletableFuture.allOf` trong Java hoặc cơ chế tương tự), Service Layer sẽ tập hợp kết quả từ chúng.
    -   **Định dạng Dữ liệu trả về:** Tạo một đối tượng DTO `AdminDashboardSummaryDto` lớn, chứa các đối tượng con tương ứng với từng khối thông tin đã thu thập.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    -   Chứa các phương thức riêng biệt cho từng khối dữ liệu, mỗi phương thức thực thi một truy vấn được tối ưu hóa cao.
    -   **`getRealtimeFinancialsForToday`:** Truy vấn trực tiếp vào `Booking` và `Hotel`.
        ```sql
        SELECT SUM(b.finalPrice) FROM Booking b WHERE b.status = 'COMPLETED' AND b.checkOutDate = CURDATE();
        ```
    -   **`getAggregatedFinancialsForMonthToDate`:** Truy vấn `SystemDailyReport`.
        ```sql
        SELECT SUM(grossRevenue), SUM(netRevenue) FROM SystemDailyReport WHERE reportDate >= DATE_TRUNC('month', CURDATE()) AND reportDate < CURDATE();
        ```
    -   **`getRealtimeBookingActivityForToday`:** Truy vấn trực tiếp vào `Booking`.
        ```sql
        SELECT COUNT(id) FROM Booking WHERE createdAt >= CURDATE() AND createdAt < CURDATE() + INTERVAL '1 day';
        ```
    -   **`getAggregatedTopPerformingHotels`:** Truy vấn `HotelDailyReport`.
        ```sql
        SELECT h.name, SUM(hdr.totalRevenue) AS recentRevenue
        FROM HotelDailyReport hdr JOIN Hotel h ON hdr.hotelId = h.id
        WHERE hdr.reportDate >= CURDATE() - INTERVAL '7 day'
        GROUP BY h.id, h.name ORDER BY recentRevenue DESC LIMIT 5;
        ```
    -   Các truy vấn khác cho việc tăng trưởng người dùng và tổng số khách sạn cũng sẽ được thực hiện tương tự.

#### Xử lý nghiệp vụ và các trường hợp biên

-   **Sự kết hợp dữ liệu:** Một điểm nghiệp vụ quan trọng là sự kết hợp giữa dữ liệu quá khứ (từ bảng tổng hợp, tính đến hết ngày hôm qua) và dữ liệu thời gian thực (từ bảng giao dịch, cho ngày hôm nay). Ví dụ, "Doanh thu tháng này" có thể được trình bày bằng cách cộng `SUM(grossRevenue)` từ `SystemDailyReport` và kết quả của `getRealtimeFinancialsForToday`. Service Layer chịu trách nhiệm cho việc cộng hợp này.
-   **Hiệu năng:** Sự sống còn của API này phụ thuộc vào việc **đánh index** đầy đủ trên các cột được sử dụng trong mệnh đề `WHERE` của các truy vấn thời gian thực (`Booking.createdAt`, `Booking.checkOutDate`, `User.createdAt`...).
-   **Không có dữ liệu:** Nếu bất kỳ truy vấn nào không trả về kết quả (ví dụ: không có booking nào hôm nay), API phải đảm bảo trả về `0` cho chỉ số đó thay vì `null` để duy trì cấu trúc DTO nhất quán.

#### Khả năng mở rộng (Extensibility)

-   Kiến trúc này được thiết kế để dễ dàng mở rộng. Việc thêm một "widget" mới vào dashboard trong tương lai chỉ đơn giản là:
    1.  Tạo một phương thức repository mới để lấy dữ liệu cho widget đó.
    2.  Thêm một lời gọi bất đồng bộ đến phương thức này trong `Service Layer`.
    3.  Thêm một trường hoặc đối tượng con mới vào `AdminDashboardSummaryDto` để chứa kết quả.
-   Thiết kế này đảm bảo rằng việc thêm tính năng mới không làm ảnh hưởng hoặc tăng độ phức tạp của các phần đã có.