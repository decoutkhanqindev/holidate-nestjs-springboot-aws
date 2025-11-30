// lib/AdminAPI/partnerRoomService.ts
// Utility functions để lấy tất cả phòng của một partner theo email

import { getHotels } from './hotelService';
import { getRoomsByHotelId } from './roomService';
import { getHotelAdmins } from '@/lib/Super_Admin/hotelAdminService';
import type { Room } from '@/types';
import apiClient, { ApiResponse } from '@/service/apiClient';

interface PartnerRoomsResult {
    partner: {
        id: string;
        email: string;
        fullName: string;
    };
    hotels: Array<{
        id: string;
        name: string;
        rooms: Room[];
        totalRooms: number;
    }>;
    totalHotels: number;
    totalRooms: number;
}

/**
 * Lấy tất cả phòng của partner theo email
 * @param partnerEmail Email của partner (ví dụ: "partner_vt_6@gmail.com")
 * @returns Thông tin partner, danh sách hotels và rooms của họ
 */
export async function getAllRoomsByPartnerEmail(partnerEmail: string): Promise<PartnerRoomsResult> {
    try {
        console.log(`[partnerRoomService] Fetching all rooms for partner: ${partnerEmail}`);

        // Bước 1: Tìm partner theo email từ getHotelAdmins (không cần quyền ADMIN)
        let partner: { id: string; email: string; fullName: string } | null = null;
        
        try {
            const adminsResponse = await getHotelAdmins({ page: 1, limit: 1000 });
            const admins = adminsResponse.data || [];
            
            const foundAdmin = admins.find(
                admin => admin.email?.toLowerCase() === partnerEmail.toLowerCase()
            );
            
            if (foundAdmin) {
                partner = {
                    id: foundAdmin.userId || foundAdmin.id || '',
                    email: foundAdmin.email || partnerEmail,
                    fullName: foundAdmin.username || foundAdmin.fullName || foundAdmin.name || 'N/A'
                };
                console.log(`[partnerRoomService] Found partner from getHotelAdmins:`, partner);
            }
        } catch (error: any) {
            console.warn(`[partnerRoomService] getHotelAdmins failed (${error.response?.status}), trying alternative method...`, error);
        }

        // Nếu không tìm thấy từ getHotelAdmins, thử lấy tất cả hotels và tìm partner từ hotel detail
        if (!partner) {
            console.log(`[partnerRoomService] Trying to find partner from hotels...`);
            
            // Lấy tất cả hotels (không filter)
            let allHotelsTemp: any[] = [];
            let currentPage = 0;
            let hasMore = true;
            const maxPages = 10; // Giới hạn để tránh quá nhiều requests

            while (hasMore && currentPage < maxPages) {
                try {
                    const hotelsResponse = await getHotels(
                        currentPage,
                        100,
                        undefined,
                        undefined,
                        undefined,
                        undefined
                    );

                    allHotelsTemp = allHotelsTemp.concat(hotelsResponse.hotels || []);
                    hasMore = hotelsResponse.hasNext || false;
                    currentPage++;
                } catch (error: any) {
                    console.warn(`[partnerRoomService] Error fetching hotels page ${currentPage}:`, error);
                    hasMore = false;
                }
            }

            // Tìm hotel có partner email khớp
            for (const hotel of allHotelsTemp) {
                try {
                    // Fetch hotel detail để lấy partner info
                    const detailResponse = await apiClient.get(`/accommodation/hotels/${hotel.id}`);
                    const detailData = detailResponse.data?.data;

                    if (detailData?.partner?.email?.toLowerCase() === partnerEmail.toLowerCase()) {
                        partner = {
                            id: detailData.partner.id || '',
                            email: detailData.partner.email || partnerEmail,
                            fullName: detailData.partner.fullName || detailData.partner.name || 'N/A'
                        };
                        console.log(`[partnerRoomService] Found partner from hotel detail:`, partner);
                        break;
                    }
                } catch (error: any) {
                    // Bỏ qua lỗi khi fetch hotel detail
                    continue;
                }
            }
        }

        if (!partner || !partner.id) {
            throw new Error(`Không tìm thấy partner với email: ${partnerEmail}. Vui lòng kiểm tra lại email hoặc quyền truy cập.`);
        }

        // Bước 2: Lấy tất cả hotels của partner
        let allHotels: any[] = [];
        let currentPage = 0;
        let hasMore = true;
        const maxPages = 20; // Giới hạn để tránh quá nhiều requests

        while (hasMore && currentPage < maxPages) {
            try {
                const hotelsResponse = await getHotels(
                    currentPage,
                    100,
                    undefined,
                    undefined,
                    partner.id, // userId (partnerId)
                    'ADMIN' // roleName để filter theo partner-id
                );

                allHotels = allHotels.concat(hotelsResponse.hotels || []);
                hasMore = hotelsResponse.hasNext || false;
                currentPage++;
                
                console.log(`[partnerRoomService] Loaded ${allHotels.length} hotels so far...`);
            } catch (error: any) {
                if (error.response?.status === 403) {
                    console.warn(`[partnerRoomService] 403 Forbidden when fetching hotels. Trying without partner filter...`);
                    // Thử lấy tất cả hotels và filter ở frontend
                    hasMore = false;
                    try {
                        const allHotelsResponse = await getHotels(0, 1000, undefined, undefined, undefined, undefined);
                        allHotels = (allHotelsResponse.hotels || []).filter((hotel: any) => {
                            return hotel.ownerId === partner.id || 
                                   hotel.ownerEmail?.toLowerCase() === partnerEmail.toLowerCase();
                        });
                    } catch (err: any) {
                        throw new Error(`Không thể lấy danh sách hotels. Lỗi: ${err.message || '403 Forbidden'}`);
                    }
                } else {
                    throw error;
                }
            }
        }

        console.log(`[partnerRoomService] Total hotels found: ${allHotels.length}`);

        // Bước 3: Lấy tất cả rooms của từng hotel
        const hotelsWithRooms = await Promise.all(
            allHotels.map(async (hotel) => {
                let allRooms: Room[] = [];
                let currentPage = 0;
                let hasMore = true;

                while (hasMore) {
                    try {
                        const roomsResponse = await getRoomsByHotelId(hotel.id, currentPage, 1000);
                        allRooms = allRooms.concat(roomsResponse.rooms || []);
                        
                        hasMore = roomsResponse.hasNext || false;
                        currentPage++;
                    } catch (error: any) {
                        console.warn(`[partnerRoomService] Error fetching rooms for hotel ${hotel.id}:`, error);
                        hasMore = false; // Dừng nếu có lỗi
                    }
                }

                const totalRooms = allRooms.reduce((sum, room) => sum + (room.quantity || 0), 0);

                console.log(`[partnerRoomService] Hotel "${hotel.name}": ${allRooms.length} room types, ${totalRooms} total rooms`);

                return {
                    id: hotel.id,
                    name: hotel.name,
                    rooms: allRooms,
                    totalRooms: totalRooms
                };
            })
        );

        // Tính tổng số phòng
        const totalRooms = hotelsWithRooms.reduce((sum, hotel) => sum + hotel.totalRooms, 0);

        const result: PartnerRoomsResult = {
            partner: {
                id: partner.id,
                email: partner.email,
                fullName: partner.fullName
            },
            hotels: hotelsWithRooms,
            totalHotels: hotelsWithRooms.length,
            totalRooms: totalRooms
        };

        console.log(`[partnerRoomService] ✅ Complete! Partner has ${result.totalHotels} hotels with ${result.totalRooms} total rooms`);

        return result;
    } catch (error: any) {
        console.error(`[partnerRoomService] Error fetching rooms for partner ${partnerEmail}:`, error);
        
        // Xử lý lỗi 403 một cách rõ ràng
        if (error.response?.status === 403) {
            throw new Error(`403 Forbidden: Bạn không có quyền truy cập API này. Vui lòng đăng nhập với tài khoản ADMIN hoặc kiểm tra quyền truy cập.`);
        }
        
        // Xử lý các lỗi khác
        const errorMessage = error.message || 'Không thể lấy dữ liệu phòng';
        throw new Error(errorMessage);
    }
}

