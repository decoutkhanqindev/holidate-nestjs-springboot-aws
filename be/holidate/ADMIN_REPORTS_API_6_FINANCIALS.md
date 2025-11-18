Tuyệt vời. Chúng ta sẽ cùng nhau phân tích chi tiết **Phần 3, API 6: Báo cáo Tài chính**. Đây là một trong những API quan trọng nhất đối với ban lãnh đạo và bộ phận tài chính, yêu cầu độ chính xác và minh bạch tuyệt đối.

---

## Phần 3: Phân tích chi tiết API và Logic Backend (cho Admin)

### API 6: Báo cáo Tài chính (Financials Report)

#### Mục tiêu nghiệp vụ

API này cung cấp một bản báo cáo kết quả hoạt động kinh doanh (P&L - Profit & Loss Statement) ở mức độ cơ bản, tập trung vào dòng tiền và lợi nhuận của Holidate. Nó phải trả lời các câu hỏi tài chính cốt lõi:

- **Tổng quy mô giao dịch (GMV):** "Tổng giá trị các booking mà khách hàng đã trả qua hệ thống là bao nhiêu?" (thông qua `grossRevenue`).
- **Doanh thu thực tế (Net Revenue):** "Sau khi trừ đi phần phải trả cho đối tác, Holidate thực sự thu về bao nhiêu tiền?" (thông qua `netRevenue`).
- **Chi phí hoạt động chính (Cost of Goods Sold):** "Chi phí lớn nhất của chúng ta - tiền trả cho các khách sạn - là bao nhiêu?" (thông qua `partnerPayout`).
- **Xu hướng tài chính:** "Lợi nhuận của công ty đang tăng trưởng như thế nào theo thời gian?"

API này là nguồn dữ liệu duy nhất và chính xác (single source of truth) cho các quyết định tài chính, từ việc lập ngân sách đến việc đánh giá hiệu quả kinh doanh tổng thể.

#### Endpoint và Parameters

- **Endpoint:** `GET /admin/reports/financials`
- **Parameters:**
  - `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo.
  - `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo.
  - `groupBy` (`string`, optional, enum: `day`, `week`, `month`, default: `day`): Đơn vị thời gian để nhóm dữ liệu, cho phép xem xu hướng tài chính.

#### Nguồn dữ liệu

- **Bảng chính:** `SystemDailyReport`.
- **Nguyên tắc:** API này được thiết kế để có hiệu năng cực cao. Toàn bộ các chỉ số tài chính phức tạp (`grossRevenue`, `netRevenue`) đã được Tác vụ nền tính toán và tổng hợp sẵn. API chỉ có nhiệm vụ đọc, tổng hợp lại theo `groupBy` và tính toán một chỉ số dẫn xuất đơn giản.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - **Xác thực & Ủy quyền:** Kiểm tra vai trò `ADMIN`. Cần cân nhắc thêm một tầng phân quyền chi tiết hơn, ví dụ `FINANCE_ADMIN`, nếu trong tương lai chỉ một nhóm nhỏ Admin được phép xem dữ liệu tài chính nhạy cảm này.
    - **Validation:** Kiểm tra tính hợp lệ của các tham số.
    - Gọi phương thức trong `Service Layer`.

2.  **Service Layer (Tầng nghiệp vụ):**

    - Đây là nơi thực hiện logic tính toán và định dạng cuối cùng.
    - **Bước 1: Gọi Repository:**
      - Gọi một phương thức duy nhất, ví dụ `repository.getFinancialSummary(from, to, groupBy)`.
    - **Bước 2: Tính toán Chỉ số Dẫn xuất và Định dạng:**
      - Repository sẽ trả về một danh sách các DTO, mỗi DTO chứa `period`, `grossRevenue`, và `netRevenue`.
      - Service Layer sẽ lặp qua danh sách này để:
        - Tính toán chỉ số `partnerPayout = grossRevenue - netRevenue` cho mỗi dòng dữ liệu.
        - Tính toán `grossMargin` (biên lợi nhuận gộp): `(netRevenue / grossRevenue) * 100`. Đây là một chỉ số cực kỳ quan trọng.
        - Thực hiện làm tròn tiền tệ.
        - Tính toán các giá trị tổng cho toàn bộ kỳ báo cáo (`summary`).
    - **Bước 3: Đóng gói Dữ liệu trả về:**
      - Tạo một DTO phản hồi cuối cùng, chứa cả dữ liệu chi tiết theo chuỗi thời gian và dữ liệu tóm tắt.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    - Thực thi một truy vấn tổng hợp hiệu quả trên `SystemDailyReport`.
    - Ví dụ, cho `groupBy=month`:
      ```sql
      SELECT
          DATE_TRUNC('month', reportDate)::date AS period,
          SUM(grossRevenue) AS grossRevenue,
          SUM(netRevenue) AS netRevenue
      FROM
          SystemDailyReport
      WHERE
          reportDate BETWEEN :from AND :to
      GROUP BY
          period
      ORDER BY
          period ASC;
      ```

#### Xử lý nghiệp vụ và các trường hợp biên

- **Tính chính xác của `commissionRate`:** Toàn bộ báo cáo này phụ thuộc vào tính chính xác của trường `commissionRate` trong entity `Hotel`. Cần có một quy trình nghiệp vụ rõ ràng để đảm bảo rằng khi một hợp đồng với đối tác thay đổi, `commissionRate` phải được cập nhật ngay lập tức. Cần cân nhắc xem nên lưu lại lịch sử thay đổi `commissionRate` hay không để có thể tính toán lại báo cáo tài chính trong quá khứ một cách chính xác.
- **Làm tròn tiền tệ (Currency Rounding):**
  - Đây là một yêu cầu nghiệp vụ quan trọng trong xử lý tài chính để tránh các sai số tích lũy.
  - Tất cả các giá trị tiền tệ trả về từ API nên được làm tròn đến một số lượng chữ số thập phân nhất quán (ví dụ: 2 chữ số). Việc này nên được thực hiện ở bước cuối cùng trong Service Layer, trước khi gửi đi.
- **Định nghĩa "Chi phí" (`partnerPayout`):** Cần làm rõ rằng `partnerPayout` ở đây chỉ là chi phí trực tiếp trả cho đối tác (Cost of Goods Sold), không bao gồm các chi phí vận hành khác của công ty (lương, marketing, server...).
- **Xử lý Chia cho Không:** Khi tính `grossMargin`, phải xử lý trường hợp `grossRevenue` bằng 0 để tránh lỗi. Nếu `grossRevenue` bằng 0, `grossMargin` cũng phải bằng 0.

#### Tái sử dụng cho chức năng so sánh

- Kiến trúc wrapper được áp dụng một cách hoàn hảo.
- Logic so sánh sẽ gọi phương thức `getFinancialSummary` hai lần.
- Kết quả cuối cùng sẽ hiển thị sự thay đổi (tuyệt đối và phần trăm) cho tất cả các chỉ số tài chính quan trọng: `grossRevenue`, `netRevenue`, `partnerPayout`, và cả `grossMargin`. Điều này cung cấp một công cụ phân tích tài chính cực kỳ mạnh mẽ, ví dụ: "Doanh thu gộp tăng 10% nhưng biên lợi nhuận lại giảm 2%, tại sao?".
