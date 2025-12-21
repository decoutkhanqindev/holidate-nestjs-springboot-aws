Chắc chắn rồi. Chúng ta sẽ kết thúc phần phân tích chi tiết cho các API của Admin bằng **API 7: So sánh hiệu suất giữa các kỳ**. Đây là một "meta-feature" áp dụng cho toàn bộ hệ thống báo cáo, nâng cao giá trị của tất cả các API khác.

---

## Phần 3: Phân tích chi tiết API và Logic Backend (cho Admin)

### API 7: So sánh hiệu suất giữa các kỳ (Period Comparison)

#### Mục tiêu nghiệp vụ

Tính năng này cung cấp cho Admin năng lực phân tích so sánh mạnh mẽ, biến mọi báo cáo từ một "bản chụp" (snapshot) tĩnh thành một công cụ đo lường động. Mục tiêu nghiệp vụ là cho phép Admin trả lời các câu hỏi chiến lược dựa trên sự thay đổi theo thời gian:

- **Đánh giá Hiệu quả Chiến dịch:** "Doanh thu toàn hệ thống sau khi triển khai chiến dịch Black Friday (kỳ hiện tại) đã tăng trưởng bao nhiêu so với tuần trước đó (kỳ so sánh)?"
- **Phân tích Tăng trưởng Năm qua Năm (Year-over-Year Growth):** "Số lượng người dùng mới đăng ký trong Quý 1 năm nay so với Quý 1 năm ngoái như thế nào?"
- **Phát hiện Dấu hiệu Bất thường:** "Tại sao tỷ lệ hủy phòng của thành phố Đà Nẵng tháng này lại tăng vọt so với tháng trước?"

Bằng cách đặt các chỉ số vào bối cảnh thời gian, tính năng này giúp Admin chuyển từ việc quan sát dữ liệu sang việc diễn giải và hành động dựa trên sự thay đổi của chúng.

#### Kiến trúc và Thiết kế Logic

Kiến trúc cốt lõi là xây dựng một **lớp logic so sánh (Comparison Logic Layer)** có thể tái sử dụng, thay vì tạo ra các endpoint riêng biệt.

- **Mở rộng Parameters:** Mọi API báo cáo của Admin (`/revenue`, `/hotel-performance`, `/financials`, etc.) sẽ được nâng cấp để chấp nhận hai tham số tùy chọn:
  - `compareFrom` (`string`, `YYYY-MM-DD`, optional): Ngày bắt đầu của kỳ so sánh.
  - `compareTo` (`string`, `YYYY-MM-DD`, optional): Ngày kết thúc của kỳ so sánh.
- **Thiết kế DTO Phản hồi (Response DTO Design):** Cấu trúc dữ liệu trả về của các API sẽ được điều chỉnh để chứa được thông tin so sánh. Một mẫu thiết kế phổ biến là:
  ```json
  {
    "currentPeriod": {
      "from": "...",
      "to": "...",
      "data": [...], // Dữ liệu chi tiết của kỳ hiện tại
      "summary": {...} // Dữ liệu tóm tắt của kỳ hiện tại
    },
    "previousPeriod": {
      "from": "...",
      "to": "...",
      "data": [...], // Dữ liệu chi tiết của kỳ so sánh
      "summary": {...} // Dữ liệu tóm tắt của kỳ so sánh
    },
    "comparison": {
      // Chỉ số so sánh cho các giá trị tóm tắt
      "totalRevenue": {
        "difference": 25000000,
        "percentageChange": 15.5
      },
      // ... các chỉ số khác
    }
  }
  ```

#### Luồng xử lý Backend chi tiết

