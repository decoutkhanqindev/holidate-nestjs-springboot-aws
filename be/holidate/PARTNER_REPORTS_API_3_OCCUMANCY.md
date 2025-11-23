Chắc chắn rồi. Chúng ta sẽ cùng nhau phân tích chi tiết **Phần 3, API 3: Tỷ lệ lấp đầy**, theo đúng định dạng Markdown, tập trung vào chiều sâu của nghiệp vụ và logic backend.

---

### API 3: Tỷ lệ lấp đầy (Occupancy Rate)

#### Mục tiêu nghiệp vụ

Tỷ lệ lấp đầy là một trong những chỉ số sức khỏe cốt lõi (Key Performance Indicator - KPI) của ngành khách sạn. Nó đo lường hiệu quả vận hành và khả năng tối ưu hóa công suất phòng của một cơ sở lưu trú. API này phải cung cấp cho đối tác một công cụ mạnh mẽ để:

1.  **Theo dõi xu hướng theo thời gian:** Xem tỷ lệ lấp đầy biến động như thế nào qua từng ngày, giúp nhận diện các ngày trong tuần, các sự kiện, hoặc các mùa có hiệu suất cao/thấp.
2.  **Đánh giá hiệu suất tổng thể:** Cung cấp một con số trung bình chính xác cho cả một kỳ báo cáo, giúp đối tác so sánh hiệu suất giữa các tháng, các quý, hoặc so với mục tiêu đã đề ra.

Việc hiểu rõ chỉ số này giúp đối tác đưa ra các quyết định quan trọng về chiến lược giá (pricing), các chương trình khuyến mãi, và kế hoạch nhân sự.

#### Endpoint và Parameters

-   **Endpoint:** `GET /partner/reports/occupancy`
-   **Parameters:**
    -   `hotelId` (`UUID`, required): ID của khách sạn, được trích xuất một cách an toàn từ context của người dùng đã được xác thực.
    -   `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo.
    -   `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo.

#### Nguồn dữ liệu

-   **Bảng chính:** `HotelDailyReport`.
-   **Các trường cốt lõi:**
    -   `occupiedRoomNights`: Tổng số "phòng-đêm" đã được bán.
    -   `totalRoomNights`: Tổng số "phòng-đêm" có sẵn để bán.
-   **Nguyên tắc:** API này tuyệt đối tuân thủ kiến trúc đã đề ra, chỉ thực hiện các thao tác đọc trên bảng tổng hợp `HotelDailyReport`. Điều này đảm bảo hiệu năng vượt trội và không gây ảnh hưởng đến hệ thống giao dịch.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**
    -   Tiếp nhận yêu cầu HTTP `GET`.
    -   **Xác thực và Ủy quyền (Authentication & Authorization):** Xác thực token của người dùng và kiểm tra role là `PARTNER`. Nếu không, trả về lỗi `403 Forbidden`.
    -   **Validation (Kiểm tra tính hợp lệ của tham số):** Kiểm tra định dạng và thứ tự của `from` và `to`.
    -   Nếu mọi thứ hợp lệ, gọi phương thức xử lý trong `Service Layer`.

