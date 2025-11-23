Chắc chắn rồi. Chúng ta sẽ kết thúc phần phân tích chi tiết cho các API của Partner bằng **API 7: So sánh các kỳ**. Đây không phải là một API endpoint cụ thể, mà là một **"meta-feature"**—một lớp logic được áp dụng lên trên tất cả các API báo cáo khác.

---

### API 7: So sánh các kỳ (Period Comparison)

#### Mục tiêu nghiệp vụ

Tính năng này cung cấp cho đối tác một trong những công cụ phân tích mạnh mẽ nhất: **bối cảnh**. Một con số đơn lẻ (ví dụ: "doanh thu tháng này là 1 tỷ") gần như vô nghĩa nếu không có điểm tham chiếu. Tính năng so sánh giúp đối tác trả lời các câu hỏi kinh doanh cốt lõi:

- **Đánh giá tăng trưởng:** "Hoạt động kinh doanh của tôi đang tốt lên hay xấu đi so với tháng trước?"
- **Phân tích mùa vụ:** "Doanh thu tháng 12 năm nay có cao hơn so với tháng 12 năm ngoái không?"
- **Đo lường hiệu quả chiến dịch:** "Tỷ lệ lấp đầy sau khi tôi chạy chương trình khuyến mãi tuần này có cao hơn tuần trước đó không?"

Bằng cách cung cấp bối cảnh, tính năng này biến dữ liệu thô thành thông tin chi tiết có thể hành động (actionable insights).

#### Kiến trúc và Thiết kế Logic

Thay vì tạo ra các endpoint riêng biệt như `/revenue/compare`, `/occupancy/compare`... (vi phạm nguyên tắc DRY), chúng ta sẽ mở rộng các API hiện có để chúng có khả năng xử lý việc so sánh một cách linh hoạt.

- **Mở rộng Parameters:** Tất cả các API báo cáo (`/revenue`, `/bookings/summary`, etc.) sẽ chấp nhận thêm hai tham số tùy chọn:
  - `compareFrom` (`string`, `YYYY-MM-DD`, optional): Ngày bắt đầu của kỳ so sánh.
  - `compareTo` (`string`, `YYYY-MM-DD`, optional): Ngày kết thúc của kỳ so sánh.
- **Điều kiện kích hoạt:** Logic so sánh chỉ được kích hoạt nếu **cả hai** tham số `compareFrom` và `compareTo` đều được cung cấp. Nếu chỉ có một, API sẽ bỏ qua và hoạt động như bình thường.

#### Luồng xử lý Backend chi tiết

Logic so sánh được triển khai chủ yếu ở **Service Layer** dưới dạng một "wrapper" hoặc một phương thức cấp cao hơn.

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - **Xác thực và Ủy quyền (Authentication & Authorization):** Xác thực token của người dùng và kiểm tra role là `PARTNER`. Nếu không, trả về lỗi `403 Forbidden`.
    - **Validation (Kiểm tra tính hợp lệ của tham số):**
      - Kiểm tra tính hợp lệ của tất cả các tham số, bao gồm cả `compareFrom` và `compareTo` (nếu có).
      - Đảm bảo `compareFrom <= compareTo`.
    - Gọi một phương thức duy nhất trong Service, ví dụ `getRevenueReport(requestDto)`. `requestDto` sẽ chứa tất cả các tham số, bao gồm cả thông tin về kỳ hiện tại và kỳ so sánh.

