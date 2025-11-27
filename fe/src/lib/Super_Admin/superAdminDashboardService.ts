// lib/Super_Admin/superAdminDashboardService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';

export interface AdminDashboardSummary {
    realtimeFinancials: {
        todayRevenue: number;
        mtdRevenue: number;
    };
    aggregatedFinancials: {
        mtdGrossRevenue: number;
        mtdNetRevenue: number;
    };
    bookingActivity: {
        bookingsCreatedToday: number;
    };
    ecosystemGrowth: {
        newUsersToday: number;
        newPartnersToday: number;
        totalActiveHotels: number;
    };
    topPerformingHotels: Array<{
        hotelId: string;
        hotelName: string;
        totalRevenue: number;
        totalBookings: number;
    }>;
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    const response = await apiClient.get<ApiResponse<AdminDashboardSummary>>(
        `/admin/dashboard/summary`
    );
    return response.data.data;
}






