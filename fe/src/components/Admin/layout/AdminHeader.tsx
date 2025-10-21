// src/components/admin/layout/AdminHeader.tsx

"use client";

export default function AdminHeader() {
    return (
        <header className="bg-white shadow-md p-4 flex justify-end items-center">
            <div>
                <span className="mr-4 text-blue-600 font-bold">Chào, Admin!</span>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    onClick={() => window.location.href = '/admin-login'}
                >
                    Đăng xuất
                </button>
            </div>
        </header>
    );
}