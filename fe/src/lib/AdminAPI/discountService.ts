// lib/AdminAPI/discountService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';
import type { Discount } from '@/types';

const baseURL = '/discounts';

// Interface từ API response (theo cấu trúc backend)
interface DiscountResponse {
    id: string;
    code: string;
    description?: string;
    percentage: number; // Backend chỉ có percentage
    usageLimit: number;
    timesUsed: number;
    minBookingPrice: number;
    minBookingCount: number;
    validFrom: string; // LocalDate từ backend (YYYY-MM-DD)
    validTo: string; // LocalDate từ backend (YYYY-MM-DD)
    active: boolean;
    createdAt: string; // LocalDateTime từ backend
    updatedAt?: string;
}

interface PaginatedDiscountResponse {
    content: DiscountResponse[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Helper function để map từ DiscountResponse sang Discount
function mapDiscountResponseToDiscount(response: DiscountResponse): Discount {
    // Backend chỉ có percentage, không có amount
    // Map percentage thành discountValue với discountType = 'PERCENT'
    return {
        id: response.id,
        code: response.code,
        description: response.description || '', // Thêm description
        discountValue: response.percentage, // percentage từ backend
        discountType: 'PERCENT' as const, // Backend chỉ hỗ trợ percentage
        expiresAt: new Date(response.validTo), // validTo -> expiresAt
        active: response.active, // Thêm trạng thái active
        createdAt: new Date(response.createdAt),
    };
}

/**
 * Lấy danh sách mã giảm giá với phân trang
 */
export interface GetDiscountsParams {
    page?: number;
    size?: number;
    code?: string;
    active?: boolean;
    currentlyValid?: boolean;
    validFrom?: string; // ISO format: YYYY-MM-DD
    validTo?: string; // ISO format: YYYY-MM-DD
    minPercentage?: number;
    maxPercentage?: number;
    minBookingPrice?: number;
    maxBookingPrice?: number;
    minBookingCount?: number;
    maxBookingCount?: number;
    available?: boolean;
    exhausted?: boolean;
    minTimesUsed?: number;
    maxTimesUsed?: number;
    hotelId?: string;
    specialDayId?: string;
    sortBy?: string; // code, percentage, valid-from, valid-to, usage-limit, times-used, min-booking-price, created-at
    sortDir?: 'asc' | 'desc';
}

export interface PaginatedDiscountsResult {
    data: Discount[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

export async function getDiscounts(params: GetDiscountsParams = {}): Promise<PaginatedDiscountsResult> {
    try {
        const {
            page = 0, // Backend dùng 0-based index
            size = 10,
            code,
            active,
            currentlyValid,
            validFrom,
            validTo,
            minPercentage,
            maxPercentage,
            minBookingPrice,
            maxBookingPrice,
            minBookingCount,
            maxBookingCount,
            available,
            exhausted,
            minTimesUsed,
            maxTimesUsed,
            hotelId,
            specialDayId,
            sortBy = 'created-at',
            sortDir = 'asc',
        } = params;

        // Backend sử dụng kebab-case cho query params
        const queryParams: any = {
            page,
            size,
            'sort-by': sortBy,
            'sort-dir': sortDir,
        };

        // Thêm các filter parameters
        if (code && code.trim() !== '') queryParams.code = code.trim();
        if (active !== undefined) queryParams.active = active;
        if (currentlyValid !== undefined) queryParams['currently-valid'] = currentlyValid;
        if (validFrom) queryParams['valid-from'] = validFrom;
        if (validTo) queryParams['valid-to'] = validTo;
        if (minPercentage !== undefined && minPercentage !== null) queryParams['min-percentage'] = minPercentage;
        if (maxPercentage !== undefined && maxPercentage !== null) queryParams['max-percentage'] = maxPercentage;
        if (minBookingPrice !== undefined && minBookingPrice !== null) queryParams['min-booking-price'] = minBookingPrice;
        if (maxBookingPrice !== undefined && maxBookingPrice !== null) queryParams['max-booking-price'] = maxBookingPrice;
        if (minBookingCount !== undefined && minBookingCount !== null) queryParams['min-booking-count'] = minBookingCount;
        if (maxBookingCount !== undefined && maxBookingCount !== null) queryParams['max-booking-count'] = maxBookingCount;
        if (available !== undefined) queryParams.available = available;
        if (exhausted !== undefined) queryParams.exhausted = exhausted;
        if (minTimesUsed !== undefined && minTimesUsed !== null) queryParams['min-times-used'] = minTimesUsed;
        if (maxTimesUsed !== undefined && maxTimesUsed !== null) queryParams['max-times-used'] = maxTimesUsed;
        if (hotelId && hotelId.trim() !== '') queryParams['hotel-id'] = hotelId.trim();
        if (specialDayId && specialDayId.trim() !== '') queryParams['special-day-id'] = specialDayId.trim();

        const response = await apiClient.get<ApiResponse<PaginatedDiscountResponse>>(
            baseURL,
            { params: queryParams }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            const discounts = response.data.data.content.map(mapDiscountResponseToDiscount);


            return {
                data: discounts,
                totalPages: response.data.data.totalPages,
                currentPage: response.data.data.page,
                totalItems: response.data.data.totalItems,
            };
        }

        return {
            data: [],
            totalPages: 0,
            currentPage: 0,
            totalItems: 0,
        };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách mã giảm giá');
    }
}

/**
 * Lấy thông tin một mã giảm giá theo ID
 */
export async function getDiscountById(id: string): Promise<Discount | null> {
    try {

        const response = await apiClient.get<ApiResponse<DiscountResponse>>(
            `${baseURL}/${id}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return mapDiscountResponseToDiscount(response.data.data);
        }

        return null;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        throw new Error(error.response?.data?.message || 'Không thể tải thông tin mã giảm giá');
    }
}