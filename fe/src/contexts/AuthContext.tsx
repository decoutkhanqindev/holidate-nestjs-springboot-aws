// contexts/AuthContext.tsx 

'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser, logoutUser, getMyProfile } from '@/service/authService';

// Interfaces
interface User { id?: string; fullName: string; email: string; role?: string; score?: number; }
interface JwtPayload { sub: string; fullName: string; role?: string; id?: string; exp?: number; }
interface AuthContextType { isLoggedIn: boolean; user: User | null; isLoading: boolean; isModalOpen: boolean; openModal: () => void; closeModal: () => void; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void>; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // dành cho login bằng email
    const processEmailLoginSuccess = (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        const decodedToken = jwtDecode<JwtPayload>(accessToken);
        const userData: User = {
            fullName: decodedToken.fullName,
            email: decodedToken.sub,
        };
        setUser(userData);
        setIsLoggedIn(true);
        console.log("✅ [Email Login] Đăng nhập thành công, user state đã được cập nhật:", userData);
    };

    useEffect(() => {
        const initializeAuth = async () => {
            //Kiểm tra token từ localStorage ( Email Login)
            const tokenFromStorage = localStorage.getItem('accessToken');

            if (tokenFromStorage) {
                try {
                    console.log(" [Session Restore] Phát hiện token trong localStorage. Đang khôi phục...");
                    const decodedToken = jwtDecode<JwtPayload>(tokenFromStorage);
                    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                        console.warn("[Session Restore] Token trong localStorage đã hết hạn.");
                        logout(); // Dọn  token cũ
                    } else {
                        const userData: User = {
                            fullName: decodedToken.fullName,
                            email: decodedToken.sub,
                        };
                        setUser(userData);
                        setIsLoggedIn(true);
                        console.log("[Session Restore] Khôi phục phiên từ localStorage thành công.");
                    }
                } catch (error) {
                    console.error(" [Session Restore] Token trong localStorage không hợp lệ.", error);
                    logout();
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            try {
                const response = await getMyProfile();
                const userData: User = response.data.data;
                setUser(userData);
                setIsLoggedIn(true);
                console.log(" [Session Restore] Khôi phục phiên từ server (cookie) thành công.");
            } catch (error) {
                console.log("ℹ [Session Restore] Không có phiên đăng nhập hợp lệ từ server.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Logic login bằng email không đổi
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await loginUser({ email, password });
            const { accessToken, refreshToken } = response.data.data;
            processEmailLoginSuccess(accessToken, refreshToken);
            closeModal();
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutUser({});
        } catch (error) { console.error("Lỗi khi đăng xuất trên server:", error); }
        finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Xóa cookie token (Google login)
            document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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