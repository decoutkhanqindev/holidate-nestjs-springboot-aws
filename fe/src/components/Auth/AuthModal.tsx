// components/Auth/AuthModal.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
    registerUser,
    sendVerificationEmail,
    verifyEmailWithOtp,
    resendVerificationEmail,
    sendPasswordResetOtp,
    resetPassword
} from '@/service/authService';
import { API_BASE_URL } from '@/service/api';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
    </svg>
);

const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash-fill" viewBox="0 0 16 16">
        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
    </svg>
);


export default function AuthModal() {
    const { isModalOpen, closeModal, login } = useAuth();

    // State quản lý chung
    const [view, setView] = useState('social');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State cho các form
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // State cho OTP và đếm ngược
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [registrationStep, setRegistrationStep] = useState('details'); // 'details' | 'otp'
    const [forgotPasswordStep, setForgotPasswordStep] = useState('enterEmail');

    // State để quản lý hiển thị mật khẩu
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    // Reset toàn bộ state khi đóng modal
    useEffect(() => {
        if (!isModalOpen) {
            setTimeout(() => {
                setView('social'); setError(''); setSuccess(''); setIsLoading(false);
                setLoginEmail(''); setLoginPassword(''); setFullName(''); setRegisterEmail('');
                setRegisterPassword(''); setConfirmPassword(''); setOtp(''); setForgotPasswordEmail('');
                setNewPassword(''); setConfirmNewPassword(''); setRegistrationStep('details');
                setForgotPasswordStep('enterEmail'); setShowLoginPassword(false);
                setShowRegisterPassword(false); setShowConfirmPassword(false);
                setShowNewPassword(false); setShowConfirmNewPassword(false);
            }, 300);
        }
    }, [isModalOpen]);

    // useEffect cho đếm ngược
    useEffect(() => {
        let timerId: NodeJS.Timeout;
        const isOtpStep = (registrationStep === 'otp' || forgotPasswordStep === 'enterOtp') && countdown > 0;
        if (isOtpStep) {
            timerId = setInterval(() => setCountdown(p => p > 0 ? p - 1 : 0), 1000);
        }
        return () => clearInterval(timerId);
    }, [registrationStep, forgotPasswordStep, countdown]);

    // Hàm tiện ích chuyển view
    const switchView = (newView: string) => {
        setView(newView);
        setError('');
        setSuccess('');
    }


    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault(); setIsLoading(true); setError(''); setSuccess('');
        try {
            await login(loginEmail, loginPassword);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
        } finally { setIsLoading(false); }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (registerPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp!'); return; }
        if (registerPassword.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }

        setIsLoading(true); setError(''); setSuccess('');
        try {
            await registerUser({ fullName, email: registerEmail, password: registerPassword });
            await sendVerificationEmail({ email: registerEmail });
            setRegistrationStep('otp'); setCountdown(60);
            setSuccess(`Mã OTP đã được gửi tới ${registerEmail}. Vui lòng kiểm tra email!`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
        } finally { setIsLoading(false); }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            await verifyEmailWithOtp({ email: registerEmail, otp });
            setSuccess('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
            switchView('emailLogin');
            setLoginEmail(registerEmail);
            setFullName(''); setRegisterEmail(''); setRegisterPassword('');
            setConfirmPassword(''); setOtp(''); setRegistrationStep('details');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mã OTP không chính xác!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const emailForResend = view === 'emailRegister' ? registerEmail : forgotPasswordEmail;
        setError(''); setSuccess('');
        try {
            if (view === 'emailRegister') {
                await resendVerificationEmail({ email: emailForResend });
            } else if (view === 'forgotPassword') {
                await sendPasswordResetOtp({ email: emailForResend });
            }
            setSuccess(`Mã OTP mới đã được gửi lại.`); setCountdown(60);
        } catch (err) {
            setError('Gửi lại mã thất bại. Vui lòng thử lại sau.');
        }
    };

    const handleForgotPasswordRequest = async (e: React.FormEvent) => {
        e.preventDefault(); setIsLoading(true); setError(''); setSuccess('');
        try {
            await sendPasswordResetOtp({ email: forgotPasswordEmail });
            setForgotPasswordStep('enterOtp'); setCountdown(60); setOtp('');
            setSuccess(`Mã OTP đã được gửi tới ${forgotPasswordEmail}. Vui lòng kiểm tra email!`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Email không tồn tại hoặc có lỗi xảy ra.');
        } finally { setIsLoading(false); }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) { setError('Mật khẩu xác nhận không khớp!'); return; }
        if (newPassword.length < 6) { setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }

        setIsLoading(true); setError(''); setSuccess('');
        try {
            await resetPassword({ email: forgotPasswordEmail, otp, newPassword: newPassword });
            setSuccess('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
            switchView('emailLogin'); setLoginEmail(forgotPasswordEmail);
            setForgotPasswordEmail(''); setOtp(''); setNewPassword(''); setConfirmNewPassword('');
            setForgotPasswordStep('enterEmail');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại! Mã OTP có thể không đúng hoặc đã hết hạn.');
        } finally { setIsLoading(false); }
    };

    // Hàm render giao diện
    const renderContent = () => {
        const renderMessages = () => (
            <>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {success && <div className="alert alert-success" role="alert">{success}</div>}
            </>
        );

        if (view === 'emailLogin') {
            return (
                <form onSubmit={handleEmailLogin}>
                    <div className="d-flex align-items-center mb-4"><button type="button" onClick={() => switchView('social')} className="btn btn-link text-dark p-0 me-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" /></svg></button><h4 className="fw-bold mb-0">Đăng nhập</h4></div>
                    {renderMessages()}
                    <div className="mb-3"><label htmlFor="emailLogin" className="form-label">Email</label><input type="email" id="emailLogin" className="form-control form-control-lg" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isLoading} /></div>
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center"><label htmlFor="passwordLogin" className="form-label mb-0">Mật khẩu</label><a href="#" onClick={(e) => { e.preventDefault(); switchView('forgotPassword'); setForgotPasswordEmail(loginEmail); }} className="fw-bold text-decoration-none small">Quên mật khẩu?</a></div>
                        <div className="input-group mt-2">
                            <input type={showLoginPassword ? 'text' : 'password'} id="passwordLogin" className="form-control form-control-lg" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isLoading} />
                            <button className="btn btn-outline-secondary" type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}>{showLoginPassword ? <EyeSlashIcon /> : <EyeIcon />}</button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isLoading}>{isLoading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
                    <p className="text-center mt-3">Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); switchView('emailRegister'); }} className="fw-bold text-decoration-none">Đăng ký</a></p>
                </form>
            );
        }

        if (view === 'emailRegister') {
            if (registrationStep === 'otp') {
                return (
                    <form onSubmit={handleOtpSubmit}>
                        <h4 className="fw-bold mb-3">Xác thực tài khoản</h4>
                        {renderMessages()}
                        <p className="text-muted mb-4">Mã OTP đã được gửi đến <strong>{registerEmail}</strong>.</p>
                        <div className="mb-4">
                            <label htmlFor="otp" className="form-label">Mã OTP</label>
                            <input type="text" id="otp" className="form-control form-control-lg" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} disabled={isLoading} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg w-100 mb-3" disabled={isLoading}>{isLoading ? 'Đang xác thực...' : 'Xác nhận'}</button>
                        <div className="text-center">
                            {countdown > 0 ? (<p className="text-muted">Gửi lại mã sau {countdown} giây</p>) : (<button type="button" onClick={handleResendOtp} className="btn btn-link text-decoration-none">Gửi lại mã</button>)}
                        </div>
                        <a href="#" onClick={(e) => { e.preventDefault(); setRegistrationStep('details'); setError(''); setSuccess(''); }} className="d-block text-center mt-2 text-decoration-none">Quay lại</a>
                    </form>
                );
            }
            return (
                <form onSubmit={handleRegisterSubmit}>
                    <div className="d-flex align-items-center mb-4"><button type="button" onClick={() => switchView('social')} className="btn btn-link text-dark p-0 me-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" /></svg></button><h4 className="fw-bold mb-0">Đăng ký</h4></div>
                    {renderMessages()}
                    <div className="mb-3"><label htmlFor="fullName" className="form-label">Họ và Tên</label><input type="text" id="fullName" className="form-control form-control-lg" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} /></div>
                    <div className="mb-3"><label htmlFor="emailRegister" className="form-label">Email</label><input type="email" id="emailRegister" className="form-control form-control-lg" required value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} disabled={isLoading} /></div>
                    <div className="mb-3"><label htmlFor="passwordRegister" className="form-label">Mật khẩu</label>
                        <div className="input-group"><input type={showRegisterPassword ? 'text' : 'password'} id="passwordRegister" className="form-control form-control-lg" required value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} disabled={isLoading} /><button className="btn btn-outline-secondary" type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>{showRegisterPassword ? <EyeSlashIcon /> : <EyeIcon />}</button></div>
                    </div>
                    <div className="mb-4"><label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                        <div className="input-group"><input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" className="form-control form-control-lg" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} /><button className="btn btn-outline-secondary" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}</button></div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isLoading}>{isLoading ? 'Đang xử lý...' : 'Tiếp tục'}</button>
                    <p className="text-center mt-3">Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); switchView('emailLogin'); }} className="fw-bold text-decoration-none">Đăng nhập</a></p>
                </form>
            );
        }

        if (view === 'forgotPassword') {
            switch (forgotPasswordStep) {
                case 'enterOtp':
                    return (
                        <form onSubmit={handleResetPasswordSubmit}>
                            <h4 className="fw-bold mb-3">Đặt lại mật khẩu</h4>
                            {renderMessages()}
                            <p className="text-muted mb-4">Mã OTP đã được gửi đến <strong>{forgotPasswordEmail}</strong>.</p>
                            <div className="mb-3"><label htmlFor="otp" className="form-label">Mã OTP</label><input type="text" id="otp" className="form-control form-control-lg" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} disabled={isLoading} /></div>
                            <div className="mb-3"><label htmlFor="newPassword" className="form-label">Mật khẩu mới</label>
                                <div className="input-group"><input type={showNewPassword ? 'text' : 'password'} id="newPassword" className="form-control form-control-lg" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isLoading} placeholder="********" /><button className="btn btn-outline-secondary" type="button" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeSlashIcon /> : <EyeIcon />}</button></div>
                            </div>
                            <div className="mb-4"><label htmlFor="confirmNewPassword" className="form-label">Xác nhận mật khẩu mới</label>
                                <div className="input-group"><input type={showConfirmNewPassword ? 'text' : 'password'} id="confirmNewPassword" className="form-control form-control-lg" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} disabled={isLoading} placeholder="********" /><button className="btn btn-outline-secondary" type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>{showConfirmNewPassword ? <EyeSlashIcon /> : <EyeIcon />}</button></div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg w-100 mb-3" disabled={isLoading}>{isLoading ? 'Đang xử lý...' : 'Xác nhận'}</button>
                            <div className="text-center">{countdown > 0 ? (<p className="text-muted">Gửi lại mã sau {countdown} giây</p>) : (<button type="button" onClick={handleResendOtp} className="btn btn-link text-decoration-none">Gửi lại mã</button>)}</div>
                            <a href="#" onClick={(e) => { e.preventDefault(); setForgotPasswordStep('enterEmail'); setError(''); setSuccess(''); }} className="d-block text-center mt-2 text-decoration-none">Quay lại</a>
                        </form>
                    );
                case 'enterEmail':
                default:
                    return (
                        <form onSubmit={handleForgotPasswordRequest}>
                            <div className="d-flex align-items-center mb-4"><button type="button" onClick={(e) => { e.preventDefault(); switchView('emailLogin'); }} className="btn btn-link text-dark p-0 me-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" /></svg></button><h4 className="fw-bold mb-0">Quên mật khẩu</h4></div>
                            {renderMessages()}
                            <p className="text-muted">Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.</p>
                            <div className="mb-4"><label htmlFor="forgotPasswordEmail" className="form-label">Email</label><input type="email" id="forgotPasswordEmail" className="form-control form-control-lg" required value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} disabled={isLoading} /></div>
                            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isLoading}>{isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}</button>
                        </form>
                    );
            }
        }

        return (
            <>
                <div className="text-center mb-4"><div className="p-3 bg-light rounded-3 d-inline-block"><span style={{ fontSize: '40px' }}>🎟️</span></div><h4 className="fw-bold mt-3">Chúng tôi có một ưu đãi vô cùng hấp dẫn!</h4></div>
                <div className="d-flex justify-content-center gap-3 mb-3">
                    <a href={`${API_BASE_URL}/oauth2/authorization/google`} className="btn btn-google rounded-pill px-4 py-2 d-flex align-items-center flex-grow-1 justify-content-center text-decoration-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16"><path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" /></svg>
                        <span className="ms-2 fw-semibold">Google</span>
                    </a>
                    <button onClick={() => switchView('emailLogin')} className="btn btn-google rounded-pill px-4 py-2 d-flex align-items-center flex-grow-1 justify-content-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" /></svg>
                        <span className="ms-2 fw-semibold">Email</span>
                    </button>
                </div>
                <a href="#" onClick={(e) => { e.preventDefault(); switchView('emailLogin'); }} className="text-center text-primary fw-bold text-decoration-none mt-2 d-block">Các lựa chọn khác</a>
                <hr />
                <p className="text-center text-muted small">Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản và Điều kiện</a> và <a href="#">Chính sách bảo vệ dữ liệu</a> của chúng tôi.</p>
                <button onClick={closeModal} className="btn btn-link text-decoration-none w-100 mt-2">Tìm kiếm với tư cách là khách</button>
            </>
        );
    };

    if (!isModalOpen) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content p-4 rounded-4">
                    <div className="modal-header border-0">
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}