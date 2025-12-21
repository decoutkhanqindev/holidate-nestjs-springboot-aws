# PHÂN TÍCH ACTORS CHO USE CASE DIAGRAM

## TỔNG QUAN

Dựa trên các file mô tả chức năng và cấu trúc hệ thống, đây là phân tích chi tiết về các actors cần có trong Use Case Diagram.

---

## 1. ACTORS CHÍNH (PRIMARY ACTORS) - Người dùng hệ thống

### 1.1. **Admin (Quản trị viên)**

- **Loại**: Human Actor (Người dùng)
- **Mô tả**: Người quản lý toàn bộ hệ thống
- **Vai trò**: Có toàn quyền quản lý hệ thống
- **Use Cases chính**:
  - Quản lý người dùng và vai trò
  - Quản lý địa điểm
  - Quản lý khách sạn (tạo, xóa)
  - Quản lý phòng
  - Quản lý tiện ích
  - Quản lý khuyến mãi
  - Quản lý đặt phòng
  - Quản lý đánh giá
  - Xử lý yêu cầu từ đối tác
  - Quản lý Chatbot AI
  - Xem báo cáo và phân tích toàn hệ thống

### 1.2. **Partner (Đối tác)**

- **Loại**: Human Actor (Người dùng)
- **Mô tả**: Người quản lý khách sạn của mình
- **Vai trò**: Quản lý khách sạn, phòng và đặt phòng của chính mình
- **Use Cases chính**:
  - Quản lý thông tin cá nhân
  - Quản lý khách sạn (cập nhật thông tin)
  - Quản lý phòng (tạo, cập nhật, xóa)
  - Quản lý kho phòng
  - Quản lý đặt phòng (tạo, hủy, check-in, check-out, hoàn tiền)
  - Quản lý đánh giá
  - Xem báo cáo và phân tích khách sạn
  - Gửi yêu cầu cho quản trị viên

### 1.3. **User (Khách hàng)**

- **Loại**: Human Actor (Người dùng)
- **Mô tả**: Người sử dụng dịch vụ đặt phòng
- **Vai trò**: Tìm kiếm và đặt phòng khách sạn
- **Use Cases chính**:
  - Quản lý thông tin cá nhân
  - Tìm kiếm và khám phá phòng
  - Quản lý đặt phòng (tạo, hủy, đổi lịch, thanh toán, check-in, check-out)
  - Quản lý đánh giá
  - Sử dụng Chatbot AI để tìm phòng

---

## 2. ACTORS PHỤ (SECONDARY ACTORS) - Hệ thống bên ngoài

### 2.1. **VNPay** ✅ **NÊN LÀ ACTOR**

- **Loại**: External System Actor (Hệ thống bên ngoài)
- **Mô tả**: Hệ thống thanh toán điện tử VNPay
- **Vai trò**: Xử lý thanh toán và hoàn tiền
- **Lý do là Actor**:
  - VNPay là hệ thống bên ngoài độc lập
  - Hệ thống gửi request thanh toán đến VNPay
  - VNPay gửi callback về hệ thống sau khi thanh toán
  - VNPay xử lý hoàn tiền (refund)
  - VNPay có các use cases riêng: "Nhận yêu cầu thanh toán", "Gửi kết quả thanh toán", "Xử lý hoàn tiền"
- **Use Cases liên quan**:
  - Nhận yêu cầu thanh toán từ hệ thống
  - Gửi kết quả thanh toán (callback)
  - Xử lý hoàn tiền

### 2.2. **OpenAI API** ✅ **NÊN LÀ ACTOR** (Khi Chatbot AI sử dụng OpenAI API)

