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
    totalRoomCapacity: number;
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
    return response.data.data;
}


