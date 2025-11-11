"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    email: string;
    fullName: string;
    role: {
        id: string;
        name: string;
        description: string;
    };
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

        // QUAN TRỌNG: Xóa userId khỏi localStorage nếu có (để tránh conflict với Client context)
        // Client context chỉ nên khôi phục session cho USER role
        localStorage.removeItem('userId');

        // Map role name sang frontend role
        const roleName = userData.role.name.toLowerCase();
        if (roleName === 'admin') {
            router.push('/super-admin');
        } else {
            router.push('/admin-dashboard');
        }
    };

    const logout = async () => {
        // Gọi API logout nếu cần
        try {
            const { logoutAdmin } = await import('@/lib/AdminAPI/adminAuthService');
            await logoutAdmin();
        } catch (error) {
            console.error('[AuthContext] Logout API error:', error);
        }

        localStorage.removeItem('adminUser');
        localStorage.removeItem('impersonatedUser');
        setUser(null);
        setImpersonatedUser(null);
        router.push('/admin-login');
    };

    const startImpersonation = (hotel: { id: string, name: string }) => {
        if (user && user.role.name.toLowerCase() === 'admin') {
            const hotelAdminView: User = {
                id: user.id,
                email: `super_admin_viewing_${hotel.id}`,
                fullName: user.fullName,
                role: {
                    id: user.role.id,
                    name: 'partner',
                    description: 'Impersonating hotel admin',
                },
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