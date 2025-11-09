# HƯỚNG DẪN VẼ USE CASE DIAGRAM - WEBSITE HOLIDATE

## TỔNG QUAN

Tài liệu này hướng dẫn chi tiết cách vẽ Use Case Diagram cho hệ thống Website Holidate, bao gồm các actors, use cases, và các mối quan hệ generalization, include, extend.

---

## 1. ACTORS VÀ GENERALIZATION

### 1.1. **Primary Actors (Human Actors)**

#### **A. Khách hàng (User)**

- **Loại**: Human Actor
- **Mô tả**: Người sử dụng dịch vụ đặt phòng khách sạn
- **Vai trò**: Tìm kiếm, đặt phòng, đánh giá

#### **B. Đối tác Khách sạn (Partner)**

- **Loại**: Human Actor
- **Mô tả**: Người quản lý khách sạn của mình
- **Vai trò**: Quản lý khách sạn, phòng, đặt phòng, báo cáo
- **Generalization**: Kế thừa từ **Khách hàng** (Partner → User)

#### **C. Quản trị viên (Admin)**

- **Loại**: Human Actor
- **Mô tả**: Người quản lý toàn bộ hệ thống
- **Vai trò**: Quản lý hệ thống, người dùng, địa điểm, tiện ích, khuyến mãi
- **Generalization**: Kế thừa từ **Đối tác Khách sạn** (Admin → Partner)
- **Kết quả**: Admin có tất cả quyền của Partner và User

### 1.2. **Secondary Actors (External Systems)**

#### **D. VNPay**

- **Loại**: External System Actor
- **Mô tả**: Hệ thống thanh toán điện tử VNPay
- **Vai trò**: Xử lý thanh toán và hoàn tiền

#### **E. OpenAI API**

- **Loại**: External System Actor
- **Mô tả**: Hệ thống AI cung cấp dịch vụ Chatbot
- **Vai trò**: Xử lý các yêu cầu AI và trả về phản hồi thông minh

### 1.3. **Cấu trúc Generalization**

```
Khách hàng (User)
      ▲
      │ (Generalization)
      │
Đối tác Khách sạn (Partner)
      ▲
      │ (Generalization)
      │
Quản trị viên (Admin)
```

**Giải thích:**

- **Partner → User**: Partner kế thừa tất cả use cases của User
- **Admin → Partner**: Admin kế thừa tất cả use cases của Partner (và gián tiếp có tất cả use cases của User)
- **Hierarchy**: User → Partner → Admin

---

## 2. USE CASES CHÍNH

### 2.1. **Use Cases của Khách hàng (User)**

#### **Nhóm 1: Xác thực và đăng nhập**

1. **Đăng ký tài khoản mới**
2. **Đăng nhập bằng email và mật khẩu**
3. **Đăng nhập bằng Google OAuth2**
4. **Đăng xuất**
5. **Xác thực email (OTP)**
6. **Đặt lại mật khẩu**

#### **Nhóm 2: Quản lý thông tin cá nhân**

7. **Xem thông tin tài khoản**
8. **Cập nhật thông tin cá nhân**

#### **Nhóm 3: Tìm kiếm và khám phá phòng**

9. **Tìm kiếm khách sạn**
10. **Xem danh sách phòng**
11. **Xem chi tiết phòng**
12. **Xem đánh giá khách sạn**
13. **Xem thông tin địa điểm**
14. **Xem tiện ích**
15. **Xem khuyến mãi**
16. **Sử dụng Chatbot AI để tìm phòng**

#### **Nhóm 4: Quản lý đặt phòng**

17. **Tạo đặt phòng mới**
18. **Xem trước giá trước khi đặt**
19. **Xem danh sách đặt phòng**
20. **Xem chi tiết đặt phòng**
21. **Hủy đặt phòng**
22. **Đổi lịch đặt phòng**
23. **Thanh toán**
24. **Thực hiện check-in**
25. **Thực hiện check-out**

#### **Nhóm 5: Quản lý đánh giá**

26. **Viết đánh giá**
27. **Chỉnh sửa đánh giá**
28. **Xóa đánh giá**

### 2.2. **Use Cases của Đối tác Khách sạn (Partner)**

**Lưu ý**: Partner kế thừa tất cả use cases của User (trừ "Đăng ký tài khoản mới"), và có thêm các use cases sau:

#### **Nhóm 6: Xác thực và đăng nhập (Partner)**

29. **Đăng nhập bằng email và mật khẩu** (kế thừa từ User)
30. **Đăng nhập bằng Google OAuth2** (kế thừa từ User)
31. **Đăng xuất** (kế thừa từ User)
32. **Đặt lại mật khẩu** (kế thừa từ User)
33. **Lưu ý**: Partner không thể tự đăng ký, chỉ Admin mới có quyền tạo tài khoản Partner

#### **Nhóm 7: Quản lý khách sạn (Partner)**

34. **Cập nhật thông tin khách sạn**

#### **Nhóm 8: Quản lý phòng (Partner)**

35. **Tạo phòng mới**
36. **Cập nhật thông tin phòng**
37. **Xóa phòng**

#### **Nhóm 9: Quản lý kho phòng (Partner)**

38. **Xem thông tin kho phòng**
39. **Tạo bản ghi kho phòng**
40. **Cập nhật thông tin kho phòng**
41. **Xóa bản ghi kho phòng**

#### **Nhóm 10: Quản lý đặt phòng (Partner - mở rộng)**

42. **Xóa đặt phòng** (User không có quyền này)
43. **Hoàn tiền**