- **Loại**: External System Actor (Hệ thống bên ngoài)
- **Mô tả**: OpenAI API - Hệ thống AI bên ngoài cung cấp dịch vụ Chatbot
- **Vai trò**: Xử lý các yêu cầu AI và trả về phản hồi thông minh
- **Lý do là Actor**:
  - ✅ **OpenAI API là hệ thống bên ngoài độc lập**: Đây là external service hoàn toàn tách biệt với hệ thống Holidate
  - ✅ **Tương tác 2 chiều với hệ thống**:
    - Hệ thống gửi request (prompt, câu hỏi) đến OpenAI API
    - OpenAI API xử lý và trả về response (phản hồi AI, gợi ý)
  - ✅ **Có use cases riêng biệt**:
    - "Xử lý câu hỏi từ khách hàng"
    - "Trả về phản hồi AI"
    - "Phân tích yêu cầu tìm phòng"
  - ✅ **Độc lập về kiến trúc**: OpenAI API không phụ thuộc vào hệ thống Holidate, và hệ thống Holidate phụ thuộc vào OpenAI API
- **Use Cases liên quan**:
  - Nhận yêu cầu xử lý AI từ hệ thống (câu hỏi, prompt)
  - Xử lý và phân tích yêu cầu
  - Trả về phản hồi AI (gợi ý phòng, câu trả lời)
  - Hỗ trợ tìm kiếm phòng thông minh

#### **Phân biệt giữa OpenAI API và Chatbot AI Service**

- **OpenAI API** (External System - Actor):

  - Hệ thống bên ngoài độc lập
  - Cung cấp dịch vụ AI
  - Là actor trong Use Case Diagram

- **Chatbot AI Service** (Internal Component - Không phải Actor):
  - Component nội bộ của hệ thống Holidate
  - Sử dụng OpenAI API để xử lý yêu cầu
  - Không phải actor, chỉ là cách hệ thống implement use case

#### **Cách mô tả trong Use Case Diagram**

```
User → "Sử dụng Chatbot AI để tìm phòng" → System → OpenAI API (Actor)
                                         ↓
                                    OpenAI API
                                    "Xử lý câu hỏi"
                                    "Trả về phản hồi AI"
```

- **User có use case**: "Sử dụng Chatbot AI để tìm phòng"
- **System tương tác với OpenAI API**: "Gửi yêu cầu xử lý AI", "Nhận phản hồi AI"
- **Admin có use case**: "Quản lý Chatbot AI" (cấu hình, xem báo cáo, quản lý prompt)

---

## 3. CÁC HỆ THỐNG KHÁC (KHÔNG NÊN LÀ ACTORS)

### 3.1. **Google OAuth2**

- **Loại**: External System (Không nên là Actor trong Use Case Diagram chính)
- **Lý do**:
  - Google OAuth2 chỉ là phương thức xác thực
  - Không có use cases riêng, chỉ là phần của use case "Đăng nhập"
  - Có thể mô tả trong diagram phụ (Authentication Diagram)

### 3.2. **AWS S3**

- **Loại**: External System (Không nên là Actor)
- **Lý do**:
  - AWS S3 chỉ là dịch vụ lưu trữ
  - Không có use cases riêng, chỉ là phần của use case "Upload hình ảnh"
  - Là infrastructure, không phải business actor

### 3.3. **Email Service (SMTP)**

- **Loại**: External System (Không nên là Actor)
- **Lý do**:
  - Email Service chỉ là dịch vụ gửi email
  - Không có use cases riêng, chỉ là phần của use case "Gửi email xác nhận"
  - Là infrastructure, không phải business actor

### 3.4. **OpenAI API vs Infrastructure Services**

- **Tại sao OpenAI API là Actor nhưng Email Service không?**
  - **OpenAI API**:
    - Có logic xử lý phức tạp (AI, machine learning)
    - Trả về kết quả có ý nghĩa business (gợi ý phòng, phân tích yêu cầu)
    - Là một phần quan trọng của use case "Sử dụng Chatbot AI"
  - **Email Service (SMTP)**:
    - Chỉ là dịch vụ infrastructure đơn giản (gửi email)
    - Không có logic xử lý phức tạp
    - Chỉ là phương tiện để thực hiện use case (gửi thông báo)

---

## 4. KẾT LUẬN VÀ KHUYẾN NGHỊ

### 4.1. **Số lượng Actors chính**

#### **Phương án 1: Tối thiểu (3 Actors)**

1. **Admin** (Quản trị viên)
2. **Partner** (Đối tác)
3. **User** (Khách hàng)

