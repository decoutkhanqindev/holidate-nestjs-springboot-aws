import type { Metadata } from 'next';
import { HotelResponse, Room, PaginatedData } from '@/service/hotelService';
import apiClient, { ApiResponse } from '@/service/apiClient';
import HotelDetailPageClient from './HotelDetailPageClient';

// ============================================
// ISR CONFIGURATION
// ============================================
// Revalidate mỗi 1 giờ (3600 giây) để đảm bảo data luôn mới nhất
// Có thể tăng lên 24 giờ (86400) nếu data không thay đổi thường xuyên
export const revalidate = 3600; // 1 giờ

// ============================================
// HELPER FUNCTIONS - Fetch trên Server
// ============================================
async function getHotelByIdOnServer(hotelId: string): Promise<HotelResponse | null> {
    try {
        const response = await apiClient.get<ApiResponse<HotelResponse>>(
            `/accommodation/hotels/${hotelId}`
        );
        return response.data.data;
    } catch (error) {
        console.error('[HotelDetailPage] Error fetching hotel:', error);
        return null;
    }
}

async function getRoomsByHotelIdOnServer(hotelId: string, page: number = 0, size: number = 10): Promise<PaginatedData<Room>> {
    try {
        const params = new URLSearchParams({
            'hotel-id': hotelId,
            page: page.toString(),
            size: size.toString(),
        });

        const response = await apiClient.get<ApiResponse<PaginatedData<Room>>>(
            `/accommodation/rooms?${params.toString()}`
        );

        return response.data.data;
    } catch (error) {
        console.error('[HotelDetailPage] Error fetching rooms:', error);
        return {
            content: [],
            page: 0,
            size: 10,
            totalItems: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
        };
    }
}

// ============================================
// GENERATE METADATA DYNAMIC
// ============================================
export async function generateMetadata({ params }: { params: Promise<{ hotelId: string }> }): Promise<Metadata> {
    const { hotelId } = await params;
    
    let hotel: HotelResponse | null = null;
    try {
        hotel = await getHotelByIdOnServer(hotelId);
    } catch (error) {
        console.error('[HotelDetailPage] Error fetching hotel for metadata:', error);
    }

    if (!hotel) {
        return {
            title: 'Khách sạn | Holidate',
            description: 'Thông tin chi tiết khách sạn',
        };
    }

    const address = [
        hotel.address,
        hotel.street?.name,
        hotel.ward?.name,
        hotel.district?.name,
        hotel.city?.name
    ].filter(Boolean).join(', ');

    const mainImage = hotel.photos?.[0]?.photos?.[0]?.url || '';
    const price = hotel.currentPricePerNight > 0 
        ? `${hotel.currentPricePerNight.toLocaleString('vi-VN')} VND` 
        : 'Liên hệ giá';

    // Build description để tránh nested template strings
    let description = hotel.description || '';
    if (!description) {
        description = `Đặt phòng tại ${hotel.name}, ${address}. Giá từ ${price}/đêm.`;
        if (hotel.starRating > 0) {
            description += ` ${hotel.starRating} sao.`;
        }
        if (hotel.averageScore > 0) {
            description += ` Đánh giá ${hotel.averageScore}/10.`;
        }
        description += ' Ưu đãi đặc biệt, thanh toán an toàn.';
    }

    return {
        title: `${hotel.name} - ${address} | Holidate`,
        description: description,
        keywords: [
            hotel.name,
            `khách sạn ${hotel.city?.name || ''}`,
            `đặt phòng ${hotel.name}`,
            address,
            'Holidate',
            'booking khách sạn',
        ],
        openGraph: {
            title: `${hotel.name} - ${address}`,
            description: hotel.description || `Đặt phòng tại ${hotel.name}. Giá từ ${price}/đêm.`,
            type: 'website',
            images: mainImage ? [{ url: mainImage, alt: hotel.name }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${hotel.name} - ${address}`,
            description: hotel.description || `Đặt phòng tại ${hotel.name}. Giá từ ${price}/đêm.`,
            images: mainImage ? [mainImage] : [],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

// ============================================
// SERVER COMPONENT
// ============================================
interface HotelDetailPageProps {
    params: Promise<{ hotelId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HotelDetailPage({ params, searchParams }: HotelDetailPageProps) {
    const { hotelId } = await params;
    
    // Fetch hotel và rooms song song từ server
    let hotel: HotelResponse | null = null;
    let roomsData: PaginatedData<Room> = {
        content: [],
        page: 0,
        size: 10,
        totalItems: 0,
        totalPages: 0,
        first: true,
        last: true,
        hasNext: false,
        hasPrevious: false,
    };

    try {
        [hotel, roomsData] = await Promise.all([
            getHotelByIdOnServer(hotelId),
            getRoomsByHotelIdOnServer(hotelId, 0, 10),
        ]);
    } catch (error) {
        console.error('[HotelDetailPage] Error fetching data:', error);
        // Nếu lỗi, vẫn render với null/empty - client sẽ tự fetch lại
    }

    return (
        <HotelDetailPageClient
            initialHotel={hotel}
            initialRooms={roomsData.content}
            initialHasMore={!roomsData.last}
            initialPage={roomsData.page}
        />
    );
}
