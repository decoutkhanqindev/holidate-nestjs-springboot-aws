// components/Admin/DiscountsTable.tsx
"use client";

import { useTransition } from 'react';
// Bỏ Link vì không cần chuyển trang nữa
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Discount } from '@/types';

function formatDiscountValue(value: number, type: 'PERCENT' | 'AMOUNT') {
    if (type === 'PERCENT') return `${value}%`;
    return `${value.toLocaleString('vi-VN')} VND`;
}

// --- BẮT ĐẦU THAY ĐỔI ---
interface DiscountsTableProps {
    discounts: Discount[];
    onEdit: (discount: Discount) => void; // Thêm prop onEdit
}

export default function DiscountsTable({ discounts, onEdit }: DiscountsTableProps) {
    // --- KẾT THÚC THAY ĐỔI ---
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string, code: string) => {
        if (confirm(`Bạn có chắc chắn muốn xóa mã "${code}" không?`)) {
            startTransition(async () => {
                alert(`(Giả lập) Đã xóa mã giảm giá có ID: ${id}`);
            });
        }
    };

    return (
        <div className={`mt-6 bg-white rounded-lg shadow-md overflow-hidden transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* thead giữ nguyên */}
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm giá</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày hết hạn</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {discounts.map((discount) => (
                            <tr key={discount.id} className="hover:bg-gray-50">
                                {/* các td khác giữ nguyên */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{discount.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{discount.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                    {formatDiscountValue(discount.discountValue, discount.discountType)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(discount.expiresAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap  text-sm font-medium">
                                    <div className="inline-flex items-center gap-x-5">
                                        <button
                                            onClick={() => onEdit(discount)}
                                            className="text-indigo-600 hover:text-indigo-800"
                                            title="Chỉnh sửa"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(discount.id, discount.code)} disabled={isPending} className="text-red-600 hover:text-red-800 disabled:text-gray-400" title="Xóa">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}