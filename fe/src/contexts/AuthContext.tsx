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
        console.log("✅ [Login] Đăng nhập thành công (USER role), user state đã được cập nhật từ data:", userData);
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
        console.log("✅ [Login] Đăng nhập thành công, user state đã được cập nhật:", userData);
        return false;
    };

    useEffect(() => {
        const initializeAuth = async () => {
            // QUAN TRỌNG: Kiểm tra flag logout trước - nếu vừa logout, không tự động login lại
            const justLoggedOut = sessionStorage.getItem('justLoggedOut');
            if (justLoggedOut === 'true') {
                console.log("[Client AuthContext] ⚠️ Vừa logout, không tự động khôi phục session");
                sessionStorage.removeItem('justLoggedOut');
                setIsLoading(false);
                return; // Không kiểm tra session nữa
            }

            // BƯỚC 1: Kiểm tra localStorage-based session (email login) TRƯỚC
            const tokenFromStorage = localStorage.getItem('accessToken');
            const userIdFromStorage = localStorage.getItem('userId');

            if (tokenFromStorage && userIdFromStorage) {
                try {
                    console.log("[Client AuthContext] Phát hiện token và userId. Đang kiểm tra...");
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
                            console.log("[Client AuthContext] Khôi phục phiên USER thành công.", userData);

                            // Load avatarUrl từ profile
                            getUserProfile(userIdFromStorage).then(profile => {
                                console.log("[Client AuthContext] Profile loaded on init:", profile);
                                setUser(prevUser => ({
                                    ...prevUser!,
                                    avatarUrl: profile.avatarUrl,
                                }));
                            }).catch(err => {
                                console.warn("[Client AuthContext] Could not load profile on init:", err);
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
                console.log("[Client AuthContext] ⚠️ Flag skipOAuthCheck được set, bỏ qua kiểm tra OAuth cookie");
                console.log("[Client AuthContext] ⚠️ Đây là reload sau logout - không tự động login lại từ JSESSIONID");
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
                    console.log("[Client AuthContext] ⚠️ Vừa logout", Math.floor(timeSinceLogout / 1000), "giây trước");
                    console.log("[Client AuthContext] ⚠️ Không tự động login lại từ JSESSIONID session");
                    sessionStorage.removeItem('lastLogoutTime');
                    setIsLoading(false);
                    return;
                } else {
                    // Xóa timestamp cũ nếu đã quá 5 giây
                    sessionStorage.removeItem('lastLogoutTime');
                }
            }

            try {
                console.log("[Client AuthContext] Không có token trong localStorage, kiểm tra OAuth cookie...");
                console.log("[Client AuthContext] ⚠️ LƯU Ý: Nếu vừa logout, JSESSIONID có thể vẫn còn nhưng không nên dùng");
                console.log("[Client AuthContext] Đang gọi /auth/me để lấy token từ cookie...");
                const meResponse = await getMyProfile();
                console.log("[Client AuthContext] /auth/me response:", meResponse);
                const meData = meResponse.data.data;
                console.log("[Client AuthContext] meData:", meData);

                if (meData && meData.id && meData.accessToken) {
                    // QUAN TRỌNG: Kiểm tra xem token có bị invalidate không
                    // Nếu token đã bị invalidate, không nên tự động login lại
                    console.log("[Client AuthContext] ✅ Phát hiện cookie-based session từ OAuth");
                    console.log("[Client AuthContext] ⚠️ LƯU Ý: Kiểm tra xem đây có phải session cũ sau logout không");

                    // QUAN TRỌNG: Kiểm tra xem token này có bị invalidate không
                    // Bằng cách thử decode và kiểm tra xem có thể dùng được không
                    try {
                        const decodedToken = jwtDecode<any>(meData.accessToken);
                        console.log("[Client AuthContext] - Token decode thành công:", decodedToken);

                        // Kiểm tra token có hết hạn không
                        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                            console.warn("[Client AuthContext] ⚠️ Token từ cookie đã hết hạn, không tự động login lại");
                            setIsLoading(false);
                            return;
                        }

                        console.log("[Client AuthContext] - User ID:", meData.id);
                        console.log("[Client AuthContext] - Email:", meData.email);
                        console.log("[Client AuthContext] - AccessToken length:", meData.accessToken.length);
                        console.log("[Client AuthContext] - AccessToken preview:", meData.accessToken.substring(0, 50) + "...");

                        console.log("[Client AuthContext] Đang lưu token vào localStorage...");
                        localStorage.setItem('accessToken', meData.accessToken);
                        console.log("[Client AuthContext] ✅ Đã lưu accessToken vào localStorage");

                        if (meData.refreshToken) {
                            localStorage.setItem('refreshToken', meData.refreshToken);
                            console.log("[Client AuthContext] ✅ Đã lưu refreshToken vào localStorage");
                        }
                        localStorage.setItem('userId', meData.id);
                        console.log("[Client AuthContext] ✅ Đã lưu userId vào localStorage");

                        // Verify token đã được lưu
                        const savedToken = localStorage.getItem('accessToken');
                        console.log("[Client AuthContext] ✅ Verify: Token trong localStorage sau khi lưu:", savedToken ? `CÓ (${savedToken.substring(0, 20)}...)` : "KHÔNG CÓ - LỖI!");
                        if (!savedToken || savedToken !== meData.accessToken) {
                            console.error("[Client AuthContext] ❌ LỖI: Token không được lưu đúng vào localStorage!");
                        }

                        const hasRedirected = processTokenResponse({
                            id: meData.id,
                            email: meData.email,
                            fullName: meData.fullName,
                            role: meData.role,
                            accessToken: meData.accessToken,
                            refreshToken: meData.refreshToken || '',
                        });

                        // Load avatarUrl từ profile
                        setTimeout(() => {
                            getUserProfile(meData.id).then(profile => {
                                console.log("[Client AuthContext] Profile loaded from OAuth:", profile);
                                setUser(prevUser => ({
                                    ...prevUser!,
                                    avatarUrl: profile.avatarUrl,
                                }));
                            }).catch(err => {
                                console.warn("[Client AuthContext] Could not load profile from OAuth:", err);
                            });
                        }, 50);

                        setIsLoading(false);
                        return;
                    } catch (decodeError: any) {
                        console.error("[Client AuthContext] ❌ Token từ cookie không hợp lệ:", decodeError);
                        console.error("[Client AuthContext] ⚠️ Không tự động login lại từ session cũ");
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error: any) {
                console.log("[Client AuthContext] Không có cookie-based session (OAuth) hoặc lỗi:", error);
                // Nếu lỗi 401, có nghĩa là session đã hết hạn hoặc không hợp lệ
                if (error?.response?.status === 401) {
                    console.log("[Client AuthContext] ⚠️ /auth/me trả về 401 - session không hợp lệ, không tự động login lại");
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

            // Chỉ redirect về trang chủ nếu là USER (chưa redirect)
            if (!hasRedirected) {
                router.push('/');
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
        console.log("===========================================");
        console.log("🔴 [LOGOUT] BẮT ĐẦU QUÁ TRÌNH LOGOUT");
        console.log("===========================================");

        const accessToken = localStorage.getItem('accessToken');
        console.log("[LOGOUT] Step 1: Kiểm tra token trong localStorage");
        console.log("[LOGOUT] - accessToken có trong localStorage:", accessToken ? `CÓ (${accessToken.substring(0, 20)}...)` : "KHÔNG CÓ");

        let tokenToSend = accessToken;

        // Nếu không có token trong localStorage, có thể là OAuth - thử lấy từ cookie
        if (!accessToken) {
            console.log("[LOGOUT] Step 2: Không có token trong localStorage, có thể là OAuth session");
            console.log("[LOGOUT] - Đang gọi /auth/me để lấy token từ cookie...");
            try {
                const meResponse = await getMyProfile();
                console.log("[LOGOUT] - ✅ /auth/me thành công, response:", meResponse);
                const meData = meResponse.data.data;
                console.log("[LOGOUT] - meData:", meData);

                if (meData && meData.accessToken) {
                    tokenToSend = meData.accessToken;
                    console.log("[LOGOUT] - ✅ Đã lấy token từ cookie:", meData.accessToken.substring(0, 20) + "...");
                } else {
                    console.warn("[LOGOUT] - ⚠️ meData không có accessToken:", meData);
                }
            } catch (error: any) {
                console.error("[LOGOUT] - ❌ Lỗi khi gọi /auth/me:", error);
                console.error("[LOGOUT] - Error response:", error?.response);
                console.error("[LOGOUT] - Error status:", error?.response?.status);
                console.error("[LOGOUT] - Error data:", error?.response?.data);
            }
        } else {
            console.log("[LOGOUT] Step 2: Có token trong localStorage, đây là email login");
        }

        console.log("[LOGOUT] Step 3: Chuẩn bị gửi request logout đến backend");
        console.log("[LOGOUT] - tokenToSend:", tokenToSend ? `CÓ (${tokenToSend.substring(0, 20)}...)` : "KHÔNG CÓ");

        try {
            if (tokenToSend) {
                console.log("[LOGOUT] - Đang gửi request POST /auth/logout với token...");
                const logoutResponse = await logoutUser({ token: tokenToSend });
                console.log("[LOGOUT] - ✅ Response từ backend:", logoutResponse);
                console.log("[LOGOUT] - ✅ Response data:", logoutResponse.data);
                console.log("[LOGOUT] - ✅ Backend đã xử lý logout thành công");
            } else {
                console.warn("[LOGOUT] - ⚠️ Không có token để gửi cho backend");
                console.warn("[LOGOUT] - ⚠️ Chỉ xóa session cục bộ, không gọi backend");
            }
        } catch (error: any) {
            console.error("===========================================");
            console.error("❌ [LOGOUT] LỖI KHI GỬI REQUEST ĐẾN BACKEND");
            console.error("===========================================");
            console.error("[LOGOUT] Error object:", error);
            console.error("[LOGOUT] Error message:", error?.message);
            console.error("[LOGOUT] Error response:", error?.response);
            console.error("[LOGOUT] Error status:", error?.response?.status);
            console.error("[LOGOUT] Error statusText:", error?.response?.statusText);
            console.error("[LOGOUT] Error data:", error?.response?.data);
            console.error("[LOGOUT] Error headers:", error?.response?.headers);
            console.error("===========================================");
        } finally {
            console.log("[LOGOUT] Step 4: Xóa dữ liệu session cục bộ");
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            console.log("[LOGOUT] - ✅ Đã xóa accessToken, refreshToken, userId từ localStorage");

            // QUAN TRỌNG: Set flag để không tự động login lại từ JSESSIONID session
            sessionStorage.setItem('justLoggedOut', 'true');
            sessionStorage.setItem('skipOAuthCheck', 'true'); // Thêm flag này để skip OAuth check
            sessionStorage.setItem('lastLogoutTime', Date.now().toString()); // Lưu timestamp logout
            console.log("[LOGOUT] - ✅ Đã set flag 'justLoggedOut', 'skipOAuthCheck' và 'lastLogoutTime' để tránh tự động login lại");

            console.log("[LOGOUT] Step 5: Reset state");
            setUser(null);
            setIsLoggedIn(false);
            console.log("[LOGOUT] - ✅ Đã reset user state và isLoggedIn");

            console.log("[LOGOUT] Step 6: Redirect về trang chủ và reload để xóa JSESSIONID");
            setTimeout(() => {
                console.log("[LOGOUT] - Đang redirect về trang chủ và reload...");
                // Sử dụng window.location.replace để không lưu vào history
                // Và reload để đảm bảo JSESSIONID được xóa
                window.location.replace('/');
            }, 100);

            console.log("===========================================");
            console.log("✅ [LOGOUT] QUÁ TRÌNH LOGOUT HOÀN TẤT");
            console.log("===========================================");
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