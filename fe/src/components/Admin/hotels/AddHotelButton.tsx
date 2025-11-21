"use client";

import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';

export default function AddHotelButton() {
    const { effectiveUser } = useAuth();
    
    // Chỉ hiển thị nút "Thêm khách sạn" nếu user là admin
    const isAdmin = effectiveUser?.role.name.toLowerCase() === 'admin';
    
    if (!isAdmin) {
        return null; // Partner không được thấy nút này
    }

    return (
        <Link
            href="/admin-hotels/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
            <PlusIcon className="h-5 w-5" />
            Thêm khách sạn
        </Link>
    );
}





































