// lib/AdminAPI/roomInventoryService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";
import { createServerApiClient } from "./serverApiClient";

const baseURL = '/accommodation/rooms/inventories';

export interface RoomInventory {
    id: string;
    roomId: string;
    date: string; // ISO date format
    price: number;
    availableQuantity: number;
    status: string;
}

export interface PaginatedRoomInventoryResponse {
    content: RoomInventory[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface GetRoomInventoriesParams {
    roomId: string;
    startDate: string; // ISO date format YYYY-MM-DD
    endDate: string; // ISO date format YYYY-MM-DD
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
}

export interface PaginatedRoomInventoriesResult {
    inventories: RoomInventory[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

/**
 * Lấy danh sách room inventories theo roomId, startDate, endDate
 */
export const getRoomInventories = async (
    params: GetRoomInventoriesParams
): Promise<PaginatedRoomInventoriesResult> => {
    try {

        // Backend sử dụng kebab-case query params
        const queryParams: any = {
            'room-id': params.roomId.trim(),
            'start-date': params.startDate, // ISO date format YYYY-MM-DD
            'end-date': params.endDate,     // ISO date format YYYY-MM-DD
            page: params.page || 0,
            size: params.size || 10,
            'sort-dir': params.sortDir || 'ASC'
        };

        if (params.status && params.status.trim() !== '') {
            queryParams.status = params.status.trim();
        }
        if (params.sortBy && params.sortBy.trim() !== '') {
            queryParams['sort-by'] = params.sortBy.trim();
        }

        console.log("[roomInventoryService] Request params:", JSON.stringify(queryParams, null, 2));

        const response = await apiClient.get<ApiResponse<PaginatedRoomInventoryResponse>>(
            baseURL,
            {
                params: queryParams
            }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return {
                inventories: response.data.data.content,
                page: response.data.data.page,
                size: response.data.data.size,
                totalItems: response.data.data.totalItems,
                totalPages: response.data.data.totalPages,
                first: response.data.data.first,
                last: response.data.data.last,
                hasNext: response.data.data.hasNext,
                hasPrevious: response.data.data.hasPrevious,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tải thông tin tồn phòng';
        throw new Error(errorMessage);
    }
};

/**
 * Lấy tồn phòng hôm nay cho một room (hoặc tổng hợp cho nhiều room)
 */
export const getTodayRoomInventory = async (
    roomId: string
): Promise<RoomInventory | null> => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        const result = await getRoomInventories({
            roomId,
            startDate: today,
            endDate: today,
            size: 1
        });

        if (result.inventories.length > 0) {
            return result.inventories[0];
        }

        return null;
    } catch (error: any) {
        return null;
    }
};

/**
 * Lấy tồn phòng cho nhiều rooms cùng lúc (hôm nay)
 */
export const getTodayInventoriesForRooms = async (
    roomIds: string[]
): Promise<Map<string, RoomInventory>> => {
    const inventoryMap = new Map<string, RoomInventory>();
    const today = new Date().toISOString().split('T')[0];

    // Fetch inventories cho tất cả rooms (có thể tối ưu thành batch request nếu API hỗ trợ)
    const promises = roomIds.map(async (roomId) => {
        try {
            const inventory = await getTodayRoomInventory(roomId);
            if (inventory) {
                inventoryMap.set(roomId, inventory);
            }
        } catch (error) {
        }
    });

    await Promise.all(promises);
    return inventoryMap;
};

/**
 * Tạo room inventory (POST)
 */
export interface CreateRoomInventoryRequest {
    roomId: string;
    days: number; // Số ngày cần tạo inventory (từ hôm nay)
}

export const createRoomInventory = async (
    request: CreateRoomInventoryRequest
): Promise<PaginatedRoomInventoriesResult> => {
    try {

        const response = await apiClient.post<ApiResponse<PaginatedRoomInventoryResponse>>(
            baseURL,
            {
                roomId: request.roomId.trim(),
                days: request.days
            }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return {
                inventories: response.data.data.content,
                page: response.data.data.page,
                size: response.data.data.size,
                totalItems: response.data.data.totalItems,
                totalPages: response.data.data.totalPages,
                first: response.data.data.first,
                last: response.data.data.last,
                hasNext: response.data.data.hasNext,
                hasPrevious: response.data.data.hasPrevious,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo tồn phòng';
        throw new Error(errorMessage);
    }
};

