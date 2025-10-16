# 🔐 Luồng Reset Password - Holidate System

## 📋 **Tổng quan 2 luồng chính**

### **Option 1: OTP Reset Password (Duy nhất)**

```
1. POST /auth/send-password-reset-otp → Gửi OTP qua email
2. POST /auth/verify-password-reset-otp → Verify OTP + Reset password
```

**Option 2: Email Verification (User mới đăng ký)**

```
1. POST /auth/email/send-verification-email
2. POST /auth/email/verify-email
```

```
Step 1: POST /auth/send-password-reset-otp
Step 2: POST /auth/verify-password-reset-otp
```

### **2. Luồng Email Verification (Cho user mới đăng ký)**

```
Step 1: POST /auth/email/send-verification-email
Step 2: POST /auth/email/verify-email
```

---

## 🔄 **Chi tiết luồng OTP Reset Password**

### **Step 1: Gửi OTP Reset Password**

**Endpoint:** `POST /auth/send-password-reset-otp`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "data": {
    "sent": true
  }
}
```

**Validation:**

- ✅ User phải tồn tại
- ✅ User phải có `authProvider = "LOCAL"`
- ✅ User phải đã active (`active = true`)
- ✅ OTP không bị block
- ✅ Email được gửi với template `password-reset-otp.html`

### **Step 2: Verify OTP và Reset Password**

**Endpoint:** `POST /auth/verify-password-reset-otp`

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response:**

```json
{
  "data": {
    "verified": true
  }
}
```

**Validation & Actions:**

- ✅ Validate OTP (6 digits numeric)
- ✅ Check OTP không expired
- ✅ Check OTP không bị block
- ✅ Verify OTP match
- ✅ **Reset password ngay lập tức**
- ✅ Clear toàn bộ OTP data
- ✅ Invalidate refresh tokens
- ✅ Save cả User và UserAuthInfo

---

---

## 📧 **Email Templates**

### **1. Email Verification Template**

- **File:** `email-verification-otp.html`
- **Màu:** 🟢 Green (`#4CAF50`)
- **Subject:** "Mã OTP xác thực Email - Holidate"

### **2. Password Reset Template**

- **File:** `password-reset-otp.html`
- **Màu:** 🟠 Orange (`#FF6B35`)
- **Subject:** "Mã OTP đặt lại mật khẩu - Holidate"

---

## 🔒 **Bảo mật**

### **OTP Management**

- ✅ Sử dụng chung 1 field OTP (không duplicate)
- ✅ OTP tự động expire sau cấu hình thời gian
- ✅ Block sau số lần thử sai tối đa
- ✅ Clear OTP data sau khi thành công

### **Session Security**

- ✅ Invalidate refresh tokens sau reset password
- ✅ Force re-login sau reset password
- ✅ Update `updatedAt` timestamp

### **Validation**

- ✅ Email format validation
- ✅ OTP pattern: 6 digits numeric (`^\\d{6}$`)
- ✅ Password minimum 8 characters
- ✅ AuthProvider check (LOCAL only)

---

## 📁 **Files Structure**

```
src/main/java/com/webapp/holidate/
├── dto/request/auth/otp/
│   ├── SendPasswordResetOtpRequest.java
│   ├── VerifyPasswordResetOtpRequest.java
│   ├── SendEmailVerificationOtpRequest.java
│   └── VerifyEmailVerificationOtpRequest.java
├── dto/response/auth/
│   └── SendPasswordResetOtpResponse.java
├── service/auth/
│   ├── AuthService.java (resetPassword method)
│   └── EmailService.java (sendPasswordResetOtp, verifyPasswordResetOtp)
└── controller/auth/
    ├── AuthController.java (password reset endpoints)
    └── EmailController.java (email verification endpoints)

src/main/resources/templates/
├── email-verification-otp.html
└── password-reset-otp.html
```

---

## ✅ **Luồng hoàn chỉnh và đã test**

1. ✅ **OTP Generation & Email** - Tạo OTP 6 số và gửi email
2. ✅ **OTP Validation** - Validate format và expiration
3. ✅ **Password Reset** - Encode và save password mới
4. ✅ **Security Cleanup** - Clear OTP data và invalidate tokens
5. ✅ **Database Consistency** - Save cả User và UserAuthInfo
6. ✅ **Email Templates** - Layout đồng nhất, màu sắc phân biệt
7. ✅ **Error Handling** - Comprehensive error types

**Luồng đã sẵn sàng production! 🚀**