#### **Nhóm 11: Báo cáo và phân tích khách sạn (Partner)**

44. **Xem báo cáo doanh thu khách sạn**
45. **Xem thống kê đặt phòng khách sạn**
46. **Xem phân tích hiệu suất phòng**
47. **Xuất báo cáo khách sạn**

#### **Nhóm 12: Gửi yêu cầu (Partner)**

48. **Gửi yêu cầu tạo khách sạn mới**
49. **Gửi yêu cầu tạo khuyến mãi**
50. **Xem trạng thái yêu cầu**

### 2.3. **Use Cases của Quản trị viên (Admin)**

**Lưu ý**: Admin kế thừa tất cả use cases của Partner và User (trừ "Đăng ký tài khoản mới"), và có thêm các use cases sau:

#### **Nhóm 13: Xác thực và đăng nhập (Admin)**

51. **Đăng nhập bằng email và mật khẩu** (kế thừa từ User)
52. **Đăng nhập bằng Google OAuth2** (kế thừa từ User)
53. **Đăng xuất** (kế thừa từ User)
54. **Đặt lại mật khẩu** (kế thừa từ User)
55. **Lưu ý**: Tài khoản Admin được tạo tự động khi khởi động hệ thống hoặc do Admin khác tạo

#### **Nhóm 14: Quản lý người dùng và vai trò (Admin)**

56. **Xem danh sách người dùng**
57. **Xem chi tiết người dùng**
58. **Tạo tài khoản người dùng** (có thể tạo với role User, Partner hoặc Admin)
59. **Cập nhật thông tin người dùng**
60. **Xóa tài khoản người dùng**
61. **Quản lý vai trò**

#### **Nhóm 15: Quản lý địa điểm (Admin)**

62. **Xem danh sách địa điểm**
63. **Tạo địa điểm mới**
64. **Cập nhật thông tin địa điểm**
65. **Xóa địa điểm**

#### **Nhóm 16: Quản lý khách sạn (Admin - mở rộng)**

66. **Tạo khách sạn mới** (chỉ Admin có quyền này)
67. **Xóa khách sạn** (chỉ Admin có quyền này)

#### **Nhóm 17: Quản lý tiện ích (Admin)**

68. **Xem danh sách tiện ích**
69. **Tạo tiện ích mới**
70. **Cập nhật thông tin tiện ích**
71. **Xóa tiện ích**
72. **Quản lý danh mục tiện ích**

#### **Nhóm 18: Quản lý ngày đặc biệt (Admin)**

73. **Xem danh sách ngày đặc biệt**
74. **Tạo ngày đặc biệt mới**
75. **Cập nhật thông tin ngày đặc biệt**
76. **Xóa ngày đặc biệt**

#### **Nhóm 19: Quản lý khuyến mãi (Admin)**

77. **Xem danh sách khuyến mãi**
78. **Tạo khuyến mãi mới**
79. **Cập nhật thông tin khuyến mãi**
80. **Xóa khuyến mãi**

#### **Nhóm 20: Quản lý đặt phòng (Admin - mở rộng)**

81. **Chỉnh sửa đặt phòng** (chỉ Admin có quyền này)

#### **Nhóm 21: Báo cáo và phân tích toàn hệ thống (Admin)**

82. **Xem báo cáo doanh thu toàn hệ thống**
83. **Xem thống kê đặt phòng toàn hệ thống**
84. **Xem phân tích hiệu suất khách sạn**
85. **Xem thống kê người dùng**
86. **Xem phân tích đánh giá toàn hệ thống**
87. **Xuất báo cáo toàn hệ thống**

#### **Nhóm 22: Xử lý yêu cầu từ đối tác (Admin)**

88. **Xem danh sách yêu cầu từ đối tác**
89. **Xem chi tiết yêu cầu**
90. **Duyệt yêu cầu**
91. **Từ chối yêu cầu**
92. **Xem lịch sử xử lý yêu cầu**

#### **Nhóm 23: Quản lý Chatbot AI (Admin)**

93. **Xem các cuộc trò chuyện với Chatbot**
94. **Phân tích hiệu quả Chatbot**
95. **Cấu hình Chatbot AI**
96. **Xem báo cáo Chatbot**

### 2.4. **Use Cases của VNPay (External System)**

97. **Nhận yêu cầu thanh toán**
98. **Gửi kết quả thanh toán (callback)**
99. **Xử lý hoàn tiền**

### 2.5. **Use Cases của OpenAI API (External System)**

100. **Nhận yêu cầu xử lý AI**
101. **Xử lý câu hỏi từ khách hàng**
102. **Trả về phản hồi AI**

---

## 3. MỐI QUAN HỆ INCLUDE (<<include>>)

### 3.1. **Định nghĩa Include**

**Include** là mối quan hệ bắt buộc: Use case A luôn phải thực hiện Use case B như một phần của nó.

**Ký hiệu UML**: `A <<include>> B` (mũi tên từ A đến B, có nhãn `<<include>>`)

### 3.2. **Các mối quan hệ Include trong hệ thống**

#### **A. Quản lý đặt phòng**

1. **Tạo đặt phòng mới <<include>> Xem trước giá trước khi đặt**

   - **Lý do**: Khi tạo đặt phòng, hệ thống luôn phải tính và hiển thị giá trước
   - **Từ code**: `BookingService.create()` luôn gọi `calculatePrice()` trước khi tạo booking

2. **Tạo đặt phòng mới <<include>> Thanh toán**

   - **Lý do**: Sau khi tạo đặt phòng, hệ thống luôn phải tạo payment và redirect đến VNPay
   - **Từ code**: `BookingService.create()` luôn gọi `PaymentService.createPaymentUrl()` sau khi tạo booking

