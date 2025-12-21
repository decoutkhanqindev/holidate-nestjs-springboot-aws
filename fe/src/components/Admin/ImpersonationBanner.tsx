// trang xem nhanh
"use client";

import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";

export default function ImpersonationBanner() {
    const { impersonatedUser, stopImpersonation } = useAuth();

    if (!impersonatedUser) {
        return null;
    }

    return (
        <div className="bg-yellow-400 text-black text-center p-2 font-bold shadow-md sticky top-0 z-50">
            <span>
                Bạn đang xem với tư cách Admin của khách sạn "{impersonatedUser.hotelName}".
            </span>
            <button
                onClick={stopImpersonation}
                className="ml-4 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
            >
                Quay lại Super Admin
            </button>
        </div>
    );
}