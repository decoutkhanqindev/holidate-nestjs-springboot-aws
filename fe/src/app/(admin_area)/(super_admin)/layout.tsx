"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import SuperAdminLayout from "@/components/AdminSuper/layout/SuperAdminLayout";

export default function Layout({ children }: { children: ReactNode }) {
    const { isLoading, effectiveUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!effectiveUser || effectiveUser.role !== 'SUPER_ADMIN') {
                router.push('/admin-login');
            }
        }
    }, [isLoading, effectiveUser, router]);

    if (isLoading || !effectiveUser || effectiveUser.role !== 'SUPER_ADMIN') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Đang tải và xác thực quyền...
            </div>
        );
    }

    // Nếu đúng quyền, chỉ cần gọi component layout và truyền children vào
    return <SuperAdminLayout>{children}</SuperAdminLayout>;
}