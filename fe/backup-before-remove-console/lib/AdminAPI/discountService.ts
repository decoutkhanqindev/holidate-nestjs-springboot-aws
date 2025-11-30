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
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
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
            sortBy = 'createdAt',
            sortDir = 'ASC',
        } = params;

        console.log(`[discountService] Fetching discounts:`, params);

        // Backend sử dụng kebab-case cho query params
        const queryParams: any = {
            page,
            size,
            'sort-by': sortBy,
            'sort-dir': sortDir,
        };

        if (code) queryParams.code = code;
        if (active !== undefined) queryParams.active = active;

        const response = await apiClient.get<ApiResponse<PaginatedDiscountResponse>>(
            baseURL,
            { params: queryParams }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            const discounts = response.data.data.content.map(mapDiscountResponseToDiscount);

            console.log(`[discountService] Fetched ${discounts.length} discounts`);

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
        console.error(`[discountService] Error fetching discounts:`, error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách mã giảm giá');
    }
}

/**
 * Lấy thông tin một mã giảm giá theo ID
 */
export async function getDiscountById(id: string): Promise<Discount | null> {
    try {
        console.log(`[discountService] Fetching discount with id: ${id}`);

        const response = await apiClient.get<ApiResponse<DiscountResponse>>(
            `${baseURL}/${id}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return mapDiscountResponseToDiscount(response.data.data);
        }

        return null;
    } catch (error: any) {
        console.error(`[discountService] Error fetching discount ${id}:`, error);
        if (error.response?.status === 404) {
            return null;
        }
        throw new Error(error.response?.data?.message || 'Không thể tải thông tin mã giảm giá');
    }
}