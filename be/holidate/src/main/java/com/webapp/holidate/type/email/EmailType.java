package com.webapp.holidate.type.email;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum EmailType {
  EMAIL_VERIFICATION("email-verification-otp", "Mã OTP xác thực Email - Holidate"),
  PASSWORD_RESET("password-reset-otp", "Mã OTP đặt lại mật khẩu - Holidate"),
  REFUND_NOTIFICATION("refund-notification", "Thông báo hoàn tiền đơn đặt phòng - Holidate");

  String templateName;
  String emailSubject;
}

