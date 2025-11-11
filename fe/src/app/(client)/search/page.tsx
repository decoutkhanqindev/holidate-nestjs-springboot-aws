import type { Metadata } from 'next';
import { HotelResponse, PaginatedData } from '@/service/hotelService';
import { getAmenityCategories, AmenityCategory } from '@/lib/AdminAPI/amenityService';
import apiClient, { ApiResponse } from '@/service/apiClient';
import SearchPageClient from './SearchPageClient';

// ============================================
// SSR CONFIGURATION
// ============================================
// Force dynamic rendering vì searchParams thay đổi liên tục
export const dynamic = 'force-dynamic';

// ============================================
// HELPER FUNCTION - Search Hotels trên Server
// ============================================
async function searchHotelsOnServer(searchParams: URLSearchParams): Promise<PaginatedData<HotelResponse>> {
    try {
        const query = searchParams.get('query') || '';
        const provinceId = searchParams.get('province-id');
        const cityId = searchParams.get('city-id');
        const districtId = searchParams.get('district-id');
        const hotelId = searchParams.get('hotel-id');

    const apiParams: any = {
            page: 0,
            size: 10,
            adults: searchParams.get('adults') || '2',
            children: searchParams.get('children') || '0',
            rooms: searchParams.get('rooms') || '1',
    };

    // Ưu tiên ID -> hotel-id, province-id, city-id, district-id -> name
    if (hotelId) apiParams['hotel-id'] = hotelId;
    else if (provinceId) apiParams['province-id'] = provinceId;
    else if (cityId) apiParams['city-id'] = cityId;
    else if (districtId) apiParams['district-id'] = districtId;
    else if (query) apiParams.name = query;

        // Build query string
        const queryString = new URLSearchParams(
            Object.entries(apiParams).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = String(value);
                }
                return acc;
            }, {} as Record<string, string>)
        ).toString();

        const response = await apiClient.get<ApiResponse<PaginatedData<HotelResponse>>>(
            `/accommodation/hotels?${queryString}`
        );

        return response.data.data;
    } catch (error) {
        console.error('[SearchPage] Error fetching hotels:', error);
        // Return empty result
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
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const params = await searchParams;
    const query = (params.query as string) || 'Khách sạn';
    const location = query || 'Việt Nam';

    return {
        title: `Tìm kiếm khách sạn tại ${location} | Holidate`,
        description: `Tìm kiếm và đặt phòng khách sạn tại ${location}. Nhiều lựa chọn khách sạn với giá tốt nhất, ưu đãi đặc biệt.`,
        keywords: [
            `khách sạn ${location}`,
            `đặt phòng ${location}`,
            'tìm kiếm khách sạn',
            'booking khách sạn',
            'Holidate'
        ],
        openGraph: {
            title: `Tìm kiếm khách sạn tại ${location}`,
            description: `Nhiều lựa chọn khách sạn với giá tốt nhất tại ${location}`,
            type: 'website',
        },
    };
}

// ============================================
// SERVER COMPONENT
// ============================================
interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    
    // Convert searchParams to URLSearchParams
    const urlSearchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            if (Array.isArray(value)) {
                value.forEach(v => urlSearchParams.append(key, v));
            } else {
                urlSearchParams.set(key, value);
            }
        }
    });

    // Fetch data từ server
    let hotelsData: PaginatedData<HotelResponse> = {
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
    let amenityCategories: AmenityCategory[] = [];

    try {
        // Fetch hotels và amenities song song
        [hotelsData, amenityCategories] = await Promise.all([
            searchHotelsOnServer(urlSearchParams),
            getAmenityCategories(),
        ]);
    } catch (error) {
        console.error('[SearchPage] Error fetching data:', error);
        // Nếu lỗi, vẫn render với empty data - client sẽ tự fetch lại
    }

    return (
        <SearchPageClient
            initialHotels={hotelsData.content}
            initialTotalItems={hotelsData.totalItems}
            initialHasMore={!hotelsData.last}
            initialAmenityCategories={amenityCategories}
        />
    );
}
