Chắc chắn rồi. Chúng ta sẽ đi sâu vào phân tích chi tiết **Phần 3, API 6: Phân tích Đánh giá**, tuân thủ định dạng Markdown và tập trung vào các khía cạnh nghiệp vụ, logic backend, cũng như các quyết định thiết kế đằng sau nó.

---

### API 6: Phân tích Đánh giá (Review Analysis)

#### Mục tiêu nghiệp vụ

API này là công cụ thiết yếu để đối tác "lắng nghe" tiếng nói của khách hàng. Nó không chỉ cung cấp một con số trung bình, mà còn là một bức tranh chi tiết về sự hài lòng của khách hàng, giúp đối tác trả lời các câu hỏi sau:

- **Đánh giá tổng quan:** "Nhìn chung, khách hàng hài lòng với dịch vụ ở mức độ nào?" (thông qua `averageScore`).
- **Mức độ tương tác:** "Khách hàng có tích cực để lại phản hồi không?" (thông qua `totalReviews`).
- **Phát hiện vấn đề nghiêm trọng:** "Có nhiều đánh giá tiêu cực (1-2 sao) không?" (thông qua `scoreDistribution`). Một điểm trung bình khá có thể che giấu một số lượng lớn các trải nghiệm rất tệ. Phân bổ điểm sẽ phơi bày điều này.
- **Xác định điểm mạnh:** "Điểm mạnh của khách sạn có phải là các trải nghiệm xuất sắc (9-10 sao) không?"

Dữ liệu này là cơ sở để đối tác cải thiện chất lượng dịch vụ, phản hồi các bình luận tiêu cực, và củng cố các điểm mạnh của mình.

#### Endpoint và Parameters

- **Endpoint:** `GET /partner/reports/reviews/summary`
- **Parameters:**
  - `hotelId` (`UUID`, required): ID của khách sạn, được lấy một cách an toàn từ context của người dùng đã xác thực.
  - `from` (`string`, `YYYY-MM-DD`, required): Ngày bắt đầu của kỳ báo cáo.
  - `to` (`string`, `YYYY-MM-DD`, required): Ngày kết thúc của kỳ báo cáo.

#### Nguồn dữ liệu

- **Kiến trúc Hybrid (Lai):** API này sử dụng một kiến trúc truy cập dữ liệu lai để cân bằng giữa hiệu năng và độ chi tiết, một quyết định thiết kế quan trọng.
  - **Bảng tổng hợp `HotelDailyReport`:** Được sử dụng để lấy các chỉ số tổng quan (`averageReviewScore`, `reviewCount`). Điều này đảm bảo các con số chính trên dashboard được tải gần như tức thì.
  - **Bảng giao dịch `Review`:** Được sử dụng để tính toán `scoreDistribution` (phân bổ điểm). Việc này là một ngoại lệ có chủ đích vì việc tính toán trước và lưu trữ tất cả các khoảng điểm có thể làm "phình" bảng `HotelDailyReport` và thiếu linh hoạt. Một truy vấn trực tiếp có index vào bảng `Review` cho mục đích này là hoàn toàn chấp nhận được.

#### Luồng xử lý Backend chi tiết

1.  **Controller Layer (Tầng điều khiển):**

    - Tiếp nhận yêu cầu HTTP `GET`.
    - **Xác thực và Ủy quyền (Authentication & Authorization):** Xác thực token của người dùng và kiểm tra role là `PARTNER`. Nếu không, trả về lỗi `403 Forbidden`.
    - **Validation (Kiểm tra tính hợp lệ của tham số):** Kiểm tra định dạng và thứ tự của `from` và `to`.
    - Gọi một phương thức duy nhất trong `Service Layer`, ví dụ `getReviewAnalysis(hotelId, from, to)`.

