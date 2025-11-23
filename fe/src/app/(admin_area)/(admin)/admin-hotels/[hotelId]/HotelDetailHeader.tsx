"use client";

import Link from 'next/link';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';

interface HotelDetailHeaderProps {
    hotelId: string;
}

export default function HotelDetailHeader({ hotelId }: HotelDetailHeaderProps) {
    const { effectiveUser } = useAuth();
    
    // Chỉ hiển thị nút edit nếu là PARTNER
    const isPartner = effectiveUser?.role.name.toLowerCase() === 'partner';
    
    if (!isPartner) {
        return null;
    }

    return (
        <Link
            href={`/admin-hotels/${hotelId}/edit`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm transition-all"
        >
            <PencilIcon className="h-5 w-5" />
            Chỉnh sửa
        </Link>
    );
}











