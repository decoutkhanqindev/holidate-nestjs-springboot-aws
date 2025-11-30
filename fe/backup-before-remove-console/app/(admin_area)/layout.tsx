// File layout tổng - chỉ để xác thực
import { AuthProvider as AdminAuthProvider } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import { ReactNode } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminAreaLayout({ children }: { children: ReactNode }) {
    // File này chỉ cần bọc AuthProvider và render ra các layout/page con.
    return (
        <AdminAuthProvider>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </AdminAuthProvider>
    );
}