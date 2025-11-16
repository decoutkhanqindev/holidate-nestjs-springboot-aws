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
            console.warn("⚠️ [Login] Admin/Partner đăng nhập qua trang client login. Redirect về trang admin...");
            // Lưu token tạm thời để admin context có thể sử dụng
            localStorage.setItem('accessToken', loginData.accessToken);
            localStorage.setItem('refreshToken', loginData.refreshToken);

            // Redirect về trang admin login với thông báo
            router.push('/admin-login?message=admin_redirect');
            return true; // Đã redirect, không cần xử lý tiếp
        }

        // Chỉ cho phép USER role đăng nhập qua trang client
        if (roleName && roleName !== 'user') {
            console.error("❌ [Login] Role không hợp lệ cho trang client login:", roleName);
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
            console.warn("⚠️ [Login] Admin/Partner đăng nhập. Redirect về trang admin...");
            localStorage.setItem('accessToken', tokenData.accessToken);
            localStorage.setItem('refreshToken', tokenData.refreshToken);
            router.push('/admin-login?message=admin_redirect');
            return true;
        }

        if (roleName && roleName !== 'user') {
            console.error("❌ [Login] Role không hợp lệ:", roleName);
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
            // QUAN TRỌNG: Kiểm tra flag logout trước - nếu vừa logout, không tự động login lại
            const justLoggedOut = sessionStorage.getItem('justLoggedOut');
            if (justLoggedOut === 'true') {
                sessionStorage.removeItem('justLoggedOut');
                setIsLoading(false);
                return; // Không kiểm tra session nữa
            }

            // BƯỚC 1: Kiểm tra localStorage-based session (email login) TRƯỚC
            const tokenFromStorage = localStorage.getItem('accessToken');
            const userIdFromStorage = localStorage.getItem('userId');

            if (tokenFromStorage && userIdFromStorage) {
                try {
                    const decodedToken = jwtDecode<JwtPayload>(tokenFromStorage);
                    const tokenRole = decodedToken.role?.toLowerCase();

                    if (tokenRole === 'admin' || tokenRole === 'partner') {
                        console.warn("[Client AuthContext] Phát hiện token của Admin/Partner. Không khôi phục session.");
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        setIsLoading(false);
                        return;
                    }

                    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                        console.warn("[Client AuthContext] Token đã hết hạn.");
                        logout();
                    } else {
                        if (!tokenRole || tokenRole === 'user') {
                            const userData: User = {
                                id: userIdFromStorage,
                                fullName: decodedToken.fullName,
                                email: decodedToken.sub,
                                role: tokenRole || 'user',
                            };
                            setUser(userData);
                            setIsLoggedIn(true);

                            // Load avatarUrl từ profile
                            getUserProfile(userIdFromStorage).then(profile => {
                                setUser(prevUser => ({
                                    ...prevUser!,
                                    avatarUrl: profile.avatarUrl,
                                }));
                            }).catch(() => {
                                // Silent fail - avatar sẽ load sau
                            });
                        } else {
                            console.warn("[Client AuthContext] Role không hợp lệ cho client:", tokenRole);
                            logout();
                        }
                    }
                } catch (error) {
                    console.error("[Client AuthContext] Token không hợp lệ.", error);
                    logout();
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            // BƯỚC 2: Kiểm tra cookie-based session (OAuth) nếu KHÔNG có token trong localStorage
            // QUAN TRỌNG: Chỉ kiểm tra OAuth cookie nếu KHÔNG có flag logout
            // Vì sau logout, JSESSIONID vẫn còn nhưng không nên tự động login lại
            // VÀ QUAN TRỌNG: Kiểm tra xem có flag "skipOAuthCheck" không (để tránh loop)
            const skipOAuthCheck = sessionStorage.getItem('skipOAuthCheck');
            if (skipOAuthCheck === 'true') {
                sessionStorage.removeItem('skipOAuthCheck');
                setIsLoading(false);
                return;
            }

            // QUAN TRỌNG: Kiểm tra xem có timestamp của lần logout gần nhất không
            // Nếu logout gần đây (trong vòng 5 giây), không tự động login lại
            const lastLogoutTime = sessionStorage.getItem('lastLogoutTime');
            if (lastLogoutTime) {
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

            try {
                const meResponse = await getMyProfile();
                const meData = meResponse.data.data;

                if (meData && meData.id && meData.accessToken) {
                    // QUAN TRỌNG: Kiểm tra xem token này có bị invalidate không
                    // Bằng cách thử decode và kiểm tra xem có thể dùng được không
                    try {
                        const decodedToken = jwtDecode<any>(meData.accessToken);

                        // Kiểm tra token có hết hạn không
                        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                            console.warn("[Client AuthContext] ⚠️ Token từ cookie đã hết hạn, không tự động login lại");
                            setIsLoading(false);
                            return;
                        }

                        localStorage.setItem('accessToken', meData.accessToken);

                        if (meData.refreshToken) {
                            localStorage.setItem('refreshToken', meData.refreshToken);
                        }
                        localStorage.setItem('userId', meData.id);

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

                        setIsLoading(false);
                        return;
                    } catch (decodeError: any) {
                        console.error("[Client AuthContext] Token từ cookie không hợp lệ:", decodeError);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error: any) {
                // Silent fail - không có session hoặc lỗi
                if (error?.response?.status === 401) {
                    // Session không hợp lệ - bình thường
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
            console.error("Lỗi đăng nhập:", error);
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
            console.error("[LOGOUT] Lỗi khi gửi request đến backend:", error);
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