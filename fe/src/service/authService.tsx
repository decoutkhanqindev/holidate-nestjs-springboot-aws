import apiClient from './api';

export const registerUser = (data: any) => {
    return apiClient.post('/auth/register', data);
};

export const loginUser = (data: any) => {
    return apiClient.post('/auth/login', data);
};

export const logoutUser = (data: any) => {
    return apiClient.post('/auth/logout', data);
};

export const sendVerificationEmail = (data: any) => {
    return apiClient.post('/auth/email/send-email-verification-otp', data);
};

export const resendVerificationEmail = (data: any) => {
    return apiClient.post('/auth/email/send-email-verification-otp', data);
};

export const verifyEmailWithOtp = (data: any) => {
    return apiClient.post('/auth/email/verify-email-verification-otp', data);
};

export const getMyProfile = () => {
    return apiClient.get('/auth/me');
}

export const refreshToken = (refreshTokenString?: string) => {
    const token = refreshTokenString || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);

    if (token) {
        return apiClient.post('/auth/refresh-token', { token });
    } else {
        return apiClient.post('/auth/refresh-token', { token: '' });
    }
}

export const sendPasswordResetOtp = (data: any) => {
    return apiClient.post('/auth/email/send-password-reset-otp', data);
};

export const verifyPasswordResetOtp = (data: any) => {
    return apiClient.post('/auth/email/verify-password-reset-otp', data);
};

export const resetPassword = (data: any) => {
    return apiClient.post('/auth/email/verify-password-reset-otp', data);
};