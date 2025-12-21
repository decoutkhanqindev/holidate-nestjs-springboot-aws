'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { loginUser, logoutUser, getMyProfile, refreshToken } from '@/service/authService';
import { getUserProfile } from '@/lib/client/userService';
import { isTokenExpiringSoon, isRefreshTokenExpired, isRefreshTokenValid, isTokenValid } from '@/lib/utils';
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
    const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    const processEmailLoginSuccess = (loginData: {
        id: string;
        email: string;
        fullName: string;
        role?: { id: string; name: string; description?: string; };
        accessToken: string;
        refreshToken: string;
    }): boolean => {
        const roleName = loginData.role?.name?.toLowerCase();

        if (roleName === 'admin' || roleName === 'partner') {
            localStorage.setItem('accessToken', loginData.accessToken);
            localStorage.setItem('refreshToken', loginData.refreshToken);
            router.push('/admin-login?message=admin_redirect');
            return true;
        }

        if (roleName && roleName !== 'user') {
            throw new Error('Vui lòng đăng nhập qua trang quản trị dành cho ' + roleName);
        }

        localStorage.setItem('accessToken', loginData.accessToken);
        localStorage.setItem('refreshToken', loginData.refreshToken);
        localStorage.setItem('userId', loginData.id);

        const userData: User = {
            id: loginData.id,
            fullName: loginData.fullName,
            email: loginData.email,
            role: loginData.role || 'user',
        };
        setUser(userData);
        setIsLoggedIn(true);
        return false;
    };

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
            const oauthLoginInProgress = sessionStorage.getItem('oauthLoginInProgress');
            const isOAuthLogin = oauthLoginInProgress === 'true';

            if (isOAuthLogin) {
                sessionStorage.removeItem('skipOAuthCheck');
                sessionStorage.removeItem('justLoggedOut');
                sessionStorage.removeItem('lastLogoutTime');
            }

            const justLoggedOut = sessionStorage.getItem('justLoggedOut');
            if (justLoggedOut === 'true' && !isOAuthLogin) {
                sessionStorage.removeItem('justLoggedOut');
                setIsLoading(false);
                return;
            }

            const tokenFromStorage = localStorage.getItem('accessToken');
            const userIdFromStorage = localStorage.getItem('userId');

            if (!isOAuthLogin && tokenFromStorage && userIdFromStorage) {
                try {
                    const decodedToken = jwtDecode<JwtPayload>(tokenFromStorage);
                    const tokenRole = decodedToken.role?.toLowerCase();
                    const isTokenExpired = decodedToken.exp && decodedToken.exp * 1000 < Date.now();

                    if (isTokenExpired) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                    } else if (tokenRole === 'admin' || tokenRole === 'partner') {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        setIsLoading(false);
                        return;
                    } else if (!tokenRole || tokenRole === 'user') {
                        const userData: User = {
                            id: userIdFromStorage,
                            fullName: decodedToken.fullName,
                            email: decodedToken.sub,
                            role: tokenRole || 'user',
                        };
                        setUser(userData);
                        setIsLoggedIn(true);

                        getUserProfile(userIdFromStorage).then(profile => {
                            setUser(prevUser => ({
                                ...prevUser!,
                                avatarUrl: profile.avatarUrl,
                            }));
                        }).catch(() => { });

                        setIsLoading(false);
                        return;
                    } else {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                    }
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userId');
                }
            }
            let shouldCheckOAuthCookie = false;
            if (isOAuthLogin) {
                shouldCheckOAuthCookie = true;
            } else {
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

            if (!shouldCheckOAuthCookie) {
                setIsLoading(false);
                return;
            }

            const skipOAuthCheck = sessionStorage.getItem('skipOAuthCheck');
            if (skipOAuthCheck === 'true' && !isOAuthLogin) {
                sessionStorage.removeItem('skipOAuthCheck');
                setIsLoading(false);
                return;
            }

            const lastLogoutTime = sessionStorage.getItem('lastLogoutTime');
            if (lastLogoutTime && !isOAuthLogin) {
                const timeSinceLogout = Date.now() - parseInt(lastLogoutTime);
                const fiveSeconds = 5 * 1000;
                if (timeSinceLogout < fiveSeconds) {
                    sessionStorage.removeItem('lastLogoutTime');
                    setIsLoading(false);
                    return;
                } else {
                    sessionStorage.removeItem('lastLogoutTime');
                }
            }

            try {

                if (isOAuthLogin) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } else {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                const meResponse = await getMyProfile();
                const meData = meResponse.data.data;

                if (meData && meData.id && meData.accessToken) {
                    try {
                        const decodedToken = jwtDecode<any>(meData.accessToken);

                        if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
                            setIsLoading(false);
                            return;
                        }

                        localStorage.setItem('accessToken', meData.accessToken);

                        if (meData.refreshToken) {
                            localStorage.setItem('refreshToken', meData.refreshToken);
                        }
                        localStorage.setItem('userId', meData.id);

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

                        const oauthReturnUrl = sessionStorage.getItem('oauthReturnUrl');
                        if (oauthReturnUrl && !hasRedirected) {
                            sessionStorage.removeItem('oauthReturnUrl');
                            router.push(oauthReturnUrl);
                            setIsLoading(false);
                            return;
                        }

                        setTimeout(() => {
                            getUserProfile(meData.id).then(profile => {
                                setUser(prevUser => ({
                                    ...prevUser!,
                                    avatarUrl: profile.avatarUrl,
                                }));
                            }).catch(() => { });
                        }, 50);

                        setIsLoading(false);
                        return;
                    } catch (decodeError: any) {
                        if (isOAuthLogin) {
                            sessionStorage.removeItem('oauthLoginInProgress');
                        }
                        setIsLoading(false);
                        return;
                    }
                } else {
                    if (isOAuthLogin) {
                        sessionStorage.removeItem('oauthLoginInProgress');
                    }
                }
            } catch (error: any) {
                if (error?.response?.status === 401) {
                } else if (error?.response?.status === 500) {
                    const hasValidTokenInStorage = tokenFromStorage && userIdFromStorage;
                    let shouldRetryOAuth = false;

                    if (hasValidTokenInStorage) {
                        try {
                            const decodedToken = jwtDecode<JwtPayload>(tokenFromStorage);
                            if (decodedToken.exp && decodedToken.exp * 1000 >= Date.now()) {
                                shouldRetryOAuth = false;
                                if (isOAuthLogin) {
                                    sessionStorage.removeItem('oauthLoginInProgress');
                                }
                            } else {
                                shouldRetryOAuth = isOAuthLogin;
                            }
                        } catch {
                            shouldRetryOAuth = isOAuthLogin;
                        }
                    } else {
                        shouldRetryOAuth = isOAuthLogin;
                    }

                    if (shouldRetryOAuth && isOAuthLogin) {
                        let retryAttempts = 5;
                        let retryDelay = 3000;

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

                                    localStorage.setItem('accessToken', retryData.accessToken);
                                    if (retryData.refreshToken) {
                                        localStorage.setItem('refreshToken', retryData.refreshToken);
                                    }
                                    localStorage.setItem('userId', retryData.id);

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
                                    return;
                                }
                            } catch (retryError: any) {
                                const errorStatus = retryError?.response?.status;
                                if (errorStatus !== 500 && errorStatus !== undefined) {
                                    break;
                                }

                                if (attempt < retryAttempts) {
                                    retryDelay = Math.min(retryDelay * 1.3, 5000);
                                } else {
                                    if (typeof window !== 'undefined') {
                                        alert('⚠️ Lỗi đăng nhập: Backend đang gặp sự cố. Vui lòng:\n\n1. Refresh trang và thử lại\n2. Nếu vẫn lỗi, vui lòng liên hệ admin để kiểm tra backend logs\n3. Hoặc thử đăng nhập bằng email/password thay vì Google');
                                    }
                                }
                            }
                        }
                    }
                }

                if (isOAuthLogin) {
                    sessionStorage.removeItem('oauthLoginInProgress');
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const handleAutoRefreshToken = async () => {
        if (isRefreshingRef.current) {
            return;
        }

        const isOAuthLogin = typeof window !== 'undefined' && sessionStorage.getItem('oauthLoginInProgress') === 'true';
        if (isOAuthLogin) {
            return;
        }

        const accessToken = localStorage.getItem('accessToken');
        const refreshTokenString = localStorage.getItem('refreshToken');

        if (!accessToken || !isLoggedIn) {
            return;
        }

        if (refreshTokenString) {
            if (isRefreshTokenExpired(refreshTokenString)) {
                await logout();
                return;
            }

            if (!isRefreshTokenValid(refreshTokenString)) {
                await logout();
                return;
            }
        }

        if (isTokenExpiringSoon(accessToken, 5)) {
            if (!refreshTokenString) {
                try {
                    const meResponse = await getMyProfile();
                    const meData = meResponse.data.data;

                    if (meData && meData.refreshToken) {
                        localStorage.setItem('refreshToken', meData.refreshToken);
                        if (meData.accessToken) {
                            localStorage.setItem('accessToken', meData.accessToken);
                        }
                        if (meData.accessToken && isTokenValid(meData.accessToken) && !isTokenExpiringSoon(meData.accessToken, 5)) {
                            return;
                        }
                    } else {
                        return;
                    }
                } catch (error: any) {
                    if (error?.response?.status === 401) {
                        await logout();
                    }
                    return;
                }
            }

            isRefreshingRef.current = true;

            try {
                const currentRefreshToken = localStorage.getItem('refreshToken') || refreshTokenString;
                const response = await refreshToken(currentRefreshToken || undefined);
                const refreshData = response.data.data;

                if (refreshData && refreshData.accessToken && refreshData.refreshToken) {
                    localStorage.setItem('accessToken', refreshData.accessToken);
                    localStorage.setItem('refreshToken', refreshData.refreshToken);

                    if (refreshData.id && refreshData.fullName && refreshData.email) {
                        setUser(prevUser => ({
                            ...prevUser!,
                            id: refreshData.id,
                            fullName: refreshData.fullName,
                            email: refreshData.email,
                            role: refreshData.role || prevUser?.role || 'user',
                        }));
                    }
                }
            } catch (error: any) {
                const errorStatus = error?.response?.status;
                if (errorStatus === 401) {
                    const storedRefreshToken = localStorage.getItem('refreshToken');
                    if (storedRefreshToken && isRefreshTokenExpired(storedRefreshToken)) {
                        await logout();
                    } else if (!storedRefreshToken) {
                        await logout();
                    } else {
                        await logout();
                    }
                }
            } finally {
                isRefreshingRef.current = false;
            }
        }
    };

    useEffect(() => {
        if (!isLoggedIn || isLoading) {
            if (tokenRefreshIntervalRef.current) {
                clearInterval(tokenRefreshIntervalRef.current);
                tokenRefreshIntervalRef.current = null;
            }
            return;
        }

        const delayedCheck = setTimeout(() => {
            handleAutoRefreshToken();
        }, 5000);

        tokenRefreshIntervalRef.current = setInterval(() => {
            handleAutoRefreshToken();
        }, 60 * 1000);

        return () => {
            clearTimeout(delayedCheck);
            if (tokenRefreshIntervalRef.current) {
                clearInterval(tokenRefreshIntervalRef.current);
                tokenRefreshIntervalRef.current = null;
            }
        };
    }, [isLoggedIn, isLoading]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await loginUser({ email, password });
            const loginData = response.data.data;
            const hasRedirected = processEmailLoginSuccess(loginData);
            closeModal();

            if (!hasRedirected) {
                const currentPath = window.location.pathname;
                if (currentPath.startsWith('/booking')) {
                } else {
                    router.push('/');
                }
            }
        } catch (error: any) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        const accessToken = localStorage.getItem('accessToken');
        let tokenToSend = accessToken;

        if (!accessToken) {
            try {
                const meResponse = await getMyProfile();
                const meData = meResponse.data.data;
                if (meData && meData.accessToken) {
                    tokenToSend = meData.accessToken;
                }
            } catch (error: any) { }
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

            sessionStorage.setItem('justLoggedOut', 'true');
            sessionStorage.setItem('skipOAuthCheck', 'true');
            sessionStorage.setItem('lastLogoutTime', Date.now().toString());

            setUser(null);
            setIsLoggedIn(false);

            setTimeout(() => {
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