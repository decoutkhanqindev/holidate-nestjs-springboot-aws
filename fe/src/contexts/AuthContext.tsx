// File: contexts/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Định nghĩa kiểu dữ liệu cho người dùng (đơn giản)
interface User {
    name: string;
    points: number;
}

// Định nghĩa kiểu dữ liệu cho Context
interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    login: (userData: User) => void;
    logout: () => void;
}

// Tạo Context với giá trị mặc định
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const login = (userData: User) => {
        setUser(userData);
        setIsLoggedIn(true);
        closeModal(); // Tự động đóng modal sau khi đăng nhập thành công
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, isModalOpen, openModal, closeModal, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Tạo custom hook để sử dụng Context dễ dàng hơn
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};