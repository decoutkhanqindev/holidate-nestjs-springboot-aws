// lib/AdminAPI/bookingService.ts
import type { Booking } from '@/types';

const sampleBookings: Booking[] = [
    { id: 1, customerName: 'TQD', roomNumbers: ['02'], checkInDate: new Date('2024-11-28'), checkOutDate: new Date('2024-11-29'), totalAmount: 1080000, paymentStatus: 'PAID', bookingStatus: 'COMPLETED' },
    { id: 2, customerName: 'taquangdung', roomNumbers: ['01'], checkInDate: new Date('2024-11-29'), checkOutDate: new Date('2024-11-29'), totalAmount: 2000000, paymentStatus: 'PAID', bookingStatus: 'COMPLETED' },
    { id: 3, customerName: 'Nguyễn Văn A', roomNumbers: ['12'], checkInDate: new Date('2024-12-05'), checkOutDate: new Date('2024-12-07'), totalAmount: 3500000, paymentStatus: 'UNPAID', bookingStatus: 'CONFIRMED' },
    { id: 4, customerName: 'Ta Quang Dũng', roomNumbers: ['03', '04'], checkInDate: new Date('2024-12-01'), checkOutDate: new Date('2024-12-02'), totalAmount: 1944000, paymentStatus: 'PAID', bookingStatus: 'COMPLETED' },
    { id: 5, customerName: 'Trần Thị B', roomNumbers: ['08'], checkInDate: new Date('2024-12-10'), checkOutDate: new Date('2024-12-11'), totalAmount: 950000, paymentStatus: 'PENDING', bookingStatus: 'PENDING' },
    { id: 6, customerName: 'Lê Văn C', roomNumbers: ['05'], checkInDate: new Date('2024-11-30'), checkOutDate: new Date('2024-12-03'), totalAmount: 4200000, paymentStatus: 'PAID', bookingStatus: 'CHECKED_IN' },
    { id: 7, customerName: 'Phạm Thị D', roomNumbers: ['15'], checkInDate: new Date('2024-12-15'), checkOutDate: new Date('2024-12-16'), totalAmount: 1100000, paymentStatus: 'UNPAID', bookingStatus: 'CANCELLED' },
];

// Hàm lấy dữ liệu đặt phòng theo trang
export async function getBookings({ page = 1, limit = 5 }: { page: number; limit: number; }) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const totalItems = sampleBookings.length;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = sampleBookings.slice(start, end);

    return {
        data: paginatedData,
        totalPages: totalPages,
        currentPage: page,
    };
}