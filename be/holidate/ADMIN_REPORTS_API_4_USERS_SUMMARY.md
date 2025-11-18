Tuyệt vời. Chúng ta sẽ cùng nhau phân tích chi tiết **Phần 3, API 4: Thống kê Người dùng và Hoạt động Đối tác**. API này có một đặc điểm thiết kế lai (hybrid) rất thú vị, kết hợp cả dữ liệu tổng hợp và dữ liệu thời gian thực.

---

## Phần 3: Phân tích chi tiết API và Logic Backend (cho Admin)

### API 4: Thống kê Người dùng và Hoạt động Đối tác

#### Mục tiêu nghiệp vụ

API này cung cấp cho Admin một cái nhìn tổng quan về sự phát triển của hệ sinh thái Holidate, tập trung vào hai tài sản quý giá nhất: **người dùng (khách hàng)** và **đối tác (khách sạn)**. Nó phải trả lời được hai câu hỏi chính:

1.  **Động lực tăng trưởng (Growth Momentum):** "Tốc độ tăng trưởng người dùng mới và đối tác mới của chúng ta trong tháng/quý này như thế nào?" - Dữ liệu này giúp đánh giá hiệu quả của các chiến dịch marketing, acquisition và phát triển kinh doanh.
2.  **Quy mô hiện tại (Current Scale):** "Tại thời điểm này, chúng ta có chính xác bao nhiêu khách hàng và đối tác đang hoạt động trên nền tảng?" - Đây là con số cơ bản để báo cáo cho các bên liên quan (stakeholders) và để hiểu quy mô của hệ thống.

#### Endpoint và Parameters

- **Endpoint:** `GET /admin/reports/users/summary`
- **Parameters:**
  - `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo (áp dụng cho phần thống kê tăng trưởng).
  - `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo (áp dụng cho phần thống kê tăng trưởng).

#### Nguồn dữ liệu (Kiến trúc Hybrid)

Kiến trúc truy cập dữ liệu của API này được thiết kế một cách có chủ đích để đáp ứng hai nhu cầu nghiệp vụ khác nhau:

- **Để trả lời câu hỏi về "Động lực tăng trưởng":**
  - **Nguồn:** `SystemDailyReport`.
  - **Lý do:** Dữ liệu về người dùng/đối tác mới theo từng ngày đã được Tác vụ nền tính toán và tổng hợp sẵn. Việc `SUM` trên bảng này cực kỳ nhanh và hiệu quả, phù hợp để xem xu hướng tăng trưởng theo thời gian.
- **Để trả lời câu hỏi về "Quy mô hiện tại":**
  - **Nguồn:** Bảng giao dịch `User` (và `Role`).
  - **Lý do:** Con số tổng người dùng/đối tác là một "bản chụp" (snapshot) tại thời điểm gọi API. Việc lưu trữ con số này hàng ngày trong `SystemDailyReport` sẽ tạo ra dữ liệu dư thừa và không linh hoạt. Một truy vấn `COUNT` trực tiếp vào bảng `User` (với index phù hợp) là đủ nhanh và luôn đảm bảo trả về con số chính xác nhất tại thời điểm hiện tại.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - Thực hiện **Xác thực & Ủy quyền** (kiểm tra vai trò `ADMIN`) và **Validation** tham số (`from`, `to`).
    - Gọi một phương thức duy nhất trong `Service Layer`, ví dụ `getUserSummary(from, to)`.

