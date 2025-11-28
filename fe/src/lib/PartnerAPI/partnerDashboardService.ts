// lib/PartnerAPI/partnerDashboardService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';

export interface PartnerDashboardSummary {
    todaysActivity: {
        checkInsToday: number;
        checkOutsToday: number;
        inHouseGuests: number;
    };
    bookingStatusCounts: Array<{
        status: string;
        count: number;
    }>;
    roomStatusCounts: Array<{
        status: string;
        count: number;
    }>;
    occupancyForecast: Array<{
        date: string;
        roomsBooked: number;
        totalCapacity: number;
        occupancyPercentage: number;
    }>;
    totalRoomCapacity?: number; // Optional vì backend có thể không trả về
}

export async function getPartnerDashboardSummary(hotelId: string, forecastDays: number = 7): Promise<PartnerDashboardSummary> {
    const response = await apiClient.get<ApiResponse<PartnerDashboardSummary>>(
        `/partner/dashboard/summary`,
        {
            params: {
                'hotel-id': hotelId,
                'forecast-days': forecastDays,
            },
        }
    );
    
    // Log chi tiết để debug
    const data = response.data.data;
    const totalRooms = (data?.roomStatusCounts || []).reduce((total: number, item: any) => total + (item.count || 0), 0);
    
    // Tính totalRoomCapacity từ occupancyForecast nếu có
    let calculatedTotalCapacity = 0;
    if (data?.occupancyForecast && data.occupancyForecast.length > 0) {
        // Lấy totalCapacity từ item đầu tiên (tất cả items nên có cùng totalCapacity)
        calculatedTotalCapacity = data.occupancyForecast[0]?.totalCapacity || 0;
    }
    
    console.log('[getPartnerDashboardSummary] API Response:', {
        hotelId: hotelId,
        roomStatusCounts: data?.roomStatusCounts,
        totalRoomsFromStatus: totalRooms,
        totalRoomCapacityFromResponse: data?.totalRoomCapacity,
        totalRoomCapacityFromForecast: calculatedTotalCapacity,
        occupancyForecastLength: data?.occupancyForecast?.length || 0,
        breakdown: (data?.roomStatusCounts || []).map((item: any) => ({
            status: item.status,
            count: item.count
        })),
        fullResponse: data
    });
    
    // Cảnh báo nếu số phòng không khớp
    if (calculatedTotalCapacity > 0 && totalRooms !== calculatedTotalCapacity) {
        console.warn('[getPartnerDashboardSummary] WARNING: Room count mismatch!', {
            fromStatus: totalRooms,
            fromForecast: calculatedTotalCapacity,
            difference: Math.abs(totalRooms - calculatedTotalCapacity)
        });
    }
    
    // Set totalRoomCapacity nếu chưa có
    if (!data.totalRoomCapacity && calculatedTotalCapacity > 0) {
        data.totalRoomCapacity = calculatedTotalCapacity;
    }
    
    return data;
}


