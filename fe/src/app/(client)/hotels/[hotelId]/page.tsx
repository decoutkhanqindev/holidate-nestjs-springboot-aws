// app/hotels/[hotelId]/page.tsx

import type { Metadata } from 'next';
import { HotelResponse } from '@/service/hotelService';
import apiClient, { ApiResponse } from '@/service/apiClient';
import HotelDetailPageClient from './HotelDetailPageClient';

// ============================================
// CẤU HÌNH REVALIDATE
// ============================================
export const revalidate = 3600; // 1 giờ

// ============================================
// HÀM LẤY DỮ LIỆU TRÊN SERVER (CHỈ CHO METADATA)
// ============================================
async function getHotelByIdOnServer(hotelId: string): Promise<HotelResponse | null> {
    try {
        // Timeout ngắn hơn cho metadata (5s)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await apiClient.get<ApiResponse<HotelResponse>>(
            `/accommodation/hotels/${hotelId}`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        return response.data.data;
    } catch (error) {
        console.error('[HotelDetailPage] Lỗi khi tải khách sạn cho metadata:', error);
        return null;
    }
}

// ============================================
// HÀM TẠO METADATA (ĐÃ SỬA LỖI `await params`)
// ============================================
interface MetadataProps {
    params: Promise<{ hotelId: string }>;
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
    // SỬA LỖI Ở ĐÂY: Thêm 'await' trước khi truy cập params
    const { hotelId } = await params;
    const hotel = await getHotelByIdOnServer(hotelId);

    if (!hotel) {
        return {
            title: 'Khách sạn | Holidate',
            description: 'Thông tin chi tiết khách sạn',
        };
    }

    const address = [
        hotel.address, hotel.street?.name, hotel.ward?.name, hotel.district?.name, hotel.city?.name
    ].filter(Boolean).join(', ');

    const mainImage = hotel.photos?.[0]?.photos?.[0]?.url || '';
    const price = hotel.currentPricePerNight > 0
        ? `${hotel.currentPricePerNight.toLocaleString('vi-VN')} VND`
        : 'Liên hệ giá';

    let description = hotel.description || `Đặt phòng tại ${hotel.name}, ${address}. Giá từ ${price}/đêm.`;

    return {
title: `${hotel.name} - ${address} | Holidate`,
        description: description,
        openGraph: {
            title: `${hotel.name} - ${address}`,
            description: description,
            images: mainImage ? [{ url: mainImage, alt: hotel.name }] : [],
        },
    };
}


// ============================================
// SERVER COMPONENT CHÍNH CỦA TRANG
// ============================================
interface HotelDetailPageProps {
    params: Promise<{ hotelId: string }>;
}

export default async function HotelDetailPage({ params }: HotelDetailPageProps) {
    const { hotelId } = await params;

    // KHÔNG fetch trên server để tránh timeout
    // Client sẽ fetch ngay sau khi mount
    // Điều này đảm bảo navigation nhanh, không bị block
    // Server chỉ render shell, client fetch tuần tự: hotel → rooms → reviews
    
    return (
        <HotelDetailPageClient
            initialHotel={null}
            initialRooms={[]}
            initialHasMore={false}
            initialPage={0}
        />
    );
}
