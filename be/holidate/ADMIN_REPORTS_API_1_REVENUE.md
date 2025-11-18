Chắc chắn rồi. Chúng ta sẽ bắt đầu phân tích chi tiết **Phần 3** cho Admin, bắt đầu với **API 1: Báo cáo Doanh thu tổng hợp**. Đây là một trong những API đa năng và quan trọng nhất, thể hiện rõ chiến lược dữ liệu hai cấp độ.

---

## Phần 3: Phân tích chi tiết API và Logic Backend (cho Admin)

### API 1: Báo cáo Doanh thu tổng hợp

#### Mục tiêu nghiệp vụ

API này là công cụ tài chính và kinh doanh cốt lõi, được thiết kế để cung cấp cho Admin một cái nhìn 360 độ về dòng tiền của toàn bộ hệ thống. Nó phải đáp ứng được nhiều cấp độ phân tích khác nhau:

- **Cấp độ Vĩ mô (Macro):** Trả lời câu hỏi "Tổng doanh thu của Holidate trong quý này là bao nhiêu?" một cách nhanh nhất.
- **Cấp độ Phân khúc (Segment):** Trả lời câu hỏi "Thành phố nào đang đóng góp nhiều doanh thu nhất?" hoặc "Top 10 khách sạn có doanh thu cao nhất là những khách sạn nào?".
- **Cấp độ Xu hướng (Trend):** Cho phép Admin xem biểu đồ xu hướng doanh thu theo thời gian (ngày, tuần, tháng) cho bất kỳ phân khúc nào đã chọn.

Đây là API nền tảng cho việc ra quyết định chiến lược, từ việc phân bổ ngân sách marketing cho các khu vực tiềm năng đến việc đánh giá hiệu quả của các nhóm đối tác.

#### Endpoint và Parameters

- **Endpoint:** `GET /admin/reports/revenue`
- **Parameters:**
  - `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo.
  - `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo.
  - `groupBy` (`string`, optional, enum: `day`, `week`, `month`, default: `day`): Đơn vị thời gian để nhóm dữ liệu xu hướng.
  - `filterBy` (`string`, optional, enum: `hotel`, `city`, `province`): Chiều dữ liệu để phân tích chi tiết. Nếu không được cung cấp, API sẽ trả về báo cáo tổng hợp toàn hệ thống.

#### Nguồn dữ liệu (Kiến trúc hai cấp độ)

- **Khi `filterBy` không được cung cấp:** API sẽ chỉ truy vấn vào bảng `SystemDailyReport`. Đây là trường hợp sử dụng tối ưu nhất, cho phép tải dashboard chính của Admin gần như tức thì.
- **Khi `filterBy` được cung cấp:** API sẽ "khoan sâu" xuống bảng `HotelDailyReport`. Logic sẽ yêu cầu `JOIN` với các bảng khác (`Hotel`, `City`, `Province`) để lấy thông tin mô tả và thực hiện nhóm dữ liệu.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - **Xác thực và Ủy quyền:**
      - Xác thực token của người dùng.
      - Kiểm tra vai trò (role) của người dùng phải là `ADMIN`. Nếu không, trả về lỗi `403 Forbidden`.
    - **Validation:**
      - Kiểm tra tính hợp lệ của `from`, `to`, `groupBy`, và `filterBy`.
    - Gọi phương thức tương ứng trong `Service Layer`.

