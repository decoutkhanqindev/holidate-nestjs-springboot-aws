// lib/AdminAPI/policyService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";

const baseURL = '/policy';

export interface CancellationPolicy {
    id: string;
    name: string;
    description?: string;
    rules?: Array<{
        id: string;
        daysBeforeCheckIn: number;
        penaltyPercentage: number;
    }>;
}

export interface ReschedulePolicy {
    id: string;
    name: string;
    description?: string;
    rules?: Array<{
        id: string;
        daysBeforeCheckIn: number;
        feePercentage: number;
    }>;
}

export interface CancellationRule {
    id: string;
    name?: string;
    daysBeforeCheckIn: number;
    penaltyPercentage: number;
}

export interface RescheduleRule {
    id: string;
    name?: string;
    daysBeforeCheckIn: number;
    feePercentage: number;
}

export interface IdentificationDocument {
    id: string;
    name: string;
}

/**
 * Lấy tất cả cancellation policies
 */
export const getAllCancellationPolicies = async (): Promise<CancellationPolicy[]> => {
    try {
        const response = await apiClient.get<ApiResponse<CancellationPolicy[]>>(
            `${baseURL}/cancellation-policies`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        // Nếu API không tồn tại (404), chỉ warn thay vì error
        if (error?.response?.status === 404) {
            console.warn("[policyService] Cancellation policies API không tồn tại (404)");
        } else {
        }
        return [];
    }
};

/**
 * Lấy tất cả reschedule policies
 */
export const getAllReschedulePolicies = async (): Promise<ReschedulePolicy[]> => {
    try {
        const response = await apiClient.get<ApiResponse<ReschedulePolicy[]>>(
            `${baseURL}/reschedule-policies`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        // Nếu API không tồn tại (404), chỉ warn thay vì error
        if (error?.response?.status === 404) {
            console.warn("[policyService] Reschedule policies API không tồn tại (404)");
        } else {
        }
        return [];
    }
};

/**
 * Lấy tất cả cancellation rules
 */
export const getAllCancellationRules = async (): Promise<CancellationRule[]> => {
    try {
        const response = await apiClient.get<ApiResponse<CancellationRule[]>>(
            `${baseURL}/cancellation-rules`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        if (error?.response?.status === 404) {
            console.warn("[policyService] Cancellation rules API không tồn tại (404)");
        }
        return [];
    }
};

/**
 * Lấy tất cả reschedule rules
 */
export const getAllRescheduleRules = async (): Promise<RescheduleRule[]> => {
    try {
        const response = await apiClient.get<ApiResponse<RescheduleRule[]>>(
            `${baseURL}/reschedule-rules`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        if (error?.response?.status === 404) {
            console.warn("[policyService] Reschedule rules API không tồn tại (404)");
        }
        return [];
    }
};

/**
 * Lấy tất cả identification documents
 */
export const getAllIdentificationDocuments = async (): Promise<IdentificationDocument[]> => {
    try {
        const response = await apiClient.get<ApiResponse<IdentificationDocument[]>>(
            `/document/identification-documents`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        return [];
    }
};

