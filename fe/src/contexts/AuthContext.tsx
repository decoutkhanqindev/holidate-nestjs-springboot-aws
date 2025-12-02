// contexts/AuthContext.tsx 

'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { loginUser, logoutUser, getMyProfile } from '@/service/authService';
import { getUserProfile } from '@/lib/client/userService';

// Interfaces
interface User {
    id?: string;
    fullName: string;
    email: string;
    role?: {
        id: string;
        name: string;
        description?: string;
    } | string;
    score?: number;
    phone?: string;
    avatarUrl?: string; // Avatar URL từ server
}
interface JwtPayload { sub: string; fullName: string; role?: string; id?: string; exp?: number; }
interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    isLoading: boolean;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // THAY ĐỔI 1: Hàm này giờ sẽ nhận toàn bộ object data từ API login (bao gồm role)
    // Trả về true nếu đã redirect (admin/partner), false nếu là user
    const processEmailLoginSuccess = (loginData: {
        id: string;
        email: string;
        fullName: string;
        role?: { id: string; name: string; description?: string; };
        accessToken: string;
        refreshToken: string;
    }): boolean => {
        // Kiểm tra role - nếu là ADMIN hoặc PARTNER, redirect về trang admin/partner
        const roleName = loginData.role?.name?.toLowerCase();

        if (roleName === 'admin' || roleName === 'partner') {
            // Lưu token tạm thời để admin context có thể sử dụng
            localStorage.setItem('accessToken', loginData.accessToken);
            localStorage.setItem('refreshToken', loginData.refreshToken);

            // Redirect về trang admin login với thông báo
            router.push('/admin-login?message=admin_redirect');
            return true; // Đã redirect, không cần xử lý tiếp
        }

        // Chỉ cho phép USER role đăng nhập qua trang client
        if (roleName && roleName !== 'user') {
            throw new Error('Vui lòng đăng nhập qua trang quản trị dành cho ' + roleName);
        }

        // Lưu token vào localStorage
        localStorage.setItem('accessToken', loginData.accessToken);
        localStorage.setItem('refreshToken', loginData.refreshToken);

        // LƯU Ý QUAN TRỌNG: Lưu ID người dùng riêng ra localStorage
        localStorage.setItem('userId', loginData.id);

        // Tạo user state từ data nhận được (bao gồm role)
        const userData: User = {
            id: loginData.id,
            fullName: loginData.fullName,
            email: loginData.email,
            role: loginData.role || 'user', // Lưu role object hoặc string
        };
        setUser(userData);
        setIsLoggedIn(true);
        return false; // Chưa redirect, sẽ redirect về trang chủ sau
    };

    // Hàm xử lý token response (dùng chung cho email login và OAuth)
    const processTokenResponse = (tokenData: {
        id: string;
        email: string;
        fullName: string;
        role?: { id: string; name: string; description?: string; };
        accessToken: string;
        refreshToken: string;
    }): boolean => {
        const roleName = tokenData.role?.name?.toLowerCase();

        if (roleName === 'admin' || roleName === 'partner') {
            localStorage.setItem('accessToken', tokenData.accessToken);
            localStorage.setItem('refreshToken', tokenData.refreshToken);
            router.push('/admin-login?message=admin_redirect');
            return true;
        }

        if (roleName && roleName !== 'user') {
            throw new Error('Vui lòng đăng nhập qua trang quản trị dành cho ' + roleName);
        }

        localStorage.setItem('accessToken', tokenData.accessToken);
        localStorage.setItem('refreshToken', tokenData.refreshToken);
        localStorage.setItem('userId', tokenData.id);

        const userData: User = {
            id: tokenData.id,
            fullName: tokenData.fullName,
            email: tokenData.email,
            role: tokenData.role || 'user',
        };
        setUser(userData);
        setIsLoggedIn(true);
        return false;
    };

    useEffect(() => {
        const initializeAuth = async () => {
            // QUAN TRỌNG: Kiểm tra flag OAuth login trước - nếu vừa login bằng OAuth, force check cookie
            // Điều này đảm bảo token được sync vào localStorage ngay sau OAuth redirect
            const oauthLoginInProgress = sessionStorage.getItem('oauthLoginInProgress');
            const isOAuthLogin = oauthLoginInProgress === 'true';

            if (isOAuthLogin) {
                // Xóa các flag có thể block OAuth check
                sessionStorage.removeItem('skipOAuthCheck');
                sessionStorage.removeItem('justLoggedOut');
                sessionStorage.removeItem('lastLogoutTime');
                // CHỈ XÓA oauthLoginInProgress SAU KHI ĐÃ DÙNG để tránh conflict
                // sessionStorage.removeItem('oauthLoginInProgress'); // Xóa sau khi đã check xong
            }

            // QUAN TRỌNG: Kiểm tra flag logout trước - nếu vừa logout, không tự động login lại
            // NHƯNG: Nếu vừa login bằng OAuth (isOAuthLogin), thì bỏ qua check này
            const justLoggedOut = sessionStorage.getItem('justLoggedOut');
            if (justLoggedOut === 'true' && !isOAuthLogin) {
                sessionStorage.removeItem('justLoggedOut');
                setIsLoading(false);
                return; // Không kiểm tra session nữa
            }


            // Điều này đảm bảo sau OAuth redirect, code luôn check cookie để sync token
            const tokenFromStorage = localStorage.getItem('accessToken');
            const userIdFromStorage = localStorage.getItem('userId');

            // QUAN TRỌNG: Nếu đang OAuth login, BỎ QUA check localStorage và check cookie OAuth trực tiếp
            // Vì sau OAuth redirect, token chỉ có trong cookie, chưa sync vào localStorage
            // Chỉ dùng localStorage nếu KHÔNG phải OAuth login
            if (!isOAuthLogin && tokenFromStorage && userIdFromStorage) {
                try {
                    const decodedToken = jwtDecode<JwtPayload>(tokenFromStorage);
                    const tokenRole = decodedToken.role?.toLowerCase();
                    const isTokenExpired = decodedToken.exp && decodedToken.exp * 1000 < Date.now();

                    // Nếu token hết hạn, xóa và check cookie
                    if (isTokenExpired) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        // Tiếp tục check OAuth cookie bên dưới
                    } else if (tokenRole === 'admin' || tokenRole === 'partner') {
                        // Token của Admin/Partner, không khôi phục session cho client
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        setIsLoading(false);
                        return;
                    } else if (!tokenRole || tokenRole === 'user') {
                        // Token hợp lệ cho USER - restore session và return ngay
                        const userData: User = {
                            id: userIdFromStorage,
                            fullName: decodedToken.fullName,
                            email: decodedToken.sub,
                            role: tokenRole || 'user',
                        };
                        setUser(userData);
                        setIsLoggedIn(true);

                        // Load avatarUrl từ profile (async, không block)
                        if (userIdFromStorage && userIdFromStorage.trim() !== '' && userIdFromStorage !== 'undefined' && userIdFromStorage !== 'null') {
                            getUserProfile(userIdFromStorage).then(profile => {
                                setUser(prevUser => ({
                                    ...prevUser!,
                                    avatarUrl: profile.avatarUrl,
                                }));
                            }).catch(() => {
                                // Silent fail - avatar sẽ load sau
                            });
                        }

                        setIsLoading(false);
                        return; // QUAN TRỌNG: Return ngay khi đã restore session từ localStorage
                    } else {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        // Tiếp tục check OAuth cookie bên dưới
                    }
                } catch (error) {
                    // Token không hợp lệ, xóa và check cookie
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userId');
                    // Tiếp tục check OAuth cookie bên dưới
                }
            } else if (isOAuthLogin) {
                // QUAN TRỌNG: Nếu đang OAuth login, KHÔNG check localStorage
                // Chỉ check cookie OAuth để sync token vào localStorage
            }



            // Kiểm tra xem có token hợp lệ trong localStorage không (nếu không phải OAuth login)
            let shouldCheckOAuthCookie = false;
            if (isOAuthLogin) {
                // Đang OAuth login, bắt buộc check cookie
                shouldCheckOAuthCookie = true;
            } else {
                // Không phải OAuth login, chỉ check cookie nếu không có token hợp lệ trong localStorage
                const currentToken = localStorage.getItem('accessToken');
                if (!currentToken) {
                    shouldCheckOAuthCookie = true;
                } else {
                    try {
                        const decoded = jwtDecode<JwtPayload>(currentToken);
                        const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
                        if (isExpired) {
                            shouldCheckOAuthCookie = true;
                        }
                    } catch {
                        shouldCheckOAuthCookie = true;
                    }
                }
            }

            // Nếu không cần check OAuth cookie, return ngay
            if (!shouldCheckOAuthCookie) {
                setIsLoading(false);
                return;
            }

            // QUAN TRỌNG: Chỉ kiểm tra OAuth cookie nếu KHÔNG có flag logout
            // Vì sau logout, JSESSIONID vẫn còn nhưng không nên tự động login lại
            const skipOAuthCheck = sessionStorage.getItem('skipOAuthCheck');
            if (skipOAuthCheck === 'true' && !isOAuthLogin) {
                sessionStorage.removeItem('skipOAuthCheck');
                setIsLoading(false);
                return;
            }


            // Nếu logout gần đây (trong vòng 5 giây), không tự động login lại
            // LƯU Ý: Khi login bằng Google OAuth, flag này sẽ được xóa trong handleGoogleLogin
            const lastLogoutTime = sessionStorage.getItem('lastLogoutTime');
            if (lastLogoutTime && !isOAuthLogin) {
                const timeSinceLogout = Date.now() - parseInt(lastLogoutTime);
                const fiveSeconds = 5 * 1000;
                if (timeSinceLogout < fiveSeconds) {
                    sessionStorage.removeItem('lastLogoutTime');
                    setIsLoading(false);
                    return;
                } else {
                    // Xóa timestamp cũ nếu đã quá 5 giây
                    sessionStorage.removeItem('lastLogoutTime');
                }
            }

            // Nếu không có token hợp lệ và không vừa logout, check OAuth cookie

            try {

                // LƯU Ý: Cookie HttpOnly không thể đọc từ document.cookie (bảo mật)
                // Nhưng với withCredentials: true, browser sẽ tự động gửi cookie trong request


                // 5. Xử lý CustomCookieAuthenticationFilter khi gọi /auth/me
                if (isOAuthLogin) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } else {
                    // Nếu không phải OAuth login nhưng check cookie, đợi một chút
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                console.log("[Client AuthContext] 🔍 Đang gọi getMyProfile() để check OAuth cookie và sync token...");

                const meResponse = await getMyProfile();
                const meData = meResponse.data.data;

                if (meData && meData.id && meData.accessToken) {
                    // QUAN TRỌNG: Kiểm tra xem token này có bị invalidate không
                    // Bằng cách thử decode và kiểm tra xem có thể dùng được không
                    try {
                        const decodedToken = jwtDecode<any>(meData.accessToken);

                        // Kiểm tra token có hết hạn không
                        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                            setIsLoading(false);
                            return;
                        }

                        // QUAN TRỌNG: Lưu token vào localStorage ngay lập tức
                        // Điều này đảm bảo apiClient có thể thêm Authorization header cho các request sau
                        localStorage.setItem('accessToken', meData.accessToken);

                        if (meData.refreshToken) {
                            localStorage.setItem('refreshToken', meData.refreshToken);
                        }
                        localStorage.setItem('userId', meData.id);

                        // Xóa flag OAuth login sau khi đã sync token thành công
                        if (isOAuthLogin) {
                            sessionStorage.removeItem('oauthLoginInProgress');
                        }

                        const hasRedirected = processTokenResponse({
                            id: meData.id,
                            email: meData.email,
                            fullName: meData.fullName,
                            role: meData.role,
                            accessToken: meData.accessToken,
                            refreshToken: meData.refreshToken || '',
                        });

                        // Kiểm tra xem có returnUrl từ OAuth không (ví dụ từ trang booking)
                        const oauthReturnUrl = sessionStorage.getItem('oauthReturnUrl');
                        if (oauthReturnUrl && !hasRedirected) {
                            sessionStorage.removeItem('oauthReturnUrl');
                            // Redirect về URL đã lưu
                            router.push(oauthReturnUrl);
                            setIsLoading(false);
                            return;
                        }

                        // Load avatarUrl từ profile
                        if (meData.id && meData.id.trim() !== '' && meData.id !== 'undefined' && meData.id !== 'null') {
                            setTimeout(() => {
                                getUserProfile(meData.id).then(profile => {
                                    setUser(prevUser => ({
                                        ...prevUser!,
                                        avatarUrl: profile.avatarUrl,
                                    }));
                                }).catch(() => {
                                    // Silent fail - avatar sẽ load sau
                                });
                            }, 50);
                        }

                        setIsLoading(false);
                        return;
                    } catch (decodeError: any) {
                        // Xóa flag OAuth login nếu có lỗi
                        if (isOAuthLogin) {
                            sessionStorage.removeItem('oauthLoginInProgress');
                        }
                        setIsLoading(false);
                        return;
                    }
                } else {
                    console.warn("[Client AuthContext] ⚠️ getMyProfile() không trả về token hoặc data không hợp lệ");
                    // Xóa flag OAuth login nếu không có token
                    if (isOAuthLogin) {
                        sessionStorage.removeItem('oauthLoginInProgress');
                    }
                }
            } catch (error: any) {
                // Log lỗi chi tiết để debug
                console.error("[Client AuthContext] ❌ Lỗi khi gọi getMyProfile():", error);
                // LƯU Ý: Cookie HttpOnly không thể đọc từ document.cookie (bảo mật)
                // Nếu cookie rỗng ở đây là bình thường - browser vẫn gửi HttpOnly cookie tự động

                if (error?.response?.status === 401) {
                } else if (error?.response?.status === 500) {

                    // QUAN TRỌNG: Chỉ retry nếu đang OAuth login VÀ không có token hợp lệ trong localStorage
                    // Nếu đã có token hợp lệ trong localStorage, không cần retry OAuth cookie
                    const hasValidTokenInStorage = tokenFromStorage && userIdFromStorage;
                    let shouldRetryOAuth = false;

                    if (hasValidTokenInStorage) {
                        try {
                            const decodedToken = jwtDecode<JwtPayload>(tokenFromStorage);
                            // Nếu token hợp lệ và chưa hết hạn, không cần retry OAuth cookie
                            if (decodedToken.exp && decodedToken.exp * 1000 >= Date.now()) {
                                shouldRetryOAuth = false;
                                // Xóa flag OAuth nếu có
                                if (isOAuthLogin) {
                                    sessionStorage.removeItem('oauthLoginInProgress');
                                }
                            } else {
                                // Token đã hết hạn, có thể retry OAuth cookie
                                shouldRetryOAuth = isOAuthLogin;
                            }
                        } catch {
                            // Token không hợp lệ, có thể retry OAuth cookie
                            shouldRetryOAuth = isOAuthLogin;
                        }
                    } else {
                        // Không có token trong localStorage, retry OAuth cookie nếu đang OAuth login
                        shouldRetryOAuth = isOAuthLogin;
                    }

                    // QUAN TRỌNG: Chỉ retry nếu đang OAuth login
                    // Vì lỗi 500 sau OAuth redirect thường là do cookie chưa được set đầy đủ hoặc backend chưa xử lý xong
                    if (shouldRetryOAuth && isOAuthLogin) {
                        console.log("[Client AuthContext] 🔄 Retry getMyProfile() với multiple attempts vì OAuth login...");

                        // Retry với nhiều attempts hơn và delay dài hơn cho OAuth
                        let retryAttempts = 5; // Tăng số lần retry
                        let retryDelay = 3000; // Bắt đầu với 3s (dài hơn nữa, vì cookie đã có token nhưng backend chưa sẵn sàng)

                        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
                            try {
                                await new Promise(resolve => setTimeout(resolve, retryDelay));

                                const retryResponse = await getMyProfile();
                                const retryData = retryResponse.data.data;

                                if (retryData && retryData.id && retryData.accessToken) {

                                    const decodedToken = jwtDecode<any>(retryData.accessToken);
                                    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                                        sessionStorage.removeItem('oauthLoginInProgress');
                                        setIsLoading(false);
                                        return;
                                    }

                                    // QUAN TRỌNG: Lưu token vào localStorage ngay
                                    localStorage.setItem('accessToken', retryData.accessToken);
                                    if (retryData.refreshToken) {
                                        localStorage.setItem('refreshToken', retryData.refreshToken);
                                    }
                                    localStorage.setItem('userId', retryData.id);

                                    // Xóa flag OAuth sau khi sync token thành công
                                    sessionStorage.removeItem('oauthLoginInProgress');

                                    const hasRedirected = processTokenResponse({
                                        id: retryData.id,
                                        email: retryData.email,
                                        fullName: retryData.fullName,
                                        role: retryData.role,
                                        accessToken: retryData.accessToken,
                                        refreshToken: retryData.refreshToken || '',
                                    });

                                    const oauthReturnUrl = sessionStorage.getItem('oauthReturnUrl');
                                    if (oauthReturnUrl && !hasRedirected) {
                                        sessionStorage.removeItem('oauthReturnUrl');
                                        router.push(oauthReturnUrl);
                                    }

                                    setIsLoading(false);
                                    return; // Success, exit retry loop
                                }
                            } catch (retryError: any) {
                                const errorStatus = retryError?.response?.status;
                                const errorMessage = retryError?.message || 'Unknown error';
                                console.error(`[Client AuthContext] ❌ Retry attempt ${attempt} thất bại:`, {
                                    status: errorStatus,
                                    message: errorMessage,
                                    data: retryError?.response?.data
                                });

                                // Nếu không phải lỗi 500, không retry nữa (có thể là lỗi khác)
                                if (errorStatus !== 500 && errorStatus !== undefined) {
                                    break;
                                }

                                // Nếu không phải lần retry cuối cùng, tăng delay và tiếp tục
                                if (attempt < retryAttempts) {
                                    // Tăng delay với exponential backoff, nhưng max là 5s
                                    retryDelay = Math.min(retryDelay * 1.3, 5000);
                                } else {
                                    console.error("[Client AuthContext] ⚠️ ĐÂY LÀ LỖI BACKEND (500 Internal Server Error)");
                                    console.error("[Client AuthContext]   1. Backend có lỗi khi xử lý OAuth callback (NullPointerException, v.v.)");

                                    // Hiển thị thông báo cho user
                                    if (typeof window !== 'undefined') {
                                        alert('⚠️ Lỗi đăng nhập: Backend đang gặp sự cố. Vui lòng:\n\n1. Refresh trang và thử lại\n2. Nếu vẫn lỗi, vui lòng liên hệ admin để kiểm tra backend logs\n3. Hoặc thử đăng nhập bằng email/password thay vì Google');
                                    }
                                }
                            }
                        }
                    } else if (error?.response?.status === 500 && isOAuthLogin) {
                        // Nếu không retry được nhưng đang OAuth login, log warning
                    }
                }

                // Xóa flag OAuth login nếu có lỗi
                if (isOAuthLogin) {
                    sessionStorage.removeItem('oauthLoginInProgress');
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // THAY ĐỔI 3: Hàm login bây giờ sẽ truyền cả object data vào hàm success (bao gồm role)
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await loginUser({ email, password });
            // Lấy toàn bộ object data từ response API (bao gồm role)
            const loginData = response.data.data;

            // Kiểm tra và xử lý redirect dựa trên role
            // Nếu đã redirect (admin/partner), return ngay
            const hasRedirected = processEmailLoginSuccess(loginData);
            closeModal();

            // Chỉ redirect về trang chủ nếu là USER (chưa redirect) VÀ không đang ở trang booking
            if (!hasRedirected) {
                // Lấy URL hiện tại
                const currentPath = window.location.pathname;

                // Nếu đang ở trang booking, giữ lại trang đó (không redirect)
                if (currentPath.startsWith('/booking')) {
                    // Không redirect, chỉ cập nhật state
                } else {
                    // Các trang khác, redirect về trang chủ
                    router.push('/');
                }
            }
        } catch (error: any) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm logout - xử lý cả email login và OAuth
    const logout = async () => {
        const accessToken = localStorage.getItem('accessToken');
        let tokenToSend = accessToken;

        // Nếu không có token trong localStorage, có thể là OAuth - thử lấy từ cookie
        if (!accessToken) {
            try {
                const meResponse = await getMyProfile();
                const meData = meResponse.data.data;

                if (meData && meData.accessToken) {
                    tokenToSend = meData.accessToken;
                }
            } catch (error: any) {
                // Silent fail - có thể không có session
            }
        }

        try {
            if (tokenToSend) {
                await logoutUser({ token: tokenToSend });
            }
        } catch (error: any) {
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');

            // QUAN TRỌNG: Set flag để không tự động login lại từ JSESSIONID session
            sessionStorage.setItem('justLoggedOut', 'true');
            sessionStorage.setItem('skipOAuthCheck', 'true');
            sessionStorage.setItem('lastLogoutTime', Date.now().toString());

            setUser(null);
            setIsLoggedIn(false);

            setTimeout(() => {
                // Sử dụng window.location.replace để không lưu vào history
                // Và reload để đảm bảo JSESSIONID được xóa
                window.location.replace('/');
            }, 100);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, isLoading, isModalOpen, openModal, closeModal, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) { throw new Error('useAuth must be used within an AuthProvider'); }
    return context;
};