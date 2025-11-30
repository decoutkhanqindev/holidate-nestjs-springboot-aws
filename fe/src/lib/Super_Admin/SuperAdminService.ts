// lib/AdminAPI/superAdminService.ts

// Dữ liệu mẫu cho dashboard
const dashboardData = {
    stats: {
        totalHotels: 125,
        totalUsers: 450,
        totalRevenue: 5450000000,
        pendingTickets: 3,
    },
    revenueByMonth: [
        { month: 'Thg 1', revenue: 450 },
        { month: 'Thg 2', revenue: 520 },
        { month: 'Thg 3', revenue: 680 },
        { month: 'Thg 4', revenue: 710 },
        { month: 'Thg 5', revenue: 850 },
        { month: 'Thg 6', revenue: 920 },
    ],
    userDistribution: {
        superAdmins: 5,
        hotelAdmins: 120,
        customers: 2325,
    },
    recentActivities: [
        { id: 1, type: 'NEW_HOTEL', description: 'Khách sạn "Grand Palace" vừa đăng ký.', time: '5 phút trước' },
        { id: 2, type: 'NEW_ADMIN', description: 'Tài khoản admin "admin_saigon" đã được tạo.', time: '1 giờ trước' },
        { id: 3, type: 'SUPPORT_TICKET', description: 'Có một ticket hỗ trợ mới.', time: '3 giờ trước' },
        { id: 4, type: 'HIGH_REVENUE', description: 'Khách sạn "The Reverie" đạt doanh thu cao.', time: 'Hôm qua' },
    ]
};

// Hàm lấy dữ liệu dashboard
export async function getSuperAdminDashboardData() {
    await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập độ trễ
    return dashboardData;
}