/**
 * In ra console tất cả phòng của partner (để debug)
 */
export async function logAllRoomsByPartnerEmail(partnerEmail: string): Promise<void> {
    try {
        const result = await getAllRoomsByPartnerEmail(partnerEmail);
        
        console.log('\n========================================');
        console.log(`📊 TẤT CẢ PHÒNG CỦA PARTNER: ${result.partner.email}`);
        console.log('========================================');
        console.log(`Partner: ${result.partner.fullName} (${result.partner.email})`);
        console.log(`Tổng số khách sạn: ${result.totalHotels}`);
        console.log(`Tổng số phòng: ${result.totalRooms}`);
        console.log('\n--- Chi tiết từng khách sạn ---\n');

        result.hotels.forEach((hotel, index) => {
            console.log(`${index + 1}. ${hotel.name} (ID: ${hotel.id})`);
            console.log(`   Tổng số phòng: ${hotel.totalRooms}`);
            console.log(`   Số loại phòng: ${hotel.rooms.length}`);
            
            hotel.rooms.forEach((room, roomIndex) => {
                console.log(`   ${roomIndex + 1}. ${room.name}`);
                console.log(`      - Số lượng: ${room.quantity || 0}`);
                console.log(`      - Trạng thái: ${room.status || 'N/A'}`);
                console.log(`      - Giá: ${room.basePricePerNight?.toLocaleString('vi-VN') || 'N/A'} VND/đêm`);
            });
            console.log('');
        });

        console.log('========================================\n');
    } catch (error: any) {
        console.error(`[partnerRoomService] Error logging rooms:`, error);
        throw error;
    }
}

