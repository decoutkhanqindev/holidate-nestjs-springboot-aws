// components/AdminSuper/discounts/DiscountsTable.tsx
"use client";

import type { SuperDiscount } from '@/types';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

// Component con cho Status Badge
function StatusBadge({ active }: { active: boolean }) {
    return (
        <span className={`badge ${active ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'}`}>
            {active ? 'Đang hoạt động' : 'Vô hiệu hóa'}
        </span>
    );
}

// Component con cho Usage Status
function UsageStatus({ timesUsed, usageLimit }: { timesUsed: number; usageLimit: number }) {
    const isExhausted = timesUsed >= usageLimit;
    const percentage = (timesUsed / usageLimit) * 100;
    
    return (
        <div className="d-flex align-items-center gap-2">
            <span className={isExhausted ? 'text-danger' : 'text-muted'}>
                {timesUsed} / {usageLimit}
            </span>
            {isExhausted && (
                <span className="badge bg-warning-subtle text-warning-emphasis">Đã hết</span>
            )}
        </div>
    );
}

// Helper để format ngày
function formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

// Helper để format số tiền
function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
}

interface DiscountsTableProps {
    discounts: SuperDiscount[];
    onEdit: (discount: SuperDiscount) => void;
    onDelete: (id: string, code: string) => void;
}

export default function DiscountsTable({ discounts, onEdit, onDelete }: DiscountsTableProps) {
    return (
        <div className="card shadow-sm">
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th scope="col" className="p-3">Mã giảm giá</th>
                                <th scope="col" className="p-3">Mô tả</th>
                                <th scope="col" className="p-3">Giảm giá</th>
                                <th scope="col" className="p-3">Sử dụng</th>
                                <th scope="col" className="p-3">Đơn tối thiểu</th>
                                <th scope="col" className="p-3">Hiệu lực</th>
                                <th scope="col" className="p-3">Trạng thái</th>
                                <th scope="col" className="p-3 text-end">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center p-4 text-muted">
                                        Không có mã giảm giá nào
                                    </td>
                                </tr>
                            ) : (
                                discounts.map(discount => (
                                    <tr key={discount.id}>
                                        <td className="p-3">
                                            <code className="bg-light px-2 py-1 rounded">{discount.code}</code>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-dark" style={{ maxWidth: '200px' }}>
                                                {discount.description}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className="fw-semibold text-primary">
                                                {discount.percentage}%
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <UsageStatus timesUsed={discount.timesUsed} usageLimit={discount.usageLimit} />
                                        </td>
                                        <td className="p-3 text-muted">
                                            {formatPrice(discount.minBookingPrice)}
                                        </td>
                                        <td className="p-3 text-muted">
                                            <div className="small">
                                                <div>Từ: {formatDate(discount.validFrom)}</div>
                                                <div>Đến: {formatDate(discount.validTo)}</div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <StatusBadge active={discount.active} />
                                        </td>
                                        <td className="p-3 text-end">
                                            <button 
                                                onClick={() => onEdit(discount)} 
                                                className="btn btn-sm btn-outline-primary me-2" 
                                                title="Chỉnh sửa"
                                            >
                                                <FaPencilAlt />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(discount.id, discount.code)} 
                                                className="btn btn-sm btn-outline-danger" 
                                                title="Xóa"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}




