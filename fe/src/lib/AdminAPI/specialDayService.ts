// lib/AdminAPI/specialDayService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";

const baseURL = '/special-days';

export interface SpecialDay {
    id: string;
    date: string; // ISO format: YYYY-MM-DD
    name: string;
}

export interface CreateSpecialDayPayload {
    date: string; // ISO format: YYYY-MM-DD
    name: string;
}

export interface UpdateSpecialDayPayload {
    date?: string; // ISO format: YYYY-MM-DD
    name?: string;
}

/**
 * Lấy tất cả special days
 */
export const getAllSpecialDays = async (): Promise<SpecialDay[]> => {
    try {
        const response = await apiClient.get<ApiResponse<SpecialDay[]>>(baseURL);

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        console.error("[specialDayService] Error fetching special days:", error);
        return [];
    }
};

/**
 * Tạo special day mới
 */
export const createSpecialDay = async (payload: CreateSpecialDayPayload): Promise<SpecialDay | null> => {
    try {
        console.log("[specialDayService] Creating special day with payload:", payload);
        
        const response = await apiClient.post<ApiResponse<SpecialDay>>(baseURL, payload);

        console.log("[specialDayService] Response received:", {
            status: response.status,
            statusCode: response.data?.statusCode,
            message: response.data?.message,
            hasData: !!response.data?.data,
        });

        // Kiểm tra status code HTTP
        if (response.status === 200 || response.status === 201) {
            // Kiểm tra statusCode trong response body
            if (response.data.statusCode === 200 && response.data.data) {
                return response.data.data;
            }
            // Nếu statusCode không phải 200, nhưng HTTP status là 200/201
            if (response.data.data) {
                return response.data.data;
            }
            // Nếu không có data nhưng có message, có thể là lỗi
            if (response.data.message && response.data.statusCode !== 200) {
                const error = new Error(response.data.message);
                (error as any).response = response;
                throw error;
            }
        }

        // Nếu response không có statusCode 200 hoặc không có data
        const errorMsg = response.data?.message || response.data?.error || 'Invalid response from server';
        const error = new Error(errorMsg);
        (error as any).response = response;
        throw error;
    } catch (error: any) {
        console.error("[specialDayService] Error creating special day:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            payload: payload,
        });
        // Giữ nguyên error để action có thể xử lý
        throw error;
    }
};

/**
 * Cập nhật special day
 */
export const updateSpecialDay = async (id: string, payload: UpdateSpecialDayPayload): Promise<SpecialDay | null> => {
    try {
        const response = await apiClient.put<ApiResponse<SpecialDay>>(`${baseURL}/${id}`, payload);

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return null;
    } catch (error: any) {
        console.error("[specialDayService] Error updating special day:", error);
        throw error;
    }
};

/**
 * Xóa special day
 */
export const deleteSpecialDay = async (id: string): Promise<SpecialDay | null> => {
    try {
        const response = await apiClient.delete<ApiResponse<SpecialDay>>(`${baseURL}/${id}`);

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return null;
    } catch (error: any) {
        console.error("[specialDayService] Error deleting special day:", error);
        throw error;
    }
};