3. **Đổi lịch đặt phòng <<include>> Xem trước giá trước khi đặt**

   - **Lý do**: Khi đổi lịch, hệ thống phải tính lại giá (có thể thay đổi do giá phòng khác nhau theo ngày)
   - **Từ code**: `BookingService.reschedule()` tính lại giá sau khi thay đổi ngày

4. **Đổi lịch đặt phòng <<include>> Thanh toán** (nếu có phí đổi lịch)

   - **Lý do**: Nếu có phí đổi lịch, hệ thống phải yêu cầu thanh toán phí này
   - **Điều kiện**: Chỉ khi có phí đổi lịch (reschedule fee)

5. **Hủy đặt phòng <<include>> Hoàn tiền** (nếu đã thanh toán)
   - **Lý do**: Khi hủy đặt phòng đã thanh toán, hệ thống phải hoàn tiền
   - **Điều kiện**: Chỉ khi đặt phòng đã thanh toán và trong thời gian được phép hoàn tiền
   - **Lưu ý**: Đây có thể là extend thay vì include (tùy điều kiện)

#### **B. Quản lý khách sạn và phòng**

6. **Tạo phòng mới <<include>> Tạo bản ghi kho phòng**

   - **Lý do**: Khi tạo phòng mới, hệ thống phải tạo bản ghi kho phòng ban đầu
   - **Hoặc**: Có thể tách riêng, nhưng thông thường khi tạo phòng cần thiết lập kho phòng

7. **Cập nhật thông tin khách sạn <<include>> Xác thực quyền sở hữu**
   - **Lý do**: Trước khi cập nhật, hệ thống phải kiểm tra xem Partner có quyền sở hữu khách sạn không
   - **Lưu ý**: Đây có thể là logic bên trong, không cần thể hiện trong use case diagram

#### **C. Quản lý đánh giá**

8. **Viết đánh giá <<include>> Xác thực đã sử dụng dịch vụ**
   - **Lý do**: Chỉ khách hàng đã check-out mới có thể viết đánh giá
   - **Lưu ý**: Đây có thể là logic bên trong

#### **D. Thanh toán**

9. **Thanh toán <<include>> Xác thực đặt phòng**

   - **Lý do**: Trước khi thanh toán, hệ thống phải xác thực đặt phòng tồn tại và hợp lệ
   - **Lưu ý**: Đây có thể là logic bên trong

10. **Thanh toán <<include>> Gửi email xác nhận**
    - **Lý do**: Sau khi thanh toán thành công, hệ thống luôn gửi email xác nhận
    - **Từ code**: `PaymentService.handleVnPayCallback()` gọi `sendBookingConfirmationEmail()`

#### **E. Xác thực và đăng nhập**

11. **Đăng ký tài khoản mới <<include>> Xác thực email**

    - **Lý do**: Khi đăng ký, hệ thống phải xác thực email bằng OTP
    - **Từ code**: Hệ thống có OTP verification cho email

12. **Đăng nhập <<include>> Xác thực thông tin đăng nhập**

    - **Lý do**: Khi đăng nhập, hệ thống phải xác thực email và mật khẩu
    - **Lưu ý**: Đây có thể là logic bên trong

13. **Đăng nhập <<include>> Tạo token**

    - **Lý do**: Sau khi đăng nhập thành công, hệ thống luôn tạo access token và refresh token
    - **Từ code**: `AuthService.login()` luôn tạo token sau khi xác thực thành công

14. **Đăng xuất <<include>> Vô hiệu hóa token**
    - **Lý do**: Khi đăng xuất, hệ thống phải vô hiệu hóa refresh token
    - **Từ code**: `AuthService.logout()` lưu token vào InvalidToken table

---

## 4. MỐI QUAN HỆ EXTEND (<<extend>>)

### 4.1. **Định nghĩa Extend**

**Extend** là mối quan hệ tùy chọn: Use case A có thể được mở rộng bởi Use case B trong một số điều kiện nhất định.

**Ký hiệu UML**: `B <<extend>> A` (mũi tên từ B đến A, có nhãn `<<extend>>`)

**Lưu ý**: Mũi tên extend chỉ từ use case mở rộng đến use case gốc.

### 4.2. **Các mối quan hệ Extend trong hệ thống**

#### **A. Tìm kiếm và khám phá phòng**

1. **Tìm kiếm khách sạn <<extend>> Sử dụng Chatbot AI để tìm phòng**

   - **Lý do**: Người dùng có thể sử dụng Chatbot AI để tìm phòng thay vì tìm kiếm thông thường
   - **Điều kiện**: Người dùng chọn sử dụng Chatbot AI
   - **Từ tài liệu**: "Chatbot AI hỗ trợ tìm kiếm phòng"

2. **Xem chi tiết phòng <<extend>> Sử dụng Chatbot AI để tìm phòng**
   - **Lý do**: Người dùng có thể hỏi Chatbot về chi tiết phòng
   - **Điều kiện**: Người dùng đang xem chi tiết phòng và chọn hỏi Chatbot

#### **B. Quản lý đặt phòng**

3. **Tạo đặt phòng mới <<extend>> Áp dụng khuyến mãi**

   - **Lý do**: Người dùng có thể (tùy chọn) áp dụng mã khuyến mãi khi tạo đặt phòng
   - **Điều kiện**: Người dùng có mã khuyến mãi và nhập vào
   - **Từ code**: `BookingCreationRequest` có trường `discountCode` (optional)

