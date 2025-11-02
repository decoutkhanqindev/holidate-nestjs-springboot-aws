"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    email: string;
    role: 'SUPER_ADMIN' | 'HOTEL_ADMIN';
    hotelId?: string;
    hotelName?: string;
};

interface AuthContextType {
    user: User | null;
    impersonatedUser: User | null;
    effectiveUser: User | null;
    login: (userData: User) => void;
    logout: () => void;
    startImpersonation: (hotel: { id: string, name: string }) => void;
    stopImpersonation: () => void;
    isLoading: boolean;
}

const AuthContextAdmin = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('adminUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            const storedImpersonatedUser = localStorage.getItem('impersonatedUser');
            if (storedImpersonatedUser) {
                setImpersonatedUser(JSON.parse(storedImpersonatedUser));
            }
        } catch (error) {
            console.error("Lỗi khi đọc dữ liệu từ localStorage", error);
            localStorage.clear();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (userData: User) => {
        localStorage.setItem('adminUser', JSON.stringify(userData));
        setUser(userData);

        if (userData.role === 'SUPER_ADMIN') {
            router.push('/super-admin');
        } else {
            router.push('/admin-dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('impersonatedUser');
        setUser(null);
        setImpersonatedUser(null);
        router.push('/admin-login');
    };

    const startImpersonation = (hotel: { id: string, name: string }) => {
        if (user?.role === 'SUPER_ADMIN') {
            const hotelAdminView: User = {
                email: `super_admin_viewing_${hotel.id}`,
                role: 'HOTEL_ADMIN',
                hotelId: hotel.id,
                hotelName: hotel.name,
            };
            localStorage.setItem('impersonatedUser', JSON.stringify(hotelAdminView));
            setImpersonatedUser(hotelAdminView);
            router.push('/admin-dashboard');
        }
    };

    const stopImpersonation = () => {
        localStorage.removeItem('impersonatedUser');
        setImpersonatedUser(null);
        router.push('/super-hotels');
    };

    const effectiveUser = impersonatedUser || user;

    const value = { user, impersonatedUser, effectiveUser, login, logout, startImpersonation, stopImpersonation, isLoading };

    return (
        <AuthContextAdmin.Provider value={value}>
            {children}
        </AuthContextAdmin.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContextAdmin);
    if (context === undefined) {
        throw new Error('useAuth phải được sử dụng trong một AuthProvider');
    }
    return context;
}