// lib/AdminAPI/hotelAdminService.ts
import type { HotelAdmin } from '@/types';

const sampleHotelAdmins: HotelAdmin[] = [
    { id: 101, username: 'admin_saigon', email: 'admin@grandsaigon.com', managedHotel: { id: 'hotel-001', name: 'Grand Saigon' }, status: 'ACTIVE', createdAt: new Date('2023-01-15') },
    { id: 102, username: 'manager_hanoi', email: 'manager@pearlhanoi.com', managedHotel: { id: 'hotel-002', name: 'Hanoi Pearl' }, status: 'ACTIVE', createdAt: new Date('2023-02-20') },
    { id: 103, username: 'danang_host', email: 'host@furama.com', managedHotel: { id: 'hotel-003', name: 'Furama Resort Danang' }, status: 'INACTIVE', createdAt: new Date('2023-03-10') },
    { id: 104, username: 'the_reverie_admin', email: 'admin@reverie.com', managedHotel: { id: 'hotel-004', name: 'The Reverie Saigon' }, status: 'ACTIVE', createdAt: new Date('2023-05-01') },
    { id: 105, username: 'intercon_manager', email: 'manager@intercon.com', managedHotel: { id: 'hotel-005', name: 'InterContinental Hanoi' }, status: 'ACTIVE', createdAt: new Date('2023-06-22') },
];

// Hàm lấy dữ liệu admin khách sạn theo trang
export async function getHotelAdmins({ page = 1, limit = 5 }: { page: number; limit: number; }) {
    await new Promise(resolve => setTimeout(resolve, 400)); // Giả lập độ trễ

    const totalItems = sampleHotelAdmins.length;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = sampleHotelAdmins.slice(start, end);

    return {
        data: paginatedData,
        totalPages: totalPages,
        currentPage: page,
    };
}