4. **Hủy đặt phòng <<extend>> Hoàn tiền**

   - **Lý do**: Khi hủy đặt phòng, hệ thống có thể hoàn tiền (nếu đã thanh toán và trong thời gian cho phép)
   - **Điều kiện**:
     - Đặt phòng đã thanh toán
     - Trong thời gian được phép hoàn tiền (theo chính sách hủy)
   - **Lưu ý**: Đây có thể là extend vì không phải lúc nào hủy cũng hoàn tiền (có thể quá hạn)

5. **Đổi lịch đặt phòng <<extend>> Thanh toán phí đổi lịch**
   - **Lý do**: Khi đổi lịch, có thể phải trả phí đổi lịch (nếu có)
   - **Điều kiện**:
     - Có phí đổi lịch (reschedule fee)
     - Người dùng chấp nhận trả phí
   - **Từ code**: `BookingService.reschedule()` tính reschedule fee nếu có

#### **C. Quản lý khách sạn**

6. **Cập nhật thông tin khách sạn <<extend>> Upload hình ảnh**

   - **Lý do**: Khi cập nhật thông tin khách sạn, Partner có thể (tùy chọn) upload hình ảnh mới
   - **Điều kiện**: Partner chọn upload hình ảnh

7. **Tạo phòng mới <<extend>> Upload hình ảnh phòng**
   - **Lý do**: Khi tạo phòng, Partner có thể (tùy chọn) upload hình ảnh phòng
   - **Điều kiện**: Partner chọn upload hình ảnh

#### **D. Báo cáo và phân tích**

8. **Xem báo cáo doanh thu <<extend>> Xuất báo cáo dưới dạng file**

   - **Lý do**: Sau khi xem báo cáo, người dùng có thể (tùy chọn) xuất file PDF/Excel
   - **Điều kiện**: Người dùng chọn xuất file
   - **Từ tài liệu**: "Xuất báo cáo dưới dạng file (PDF, Excel)"

9. **Xem thống kê đặt phòng <<extend>> Xuất báo cáo dưới dạng file**
   - **Lý do**: Tương tự như trên

#### **E. Quản lý đánh giá**

10. **Xem đánh giá khách sạn <<extend>> Lọc đánh giá theo điểm số**

    - **Lý do**: Người dùng có thể (tùy chọn) lọc đánh giá theo điểm số
    - **Điều kiện**: Người dùng chọn lọc theo điểm số
    - **Từ tài liệu**: "Lọc đánh giá theo điểm số (từ điểm tối thiểu đến tối đa)"

11. **Xem đánh giá khách sạn <<extend>> Sắp xếp đánh giá**
    - **Lý do**: Người dùng có thể (tùy chọn) sắp xếp đánh giá
    - **Điều kiện**: Người dùng chọn sắp xếp
    - **Từ tài liệu**: "Sắp xếp đánh giá theo ngày tạo"

#### **F. Tìm kiếm**

15. **Tìm kiếm khách sạn <<extend>> Lọc theo hạng sao**

    - **Lý do**: Người dùng có thể (tùy chọn) lọc kết quả theo hạng sao
    - **Điều kiện**: Người dùng chọn lọc theo hạng sao

16. **Tìm kiếm khách sạn <<extend>> Lọc theo tiện ích**

    - **Lý do**: Người dùng có thể (tùy chọn) lọc kết quả theo tiện ích
    - **Điều kiện**: Người dùng chọn lọc theo tiện ích

17. **Tìm kiếm khách sạn <<extend>> Lọc theo khoảng giá**
    - **Lý do**: Người dùng có thể (tùy chọn) lọc kết quả theo khoảng giá
    - **Điều kiện**: Người dùng chọn lọc theo khoảng giá

#### **G. Xác thực**

18. **Đăng nhập <<extend>> Đăng nhập bằng Google OAuth2**
    - **Lý do**: Người dùng có thể (tùy chọn) đăng nhập bằng Google thay vì email/password
    - **Điều kiện**: Người dùng chọn đăng nhập bằng Google
    - **Từ code**: Hệ thống có OAuth2 integration với Google

---

## 5. HƯỚNG DẪN VẼ USE CASE DIAGRAM

### 5.1. **Bước 1: Vẽ System Boundary**

1. Vẽ một hình chữ nhật lớn với nhãn "Website Holidate" ở trên cùng
2. Đây là ranh giới của hệ thống, tất cả use cases sẽ nằm bên trong

### 5.2. **Bước 2: Vẽ Actors**

1. **Vẽ Primary Actors (bên trái hệ thống):**

   - Vẽ "Khách hàng" (User) - stick figure
   - Vẽ "Đối tác Khách sạn" (Partner) - stick figure
   - Vẽ "Quản trị viên" (Admin) - stick figure

2. **Vẽ Secondary Actors (bên phải hệ thống):**

   - Vẽ "VNPay" - stick figure (có thể thêm <<external system>>)
   - Vẽ "OpenAI API" - stick figure (có thể thêm <<external system>>)

3. **Vẽ Generalization:**
   - Vẽ mũi tên từ "Đối tác Khách sạn" đến "Khách hàng" (hollow triangle arrow)
   - Vẽ mũi tên từ "Quản trị viên" đến "Đối tác Khách sạn" (hollow triangle arrow)
   - **Lưu ý**: Mũi tên generalization có đầu mũi tên rỗng (hollow triangle) và chỉ từ child đến parent

### 5.3. **Bước 3: Vẽ Use Cases**

