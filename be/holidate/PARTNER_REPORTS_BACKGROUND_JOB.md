Chắc chắn rồi. Dưới đây là phiên bản viết lại và đi sâu vào chi tiết cho **Phần 2: Luồng nghiệp vụ của Tác vụ nền (Data Aggregation Background Job)**, theo định dạng Markdown và tập trung vào đặc tả nghiệp vụ chi tiết như bạn yêu cầu.

---

## Phần 2: Luồng nghiệp vụ của Tác vụ nền (Data Aggregation Background Job)

### Tổng quan và Nguyên tắc thiết kế

Đây là "bộ não" của hệ thống báo cáo, một tiến trình tự động chịu trách nhiệm tính toán và tổng hợp dữ liệu từ các bảng giao dịch (OLTP) sang các bảng báo cáo (OLAP). Sự thành công của toàn bộ tính năng báo cáo phụ thuộc vào độ chính xác, hiệu năng và sự ổn định của tác vụ này.

Tác vụ được thiết kế dựa trên các nguyên tắc cốt lõi sau:

-   **Tính chính xác (Accuracy):** Mọi chỉ số được tính toán phải phản ánh chính xác 100% các giao dịch đã xảy ra. Logic nghiệp vụ phải được định nghĩa rõ ràng và không có sự mập mờ.
-   **Hiệu năng (Performance):** Tác vụ phải hoàn thành trong một khoảng thời gian hợp lý (ví dụ: dưới 30 phút), ngay cả khi lượng dữ liệu lên đến hàng triệu bản ghi. Điều này đòi hỏi phải **tránh tuyệt đối việc xử lý dữ liệu theo vòng lặp (row-by-row processing)** và ưu tiên các **thao tác xử lý theo tập hợp (set-based operations)** của SQL.
-   **Tính Idempotent (Idempotency):** Việc chạy lại tác vụ cho cùng một ngày phải luôn cho ra cùng một kết quả cuối cùng, ghi đè lên dữ liệu cũ. Điều này đảm bảo rằng nếu có lỗi xảy ra và tác vụ cần được chạy lại, hệ thống sẽ không tạo ra dữ liệu trùng lặp hay sai lệch. Kỹ thuật `UPSERT` (ví dụ: `INSERT ... ON CONFLICT DO UPDATE` trong PostgreSQL) là chìa khóa để đạt được điều này.
-   **Tính toàn vẹn (Transactional Integrity):** Toàn bộ quá trình tính toán và ghi dữ liệu cho một ngày phải được bao bọc trong một **giao dịch (transaction)** duy nhất. Nếu có bất kỳ lỗi nào xảy ra ở bất kỳ bước nào, toàn bộ giao dịch sẽ được `ROLLBACK`, đảm bảo dữ liệu báo cáo không ở trạng thái "nửa vời" hay không nhất quán.

### Luồng xử lý chi tiết cho ngày `D` (ngày báo cáo, tương ứng với dữ liệu của ngày T-1)

Tác vụ sẽ được kích hoạt vào lúc 2:00 AM để xử lý dữ liệu của ngày hôm trước (`D`).

#### Bước 0: Khởi tạo và Bắt đầu Giao dịch (Initialization & Transaction)

-   Xác định ngày báo cáo `D` (ví dụ: `LocalDate.now().minusDays(1)`).
-   Bắt đầu một giao dịch cơ sở dữ liệu mới. Toàn bộ các bước sau sẽ nằm trong giao dịch này.

#### Bước 1: Chuẩn bị Dữ liệu Nguồn (Prepare Source Data)

-   Thay vì truy vấn bảng `Booking` nhiều lần cho mỗi chỉ số, tác vụ sẽ thực hiện một truy vấn duy nhất để lấy ra một **tập dữ liệu trung gian (intermediate dataset)** chứa tất cả các booking có liên quan đến ngày `D`. Điều này tối ưu hóa đáng kể hiệu năng I/O.
-   **Tiêu chí để một booking được đưa vào tập dữ liệu trung gian:**
    -   `createdAt` nằm trong ngày `D` (để tính `createdBookings` và các trạng thái liên quan).
    -   HOẶC `checkOutDate` là ngày `D` VÀ `status = 'COMPLETED'` (để tính doanh thu và booking hoàn thành).
    -   HOẶC `updatedAt` nằm trong ngày `D` VÀ `status = 'CANCELLED'` (để tính booking bị hủy).
    -   HOẶC (`checkInDate <= D` VÀ `checkOutDate > D`) VÀ `status IN ('CONFIRMED', 'CHECKED_IN')` (để tính `occupiedRoomNights`).
-   Tập dữ liệu này (có thể là một CTE - Common Table Expression trong SQL) sẽ chứa các cột cần thiết như `hotelId`, `roomId`, `userId`, `finalPrice`, `numberOfRooms`, `status`, `createdAt`, `updatedAt`, `checkInDate`, `checkOutDate`.

#### Bước 2: Tính toán chỉ số cho `HotelDailyReport`