2.  **Service Layer (Tầng nghiệp vụ):**
    -   Đây là nơi diễn ra các phép tính và logic nghiệp vụ quan trọng.
    -   **Bước 1: Lấy Dữ liệu Thô:** Gọi một phương thức trong `Repository Layer`, ví dụ `repository.getDailyOccupancyData(hotelId, from, to)`, để lấy danh sách các bản ghi `HotelDailyReport` trong kỳ, chỉ bao gồm các cột cần thiết (`reportDate`, `occupiedRoomNights`, `totalRoomNights`).
    -   **Bước 2: Xử lý Dữ liệu chi tiết (cho biểu đồ):**
        -   Lặp qua danh sách dữ liệu thô nhận được.
        -   Với mỗi bản ghi hàng ngày, tính toán tỷ lệ lấp đầy của ngày đó:
            ```java
            // Pseudocode
            double dailyRate = 0.0;
            if (dailyReport.getTotalRoomNights() > 0) {
                dailyRate = ((double) dailyReport.getOccupiedRoomNights() / dailyReport.getTotalRoomNights()) * 100.0;
            }
            // Tạo một đối tượng DTO cho dữ liệu hàng ngày và thêm vào danh sách kết quả
            dailyDataList.add(new DailyOccupancyDto(dailyReport.getReportDate(), round(dailyRate, 2)));
            ```
    -   **Bước 3: Tính toán Dữ liệu tóm tắt (Summary Data):**
        -   **Lưu ý nghiệp vụ quan trọng:** Tỷ lệ lấp đầy trung bình của cả kỳ **KHÔNG PHẢI** là trung bình cộng của các tỷ lệ hàng ngày. Công thức chính xác phải dựa trên tổng số phòng đã bán chia cho tổng số phòng có sẵn trong cả kỳ.
        -   Tính tổng `occupiedRoomNights` và `totalRoomNights` từ danh sách dữ liệu thô đã lấy ở Bước 1.
            ```java
            // Pseudocode
            long totalOccupiedForPeriod = dailyDataList.stream().mapToLong(r -> r.getOccupiedRoomNights()).sum();
            long totalAvailableForPeriod = dailyDataList.stream().mapToLong(r -> r.getTotalRoomNights()).sum();

            double averageRate = 0.0;
            if (totalAvailableForPeriod > 0) {
                averageRate = ((double) totalOccupiedForPeriod / totalAvailableForPeriod) * 100.0;
            }
            ```
    -   **Bước 4: Định dạng Dữ liệu trả về:** Đóng gói danh sách dữ liệu chi tiết và các chỉ số tóm tắt (bao gồm `averageRate`, `totalOccupiedForPeriod`, `totalAvailableForPeriod`) vào một DTO cuối cùng để trả về.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    -   Chịu trách nhiệm thực thi một truy vấn đơn giản và hiệu quả.
    -   Truy vấn sẽ có dạng:
        ```sql
        SELECT
            reportDate,
            occupiedRoomNights,
            totalRoomNights
        FROM
            HotelDailyReport
        WHERE
            hotelId = :hotelId AND reportDate BETWEEN :from AND :to
        ORDER BY
            reportDate ASC;
        ```

#### Xử lý nghiệp vụ và các trường hợp biên

-   **Công thức tính trung bình chính xác:** Lý do phải dùng công thức `SUM(occupied) / SUM(total)` là vì `totalRoomNights` (mẫu số) có thể thay đổi theo từng ngày (ví dụ: có phòng đi vào bảo trì hoặc có loại phòng mới được kích hoạt). Việc lấy trung bình của các tỷ lệ hàng ngày sẽ dẫn đến sai số thống kê. Logic backend phải tuân thủ nghiêm ngặt công thức đúng.

-   **Trường hợp `totalRoomNights` bằng 0 (Chia cho Không):**
    -   **Ở cấp độ hàng ngày:** Nếu một ngày cụ thể có `totalRoomNights = 0` (ví dụ: khách sạn đóng cửa bảo trì toàn bộ), tỷ lệ lấp đầy của ngày đó phải được tính là `0`.
    -   **Ở cấp độ tổng hợp:** Nếu trong cả kỳ báo cáo, `SUM(totalRoomNights)` là `0`, thì `averageRate` cũng phải được trả về là `0`. Đây là một kịch bản hiếm nhưng cần được xử lý để tránh lỗi `ArithmeticException: / by zero`.

-   **Không có dữ liệu (No Data Found):** Nếu không có bản ghi `HotelDailyReport` nào trong khoảng thời gian được yêu cầu, API phải trả về `200 OK` với một cấu trúc hợp lệ: `data` là một mảng rỗng, và các chỉ số trong `summary` đều bằng `0`.

#### Tái sử dụng cho chức năng so sánh

-   Phương thức cốt lõi trong Service Layer, `getOccupancyData(hotelId, from, to)`, trả về một đối tượng chứa đầy đủ thông tin tóm tắt.
-   Logic wrapper cho chức năng so sánh sẽ gọi phương thức này hai lần. Sau đó, nó có thể dễ dàng so sánh các chỉ số quan trọng như `averageRate`, `totalOccupiedForPeriod` từ hai đối tượng kết quả để tính toán sự chênh lệch và phần trăm thay đổi.