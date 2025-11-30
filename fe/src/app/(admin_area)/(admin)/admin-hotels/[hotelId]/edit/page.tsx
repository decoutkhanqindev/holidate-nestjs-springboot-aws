"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getHotelById } from '@/lib/AdminAPI/hotelService';
import { PageHeader } from '@/components/Admin/ui/PageHeader';
import EditHotelClient from './EditHotelClient';
import type { Hotel } from '@/types';

export default function EditHotelPage() {
    const params = useParams();
    const router = useRouter();
    const hotelId = params?.hotelId as string;

    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadHotel = async () => {
            if (!hotelId) return;

            try {
                setIsLoading(true);
                setError(null);

                const hotelData = await getHotelById(hotelId);

                if (!hotelData) {
                    setError('Không tìm thấy khách sạn');
                    return;
                }

                setHotel(hotelData);
            } catch (err: any) {
                
                // Nếu là lỗi authentication (401/403), redirect về login
                if (err.response?.status === 401 || err.response?.status === 403) {
                    console.error('[EditHotelPage] Authentication/Authorization error (401/403), redirecting to login');
                    router.push('/admin-login');
                    return;
                }
                
                // Nếu error message có chứa "Token" hoặc "đăng nhập"
                if (err.message?.includes('Token') || 
                    err.message?.includes('đăng nhập') || 
                    err.message?.includes('authentication')) {
                    router.push('/admin-login');
                    return;
                }
                
                setError(err.message || 'Không thể tải thông tin khách sạn');
            } finally {
                setIsLoading(false);
            }
        };

        loadHotel();
    }, [hotelId, router]);

    if (isLoading) {
        return (
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="p-6 md:p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error || 'Không tìm thấy khách sạn'}</p>
                </div>
            </div>
        );
        }

        return (
            <>
                <PageHeader title={`Chỉnh sửa: ${hotel.name}`} />
                <EditHotelClient hotel={hotel} />
            </>
        );
}