#### **Phương án 2: Đầy đủ (5 Actors)** ⭐ **KHUYẾN NGHỊ**

1. **Admin** (Quản trị viên)
2. **Partner** (Đối tác)
3. **User** (Khách hàng)
4. **VNPay** (Hệ thống thanh toán) ✅
5. **OpenAI API** (Hệ thống AI - khi Chatbot AI sử dụng OpenAI API) ✅

### 4.2. **Khuyến nghị cụ thể**

#### **VNPay** ✅

- **NÊN LÀ ACTOR**
- **Lý do**:
  - VNPay là hệ thống bên ngoài độc lập
  - Có tương tác 2 chiều với hệ thống (request/response, callback)
  - Có use cases riêng biệt

#### **OpenAI API** ✅

- **NÊN LÀ ACTOR** (khi Chatbot AI sử dụng OpenAI API)
- **Lý do**:
  - OpenAI API là hệ thống bên ngoài độc lập
  - Có tương tác 2 chiều với hệ thống (request/response)
  - Có use cases riêng biệt (xử lý AI, trả về phản hồi)
  - Hệ thống phụ thuộc vào OpenAI API để cung cấp tính năng Chatbot
- **Lưu ý**:
  - OpenAI API là actor, không phải "Chatbot AI"
  - "Chatbot AI" là tính năng của hệ thống, được implement bằng cách sử dụng OpenAI API

### 4.3. **Sơ đồ Use Case Diagram đề xuất**

```
┌─────────────────────────────────────────────────────────────┐
│                    HOLIDATE SYSTEM                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Use Cases của Admin                                │  │
│  │  - Quản lý người dùng                               │  │
│  │  - Quản lý khách sạn                                │  │
│  │  - Quản lý đặt phòng                                │  │
│  │  - Xử lý yêu cầu từ đối tác                         │  │
│  │  - Quản lý Chatbot AI                               │  │
│  │  - Xem báo cáo toàn hệ thống                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Use Cases của Partner                              │  │
│  │  - Quản lý khách sạn                                │  │
│  │  - Quản lý phòng                                    │  │
│  │  - Quản lý đặt phòng                                │  │
│  │  - Xem báo cáo khách sạn                            │  │
│  │  - Gửi yêu cầu cho Admin                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Use Cases của User                                 │  │
│  │  - Tìm kiếm khách sạn                               │  │
│  │  - Đặt phòng                                        │  │
│  │  - Thanh toán                                       │  │
│  │  - Sử dụng Chatbot AI                               │  │
│  │  - Đánh giá                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Use Cases với VNPay                                │  │
│  │  - Xử lý thanh toán                                 │  │
│  │  - Xử lý hoàn tiền                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Use Cases với OpenAI API                           │  │
│  │  - Xử lý câu hỏi từ khách hàng                      │  │
│  │  - Trả về phản hồi AI                               │  │
│  │  - Phân tích yêu cầu tìm phòng                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │              │
         │              │              │              │              │
    ┌────┘         ┌────┘         ┌────┘         ┌───┘         ┌───┘
    │              │              │              │              │
┌───▼───┐    ┌─────▼─────┐   ┌────▼────┐   ┌────▼─────┐  ┌────▼────────┐
│ Admin │    │  Partner  │   │  User   │   │  VNPay   │  │ OpenAI API  │
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
    Partner → User (Partner kế thừa từ User)
    Admin → Partner (Admin kế thừa từ Partner)
    Hierarchy: User → Partner → Admin
```

---

## 5. TÓM TẮT

### **Actors được khuyến nghị:**

1. ✅ **Admin** - Quản trị viên
2. ✅ **Partner** - Đối tác
3. ✅ **User** - Khách hàng
4. ✅ **VNPay** - Hệ thống thanh toán (External System)
5. ✅ **OpenAI API** - Hệ thống AI (External System) - Khi Chatbot AI sử dụng OpenAI API

### **Tổng số Actors: 5**

### **Câu trả lời cho câu hỏi:**

