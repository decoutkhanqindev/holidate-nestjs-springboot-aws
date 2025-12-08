// lib/AdminAPI/bedTypeService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";
import { createServerApiClient } from "./serverApiClient";

export interface BedType {
    id: string;
    name: string;
}

/**
 * Normalize bedType name để matching tốt hơn
 * - Loại bỏ số ở đầu (1, 2, ...)
 * - Normalize khoảng trắng
 * - Lowercase
 */
function normalizeBedTypeName(name: string): string {
    return name
        .trim()
        .replace(/^\d+\s*/, '') // Loại bỏ số ở đầu (1, 2, ...)
        .replace(/\s+/g, ' ') // Normalize khoảng trắng
        .toLowerCase();
}

/**
 * So sánh 2 bedType names với fuzzy matching
 * - Exact match (case-insensitive)
 * - Normalized match (loại bỏ số ở đầu)
 * - Partial match (một tên chứa tên kia)
 * - Word-based match (có chung từ khóa quan trọng)
 */
function bedTypeNamesMatch(name1: string, name2: string): boolean {
    const normalized1 = normalizeBedTypeName(name1);
    const normalized2 = normalizeBedTypeName(name2);
    
    // Exact match (sau khi normalize)
    if (normalized1 === normalized2) {
        return true;
    }
    
    // Partial match - một tên chứa tên kia (ít nhất 70% ký tự giống)
    const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
    const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
    
    if (longer.includes(shorter) && shorter.length >= longer.length * 0.7) {
        return true;
    }
    
    // Word-based match - có chung từ khóa quan trọng (loại bỏ từ phổ biến như "giường", "đôi", "đơn")
    const commonWords = ['giường', 'bed', 'đôi', 'đơn', 'single', 'double', 'king', 'queen'];
    const words1 = normalized1.split(/\s+/).filter(w => w.length > 2 && !commonWords.includes(w));
    const words2 = normalized2.split(/\s+/).filter(w => w.length > 2 && !commonWords.includes(w));
    
    if (words1.length > 0 && words2.length > 0) {
        const commonWordCount = words1.filter(w => words2.includes(w)).length;
        const totalUniqueWords = new Set([...words1, ...words2]).size;
        if (commonWordCount > 0 && commonWordCount / totalUniqueWords >= 0.5) {
            return true;
        }
    }
    
    return false;
}

/**
 * Tìm bedType ID từ tên bằng cách query rooms từ TẤT CẢ hotels
 * Note: Đây là workaround vì không có API để query bedTypes trực tiếp
 */
export const findBedTypeIdByName = async (bedTypeName: string, hotelId?: string): Promise<string | null> => {
    try {

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
                            if (bedTypeNamesMatch(existingBedTypeName, bedTypeName)) {
                                return roomDetails.bedType.id;
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            } catch (error) {
            }
        }

        // Bước 2: Nếu không tìm thấy, query từ tất cả hotels
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
                            if (bedTypeNamesMatch(existingBedTypeName, bedTypeName)) {
                                console.log(`[bedTypeService] Found bedType ID in hotel ${hotel.id}: ${roomDetails.bedType.id} (matched "${existingBedTypeName}" with "${bedTypeName}")`);
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

        return null;
    } catch (error: any) {
        return null;
    }
};

/**
 * Lấy danh sách bedTypes có sẵn trong hệ thống (query từ tất cả rooms)
 * Dùng để hiển thị cho user chọn
 * Note: Backend không có endpoint riêng để lấy tất cả bed types, nên phải query từ rooms
 * Cải thiện: Query nhiều hotels và rooms hơn để lấy được TẤT CẢ bed types trong database
 */
export const getAvailableBedTypes = async (hotelId?: string): Promise<BedType[]> => {
    try {
        const bedTypesMap = new Map<string, BedType>(); // Map id -> BedType để tránh duplicate

        // Query từ nhiều hotels để lấy được tất cả bed types có sẵn
        const { getHotels } = await import('./hotelService');
        
        // Lấy TẤT CẢ hotels để đảm bảo lấy được tất cả bed types
        // Tăng số lượng lớn để lấy được tất cả
        const hotelsResult = await getHotels(0, 10000); // Lấy tối đa 10000 hotels để đảm bảo lấy được tất cả

        const { getRoomsByHotelId, getRoomById } = await import('./roomService');

        // Query từ tất cả hotels để lấy bed types
        let processedHotels = 0;
        let processedRooms = 0;
        const maxRoomsPerHotel = 10000; // Tăng lên 10000 rooms mỗi hotel
        
        // Xử lý song song một số hotels để tăng tốc độ
        const batchSize = 10; // Xử lý 10 hotels cùng lúc
        for (let i = 0; i < hotelsResult.hotels.length; i += batchSize) {
            const hotelBatch = hotelsResult.hotels.slice(i, i + batchSize);
            
            // Xử lý song song batch hotels
            await Promise.all(
                hotelBatch.map(async (hotel) => {
                    try {
                        // Lấy tất cả rooms của mỗi hotel
                        const roomsResult = await getRoomsByHotelId(hotel.id, 0, maxRoomsPerHotel);
                        
                        // Xử lý song song một số rooms để tăng tốc độ
                        const roomBatchSize = 20; // Xử lý 20 rooms cùng lúc
                        for (let j = 0; j < roomsResult.rooms.length; j += roomBatchSize) {
                            const roomBatch = roomsResult.rooms.slice(j, j + roomBatchSize);
                            
                            await Promise.all(
                                roomBatch.map(async (room) => {
                    try {
                        const roomDetails = await getRoomById(room.id);
                        if (roomDetails?.bedType) {
                            bedTypesMap.set(roomDetails.bedType.id, {
                                id: roomDetails.bedType.id,
                                name: roomDetails.bedType.name
                            });
                                            processedRooms++;
                                        }
                                    } catch (error) {
                                        // Ignore errors for individual rooms
                                    }
                                })
                            );
                        }
                        processedHotels++;
                        
                        // Log tiến độ mỗi 50 hotels
                        if (processedHotels % 50 === 0) {
                        }
                    } catch (error) {
                        // Ignore errors for individual hotels
                        processedHotels++;
                    }
                })
            );
        }


        // Sắp xếp theo tên (tiếng Việt)
        const bedTypes = Array.from(bedTypesMap.values()).sort((a, b) => 
            a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
        );

        
        return bedTypes;
    } catch (error: any) {
        return [];
    }
};

