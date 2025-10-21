// "use client";
// import { ReactNode } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import AdminHeader from '@/components/Admin/layout/AdminHeader';
// import { AuthProvider, useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
// import AdminSidebar from '@/components/Admin/layout/AdminSidebar';
// import ImpersonationBanner from '@/components/Admin/ImpersonationBanner';

// function AdminLayoutContent({ children }: { children: ReactNode }) {
//     const { isLoading, effectiveUser } = useAuth();
//     const pathname = usePathname();
//     const router = useRouter();

//     // Nếu không phải hotel admin, chuyển về login
//     if (effectiveUser?.role !== 'HOTEL_ADMIN') {
//         router.push('/admin-login');
//         return null;
//     }

//     if (isLoading) {
//         return <div>Đang tải...</div>;
//     }

//     return (
//         <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
//             <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 250, zIndex: 100 }}>
//                 <AdminSidebar />
//             </div>
//             <div style={{ marginLeft: 250, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
//                 <div style={{ position: 'fixed', left: 250, right: 0, top: 0, zIndex: 101, width: 'calc(100% - 250px)' }}>
//                     <AdminHeader />
//                 </div>
//                 <main className="p-4 bg-light" style={{ marginTop: 70, height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
//                     <ImpersonationBanner />
//                     {children}
//                 </main>
//             </div>
//         </div>
//     );
// }

// export default function AdminLayout({ children }: { children: ReactNode }) {
//     return (
//         <AuthProvider>
//             <AdminLayoutContent>{children}</AdminLayoutContent>
//         </AuthProvider>
//     );
// }


// File: app/(admin_area)/(admin)/layout.tsx
"use client";
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import AdminHeader from '@/components/Admin/layout/AdminHeader';
import AdminSidebar from '@/components/Admin/layout/AdminSidebar';
import ImpersonationBanner from '@/components/Admin/ImpersonationBanner';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isLoading, effectiveUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!effectiveUser || effectiveUser.role !== 'HOTEL_ADMIN') {
                router.push('/admin-login');
            }
        }
    }, [isLoading, effectiveUser, router]);

    if (isLoading || !effectiveUser || effectiveUser.role !== 'HOTEL_ADMIN') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Đang tải và xác thực quyền...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
            <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 250, zIndex: 100 }}>
                <AdminSidebar />
            </div>
            <div style={{ marginLeft: 250, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div style={{ position: 'fixed', left: 250, right: 0, top: 0, zIndex: 101, width: 'calc(100% - 250px)' }}>
                    <AdminHeader />
                </div>
                <main className="p-4 bg-light" style={{ marginTop: 70, height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
                    <ImpersonationBanner />
                    {children}
                </main>
            </div>
        </div>
    );
}