- **Chatbot AI có được tính là actor không? (Khi sử dụng OpenAI API)**

  - **Trả lời**: **OpenAI API** (không phải "Chatbot AI") **NÊN LÀ ACTOR**
  - **Lý do**:
    - OpenAI API là hệ thống bên ngoài độc lập
    - Có tương tác 2 chiều với hệ thống (request/response)
    - Có use cases riêng biệt
  - **Lưu ý**:
    - "Chatbot AI" là tính năng của hệ thống, không phải actor
    - "OpenAI API" là hệ thống bên ngoài cung cấp dịch vụ AI, là actor
    - Trong Use Case Diagram, nên dùng tên "OpenAI API" thay vì "Chatbot AI"

- **VNPay có được tính là actor không?**
  - **Trả lời**: **Có**, VNPay nên là một actor vì nó là hệ thống bên ngoài có tương tác 2 chiều với hệ thống.

---

## 6. GHI CHÚ BỔ SUNG

### **Cách vẽ Use Case Diagram:**

1. **Primary Actors** (Human Actors): Admin, Partner, User - đặt ở bên trái
2. **Secondary Actors** (External Systems): VNPay, OpenAI API - đặt ở bên phải
3. **Use Cases**: Đặt bên trong hệ thống (hình chữ nhật)
4. **Relationships**:
   - Association (đường thẳng) giữa Actor và Use Case
   - Include/Extend nếu cần
   - **Generalization** (kế thừa) giữa các actors:
     - ✅ **Partner → User**: Partner kế thừa tất cả use cases của User
     - ✅ **Admin → Partner**: Admin kế thừa tất cả use cases của Partner (và gián tiếp có tất cả use cases của User)
     - **Hierarchy**: User → Partner → Admin

### **Generalization giữa Actors:**

#### **Nên sử dụng Generalization** ✅

**Lý do:**

1. ✅ **Phản ánh đúng kiến trúc code**: Role hierarchy trong SecurityConfig.java
   ```java
   // ADMIN has all privileges of PARTNER and USER
   // PARTNER has all privileges of USER
   // Hierarchy: ADMIN > PARTNER > USER
   RoleHierarchy roleHierarchy() {
       return RoleHierarchyImpl.fromHierarchy(
           RoleType.ADMIN.getValue() + " > " + RoleType.PARTNER.getValue() + "\n" +
           RoleType.ADMIN.getValue() + " > " + RoleType.USER.getValue() + "\n" +
           RoleType.PARTNER.getValue() + " > " + RoleType.USER.getValue());
   }
   ```
2. ✅ **Giảm trùng lặp**: Không cần vẽ lại các use cases của User và Partner cho Admin
3. ✅ **Dễ bảo trì**: Khi thêm use case cho User hoặc Partner, Admin tự động có use case đó
4. ✅ **Chuẩn UML**: Generalization là cách chuẩn để mô tả quan hệ kế thừa

#### **Cấu trúc Generalization:**

```
User
  │ (Generalization)
  ▼
Partner
  │ (Generalization)
  ▼
Admin
```

**Giải thích:**

- **Partner → User**: Partner kế thừa tất cả use cases của User
- **Admin → Partner**: Admin kế thừa tất cả use cases của Partner (và gián tiếp có tất cả use cases của User)
- **Hierarchy**: User → Partner → Admin (chuỗi kế thừa đơn giản)

#### **Lưu ý về Multiple Inheritance:**

- ⚠️ Một số công cụ UML có thể không hỗ trợ multiple inheritance trực tiếp
- ⚠️ Có thể cần vẽ 2 generalization arrows riêng biệt
- ⚠️ Nếu công cụ không hỗ trợ, có thể mô tả bằng text hoặc comment

### **Lưu ý:**

- Chỉ nên đưa các actors có use cases riêng biệt và quan trọng vào diagram
- Tránh đưa quá nhiều actors phụ (infrastructure services) vào diagram chính
- Có thể tạo các diagram phụ cho các chức năng cụ thể (ví dụ: Payment Diagram, Authentication Diagram)
- **Xem thêm**: `USE_CASE_GENERALIZATION_ANALYSIS.md` để biết chi tiết về generalization
