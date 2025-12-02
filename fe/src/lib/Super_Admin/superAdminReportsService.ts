// lib/Super_Admin/superAdminReportsService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';

export interface RevenueReportData {
    data: Array<{
        period: string;
        revenue: number;
    }>;
    summary: {
        totalRevenue: number;
    };
    breakdown?: Array<{
        id: string;
        name: string;
        revenue: number;
    }>;
}

export interface RevenueReportWithComparison {
    currentPeriod: RevenueReportData;
    previousPeriod: RevenueReportData;
    comparison: {
        totalRevenueDifference: number;
        totalRevenuePercentageChange: number;
    };
}

export interface HotelPerformance {
    data: Array<{
        hotelId: string;
        hotelName: string;
        totalRevenue: number;
        totalCompletedBookings: number;
        totalCreatedBookings: number;
        totalCancelledBookings: number;
        averageOccupancyRate: number;
        cancellationRate: number;
    }>;
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface HotelPerformanceWithComparison {
    currentPeriod: HotelPerformance;
    previousPeriod: HotelPerformance;
    comparison: Array<{
        hotelId: string;
        hotelName: string;
        currentRank: number;
        previousRank: number;
        rankChange: number;
        revenueDifference: number;
        revenuePercentageChange: number;
        occupancyDifference: number;
        occupancyPercentageChange: number;
        bookingsDifference: number;
        bookingsPercentageChange: number;
    }>;
}

export interface UsersSummary {
    growth: {
        newCustomers: number;
        newPartners: number;
    };
    platformTotals: {
        totalCustomers: number;
        totalPartners: number;
    };
}

export interface UsersSummaryWithComparison {
    currentPeriod: UsersSummary;
    previousPeriod: UsersSummary;
    comparison: {
        newCustomersDifference: number;
        newCustomersPercentageChange: number;
        newPartnersDifference: number;
        newPartnersPercentageChange: number;
        totalCustomersDifference: number;
        totalCustomersPercentageChange: number;
        totalPartnersDifference: number;
        totalPartnersPercentageChange: number;
    };
}

export interface SeasonalityReport {
    data: Array<{
        month: string;
        totalRevenue: number;
        totalBookings: number;
    }>;
}

export interface PopularLocation {
    locationId: string;
    locationName: string;
    totalRevenue: number;
    totalBookings: number;
}

export interface PopularLocationsReport {
    data: PopularLocation[];
}

export interface PopularRoomType {
    roomCategory: string;
    totalBookedNights: number;
}

export interface PopularRoomTypesReport {
    data: PopularRoomType[];
}

export interface FinancialsReport {
    data: Array<{
        period: string;
        grossRevenue: number;
        netRevenue: number;
        partnerPayout: number;
        grossMargin: number;
    }>;
    summary: {
        totalGrossRevenue: number;
        totalNetRevenue: number;
        totalPartnerPayout: number;
        averageGrossMargin: number;
    };
}

export interface FinancialsReportWithComparison {
    currentPeriod: FinancialsReport;
    previousPeriod: FinancialsReport;
    comparison: {
        totalGrossRevenueDifference: number;
        totalGrossRevenuePercentageChange: number;
        totalNetRevenueDifference: number;
        totalNetRevenuePercentageChange: number;
        totalPartnerPayoutDifference: number;
        totalPartnerPayoutPercentageChange: number;
        averageGrossMarginDifference: number;
        averageGrossMarginPercentageChange: number;
    };
}

// Revenue Report
export async function getAdminRevenueReport(
    from: string,
    to: string,
    groupBy: 'day' | 'week' | 'month' = 'day',
    filterBy?: 'hotel' | 'city' | 'province',
    page: number = 0,
    size: number = 10,
    compareFrom?: string,
    compareTo?: string
): Promise<RevenueReportData | RevenueReportWithComparison> {
    const params: any = {
        from,
        to,
        'group-by': groupBy,
        page,
        size,
    };
    
    if (filterBy) {
        params['filter-by'] = filterBy;
    }
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    const response = await apiClient.get<ApiResponse<RevenueReportData | RevenueReportWithComparison>>(
        `/admin/reports/revenue`,
        { params }
    );
    return response.data.data;
}

// Hotel Performance Report
export async function getAdminHotelPerformanceReport(
    from: string,
    to: string,
    sortBy: 'revenue' | 'occupancy' | 'bookings' | 'cancellationRate' = 'revenue',
    sortDir: 'asc' | 'desc' = 'desc',
    cityId?: string,
    provinceId?: string,
    page: number = 0,
    size: number = 20,
    compareFrom?: string,
    compareTo?: string
): Promise<HotelPerformance | HotelPerformanceWithComparison> {
    const params: any = {
        from,
        to,
        'sort-by': sortBy,
        'sort-dir': sortDir,
        page,
        size,
    };
    
    if (cityId) {
        params['city-id'] = cityId;
    }
    
    if (provinceId) {
        params['province-id'] = provinceId;
    }
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    const response = await apiClient.get<ApiResponse<HotelPerformance | HotelPerformanceWithComparison>>(
        `/admin/reports/hotel-performance`,
        { params }
    );
    return response.data.data;
}

// Users Summary Report
export async function getAdminUsersSummaryReport(
    from: string,
    to: string,
    compareFrom?: string,
    compareTo?: string
): Promise<UsersSummary | UsersSummaryWithComparison> {
    const params: any = {
        from,
        to,
    };
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    const response = await apiClient.get<ApiResponse<UsersSummary | UsersSummaryWithComparison>>(
        `/admin/reports/users/summary`,
        { params }
    );
    return response.data.data;
}

// Seasonality Report
export async function getAdminSeasonalityReport(
    from: string,
    to: string,
    metric: 'revenue' | 'bookings' = 'bookings'
): Promise<SeasonalityReport> {
    const response = await apiClient.get<ApiResponse<SeasonalityReport>>(
        `/admin/reports/trends/seasonality`,
        {
            params: {
                from,
                to,
                metric,
            },
        }
    );
    return response.data.data;
}

// Popular Locations Report
export async function getAdminPopularLocationsReport(
    from: string,
    to: string,
    level: 'city' | 'province' = 'city',
    metric: 'revenue' | 'bookings' = 'revenue',
    limit: number = 10
): Promise<PopularLocationsReport> {
    const response = await apiClient.get<ApiResponse<PopularLocationsReport>>(
        `/admin/reports/trends/popular-locations`,
        {
            params: {
                from,
                to,
                level,
                metric,
                limit,
            },
        }
    );
    return response.data.data;
}

// Popular Room Types Report
export async function getAdminPopularRoomTypesReport(
    from: string,
    to: string,
    groupBy: 'view' | 'bedType' | 'occupancy' = 'occupancy',
    limit: number = 10
): Promise<PopularRoomTypesReport> {
    const response = await apiClient.get<ApiResponse<PopularRoomTypesReport>>(
        `/admin/reports/trends/popular-room-types`,
        {
            params: {
                from,
                to,
                'group-by': groupBy,
                limit,
            },
        }
    );
    return response.data.data;
}

// Financials Report
export async function getAdminFinancialsReport(
    from: string,
    to: string,
    groupBy: 'day' | 'week' | 'month' = 'day',
    compareFrom?: string,
    compareTo?: string
): Promise<FinancialsReport | FinancialsReportWithComparison> {
    const params: any = {
        from,
        to,
        'group-by': groupBy,
    };
    
    if (compareFrom && compareTo) {
        params['compare-from'] = compareFrom;
        params['compare-to'] = compareTo;
    }
    
    const response = await apiClient.get<ApiResponse<FinancialsReport | FinancialsReportWithComparison>>(
        `/admin/reports/financials`,
        { params }
    );
    return response.data.data;
}