-   Từ tập dữ liệu trung gian đã chuẩn bị, thực hiện một truy vấn tổng hợp duy nhất, nhóm theo `hotelId` (`GROUP BY hotelId`) để tính toán tất cả các chỉ số cần thiết.
-   **Chi tiết logic tính toán cho mỗi trường:**
    -   `totalRevenue`: `SUM(CASE WHEN status = 'COMPLETED' AND checkOutDate = D THEN finalPrice ELSE 0 END)`
    -   `createdBookings`: `COUNT(CASE WHEN createdAt >= D AND createdAt < D+1 THEN 1 END)`
    -   `pendingPaymentBookings`: `COUNT(CASE WHEN createdAt >= D AND createdAt < D+1 AND status = 'PENDING_PAYMENT' THEN 1 END)`
    -   `confirmedBookings`: `COUNT(CASE WHEN createdAt >= D AND createdAt < D+1 AND status = 'CONFIRMED' THEN 1 END)`
    -   `checkedInBookings`: `COUNT(CASE WHEN createdAt >= D AND createdAt < D+1 AND status = 'CHECKED_IN' THEN 1 END)`
    -   `completedBookings`: `COUNT(CASE WHEN status = 'COMPLETED' AND checkOutDate = D THEN 1 END)`
    -   `cancelledBookings`: `COUNT(CASE WHEN status = 'CANCELLED' AND updatedAt >= D AND updatedAt < D+1 THEN 1 END)`
    -   `rescheduledBookings`: `COUNT(CASE WHEN createdAt >= D AND createdAt < D+1 AND status = 'RESCHEDULED' THEN 1 END)`
    -   `occupiedRoomNights`: `SUM(CASE WHEN status IN ('CONFIRMED', 'CHECKED_IN') AND checkInDate <= D AND checkOutDate > D THEN numberOfRooms ELSE 0 END)`
    -   `totalRoomNights`: Chỉ số này được tính bằng một truy vấn con riêng: `(SELECT SUM(quantity) FROM Room WHERE hotelId = H.id AND status = 'ACTIVE')`.
    -   `newCustomerBookings` & `returningCustomerBookings`: Đây là logic phức tạp nhất. Nó được tính bằng cách `JOIN` với một truy vấn con để xác định ngày hoàn thành booking đầu tiên của mỗi khách hàng tại khách sạn đó.
        -   Logic con: Tìm `MIN(checkOutDate)` cho mỗi cặp `(userId, hotelId)` từ các booking `COMPLETED`.
        -   `newCustomerBookings`: `COUNT` các booking `COMPLETED` có `checkOutDate = D` mà ngày hoàn thành đầu tiên của khách hàng đó cũng là `D`.
        -   `returningCustomerBookings`: `COUNT` các booking `COMPLETED` có `checkOutDate = D` mà ngày hoàn thành đầu tiên của khách hàng đó là `< D`.

#### Bước 3: Tính toán chỉ số cho `RoomDailyPerformance`

-   Tương tự bước 2, thực hiện một truy vấn tổng hợp khác trên tập dữ liệu trung gian, nhưng lần này là `GROUP BY roomId`.
-   **Chi tiết logic tính toán:**
    -   `revenue`: `SUM(CASE WHEN status = 'COMPLETED' AND checkOutDate = D THEN finalPrice ELSE 0 END)`
    -   `bookedRoomNights`: `SUM(CASE WHEN status IN ('CONFIRMED', 'CHECKED_IN') AND checkInDate <= D AND checkOutDate > D THEN numberOfRooms ELSE 0 END)`
-   Kết quả của truy vấn này cũng sẽ bao gồm `hotelId` để tiện cho việc ghi dữ liệu.

#### Bước 4: Tổng hợp dữ liệu Đánh giá (`Review`)

-   Thực hiện một truy vấn tổng hợp riêng trên bảng `Review`.
-   `SELECT hotelId, AVG(score) as averageReviewScore, COUNT(id) as reviewCount FROM Review WHERE createdAt >= D AND createdAt < D+1 GROUP BY hotelId`.

#### Bước 5: Ghi Dữ liệu (UPSERT)

-   **Ghi vào `HotelDailyReport`:** Sử dụng kết quả từ Bước 2 và Bước 4, thực hiện một thao tác `UPSERT` hàng loạt.
    -   Lệnh này sẽ `INSERT` một bản ghi mới nếu cặp `(hotelId, reportDate)` chưa tồn tại.
    -   Nếu đã tồn tại, nó sẽ `UPDATE` tất cả các trường với giá trị mới vừa được tính toán. Điều này đảm bảo tính idempotent.
-   **Ghi vào `RoomDailyPerformance`:** Sử dụng kết quả từ Bước 3, thực hiện một thao tác `UPSERT` hàng loạt tương tự với khóa là `(roomId, reportDate)`.

#### Bước 6: Hoàn tất Giao dịch (Commit Transaction)

-   Nếu tất cả các bước trên thực thi thành công mà không có lỗi, tiến hành `COMMIT` giao dịch. Dữ liệu báo cáo cho ngày `D` chính thức được lưu lại.
-   Nếu có bất kỳ lỗi nào xảy ra, toàn bộ giao dịch sẽ tự động `ROLLBACK`, đảm bảo cơ sở dữ liệu báo cáo không bị ảnh hưởng. Tác vụ sẽ ghi log lỗi chi tiết để quản trị viên có thể điều tra và chạy lại khi cần.