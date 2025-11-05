// contexts/AuthContext.tsx 

'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { loginUser, logoutUser } from '@/service/authService';
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
    refreshUserProfile: () => Promise<void>; // Hàm để refresh user profile (sau khi update avatar)
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

    useEffect(() => {
        const initializeAuth = async () => {
            const tokenFromStorage = localStorage.getItem('accessToken');

            // THAY ĐỔI 2: Đọc cả ID người dùng từ localStorage
            const userIdFromStorage = localStorage.getItem('userId');

            // Chỉ khôi phục phiên nếu CÓ CẢ token VÀ userId
            if (tokenFromStorage && userIdFromStorage) {
                try {
                    console.log("[Client AuthContext] Phát hiện token và userId. Đang kiểm tra...");
                    const decodedToken = jwtDecode<JwtPayload>(tokenFromStorage);

                    // QUAN TRỌNG: Kiểm tra role từ token - CHỈ khôi phục nếu là USER
                    const tokenRole = decodedToken.role?.toLowerCase();

                    // Nếu role là admin hoặc partner, đây là session của admin/partner
                    // Client context KHÔNG nên khôi phục session này
                    if (tokenRole === 'admin' || tokenRole === 'partner') {
                        console.warn("[Client AuthContext] Phát hiện token của Admin/Partner. Không khôi phục session cho client context.");
                        // Xóa token và userId để tránh conflict
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        setIsLoading(false);
                        return;
                    }

                    // Kiểm tra token hết hạn
                    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                        console.warn("[Client AuthContext] Token đã hết hạn.");
                        logout();
                    } else {
                        // Chỉ khôi phục nếu role là USER (hoặc không có role - mặc định là user)
                        if (!tokenRole || tokenRole === 'user') {
                            // Tạo lại user data từ 2 nguồn: userId từ storage và thông tin còn lại từ token
                            const userData: User = {
                                id: userIdFromStorage,
                                fullName: decodedToken.fullName,
                                email: decodedToken.sub,
                                role: tokenRole || 'user',
                            };
                            setUser(userData);
                            setIsLoggedIn(true);
                            console.log("[Client AuthContext] Khôi phục phiên USER thành công.", userData);
                            
                            // Load avatarUrl từ profile sau khi đã set user cơ bản
                            // (không await để không block UI)
                            getUserProfile(userIdFromStorage).then(profile => {
                                console.log("[Client AuthContext] Profile loaded on init:", profile);
                                setUser(prevUser => ({
                                    ...prevUser!,
                                    avatarUrl: profile.avatarUrl,
                                    score: profile.score ?? prevUser?.score,
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

            // Nếu không có đủ thông tin, coi như chưa đăng nhập
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Hàm để refresh user profile (gọi sau khi update avatar)
    const refreshUserProfile = async () => {
        const currentUserId = user?.id || localStorage.getItem('userId');
        if (!currentUserId) {
            console.warn("[AuthContext] Cannot refresh profile: no user ID");
            return;
        }
        try {
            console.log("[AuthContext] Refreshing user profile for ID:", currentUserId);
            // Dùng getUserProfile để lấy đầy đủ thông tin bao gồm avatarUrl
            const profile = await getUserProfile(currentUserId);
            console.log("[AuthContext] Profile data received:", profile);
            setUser(prevUser => {
                const updatedUser = {
                    ...prevUser!,
                    id: profile.id || prevUser?.id || currentUserId,
                    fullName: profile.fullName || prevUser?.fullName || '',
                    email: profile.email || prevUser?.email || '',
                    avatarUrl: profile.avatarUrl || undefined, // Set undefined nếu không có (không phải null)
                    score: profile.score ?? prevUser?.score,
                    role: profile.role || prevUser?.role,
                };
                console.log("[AuthContext] ✅ User state updated:", updatedUser);
                console.log("[AuthContext] ✅ avatarUrl value:", updatedUser.avatarUrl);
                console.log("[AuthContext] ✅ avatarUrl type:", typeof updatedUser.avatarUrl);
                return updatedUser;
            });
        } catch (error) {
            console.error("[AuthContext] Error refreshing user profile:", error);
        }
    };

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

    // THAY ĐỔI 4: Hàm logout phải xóa cả userId
    const logout = async () => {
        try { await logoutUser({}); } catch (error) { console.error("Lỗi khi đăng xuất trên server:", error); }
        finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId'); // <<--- XÓA CẢ userId KHI LOGOUT
            setUser(null);
            setIsLoggedIn(false);
            window.location.reload();
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, isLoading, isModalOpen, openModal, closeModal, login, logout, refreshUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) { throw new Error('useAuth must be used within an AuthProvider'); }
    return context;
};