1. **Vẽ Use Cases bên trong System Boundary:**

   - Vẽ các use cases dưới dạng hình oval
   - Nhóm các use cases theo chức năng để dễ đọc
   - Sử dụng tên ngắn gọn, rõ ràng

2. **Các nhóm Use Cases chính:**
   - **Nhóm Xác thực và đăng nhập**: Đăng ký, Đăng nhập, Đăng xuất, Xác thực email, Đặt lại mật khẩu
   - **Nhóm Quản lý thông tin cá nhân**: Xem thông tin tài khoản, Cập nhật thông tin cá nhân
   - **Nhóm Tìm kiếm**: Tìm kiếm khách sạn, Xem danh sách phòng, Xem chi tiết phòng, Xem đánh giá, Sử dụng Chatbot AI
   - **Nhóm Quản lý đặt phòng**: Tạo đặt phòng, Xem trước giá, Hủy đặt phòng, Đổi lịch đặt phòng, Thanh toán, Check-in, Check-out
   - **Nhóm Quản lý khách sạn**: Cập nhật thông tin khách sạn, Tạo khách sạn, Xóa khách sạn
   - **Nhóm Quản lý phòng**: Tạo phòng, Cập nhật phòng, Xóa phòng
   - **Nhóm Quản lý kho phòng**: Xem kho phòng, Tạo bản ghi kho phòng, Cập nhật kho phòng
   - **Nhóm Quản lý đánh giá**: Viết đánh giá, Chỉnh sửa đánh giá, Xóa đánh giá
   - **Nhóm Báo cáo**: Xem báo cáo doanh thu, Xem thống kê, Xuất báo cáo
   - **Nhóm Quản lý hệ thống (Admin)**: Quản lý người dùng, Quản lý địa điểm, Quản lý tiện ích, Quản lý khuyến mãi

### 5.4. **Bước 4: Vẽ Associations (Actor - Use Case)**

1. **Vẽ đường thẳng từ Actor đến Use Case:**

   - Khách hàng → Tất cả use cases của User (bao gồm Đăng ký tài khoản mới)
   - Đối tác Khách sạn → Tất cả use cases của User (kế thừa, trừ Đăng ký tài khoản mới) + Use cases riêng của Partner
   - Quản trị viên → Tất cả use cases của User và Partner (kế thừa, trừ Đăng ký tài khoản mới) + Use cases riêng của Admin
   - VNPay → Nhận yêu cầu thanh toán, Gửi kết quả thanh toán, Xử lý hoàn tiền
   - OpenAI API → Nhận yêu cầu xử lý AI, Xử lý câu hỏi, Trả về phản hồi AI

2. **Lưu ý về Generalization:**
   - Với generalization, không cần vẽ lại tất cả associations cho Admin và Partner
   - Chỉ cần vẽ associations cho các use cases riêng của từng actor
   - Các use cases được kế thừa sẽ tự động có association thông qua generalization

### 5.5. **Bước 5: Vẽ Include Relationships**

1. **Vẽ mũi tên từ Use Case A đến Use Case B với nhãn <<include>>:**

   - Mũi tên có mũi tên đầy (solid arrow) và đường nét đứt (dashed line)
   - Nhãn `<<include>>` đặt gần mũi tên

2. **Các Include Relationships chính:**
   - Đăng ký tài khoản mới → Xác thực email
   - Đăng nhập → Tạo token
   - Đăng xuất → Vô hiệu hóa token
   - Tạo đặt phòng mới → Xem trước giá trước khi đặt
   - Tạo đặt phòng mới → Thanh toán
   - Đổi lịch đặt phòng → Xem trước giá trước khi đặt
   - Thanh toán → Gửi email xác nhận
   - Tạo phòng mới → Tạo bản ghi kho phòng (nếu cần)

### 5.6. **Bước 6: Vẽ Extend Relationships**

1. **Vẽ mũi tên từ Use Case B đến Use Case A với nhãn <<extend>>:**

   - Mũi tên có mũi tên đầy (solid arrow) và đường nét đứt (dashed line)
   - Nhãn `<<extend>>` đặt gần mũi tên
   - **Lưu ý**: Mũi tên extend chỉ từ use case mở rộng đến use case gốc

2. **Các Extend Relationships chính:**

   - Đăng nhập bằng Google OAuth2 → Đăng nhập
   - Sử dụng Chatbot AI → Tìm kiếm khách sạn
   - Áp dụng khuyến mãi → Tạo đặt phòng mới
   - Hoàn tiền → Hủy đặt phòng
   - Thanh toán phí đổi lịch → Đổi lịch đặt phòng
   - Upload hình ảnh → Cập nhật thông tin khách sạn
   - Upload hình ảnh → Tạo phòng mới
   - Xuất báo cáo → Xem báo cáo doanh thu
   - Lọc đánh giá → Xem đánh giá khách sạn
   - Lọc theo hạng sao → Tìm kiếm khách sạn
   - Lọc theo tiện ích → Tìm kiếm khách sạn
   - Lọc theo khoảng giá → Tìm kiếm khách sạn

3. **Lưu ý về Extend:**
   - Có thể thêm điều kiện (condition) trong ngoặc vuông: `[điều kiện]`
   - Ví dụ: `Hoàn tiền <<extend>> Hủy đặt phòng [nếu đã thanh toán]`

---

## 6. SƠ ĐỒ USE CASE DIAGRAM TỔNG QUAN