/**
 * Tạo bedType mới với tên cho trước
 * Note: Backend không có API tạo bedType, nhưng có thể tạo trực tiếp qua repository
 * Workaround: Tạo một room tạm để backend tự động tạo bedType, sau đó xóa room đó
 * HOẶC: Tìm bedType theo name và nếu không có thì tạo mới
 */
async function createBedTypeByName(bedTypeName: string): Promise<string | null> {
    try {
        
        // Backend không có API tạo bedType trực tiếp
        // Nhưng có thể tạo bedType thông qua việc tạo room với bedTypeName mới
        // Tuy nhiên, backend yêu cầu bedTypeId, không phải bedTypeName
        
        // Vì không có API tạo bedType, không thể tạo từ frontend
        // Cần backend hỗ trợ API tạo bedType hoặc tự động tạo khi không tìm thấy
        
        return null;
    } catch (error: any) {
        return null;
    }
}

/**
 * Tìm hoặc tạo bedType theo tên
 * - Tìm bedType theo name (fuzzy match)
 * - Nếu không tìm thấy, tạo bedType mới (nếu có thể)
 * - Nếu không thể tạo, gợi ý các bedType tương tự
 */
export const findOrCreateBedTypeByName = async (bedTypeName: string, hotelId: string): Promise<string> => {
    try {
        const trimmedName = bedTypeName.trim();
        if (!trimmedName) {
            throw new Error('Tên loại giường không được để trống');
        }

        // Bước 1: Tìm bedType ID từ tên (tìm trong tất cả hotels) với fuzzy matching
        const bedTypeId = await findBedTypeIdByName(trimmedName, hotelId);

        if (bedTypeId) {
            return bedTypeId;
        }

        // Bước 2: Nếu không tìm thấy, thử tạo bedType mới
        // Lưu ý: Backend không có API tạo bedType, nên không thể tạo từ frontend
        // Nhưng có thể thử tìm lại với các biến thể của tên

        // Bước 3: Tìm các bedType tương tự để gợi ý
        const availableBedTypes = await getAvailableBedTypes(hotelId);
        
        // Tìm các bedType tương tự (có chứa một phần của tên)
        const normalizedInput = normalizeBedTypeName(trimmedName);
        const similarBedTypes = availableBedTypes.filter(bt => {
            const normalized = normalizeBedTypeName(bt.name);
            // Tìm các bedType có chứa từ khóa hoặc ngược lại
            return normalized.includes(normalizedInput) || 
                   normalizedInput.includes(normalized) ||
                   normalized.split(' ').some(word => word.length > 2 && normalizedInput.includes(word)) ||
                   normalizedInput.split(' ').some(word => word.length > 2 && normalized.includes(word));
        }).slice(0, 5); // Lấy 5 cái tương tự nhất

        // Bước 4: Thử tìm lại với các biến thể của tên (trước khi hiển thị error)
        // Ví dụ: "1 Giường đôi lớn" -> "Giường đôi lớn" -> "Giường đôi"
        const nameVariants = [
            trimmedName.replace(/^\d+\s*/, ''), // Loại bỏ số ở đầu
            trimmedName.replace(/\s+(lớn|nhỏ|vừa|king|queen|double|single)/i, ''), // Loại bỏ từ mô tả
            trimmedName.replace(/^\d+\s*/, '').replace(/\s+(lớn|nhỏ|vừa|king|queen|double|single)/i, ''), // Cả hai
        ].filter((v, i, arr) => arr.indexOf(v) === i && v.trim() !== '' && v !== trimmedName); // Loại bỏ duplicate, empty và trùng với tên gốc

        for (const variant of nameVariants) {
            const variantId = await findBedTypeIdByName(variant, hotelId);
            if (variantId) {
                return variantId;
            }
        }

        // Bước 5: Nếu vẫn không tìm thấy, hiển thị error với gợi ý
        let errorMessage = `Không tìm thấy loại giường "${trimmedName}" trong hệ thống.`;
        
        if (similarBedTypes.length > 0) {
            errorMessage += `\n\nCó thể bạn muốn dùng một trong các loại giường sau:\n${similarBedTypes.map(bt => `- ${bt.name}`).join('\n')}`;
            errorMessage += `\n\nHoặc vui lòng nhập chính xác tên loại giường có sẵn trong hệ thống.`;
        } else if (availableBedTypes.length > 0) {
            errorMessage += `\n\nCác loại giường có sẵn trong hệ thống:\n${availableBedTypes.slice(0, 10).map(bt => `- ${bt.name}`).join('\n')}`;
            errorMessage += `\n\nVui lòng chọn một trong các loại giường trên hoặc nhập chính xác tên loại giường.`;
        } else {
            errorMessage += `\n\nVui lòng kiểm tra lại tên loại giường hoặc liên hệ admin để được hỗ trợ.`;
        }

        throw new Error(errorMessage);
    } catch (error: any) {
        throw error;
    }
};