2.  **Service Layer (Tầng nghiệp vụ):**

    - Đây là nơi điều phối và kết hợp dữ liệu từ hai nguồn khác nhau.
    - **Bước 1: Lấy dữ liệu tổng hợp:**
      - Gọi phương thức `repository.getAggregatedReviewStats(hotelId, from, to)`. Phương thức này sẽ truy vấn bảng `HotelDailyReport`.
    - **Bước 2: Lấy dữ liệu phân bổ điểm:**
      - Gọi phương thức `repository.getScoreDistribution(hotelId, from, to)`. Phương thức này sẽ truy vấn trực tiếp bảng `Review`.
    - **Bước 3: Tính toán chỉ số nghiệp vụ:**
      - **`totalReviews`:** Được lấy trực tiếp từ kết quả tổng hợp của `SUM(reviewCount)`.
      - **`averageScore` (Trung bình có trọng số):** Đây là logic nghiệp vụ quan trọng nhất. Service Layer sẽ nhận về hai giá trị từ Repository: `totalWeightedScoreSum` (tổng của `averageReviewScore * reviewCount`) và `totalReviewCount`. Sau đó, nó sẽ thực hiện phép tính cuối cùng:
        ```java
        // Pseudocode
        double totalWeightedScoreSum = stats.getTotalWeightedScoreSum();
        long totalReviewCount = stats.getTotalReviewCount();
        double averageScore = 0.0;
        if (totalReviewCount > 0) {
            averageScore = totalWeightedScoreSum / totalReviewCount;
        }
        ```
    - **Bước 4: Tổng hợp kết quả:** Kết hợp `totalReviews`, `averageScore` đã tính, và `scoreDistribution` nhận được từ Repository vào một đối tượng DTO duy nhất để trả về.

3.  **Repository/DAO Layer (Tầng truy cập dữ liệu):**
    - Chịu trách nhiệm thực thi hai truy vấn riêng biệt.
    - **Truy vấn 1: Lấy chỉ số tổng hợp từ `HotelDailyReport`:**
      ```sql
      SELECT
          SUM(averageReviewScore * reviewCount) AS totalWeightedScore,
          SUM(reviewCount) AS totalReviews
      FROM
          HotelDailyReport
      WHERE
          hotelId = :hotelId AND reportDate BETWEEN :from AND :to;
      ```
    - **Truy vấn 2: Lấy phân bổ điểm từ `Review`:**
      ```sql
      SELECT
          CASE
              WHEN score BETWEEN 9 AND 10 THEN '9-10'
              WHEN score BETWEEN 7 AND 8 THEN '7-8'
              WHEN score BETWEEN 5 AND 6 THEN '5-6'
              WHEN score BETWEEN 3 AND 4 THEN '3-4'
              ELSE '1-2'
          END AS scoreBucket,
          COUNT(id) AS reviewCount
      FROM
          Review
      WHERE
          hotelId = :hotelId AND createdAt BETWEEN :from_timestamp AND :to_timestamp
      GROUP BY
          scoreBucket;
      ```

#### Xử lý nghiệp vụ và các trường hợp biên

- **Sự cần thiết của Trung bình có trọng số:** Việc tính `averageScore` bằng công thức `SUM(averageReviewScore * reviewCount) / SUM(reviewCount)` là bắt buộc. Nếu chỉ tính trung bình đơn giản (`AVG(averageReviewScore)`), một ngày có 1 đánh giá 10 điểm sẽ có trọng số ngang bằng với một ngày có 100 đánh giá 8 điểm, dẫn đến kết quả sai lệch. Trung bình có trọng số đảm bảo mỗi đánh giá đều có giá trị như nhau.

- **Chia cho Không (Divide by Zero):** Trong Service Layer, trước khi thực hiện phép chia để tính `averageScore`, phải kiểm tra `totalReviewCount > 0`. Nếu không có đánh giá nào trong kỳ, `averageScore` phải được trả về là `0` (hoặc `null` tùy theo yêu cầu) và `totalReviews` là `0`.

- **Phân bổ điểm trống:** Nếu truy vấn `getScoreDistribution` không trả về kết quả cho một khoảng điểm nào đó (ví dụ: không có đánh giá 1-2 sao), DTO trả về nên bao gồm tất cả các khoảng điểm với giá trị `0` cho những khoảng trống đó để đảm bảo cấu trúc dữ liệu nhất quán cho client.

- **Độ trễ dữ liệu (Data Latency):** Do kiến trúc hybrid, đối tác cần ngầm hiểu rằng các chỉ số tổng quan (`averageScore`, `totalReviews`) là dữ liệu tính đến hết ngày hôm qua, trong khi `scoreDistribution` là dữ liệu gần như thời gian thực.

#### Tái sử dụng cho chức năng so sánh

- Phương thức `getReviewAnalysis` trong Service Layer có thể được tái sử dụng.
- Logic wrapper cho API so sánh sẽ:
  1.  Gọi `getReviewAnalysis` hai lần cho kỳ hiện tại và kỳ so sánh.
  2.  Tính toán sự thay đổi cho `averageScore` và `totalReviews`.
  3.  Đối với `scoreDistribution`, kết quả sẽ bao gồm hai bộ dữ liệu phân bổ, cho phép client hiển thị chúng song song (ví dụ: hai bộ biểu đồ cột) để so sánh trực quan.