2.  **Service Layer (Tầng nghiệp vụ):**

    - Đây là nơi điều phối logic dựa trên các tham số.
    - **Phân luồng logic dựa trên `filterBy`:**
      - **Trường hợp 1: `filterBy` là null (Báo cáo tổng hợp):**
        - Gọi `repository.getSystemRevenue(from, to, groupBy)`.
        - Logic đơn giản, hiệu năng cao, lấy dữ liệu trực tiếp từ `SystemDailyReport`.
      - **Trường hợp 2: `filterBy` là `hotel`, `city`, hoặc `province` (Báo cáo chi tiết):**
        - Gọi một phương thức chung, linh hoạt hơn, ví dụ `repository.getDrillDownRevenue(from, to, groupBy, filterBy)`.
        - Phương thức này sẽ chịu trách nhiệm xây dựng các truy vấn `JOIN` và `GROUP BY` phức tạp hơn.
    - **Tính toán và Định dạng:** Dù đi theo luồng nào, Service Layer cũng chịu trách nhiệm tính toán tổng cuối cùng và định dạng đối tượng DTO trả về một cách nhất quán.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    - Chứa các phương thức truy vấn tương ứng với hai luồng logic.
    - **Truy vấn cho Báo cáo tổng hợp:**
      ```sql
      -- groupBy = 'month'
      SELECT
          DATE_TRUNC('month', reportDate)::date AS period,
          SUM(grossRevenue) AS revenue
      FROM
          SystemDailyReport
      WHERE
          reportDate BETWEEN :from AND :to
      GROUP BY
          period
      ORDER BY
          period ASC;
      ```
    - **Truy vấn cho Báo cáo chi tiết (ví dụ `filterBy=city`):**
      ```sql
      SELECT
          c.id AS filterId,
          c.name AS filterName,
          SUM(hdr.totalRevenue) AS revenue
      FROM
          HotelDailyReport hdr
      JOIN
          Hotel h ON hdr.hotelId = h.id
      JOIN
          City c ON h.cityId = c.id -- Giả sử Hotel có cityId
      WHERE
          hdr.reportDate BETWEEN :from AND :to
      GROUP BY
          c.id, c.name
      ORDER BY
          revenue DESC; -- Thường sắp xếp theo doanh thu giảm dần
      ```
    - **Lưu ý:** Để có cả dữ liệu xu hướng và dữ liệu phân loại, cần có hai truy vấn riêng biệt hoặc một truy vấn phức tạp hơn. Cách tiếp cận phổ biến là trả về top N (ví dụ top 10 thành phố) và một mục "Khác" (Others).

#### Xử lý nghiệp vụ và các trường hợp biên

- **Hiệu năng của truy vấn JOIN:** Khi thực hiện `JOIN` qua nhiều bảng (`HotelDailyReport` → `Hotel` → `City` → `Province`), cần đảm bảo tất cả các cột khóa ngoại (`hotelId`, `cityId`, `provinceId`...) đều được **đánh index** một cách cẩn thận. Nếu không, hiệu năng sẽ suy giảm nghiêm trọng khi dữ liệu lớn lên.
- **Tính nhất quán của dữ liệu địa lý:** Báo cáo phụ thuộc vào tính chính xác của dữ liệu địa lý trong bảng `Hotel`. Nếu một khách sạn thiếu thông tin `cityId`, nó sẽ bị loại khỏi báo cáo doanh thu theo thành phố. Cần có cơ chế đảm bảo tính toàn vẹn của dữ liệu này.
- **Số lượng kết quả lớn (khi `filterBy=hotel`):** Danh sách khách sạn có thể lên đến hàng ngàn. API báo cáo doanh thu theo khách sạn phải được **phân trang (pagination)** để tránh trả về một lượng dữ liệu quá lớn gây quá tải cho cả server và client.
- **Không có dữ liệu:** Nếu không có doanh thu trong kỳ, API phải trả về `200 OK` với cấu trúc dữ liệu hợp lệ (mảng rỗng, tổng bằng 0).

#### Tái sử dụng cho chức năng so sánh

- Kiến trúc wrapper như đã định nghĩa cho Partner được áp dụng hoàn hảo ở đây.
- Phương thức `getRevenueReport(requestDto)` trong Service sẽ được gọi hai lần.
- Logic so sánh sẽ được áp dụng cho cả con số tổng hợp và có thể cho từng mục trong báo cáo chi tiết (ví dụ: hiển thị % tăng/giảm doanh thu cho từng thành phố). Điều này cung cấp một công cụ phân tích cực kỳ mạnh mẽ cho Admin.