### 6.1. **Cấu trúc tổng quan**

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBSITE HOLIDATE                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Use Cases của User                                      │  │
│  │  - Xem thông tin tài khoản                              │  │
│  │  - Cập nhật thông tin cá nhân                           │  │
│  │  - Tìm kiếm khách sạn                                   │  │
│  │  - Xem danh sách phòng                                  │  │
│  │  - Xem chi tiết phòng                                   │  │
│  │  - Tạo đặt phòng mới                                    │  │
│  │  - Hủy đặt phòng                                        │  │
│  │  - Đổi lịch đặt phòng                                   │  │
│  │  - Thanh toán                                           │  │
│  │  - Viết đánh giá                                        │  │
│  │  - ...                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Use Cases của Partner (thêm vào)                        │  │
│  │  - Cập nhật thông tin khách sạn                         │  │
│  │  - Tạo phòng mới                                        │  │
│  │  - Quản lý kho phòng                                    │  │
│  │  - Xóa đặt phòng                                        │  │
│  │  - Hoàn tiền                                            │  │
│  │  - Xem báo cáo khách sạn                                │  │
│  │  - Gửi yêu cầu cho Admin                                │  │
│  │  - ...                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Use Cases của Admin (thêm vào)                          │  │
│  │  - Quản lý người dùng và vai trò                        │  │
│  │  - Quản lý địa điểm                                     │  │
│  │  - Tạo khách sạn mới                                    │  │
│  │  - Xóa khách sạn                                        │  │
│  │  - Quản lý tiện ích                                     │  │
│  │  - Quản lý khuyến mãi                                   │  │
│  │  - Chỉnh sửa đặt phòng                                  │  │
│  │  - Xử lý yêu cầu từ đối tác                             │  │
│  │  - Quản lý Chatbot AI                                   │  │
│  │  - Xem báo cáo toàn hệ thống                            │  │
│  │  - ...                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Use Cases với VNPay                                     │  │
│  │  - Nhận yêu cầu thanh toán                              │  │
│  │  - Gửi kết quả thanh toán                               │  │
│  │  - Xử lý hoàn tiền                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Use Cases với OpenAI API                                │  │
│  │  - Nhận yêu cầu xử lý AI                                │  │
│  │  - Xử lý câu hỏi từ khách hàng                          │  │
│  │  - Trả về phản hồi AI                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │              │
         │              │              │              │              │
    ┌────┘         ┌────┘         ┌────┘         ┌───┘         ┌───┘
    │              │              │              │              │
┌───▼───┐    ┌─────▼─────┐   ┌────▼────┐   ┌────▼─────┐  ┌────▼────────┐
│Admin  │    │  Partner  │   │  User   │   │  VNPay   │  │ OpenAI API  │
└───┬───┘    └─────┬─────┘   └─────────┘   └──────────┘  └─────────────┘
    │              │
    │              │ (Generalization)
    │              │
    │         ┌────┴────┐
    │         │         │
    │         │    ┌────▼────┐
    │         │    │  User   │
    │         │    └─────────┘
    │         │
    └─────────┘
    (Generalization Chain)
    Partner → User
    Admin → Partner
```

### 6.2. **Ví dụ Include và Extend**

```
Tạo đặt phòng mới
    │
    │ <<include>>
    ▼
Xem trước giá trước khi đặt
    │
    │ <<include>>
    ▼
Thanh toán

Tìm kiếm khách sạn
    ▲
    │ <<extend>>
    │
Sử dụng Chatbot AI để tìm phòng

Hủy đặt phòng
    ▲
    │ <<extend>> [nếu đã thanh toán]
    │
Hoàn tiền
```

---

## 7. VÍ DỤ PLANTUML

### 7.1. **PlantUML Code**

```plantuml
@startuml Holidate Use Case Diagram

!define RECTANGLE class

' Actors
actor User as "Khách hàng"
actor Partner as "Đối tác Khách sạn"
actor Admin as "Quản trị viên"
actor VNPay
actor "OpenAI API" as OpenAI

' Generalization relationships (Hierarchy: User → Partner → Admin)
User <|-- Partner
Partner <|-- Admin

