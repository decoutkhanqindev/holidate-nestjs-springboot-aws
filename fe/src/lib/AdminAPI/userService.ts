// lib/AdminAPI/userService.ts
import type { User } from '@/types';

// Giả lập người dùng đang đăng nhập là một HOTEL_ADMIN
export const getCurrentUser = (): User => ({
    id: 2,
    username: 'hotel_admin_user',
    email: 'admin@hotel.com',
    avatarUrl: '/avatars/admin.png',
    role: 'HOTEL_ADMIN',
    status: 'ACTIVE',
});

// Dữ liệu mẫu toàn bộ hệ thống
const allUsers: User[] = [
    { id: 1, username: 'superadmin', email: 'super@app.com', avatarUrl: '/avatars/super.png', role: 'SUPER_ADMIN', status: 'ACTIVE' },
    { id: 2, username: 'hotel_admin_user', email: 'admin@hotel.com', avatarUrl: '/avatars/admin.png', role: 'HOTEL_ADMIN', status: 'ACTIVE' },
    { id: 3, username: 'receptionist_01', email: 'reception@hotel.com', avatarUrl: '/avatars/staff1.png', role: 'HOTEL_STAFF', status: 'ACTIVE' },
    { id: 4, username: 'dung', email: 'taquangdung050503@gmail.com', avatarUrl: '/avatars/customer1.png', role: 'CUSTOMER', status: 'ACTIVE' },
    { id: 5, username: 'another_hotel_admin', email: 'other@hotel.com', avatarUrl: '/avatars/admin2.png', role: 'HOTEL_ADMIN', status: 'INACTIVE' },
    { id: 6, username: 'staff_02', email: 'staff2@hotel.com', avatarUrl: '/avatars/staff2.png', role: 'HOTEL_STAFF', status: 'INACTIVE' },
    { id: 7, username: 'customer_vip', email: 'vip@gmail.com', avatarUrl: '/avatars/customer2.png', role: 'CUSTOMER', status: 'ACTIVE' },
];

// Hàm lấy người dùng với logic phân quyền
export async function getUsers({ page = 1, limit = 5 }: { page: number; limit: number; }) {
    const currentUser = getCurrentUser();

    // LOGIC PHÂN QUYỀN: HOTEL_ADMIN chỉ thấy người dùng có vai trò thấp hơn
    const viewableUsers = allUsers.filter(user =>
        user.role === 'HOTEL_STAFF' || user.role === 'CUSTOMER'
    );

    // Logic phân trang
    const totalItems = viewableUsers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = viewableUsers.slice(start, end);

    return {
        data: paginatedData,
        totalPages,
        currentPage: page,
    };
}