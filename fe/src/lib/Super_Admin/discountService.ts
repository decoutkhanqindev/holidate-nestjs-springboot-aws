// lib/Super_Admin/discountService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';
import { createServerApiClient } from '@/lib/AdminAPI/serverApiClient';
import type { SuperDiscount, PagedResponse } from '@/types';

const baseURL = '/discounts';

/**
 * Lấy danh sách mã giảm giá với phân trang
 */
export async function getDiscounts({
    page = 0,
    size = 10,
    code,
    active,
    sortBy = 'createdAt',
    sortDir = 'desc'
}: {
    page?: number;
    size?: number;
    code?: string;
    active?: boolean;
    sortBy?: string;
    sortDir?: string;
}): Promise<PagedResponse<SuperDiscount>> {
    try {

        const params: any = {
            page,
            size,
            sortBy,
            sortDir,
        };

        if (code) params.code = code;
        if (active !== undefined) params.active = active;

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
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tải danh sách mã giảm giá';
        throw new Error(errorMessage);
    }
}

/**
 * Lấy chi tiết mã giảm giá theo ID
 */
export async function getDiscountById(id: string): Promise<SuperDiscount> {
    try {

        const response = await apiClient.get<ApiResponse<SuperDiscount>>(`${baseURL}/${id}`);

        if (response.data?.statusCode === 200 && response.data?.data) {
            const discount = response.data.data;
            
            // Map dates
            return {
                ...discount,
                validFrom: new Date(discount.validFrom),
                validTo: new Date(discount.validTo),
                createdAt: discount.createdAt ? new Date(discount.createdAt) : new Date(),
                updatedAt: discount.updatedAt ? new Date(discount.updatedAt) : undefined,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tải thông tin mã giảm giá';
        throw new Error(errorMessage);
    }
}

/**
 * Tạo mã giảm giá mới - Server version
 */
export async function createDiscountServer(payload: {
    code: string;
    description: string;
    percentage: number;
    usageLimit: number;
    timesUsed?: number;
    minBookingPrice: number;
    minBookingCount: number;
    validFrom: string; // YYYY-MM-DD
    validTo: string; // YYYY-MM-DD
    hotelId?: string;
    specialDayId?: string;
}): Promise<SuperDiscount> {
    try {
        console.log('[discountService] Creating discount (server):', payload);

        const serverClient = await createServerApiClient();
        
        const requestPayload = {
            code: payload.code.trim(),
            description: payload.description.trim(),
            percentage: payload.percentage,
            usageLimit: payload.usageLimit,
            timesUsed: payload.timesUsed || 0,
            minBookingPrice: payload.minBookingPrice,
            minBookingCount: payload.minBookingCount,
            validFrom: payload.validFrom,
            validTo: payload.validTo,
        };

        const params: any = {};
        if (payload.hotelId) params.hotelId = payload.hotelId;
        if (payload.specialDayId) params.specialDayId = payload.specialDayId;

        const response = await serverClient.post<ApiResponse<SuperDiscount>>(
            baseURL,
            requestPayload,
            { params }
        );

        if (response.data?.statusCode === 200 && response.data?.data) {
            const discount = response.data.data;
            console.log('[discountService] ✅ Discount created successfully (server)');
            
            return {
                ...discount,
                validFrom: new Date(discount.validFrom),
                validTo: new Date(discount.validTo),
                createdAt: discount.createdAt ? new Date(discount.createdAt) : new Date(),
                updatedAt: discount.updatedAt ? new Date(discount.updatedAt) : undefined,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[discountService] Error creating discount (server):', error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tạo mã giảm giá';
        throw new Error(errorMessage);
    }
}

/**
 * Cập nhật mã giảm giá - Server version
 */
export async function updateDiscountServer(
    id: string,
    payload: {
        code?: string;
        description?: string;
        percentage?: number;
        usageLimit?: number;
        timesUsed?: number;
        minBookingPrice?: number;
        minBookingCount?: number;
        validFrom?: string; // YYYY-MM-DD
        validTo?: string; // YYYY-MM-DD
        active?: boolean;
        hotelId?: string;
        specialDayId?: string;
    }
): Promise<SuperDiscount> {
    try {
        console.log(`[discountService] Updating discount ${id} (server):`, payload);

        const serverClient = await createServerApiClient();
        
        const requestPayload: any = {};
        
        // Chỉ thêm các field nếu có giá trị và không phải empty string
        if (payload.code !== undefined && payload.code !== null && payload.code.trim() !== '') {
            requestPayload.code = payload.code.trim();
        }
        if (payload.description !== undefined && payload.description !== null && payload.description.trim() !== '') {
            requestPayload.description = payload.description.trim();
        }
        if (payload.percentage !== undefined && payload.percentage !== null) {
            requestPayload.percentage = payload.percentage;
        }
        if (payload.usageLimit !== undefined && payload.usageLimit !== null) {
            requestPayload.usageLimit = payload.usageLimit;
        }
        if (payload.timesUsed !== undefined && payload.timesUsed !== null) {
            requestPayload.timesUsed = payload.timesUsed;
        }
        if (payload.minBookingPrice !== undefined && payload.minBookingPrice !== null) {
            requestPayload.minBookingPrice = payload.minBookingPrice;
        }
        if (payload.minBookingCount !== undefined && payload.minBookingCount !== null) {
            requestPayload.minBookingCount = payload.minBookingCount;
        }
        if (payload.validFrom !== undefined && payload.validFrom !== null && payload.validFrom.trim() !== '') {
            requestPayload.validFrom = payload.validFrom.trim();
        }
        if (payload.validTo !== undefined && payload.validTo !== null && payload.validTo.trim() !== '') {
            requestPayload.validTo = payload.validTo.trim();
        }
        if (payload.active !== undefined && payload.active !== null) {
            requestPayload.active = payload.active;
        }
        // hotelId và specialDayId: chỉ gửi nếu có giá trị, không gửi empty string
        if (payload.hotelId !== undefined && payload.hotelId !== null && payload.hotelId.trim() !== '') {
            requestPayload.hotelId = payload.hotelId.trim();
        }
        if (payload.specialDayId !== undefined && payload.specialDayId !== null && payload.specialDayId.trim() !== '') {
            requestPayload.specialDayId = payload.specialDayId.trim();
        }

        console.log(`[discountService] Update request payload:`, JSON.stringify(requestPayload, null, 2));
        console.log(`[discountService] Payload keys:`, Object.keys(requestPayload));
        console.log(`[discountService] Payload size:`, Object.keys(requestPayload).length);

        const response = await serverClient.put<ApiResponse<SuperDiscount>>(
            `${baseURL}/${id}`,
            requestPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.data?.statusCode === 200 && response.data?.data) {
            const discount = response.data.data;
            console.log(`[discountService] ✅ Discount updated successfully (server): ${id}`);
            
            return {
                ...discount,
                validFrom: new Date(discount.validFrom),
                validTo: new Date(discount.validTo),
                createdAt: discount.createdAt ? new Date(discount.createdAt) : new Date(),
                updatedAt: discount.updatedAt ? new Date(discount.updatedAt) : undefined,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error(`[discountService] Error updating discount ${id} (server):`, error);
        
        // Log chi tiết error response từ backend
        if (error.response) {
            console.error(`[discountService] Error response data (full):`, JSON.stringify(error.response.data, null, 2));
            
            // Cố gắng extract message từ nhiều nguồn
            let errorMessage = 'Không thể cập nhật mã giảm giá';
            
            if (error.response.data) {
                // Thử các cách extract message khác nhau
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.data?.message) {
                    errorMessage = error.response.data.data.message;
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.errors) {
                    // Validation errors từ Spring Boot
                    const errors = error.response.data.errors;
                    if (Array.isArray(errors) && errors.length > 0) {
                        errorMessage = errors.map((e: any) => e.defaultMessage || e.message || e.field).join(', ');
                    } else if (typeof errors === 'object') {
                        errorMessage = JSON.stringify(errors);
                    }
                }
                
                // Nếu vẫn không có message, thử lấy status text
                if (errorMessage === 'Không thể cập nhật mã giảm giá' && error.response.statusText) {
                    errorMessage = `${error.response.status} ${error.response.statusText}`;
                }
            }
            
            throw new Error(errorMessage);
        }
        
        // Nếu không có response, dùng message từ error
        const errorMessage = error.message || 'Không thể cập nhật mã giảm giá. Vui lòng thử lại.';
        throw new Error(errorMessage);
    }
}

/**
 * Xóa mã giảm giá - Server version
 */
export async function deleteDiscountServer(id: string): Promise<void> {
    try {
        console.log(`[discountService] Deleting discount ${id} (server)`);

        const serverClient = await createServerApiClient();
        const response = await serverClient.delete<ApiResponse<SuperDiscount>>(`${baseURL}/${id}`);

        if (response.data?.statusCode === 200 || response.status === 200 || response.status === 204) {
            console.log(`[discountService] ✅ Discount deleted successfully (server): ${id}`);
            return;
        }

        throw new Error(`Invalid response status: ${response.status}`);
    } catch (error: any) {
        console.error(`[discountService] Error deleting discount ${id} (server):`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể xóa mã giảm giá';
        throw new Error(errorMessage);
    }
}

