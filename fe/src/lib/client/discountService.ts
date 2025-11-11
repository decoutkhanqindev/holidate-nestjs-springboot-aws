// lib/client/discountService.ts
// Service để lấy mã giảm giá cho client (public, không cần auth)
import apiClient, { ApiResponse } from '@/service/apiClient';
import type { SuperDiscount, PagedResponse } from '@/types';

const baseURL = '/discounts';

/**
 * Lấy danh sách mã giảm giá công khai (cho client)
 * Lấy các mã đang active và còn hiệu lực
 */
export async function getPublicDiscounts({
    page = 0,
    size = 100, // Lấy nhiều để filter phía client
    sortBy = 'validTo',
    sortDir = 'asc' // Sắp xếp theo ngày hết hạn tăng dần (gần hết hạn nhất trước)
}: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
}): Promise<PagedResponse<SuperDiscount>> {
    try {
        const params: any = {
            page,
            size,
            sortBy,
            sortDir,
            active: true, // Chỉ lấy mã đang active
            currentlyValid: true, // Chỉ lấy mã còn hiệu lực
        };

        const response = await apiClient.get<ApiResponse<PagedResponse<SuperDiscount>>>(baseURL, {
            params,
        });

        if (response.data?.statusCode === 200 && response.data?.data) {
            const data = response.data.data;
            
            // Map dates từ string sang Date
            const mappedContent = data.content.map(discount => ({
                ...discount,
                validFrom: new Date(discount.validFrom),
                validTo: new Date(discount.validTo),
                createdAt: discount.createdAt ? new Date(discount.createdAt) : new Date(),
                updatedAt: discount.updatedAt ? new Date(discount.updatedAt) : undefined,
            }));

            return {
                ...data,
                content: mappedContent,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[client/discountService] Error fetching public discounts:', error);
        // Trả về empty response nếu lỗi
        return {
            content: [],
            page: 0,
            size: 0,
            totalItems: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
        };
    }
}

/**
 * Lấy 3 mã giảm giá có ngày hết hạn gần nhất (ưu tiên các mã trong tháng)
 */
export async function getTop3ExpiringDiscounts(): Promise<SuperDiscount[]> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setHours(23, 59, 59, 999);

        // Lấy tất cả mã active và còn hiệu lực
        const response = await getPublicDiscounts({
            page: 0,
            size: 100,
            sortBy: 'validTo',
            sortDir: 'asc', // Sắp xếp theo ngày hết hạn tăng dần (gần hết hạn nhất trước)
        });

        // Filter các mã có validTo >= today (còn hiệu lực)
        const validDiscounts = response.content.filter(discount => {
            const validTo = new Date(discount.validTo);
            validTo.setHours(0, 0, 0, 0);
            return validTo >= today;
        });

        // Ưu tiên các mã trong tháng (validTo <= nextMonth)
        const discountsInMonth = validDiscounts.filter(discount => {
            const validTo = new Date(discount.validTo);
            validTo.setHours(0, 0, 0, 0);
            return validTo <= nextMonth;
        });

        // Nếu có ít nhất 3 mã trong tháng, lấy 3 mã đó
        if (discountsInMonth.length >= 3) {
            return discountsInMonth.slice(0, 3);
        }

        // Nếu không đủ 3 mã trong tháng, lấy từ tất cả mã còn hiệu lực
        return validDiscounts.slice(0, 3);
    } catch (error: any) {
        console.error('[client/discountService] Error fetching top 3 expiring discounts:', error);
        return [];
    }
}

