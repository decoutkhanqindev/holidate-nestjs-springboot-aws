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
  REFUND_NOTIFICATION("refund-notification", "Thông báo hoàn tiền đơn đặt phòng - Holidate"),
  RESCHEDULE_NOTIFICATION("reschedule-notification", "Thông báo đổi lịch đặt phòng - Holidate"),
  BOOKING_CONFIRMATION("booking-confirmation", "Xác nhận đặt phòng thành công - Holidate"),
  CHECKIN_NOTIFICATION("checkin-notification", "Xác nhận nhận phòng - Holidate"),
  CHECKOUT_NOTIFICATION("checkout-notification", "Xác nhận trả phòng - Holidate");

  String templateName;
  String emailSubject;
}