' System boundary
rectangle "Website Holidate" {
    ' User use cases
    (Đăng ký tài khoản mới) as UC_Register
    (Đăng nhập bằng email và mật khẩu) as UC_Login
    (Đăng nhập bằng Google OAuth2) as UC_LoginGoogle
    (Đăng xuất) as UC_Logout
    (Xác thực email) as UC_VerifyEmail
    (Đặt lại mật khẩu) as UC_ResetPassword
    (Xem thông tin tài khoản) as UC_ViewProfile
    (Cập nhật thông tin cá nhân) as UC_UpdateProfile
    (Tìm kiếm khách sạn) as UC_SearchHotel
    (Xem danh sách phòng) as UC_ViewRooms
    (Xem chi tiết phòng) as UC_ViewRoomDetail
    (Xem đánh giá khách sạn) as UC_ViewReviews
    (Tạo đặt phòng mới) as UC_CreateBooking
    (Xem trước giá trước khi đặt) as UC_PricePreview
    (Xem danh sách đặt phòng) as UC_ViewBookings
    (Xem chi tiết đặt phòng) as UC_ViewBookingDetail
    (Hủy đặt phòng) as UC_CancelBooking
    (Đổi lịch đặt phòng) as UC_RescheduleBooking
    (Thanh toán) as UC_Payment
    (Thực hiện check-in) as UC_CheckIn
    (Thực hiện check-out) as UC_CheckOut
    (Viết đánh giá) as UC_WriteReview
    (Chỉnh sửa đánh giá) as UC_EditReview
    (Xóa đánh giá) as UC_DeleteReview
    (Sử dụng Chatbot AI để tìm phòng) as UC_Chatbot

    ' Partner use cases (additional)
    (Cập nhật thông tin khách sạn) as UC_UpdateHotel
    (Tạo phòng mới) as UC_CreateRoom
    (Cập nhật thông tin phòng) as UC_UpdateRoom
    (Xóa phòng) as UC_DeleteRoom
    (Xem thông tin kho phòng) as UC_ViewInventory
    (Tạo bản ghi kho phòng) as UC_CreateInventory
    (Cập nhật thông tin kho phòng) as UC_UpdateInventory
    (Xóa đặt phòng) as UC_DeleteBooking
    (Hoàn tiền) as UC_Refund
    (Xem báo cáo doanh thu khách sạn) as UC_HotelReport
    (Xuất báo cáo khách sạn) as UC_ExportHotelReport
    (Gửi yêu cầu cho Admin) as UC_SendRequest

    ' Admin use cases (additional)
    (Quản lý người dùng và vai trò) as UC_ManageUsers
    (Quản lý địa điểm) as UC_ManageLocations
    (Tạo khách sạn mới) as UC_CreateHotel
    (Xóa khách sạn) as UC_DeleteHotel
    (Quản lý tiện ích) as UC_ManageAmenities
    (Quản lý ngày đặc biệt) as UC_ManageSpecialDays
    (Quản lý khuyến mãi) as UC_ManageDiscounts
    (Chỉnh sửa đặt phòng) as UC_EditBooking
    (Xử lý yêu cầu từ đối tác) as UC_ProcessRequests
    (Quản lý Chatbot AI) as UC_ManageChatbot
    (Xem báo cáo toàn hệ thống) as UC_SystemReport
    (Xuất báo cáo toàn hệ thống) as UC_ExportSystemReport

    ' External system use cases
    (Nhận yêu cầu thanh toán) as UC_ReceivePayment
    (Gửi kết quả thanh toán) as UC_SendPaymentResult
    (Xử lý hoàn tiền) as UC_ProcessRefund
    (Nhận yêu cầu xử lý AI) as UC_ReceiveAIRequest
    (Xử lý câu hỏi từ khách hàng) as UC_ProcessQuestion
    (Trả về phản hồi AI) as UC_AIResponse
}

' User associations
User --> UC_Register
User --> UC_Login
User --> UC_Logout
User --> UC_VerifyEmail
User --> UC_ResetPassword
User --> UC_ViewProfile
User --> UC_UpdateProfile
User --> UC_SearchHotel
User --> UC_ViewRooms
User --> UC_ViewRoomDetail
User --> UC_ViewReviews
User --> UC_CreateBooking
User --> UC_ViewBookings
User --> UC_ViewBookingDetail
User --> UC_CancelBooking
User --> UC_RescheduleBooking
User --> UC_CheckIn
User --> UC_CheckOut
User --> UC_WriteReview
User --> UC_EditReview
User --> UC_DeleteReview

' Partner associations (additional)
Partner --> UC_UpdateHotel
Partner --> UC_CreateRoom
Partner --> UC_UpdateRoom
Partner --> UC_DeleteRoom
Partner --> UC_ViewInventory
Partner --> UC_CreateInventory
Partner --> UC_UpdateInventory
Partner --> UC_DeleteBooking
Partner --> UC_Refund
Partner --> UC_HotelReport
Partner --> UC_SendRequest

' Admin associations (additional)
Admin --> UC_ManageUsers
Admin --> UC_ManageLocations
Admin --> UC_CreateHotel
Admin --> UC_DeleteHotel
Admin --> UC_ManageAmenities
Admin --> UC_ManageSpecialDays
Admin --> UC_ManageDiscounts
Admin --> UC_EditBooking
Admin --> UC_ProcessRequests
Admin --> UC_ManageChatbot
Admin --> UC_SystemReport

' VNPay associations
VNPay --> UC_ReceivePayment
VNPay --> UC_SendPaymentResult
VNPay --> UC_ProcessRefund

' OpenAI API associations
OpenAI --> UC_ReceiveAIRequest
OpenAI --> UC_ProcessQuestion
OpenAI --> UC_AIResponse

' Include relationships
UC_Register ..> UC_VerifyEmail : <<include>>
UC_Login ..> UC_GenerateToken : <<include>>
UC_Logout ..> UC_InvalidateToken : <<include>>
UC_CreateBooking ..> UC_PricePreview : <<include>>
UC_CreateBooking ..> UC_Payment : <<include>>
UC_RescheduleBooking ..> UC_PricePreview : <<include>>
UC_Payment ..> UC_SendPaymentResult : <<include>>
UC_CreateRoom ..> UC_CreateInventory : <<include>>

' Extend relationships
UC_LoginGoogle ..> UC_Login : <<extend>>
UC_Chatbot ..> UC_SearchHotel : <<extend>>
UC_Refund ..> UC_CancelBooking : <<extend>> [nếu đã thanh toán]
UC_ExportHotelReport ..> UC_HotelReport : <<extend>>
UC_ExportSystemReport ..> UC_SystemReport : <<extend>>

note right of Admin
  Admin kế thừa tất cả use cases
  của Partner và User thông qua
  generalization relationship
end note

note right of VNPay
  VNPay là hệ thống thanh toán
  bên ngoài, xử lý thanh toán
  và hoàn tiền
end note

note right of OpenAI
  OpenAI API là hệ thống AI
  bên ngoài, xử lý các yêu cầu
  từ Chatbot AI
end note

