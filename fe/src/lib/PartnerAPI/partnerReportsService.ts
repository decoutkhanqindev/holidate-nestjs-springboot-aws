// lib/PartnerAPI/partnerReportsService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';

export interface RevenueReportData {
    data: Array<{
        period: string;
        revenue: number;
    }>;
    summary: {
        totalRevenue: number;
    };
}

export interface RevenueReportWithComparison {
    currentPeriod: RevenueReportData;
    previousPeriod: RevenueReportData;
    comparison: {
        totalRevenueDifference: number;
        totalRevenuePercentageChange: number;
    };
}

export interface BookingsSummary {
    totalCreated: number;
    totalPending: number;
    totalConfirmed: number;
    totalCheckedIn: number;
    totalCompleted: number;
    totalCancelled: number;
    totalRescheduled: number;
    cancellationRate: number;
}

export interface BookingsSummaryWithComparison {
    currentPeriod: BookingsSummary;
    previousPeriod: BookingsSummary;
    comparison: {
        [key: string]: {
            difference: number;
            percentageChange: number;
        };
    };
}

export interface OccupancyReport {
    data: Array<{
        date: string;
        occupancyRate: number;
    }>;
    summary: {
        averageRate: number;
        totalOccupied: number;
        totalAvailable: number;
    };
}

export interface OccupancyReportWithComparison {
    currentPeriod: OccupancyReport;
    previousPeriod: OccupancyReport;
    comparison: {
        averageRateDifference: number;
        averageRatePercentageChange: number;
    };
}

export interface RoomPerformance {
    data: Array<{
        roomId: string;
        roomName: string;
        roomView: string;
        totalRevenue: number;
        totalBookedNights: number;
    }>;
}

export interface RoomPerformanceWithComparison {
    data: Array<{
        roomId: string;
        roomName: string;
        roomView: string;
        currentPeriod: {
            totalRevenue: number;
            totalBookedNights: number;
        };
        previousPeriod: {
            totalRevenue: number;
            totalBookedNights: number;
        };
        comparison: {
            totalRevenueDifference: number;
            totalRevenuePercentageChange: number;
            totalBookedNightsDifference: number;
            totalBookedNightsPercentageChange: number;
        };
    }>;
}

export interface CustomerSummary {
    totalNewCustomerBookings: number;
    totalReturningCustomerBookings: number;
    totalCompletedBookings: number;
    newCustomerPercentage: number;
    returningCustomerPercentage: number;
}

export interface CustomerSummaryWithComparison {
    currentPeriod: CustomerSummary;
    previousPeriod: CustomerSummary;
    comparison: {
        [key: string]: {
            difference: number;
            percentageChange: number;
        };
    };
}

export interface ReviewsSummary {
    totalReviews: number;
    averageScore: number;
    scoreDistribution: Array<{
        scoreBucket: string;
        reviewCount: number;
    }>;
}

export interface ReviewsSummaryWithComparison {
    currentPeriod: ReviewsSummary;
    previousPeriod: ReviewsSummary;
    comparison: {
        totalReviewsDifference: number;
        totalReviewsPercentageChange: number;
        averageScoreDifference: number;
        averageScorePercentageChange: number;
    };
}

// Revenue Report
export async function getPartnerRevenueReport(
    hotelId: string,
    from: string,
    to: string,
    groupBy: 'day' | 'week' | 'month' = 'day',
    compareFrom?: string,
    compareTo?: string
): Promise<RevenueReportData | RevenueReportWithComparison> {
    const params: any = {
        'hotel-id': hotelId,
        from,
        to,
        'group-by': groupBy,
    };
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    
    try {
        const response = await apiClient.get<ApiResponse<RevenueReportData | RevenueReportWithComparison>>(
            `/partner/reports/revenue`,
            { params }
        );
        
        
        if (!response.data?.data) {
            throw new Error('API không trả về dữ liệu');
        }
        
        return response.data.data;
    } catch (error: any) {
        throw error;
    }
}

// Bookings Summary
export async function getPartnerBookingsSummary(
    hotelId: string,
    from: string,
    to: string,
    compareFrom?: string,
    compareTo?: string
): Promise<BookingsSummary | BookingsSummaryWithComparison> {
    const params: any = {
        'hotel-id': hotelId,
        from,
        to,
    };
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    const response = await apiClient.get<ApiResponse<BookingsSummary | BookingsSummaryWithComparison>>(
        `/partner/reports/bookings/summary`,
        { params }
    );
    return response.data.data;
}

// Occupancy Report
export async function getPartnerOccupancyReport(
    hotelId: string,
    from: string,
    to: string,
    compareFrom?: string,
    compareTo?: string
): Promise<OccupancyReport | OccupancyReportWithComparison> {
    const params: any = {
        'hotel-id': hotelId,
        from,
        to,
    };
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    const response = await apiClient.get<ApiResponse<OccupancyReport | OccupancyReportWithComparison>>(
        `/partner/reports/occupancy`,
        { params }
    );
    return response.data.data;
}

// Room Performance
export async function getPartnerRoomPerformance(
    hotelId: string,
    from: string,
    to: string,
    sortBy: 'revenue' | 'bookedRoomNights' = 'revenue',
    sortDir: 'asc' | 'desc' = 'desc',
    compareFrom?: string,
    compareTo?: string
): Promise<RoomPerformance | RoomPerformanceWithComparison> {
    const params: any = {
        'hotel-id': hotelId,
        from,
        to,
        'sort-by': sortBy,
        'sort-dir': sortDir,
    };
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    const response = await apiClient.get<ApiResponse<RoomPerformance | RoomPerformanceWithComparison>>(
        `/partner/reports/rooms/performance`,
        { params }
    );
    return response.data.data;
}

// Customer Summary
export async function getPartnerCustomerSummary(
    hotelId: string,
    from: string,
    to: string,
    compareFrom?: string,
    compareTo?: string
): Promise<CustomerSummary | CustomerSummaryWithComparison> {
    const params: any = {
        'hotel-id': hotelId,
        from,
        to,
    };
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    const response = await apiClient.get<ApiResponse<CustomerSummary | CustomerSummaryWithComparison>>(
        `/partner/reports/customers/summary`,
        { params }
    );
    return response.data.data;
}

// Reviews Summary
export async function getPartnerReviewsSummary(
    hotelId: string,
    from: string,
    to: string,
    compareFrom?: string,
    compareTo?: string
): Promise<ReviewsSummary | ReviewsSummaryWithComparison> {
    const params: any = {
        'hotel-id': hotelId,
        from,
        to,
    };
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    const response = await apiClient.get<ApiResponse<ReviewsSummary | ReviewsSummaryWithComparison>>(
        `/partner/reports/reviews/summary`,
        { params }
    );
    return response.data.data;
}

