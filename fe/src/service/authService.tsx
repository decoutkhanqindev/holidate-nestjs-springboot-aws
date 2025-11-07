//  services/authService.ts
import apiClient from './api';

// 1 Đăng ký
export const registerUser = (data: any) => {
    return apiClient.post('/auth/register', data);
};

// 2 Đăng nhập
export const loginUser = (data: any) => {
    return apiClient.post('/auth/login', data);
};

// 3 Đăng xuất
export const logoutUser = (data: any) => {
    console.log("[authService] 🔴 LOGOUT REQUEST - Gửi request logout đến backend");
    console.log("[authService] Request data:", { token: data.token ? `${data.token.substring(0, 20)}...` : 'KHÔNG CÓ TOKEN' });
    console.log("[authService] Request URL: POST /auth/logout");
    return apiClient.post('/auth/logout', data);
};
// export const logoutUser = () => {

//     return apiClient.post('/auth/logout');
// };
// 4 Gửi email xác thực (bước đầu tiên của OTP)
// export const sendVerificationEmail = (data: any) => {
//     return apiClient.post('/auth/email/send-verification-email', data);
// };

export const sendVerificationEmail = (data: any) => {
    return apiClient.post('/auth/email/send-email-verification-otp', data);
};


// thay bang ham  sendVerificationEmail

//export const sendVerificationEmail = (data: any) => {
//     return apiClient.post('/auth/email/send-email-verification-otp', data);
// };


// 5 Gửi lại email xác thực
export const resendVerificationEmail = (data: any) => {
    return apiClient.post('/auth/email/resend-verification-email', data);
};

// 6 Xác thực email với OTP
// export const verifyEmailWithOtp = (data: any) => {
//     return apiClient.post('/auth/email/verify-email', data);
// };
export const verifyEmailWithOtp = (data: any) => {
    return apiClient.post('/auth/email/verify-email-verification-otp', data);
};

// lấy thông tin cá nhân của user hiện tại
export const getMyProfile = () => {
    return apiClient.get('/auth/me');
}



// ---  ĐẶT LẠI MẬT KHẨU ---


// 8 Gửi OTP để đặt lại mật khẩu
export const sendPasswordResetOtp = (data: any) => {
    console.log("DEMO: Gửi OTP đặt lại mật khẩu đến:", data.email);
    return apiClient.post('/auth/email/send-password-reset-otp', data);
};

// 9 Xác thực OTP đặt lại mật khẩu
export const verifyPasswordResetOtp = (data: any) => {
    console.log("DEMO: Xác thực OTP:", data.otp, "cho email:", data.email);
    return apiClient.post('/auth/email/verify-password-reset-otp', data);
};

// 10 Đặt lại mật khẩu mới sau khi đã xác thực OTP
export const resetPassword = (data: any) => {
    console.log("DEMO: Đặt lại mật khẩu cho email:", data.email);

    // API này thường yêu cầu email, otp, và newPassword
    return apiClient.post('/auth/email/verify-password-reset-otp', data);
};