@enduml
```

---

## 8. CÁC LƯU Ý KHI VẼ USE CASE DIAGRAM

### 8.1. **Lưu ý về Generalization**

1. **Mũi tên Generalization:**

   - Mũi tên có đầu mũi tên rỗng (hollow triangle)
   - Mũi tên chỉ từ child đến parent (từ actor có nhiều quyền đến actor có ít quyền hơn)
   - Ví dụ: `Partner → User` (Partner kế thừa từ User)

2. **Không cần vẽ lại associations:**
   - Với generalization, không cần vẽ lại tất cả associations cho Admin và Partner
   - Chỉ cần vẽ associations cho các use cases riêng của từng actor
   - Các use cases được kế thừa sẽ tự động có association

### 8.2. **Lưu ý về Include**

1. **Include là bắt buộc:**

   - Use case A luôn phải thực hiện Use case B
   - Không có điều kiện, luôn xảy ra

2. **Khi nào dùng Include:**
   - Khi một use case luôn cần một use case khác
   - Ví dụ: "Tạo đặt phòng" luôn cần "Xem trước giá"

### 8.3. **Lưu ý về Extend**

1. **Extend là tùy chọn:**

   - Use case A có thể được mở rộng bởi Use case B
   - Có điều kiện, không phải lúc nào cũng xảy ra

2. **Khi nào dùng Extend:**

   - Khi một use case có thể (tùy chọn) được mở rộng bởi use case khác
   - Ví dụ: "Hủy đặt phòng" có thể được mở rộng bởi "Hoàn tiền" (nếu đã thanh toán)

3. **Điều kiện Extend:**
   - Có thể thêm điều kiện trong ngoặc vuông: `[điều kiện]`
   - Ví dụ: `Hoàn tiền <<extend>> Hủy đặt phòng [nếu đã thanh toán]`

### 8.4. **Lưu ý về Actors**

1. **Primary Actors (Human Actors):**

   - Đặt ở bên trái hệ thống
   - Vẽ bằng stick figure

2. **Secondary Actors (External Systems):**
   - Đặt ở bên phải hệ thống
   - Vẽ bằng stick figure (có thể thêm <<external system>>)
   - Chỉ vẽ khi có tương tác trực tiếp với hệ thống

### 8.5. **Lưu ý về Use Cases**

1. **Tên Use Case:**

   - Sử dụng động từ + danh từ
   - Ví dụ: "Tạo đặt phòng", "Xem thông tin tài khoản"
   - Tránh tên quá dài

2. **Nhóm Use Cases:**

   - Nhóm các use cases liên quan lại với nhau
   - Sử dụng package hoặc khu vực riêng để nhóm

3. **Mức độ chi tiết:**
   - Không cần quá chi tiết (ví dụ: không cần "Nhấn nút Submit")
   - Chỉ vẽ các use cases ở mức business logic

---

## 9. TÓM TẮT

### 9.1. **Actors**

1. **Primary Actors:**

   - Khách hàng (User)
   - Đối tác Khách sạn (Partner) - kế thừa từ User
   - Quản trị viên (Admin) - kế thừa từ Partner

2. **Secondary Actors:**
   - VNPay (External System)
   - OpenAI API (External System)

### 9.2. **Generalization**

- **Partner → User**: Partner kế thừa tất cả use cases của User
- **Admin → Partner**: Admin kế thừa tất cả use cases của Partner
- **Hierarchy**: User → Partner → Admin

### 9.3. **Include Relationships**

- Tạo đặt phòng mới → Xem trước giá trước khi đặt
- Tạo đặt phòng mới → Thanh toán
- Đổi lịch đặt phòng → Xem trước giá trước khi đặt
- Thanh toán → Gửi email xác nhận
- Tạo phòng mới → Tạo bản ghi kho phòng

### 9.4. **Extend Relationships**

- Đăng nhập bằng Google OAuth2 → Đăng nhập
- Sử dụng Chatbot AI → Tìm kiếm khách sạn
- Áp dụng khuyến mãi → Tạo đặt phòng mới
- Hoàn tiền → Hủy đặt phòng [nếu đã thanh toán]
- Thanh toán phí đổi lịch → Đổi lịch đặt phòng
- Upload hình ảnh → Cập nhật thông tin khách sạn
- Upload hình ảnh → Tạo phòng mới
- Xuất báo cáo → Xem báo cáo doanh thu
- Lọc đánh giá → Xem đánh giá khách sạn
- Lọc theo hạng sao/tiện ích/giá → Tìm kiếm khách sạn

### 9.5. **Cách vẽ**

1. Vẽ System Boundary
2. Vẽ Actors và Generalization
3. Vẽ Use Cases
4. Vẽ Associations (Actor - Use Case)
5. Vẽ Include Relationships
6. Vẽ Extend Relationships

---

## 10. TÀI LIỆU THAM KHẢO

- USER_chuc_nang.txt - Chức năng của Khách hàng
- PARTNER_chuc_nang.txt - Chức năng của Đối tác Khách sạn
- ADMIN_chuc_nang.txt - Chức năng của Quản trị viên
- USE_CASE_ACTORS_ANALYSIS.md - Phân tích các Actors
- USE_CASE_GENERALIZATION_ANALYSIS.md - Phân tích Generalization
- SecurityConfig.java - Role Hierarchy trong code

---

**Lưu ý cuối cùng:**

- Use Case Diagram là một công cụ để mô tả hệ thống ở mức cao, không cần quá chi tiết
- Tập trung vào các use cases chính và các mối quan hệ quan trọng
- Có thể tách thành nhiều diagram nhỏ hơn nếu diagram quá phức tạp
- Luôn cập nhật diagram khi hệ thống thay đổi
