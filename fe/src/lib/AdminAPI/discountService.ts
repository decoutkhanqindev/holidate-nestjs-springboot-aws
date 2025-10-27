// lib/AdminAPI/discountService.ts
import type { Discount } from '@/types';

// Tăng số lượng dữ liệu mẫu để thấy rõ phân trang
const sampleDiscounts: Discount[] = [
    // ... (Thêm nhiều dữ liệu hơn nếu muốn, ở đây tôi copy lại 3 lần)
    { id: 'promo-001', code: 'SUMMER2024', discountValue: 15, discountType: 'PERCENT', expiresAt: new Date('2024-09-30T23:59:59'), createdAt: new Date() },
    { id: 'promo-002', code: 'WELCOME50K', discountValue: 50000, discountType: 'AMOUNT', expiresAt: new Date('2024-12-31T23:59:59'), createdAt: new Date() },
    { id: 'promo-003', code: 'FLASHSEP', discountValue: 100000, discountType: 'AMOUNT', expiresAt: new Date('2024-09-15T23:59:59'), createdAt: new Date() },
    { id: 'promo-004', code: 'NEWUSER10', discountValue: 10, discountType: 'PERCENT', expiresAt: new Date('2025-01-01T23:59:59'), createdAt: new Date() },
    { id: 'promo-005', code: 'DEAL20K', discountValue: 20000, discountType: 'AMOUNT', expiresAt: new Date('2024-10-31T23:59:59'), createdAt: new Date() },
    { id: 'promo-006', code: 'BIGSALE', discountValue: 25, discountType: 'PERCENT', expiresAt: new Date('2024-11-30T23:59:59'), createdAt: new Date() },
    { id: 'promo-007', code: 'SAVE100K', discountValue: 100000, discountType: 'AMOUNT', expiresAt: new Date('2024-10-10T23:59:59'), createdAt: new Date() },
];

// --- BẮT ĐẦU THAY ĐỔI ---
// Hàm lấy mã giảm giá THEO TRANG
export async function getDiscounts({ page = 1, limit = 5 }: { page: number; limit: number; }) {
    console.log(`Fetching discounts for page: ${page}, limit: ${limit}`);
    await new Promise(resolve => setTimeout(resolve, 300));

    const totalItems = sampleDiscounts.length;
    const totalPages = Math.ceil(totalItems / limit);

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = sampleDiscounts.slice(start, end);

    return {
        data: paginatedData,
        totalPages: totalPages,
        currentPage: page,
        totalItems: totalItems,
    };
}

export async function getDiscountById(id: string): Promise<Discount | null> {
    console.log(`Fetching discount with id: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const discount = sampleDiscounts.find(d => d.id === id);
    return discount || null;
}