2.  **Service Layer (Tầng nghiệp vụ):**

    - Đây là nơi logic so sánh được dàn dựng.
    - **Bước 1: Tách biệt logic cốt lõi:**
      - Đảm bảo rằng logic để lấy dữ liệu cho một kỳ duy nhất được đóng gói trong một phương thức riêng, có thể tái sử dụng. Ví dụ: `private RevenueData getSinglePeriodRevenue(hotelId, from, to)`.
    - **Bước 2: Gọi logic cốt lõi hai lần:**
      - Gọi phương thức `getSinglePeriodRevenue` cho kỳ hiện tại (`from`, `to`).
      - Nếu `compareFrom` và `compareTo` tồn tại, gọi lại phương thức `getSinglePeriodRevenue` cho kỳ so sánh.
    - **Bước 3: Tính toán so sánh:**

      - Sau khi có được hai bộ dữ liệu (ví dụ: `currentPeriodData` và `previousPeriodData`), thực hiện tính toán so sánh cho các chỉ số chính.
      - **Logic tính toán (ví dụ cho doanh thu):**

        ```java
        // Pseudocode
        double currentRevenue = currentPeriodData.getSummary().getTotalRevenue();
        double previousRevenue = previousPeriodData.getSummary().getTotalRevenue();

        double difference = currentRevenue - previousRevenue;
        double percentageChange = 0.0;
        if (previousRevenue != 0) { // Quan trọng: Tránh chia cho không
            percentageChange = (difference / previousRevenue) * 100.0;
        } else if (currentRevenue > 0) {
            percentageChange = 100.0; // Hoặc một giá trị vô cực tùy theo quy ước
        }
        ```

    - **Bước 4: Xây dựng cấu trúc phản hồi hợp nhất:**
      - Tạo một đối tượng DTO cấp cao, ví dụ `ComparisonReportDto`.
      - Đối tượng này sẽ chứa:
        - Một đối tượng cho dữ liệu kỳ hiện tại (`currentPeriodData`).
        - Một đối tượng cho dữ liệu kỳ so sánh (`previousPeriodData`).
        - Một đối tượng chứa các kết quả so sánh (`comparison`, bao gồm `difference` và `percentageChange`).

#### Xử lý nghiệp vụ và các trường hợp biên

- **Xử lý Chia cho Không:** Đây là trường hợp biên quan trọng nhất. Khi chỉ số của kỳ trước bằng 0, không thể tính phần trăm thay đổi một cách thông thường. Hệ thống phải có quy tắc xử lý rõ ràng:
  - Nếu kỳ trước = 0 và kỳ này > 0: `percentageChange` có thể là `100.0` (tăng trưởng tuyệt đối) hoặc một giá trị đặc biệt (`Infinity`, `null`). `100.0` thường dễ xử lý hơn cho client.
  - Nếu kỳ trước = 0 và kỳ này = 0: `percentageChange` là `0.0`.
- **So sánh Dữ liệu Chi tiết (Ví dụ: Doanh thu theo ngày):**
  - Đối với các báo cáo có dữ liệu chi tiết theo chuỗi thời gian (như doanh thu theo ngày), API không nên cố gắng so sánh từng điểm dữ liệu (ngày 1 của kỳ này vs ngày 1 của kỳ trước).
  - Thay vào đó, API nên trả về hai bộ dữ liệu chi tiết riêng biệt (`currentPeriod.data` và `previousPeriod.data`). Client (frontend) sẽ chịu trách nhiệm vẽ hai đường biểu đồ trên cùng một trục để so sánh trực quan.
- **So sánh Dữ liệu Phân loại (Ví dụ: Hiệu suất phòng):**
  - Đây là trường hợp phức tạp nhất. Logic so sánh cần "merge" hai danh sách hiệu suất phòng dựa trên `roomId`.
  - Kết quả cuối cùng là một danh sách duy nhất, trong đó mỗi phần tử chứa thông tin của một phòng và bao gồm cả dữ liệu của kỳ hiện tại, kỳ trước, và các chỉ số so sánh.
- **Tính nhất quán của khoảng thời gian:** Đối tác thường so sánh các khoảng thời gian có độ dài bằng nhau (ví dụ: 7 ngày này vs 7 ngày trước, tháng 11 vs tháng 10). Tuy nhiên, API nên đủ linh hoạt để xử lý các khoảng thời gian có độ dài khác nhau. Việc diễn giải kết quả so sánh trong trường hợp này thuộc về người dùng.

#### Lợi ích của kiến trúc Wrapper

- **Tái sử dụng code (DRY):** Logic báo cáo cốt lõi chỉ cần viết và kiểm thử một lần.
- **Dễ bảo trì:** Khi cần sửa lỗi hoặc thay đổi logic tính toán của một chỉ số, chỉ cần sửa ở một nơi duy nhất (`getSinglePeriod...`).
- **Mở rộng linh hoạt:** Tất cả các báo cáo trong tương lai có thể dễ dàng có thêm tính năng so-sánh bằng cách áp dụng cùng một mẫu thiết kế wrapper này.
