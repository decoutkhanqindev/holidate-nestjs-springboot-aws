// File layout tổng - chỉ để xác thực
import { AuthProvider as AdminAuthProvider } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import { ReactNode } from "react";

export default function AdminAreaLayout({ children }: { children: ReactNode }) {
    // File này chỉ cần bọc AuthProvider và render ra các layout/page con.
    return (
        <AdminAuthProvider>
            {children}
        </AdminAuthProvider>
    );
}