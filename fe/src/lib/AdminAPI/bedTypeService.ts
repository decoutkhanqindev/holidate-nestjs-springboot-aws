// lib/AdminAPI/bedTypeService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";
import { createServerApiClient } from "./serverApiClient";

export interface BedType {
    id: string;
    name: string;
}

/**
 * Tìm bedType ID từ tên bằng cách query rooms từ TẤT CẢ hotels
 * Note: Đây là workaround vì không có API để query bedTypes trực tiếp
 */
export const findBedTypeIdByName = async (bedTypeName: string, hotelId?: string): Promise<string | null> => {
    try {
        console.log(`[bedTypeService] Finding bedType ID by name: "${bedTypeName}"`);

        // Bước 1: Thử tìm trong rooms của hotel hiện tại trước
        if (hotelId) {
            try {
                const { getRoomsByHotelId } = await import('./roomService');
                const roomsResult = await getRoomsByHotelId(hotelId, 0, 100);

                const { getRoomById } = await import('./roomService');
                for (const room of roomsResult.rooms.slice(0, 10)) {
                    try {
                        const roomDetails = await getRoomById(room.id);
                        if (roomDetails?.bedType) {
                            const existingBedTypeName = roomDetails.bedType.name;
                            if (existingBedTypeName.trim().toLowerCase() === bedTypeName.trim().toLowerCase()) {
                                console.log(`[bedTypeService] Found bedType ID in hotel ${hotelId}: ${roomDetails.bedType.id}`);
                                return roomDetails.bedType.id;
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            } catch (error) {
                console.warn(`[bedTypeService] Could not query rooms from hotel ${hotelId}`);
            }
        }

        // Bước 2: Nếu không tìm thấy, query từ tất cả hotels
        console.log(`[bedTypeService] Searching in all hotels...`);
        const { getHotels } = await import('./hotelService');

        // Query một số hotels đầu tiên để tìm bedTypes
        const hotelsResult = await getHotels(0, 20); // Lấy 20 hotels đầu

        const { getRoomsByHotelId, getRoomById } = await import('./roomService');

        for (const hotel of hotelsResult.hotels.slice(0, 10)) { // Chỉ check 10 hotels đầu
            try {
                const roomsResult = await getRoomsByHotelId(hotel.id, 0, 10); // Mỗi hotel lấy 10 rooms đầu

                for (const room of roomsResult.rooms.slice(0, 5)) { // Chỉ check 5 rooms đầu mỗi hotel
                    try {
                        const roomDetails = await getRoomById(room.id);
                        if (roomDetails?.bedType) {
                            const existingBedTypeName = roomDetails.bedType.name;
                            if (existingBedTypeName.trim().toLowerCase() === bedTypeName.trim().toLowerCase()) {
                                console.log(`[bedTypeService] Found bedType ID in hotel ${hotel.id}: ${roomDetails.bedType.id}`);
                                return roomDetails.bedType.id;
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            } catch (error) {
                continue;
            }
        }

        console.warn(`[bedTypeService] BedType "${bedTypeName}" not found in any rooms`);
        return null;
    } catch (error: any) {
        console.error("[bedTypeService] Error finding bedType ID:", error);
        return null;
    }
};

/**
 * Tìm hoặc tạo bedType theo tên
 * Tìm bedType ID từ tên bằng cách query rooms từ tất cả hotels
 * Nếu không tìm thấy, throw error vì không có API để tạo bedType mới
 */
export const findOrCreateBedTypeByName = async (bedTypeName: string, hotelId: string): Promise<string> => {
    try {
        // Tìm bedType ID từ tên (tìm trong tất cả hotels)
        const bedTypeId = await findBedTypeIdByName(bedTypeName.trim(), hotelId);

        if (bedTypeId) {
            return bedTypeId;
        }

        // Nếu không tìm thấy, throw error vì không có API để tạo bedType mới
        throw new Error(
            `Loại giường "${bedTypeName}" chưa tồn tại trong hệ thống. ` +
            `Vui lòng sử dụng một loại giường có sẵn hoặc liên hệ admin để tạo loại giường mới trước. ` +
            `\n\nCác loại giường phổ biến: "Giường đôi", "Giường King (cỡ lớn)", "2 giường đơn", "Giường đơn", "Giường Queen", ...`
        );
    } catch (error: any) {
        console.error("[bedTypeService] Error finding or creating bedType:", error);
        throw error;
    }
};
