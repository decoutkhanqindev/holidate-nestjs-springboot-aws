// contexts/AuthContext.tsx 

'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser, logoutUser, getMyProfile } from '@/service/authService';

// Interfaces
interface User { id?: string; fullName: string; email: string; role?: string; score?: number; phone?: string; }
interface JwtPayload { sub: string; fullName: string; role?: string; id?: string; exp?: number; }
interface AuthContextType { isLoggedIn: boolean; user: User | null; isLoading: boolean; isModalOpen: boolean; openModal: () => void; closeModal: () => void; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // THAY ĐỔI 1: Hàm này giờ sẽ nhận toàn bộ object data từ API login
    const processEmailLoginSuccess = (loginData: { id: string; email: string; fullName: string; accessToken: string; refreshToken: string; }) => {
        // Lưu token vào localStorage
        localStorage.setItem('accessToken', loginData.accessToken);
        localStorage.setItem('refreshToken', loginData.refreshToken);

        // LƯU Ý QUAN TRỌNG: Lưu ID người dùng riêng ra localStorage
        localStorage.setItem('userId', loginData.id);

        // Tạo user state từ data nhận được
        const userData: User = {
            id: loginData.id,
            fullName: loginData.fullName,
            email: loginData.email,
        };
        setUser(userData);
        setIsLoggedIn(true);
        console.log("✅ [Login] Đăng nhập thành công, user state đã được cập nhật từ data:", userData);
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const tokenFromStorage = localStorage.getItem('accessToken');

            // THAY ĐỔI 2: Đọc cả ID người dùng từ localStorage
            const userIdFromStorage = localStorage.getItem('userId');

            // Chỉ khôi phục phiên nếu CÓ CẢ token VÀ userId
            if (tokenFromStorage && userIdFromStorage) {
                try {
                    console.log(" [Session Restore] Phát hiện token và userId. Đang khôi phục...");
                    const decodedToken = jwtDecode<JwtPayload>(tokenFromStorage);
                    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                        console.warn("[Session Restore] Token đã hết hạn.");
                        logout();
                    } else {
                        // Tạo lại user data từ 2 nguồn: userId từ storage và thông tin còn lại từ token
                        const userData: User = {
                            id: userIdFromStorage,
                            fullName: decodedToken.fullName,
                            email: decodedToken.sub,
                        };
                        setUser(userData);
                        setIsLoggedIn(true);
                        console.log("[Session Restore] Khôi phục phiên thành công (giải pháp tạm thời).", userData);
                    }
                } catch (error) {
                    console.error(" [Session Restore] Token không hợp lệ.", error);
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

    // THAY ĐỔI 3: Hàm login bây giờ sẽ truyền cả object data vào hàm success
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await loginUser({ email, password });
            // Lấy toàn bộ object data từ response API
            const loginData = response.data.data;
            processEmailLoginSuccess(loginData);
            closeModal();
        } catch (error) {
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