2.  **Service Layer (Tầng nghiệp vụ):**

    - Đây là nơi điều phối việc lấy dữ liệu từ hai nguồn khác nhau và tổng hợp chúng lại.
    - **Bước 1: Lấy dữ liệu tăng trưởng theo kỳ:**
      - Gọi phương thức `repository.getNewUsersInPeriod(from, to)`.
    - **Bước 2: Lấy dữ liệu tổng thể hiện tại:**
      - Gọi phương thức `repository.getTotalUserCounts()`.
    - **Bước 3: Tổng hợp và Định dạng:**
      - Tạo một đối tượng DTO cấp cao, ví dụ `UserSummaryReportDto`.
      - DTO này sẽ có hai đối tượng con:
        - `growthInPeriod`: Chứa kết quả từ Bước 1 (`newCustomers`, `newPartners`) và khoảng thời gian (`from`, `to`).
        - `platformTotals`: Chứa kết quả từ Bước 2 (`totalCustomers`, `totalPartners`) và một dấu thời gian (`asOf: "YYYY-MM-DDTHH:mm:ssZ"`) để chỉ rõ thời điểm lấy dữ liệu.
      - Trả về DTO đã được định dạng.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    - Chịu trách nhiệm thực thi các truy vấn từ hai nguồn dữ liệu khác nhau.
    - **Truy vấn 1: Lấy dữ liệu tăng trưởng từ `SystemDailyReport`:**
      ```sql
      SELECT
          SUM(newCustomersRegistered) AS newCustomers,
          SUM(newPartnersRegistered) AS newPartners
      FROM
          SystemDailyReport
      WHERE
          reportDate BETWEEN :from AND :to;
      ```
    - **Truy vấn 2: Lấy dữ liệu tổng thể từ `User`:**
      ```sql
      SELECT
          r.name AS roleName,
          COUNT(u.id) AS userCount
      FROM
          User u
      JOIN
          Role r ON u.roleId = r.id
      WHERE
          r.name IN ('CUSTOMER', 'PARTNER') -- Hoặc tên vai trò bạn đã định nghĩa
      GROUP BY
          r.name;
      ```
      Service Layer sẽ xử lý kết quả này để điền vào các trường `totalCustomers` và `totalPartners`.

#### Xử lý nghiệp vụ và các trường hợp biên

- **Hiệu năng của truy vấn `COUNT`:** Truy vấn `COUNT` trên bảng `User` có thể trở nên chậm khi bảng phát triển rất lớn. Để đảm bảo hiệu năng, cần có:
  - Một **index** trên cột `roleId` của bảng `User`.
  - Cơ sở dữ liệu sẽ sử dụng "index-only scan" để thực hiện việc đếm một cách rất hiệu quả mà không cần truy cập vào dữ liệu của bảng chính.
- **Tính nhất quán của "Đối tác":** Cần làm rõ định nghĩa "đối tác". Nếu một `User` có vai trò `PARTNER` có thể quản lý nhiều `Hotel`, thì `totalPartners` ở đây là đếm số lượng **tài khoản đối tác**, không phải số lượng **khách sạn**. Số lượng khách sạn được lấy từ một truy vấn `COUNT` riêng trên bảng `Hotel`.
- **Không có dữ liệu tăng trưởng:** Nếu không có người dùng mới nào đăng ký trong kỳ, truy vấn `SUM` trên `SystemDailyReport` sẽ trả về `null`. Service Layer phải xử lý để chuyển đổi `null` thành `0`.
- **Độ trễ dữ liệu:** Admin cần hiểu rõ sự khác biệt: Dữ liệu tăng trưởng là "tính đến hết ngày hôm qua", trong khi dữ liệu tổng thể là "thời gian thực". Việc ghi rõ dấu thời gian `asOf` trong phản hồi là rất quan trọng để đảm bảo sự minh bạch.

#### Tái sử dụng cho chức năng so sánh

- Tính năng so sánh chủ yếu áp dụng cho phần **dữ liệu tăng trưởng theo kỳ**.
- Logic wrapper sẽ gọi `repository.getNewUsersInPeriod(from, to)` hai lần cho hai kỳ khác nhau.
- Sau đó, nó sẽ tính toán sự thay đổi (tuyệt đối và phần trăm) cho `newCustomers` và `newPartners` và đưa vào cấu trúc phản hồi.
- Phần dữ liệu tổng thể (`platformTotals`) thường không cần so sánh vì nó luôn là con số mới nhất.