Logic so sánh được triển khai chủ yếu ở **Service Layer** dưới dạng một phương thức "wrapper" hoặc sử dụng các mẫu thiết kế như Strategy hoặc Decorator Pattern để làm cho code sạch sẽ và có thể mở rộng.

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - **Xác thực và Ủy quyền (Authentication & Authorization):** Xác thực token của người dùng và kiểm tra role là `ADMIN`. Nếu không, trả về lỗi `403 Forbidden`.
    - **Validation (Kiểm tra tính hợp lệ của tham số):**
      - Kiểm tra tính hợp lệ của tất cả các tham số.
      - Nếu `compareFrom` được cung cấp, thì `compareTo` cũng phải được cung cấp và ngược lại.
      - Đảm bảo `compareFrom <= compareTo`.
    - Gọi một phương thức cấp cao duy nhất trong Service, ví dụ `getFinancialReport(requestDto)`, trong đó DTO chứa cả hai bộ tham số ngày.

2.  **Service Layer (Tầng nghiệp vụ - Logic Wrapper):**
    - **Bước 1: Tách biệt logic cốt lõi:**
      - Đảm bảo logic nghiệp vụ để lấy dữ liệu cho một kỳ duy nhất được đóng gói trong một phương thức `private` hoặc `protected`, ví dụ: `private ReportData getSinglePeriodData(params)`.
    - **Bước 2: Thực thi song song (nếu có thể):**
      - Gọi `getSinglePeriodData` cho kỳ hiện tại.
      - Nếu có tham số so sánh, gọi `getSinglePeriodData` cho kỳ so sánh. Để tối ưu hóa, hai lời gọi này có thể được thực thi song song bằng cách sử dụng `CompletableFuture` (trong Java) hoặc các cơ chế bất đồng bộ tương tự để giảm thời gian chờ đợi tổng thể.
    - **Bước 3: Hợp nhất và Tính toán so sánh:**
      - Chờ cả hai kết quả trả về.
      - Thực hiện logic "merge" và tính toán `difference` và `percentageChange` cho từng chỉ số trong phần `summary`.
      - Đối với các báo cáo dạng danh sách (như Hiệu suất Khách sạn), logic merge sẽ phức tạp hơn, cần phải khớp các thực thể (ví dụ: `hotelId`) giữa hai kỳ.
    - **Bước 4: Xây dựng cấu trúc phản hồi hợp nhất:**
      - Tạo đối tượng DTO phản hồi cuối cùng theo cấu trúc đã thiết kế ở trên và trả về.

#### Xử lý nghiệp vụ và các trường hợp biên

- **So sánh Dữ liệu Phân loại (Categorical Data):**
  - Khi so sánh một danh sách như "Top 10 Khách sạn", API không chỉ so sánh các chỉ số của từng khách sạn mà còn có thể cung cấp thêm thông tin về **sự thay đổi thứ hạng (rank change)**.
  - Ví dụ: Khách sạn A từ hạng 5 kỳ trước lên hạng 2 kỳ này (thay đổi: ▲3). Việc này đòi hỏi logic xử lý phức tạp hơn ở Service Layer sau khi đã có hai danh sách đã được sắp xếp.
- **Xử lý Chia cho Không:** Logic tính `percentageChange` phải luôn kiểm tra mẫu số (giá trị của kỳ trước). Nếu giá trị kỳ trước là 0, cần áp dụng quy tắc nghiệp vụ rõ ràng (ví dụ: trả về `100.0%` nếu giá trị kỳ này > 0, hoặc `null` để client tự diễn giải).
- **Tính nhất quán của Dữ liệu:** Khi so sánh, cả hai bộ dữ liệu đều được lấy từ cùng một nguồn (`SystemDailyReport` hoặc `HotelDailyReport`), đảm bảo tính nhất quán trong cách tính toán.
- **API Response Time:** Vì logic so sánh thực hiện truy vấn hai lần, thời gian phản hồi của API có thể tăng lên. Việc thực thi song song các lời gọi lấy dữ liệu là một kỹ thuật tối ưu hóa quan trọng để giảm thiểu ảnh hưởng này.
- **Độ phức tạp của Client:** Cấu trúc phản hồi so sánh phức tạp hơn. Client (frontend) cần được thiết kế để có thể xử lý và hiển thị cấu trúc này một cách hiệu quả, ví dụ như vẽ hai đường biểu đồ, hiển thị các chỉ số phần trăm thay đổi, hoặc tô màu các giá trị tăng/giảm.
