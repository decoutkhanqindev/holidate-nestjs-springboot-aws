import { AuthProvider as AdminAuthProvider } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import AdminHeader from "@/components/Admin/layout/AdminHeader";
import { ReactNode } from "react";

export default function AdminAreaLayout({ children }: { children: ReactNode }) {
    return (
        // **Bọc tất cả mọi thứ của Admin bằng AuthProvider của Admin**
        <AdminAuthProvider>
            <div className="flex h-screen bg-gray-100 font-sans">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <AdminHeader />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminAuthProvider>
    );
}