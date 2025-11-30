// components/Admin/DiscountFormModal.tsx
"use client";

import DiscountForm from "./DiscountForm";
import type { Discount } from '@/types'; // Import type

// --- BẮT ĐẦU THAY ĐỔI ---
interface DiscountFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    discount: Discount | null; // Thêm prop discount
}

export default function DiscountFormModal({ isOpen, onClose, discount }: DiscountFormModalProps) {
    // --- KẾT THÚC THAY ĐỔI ---
    if (!isOpen) return null;

    const isEditing = !!discount; // Kiểm tra xem có đang sửa hay không

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 m-4 animate-fade-in-down">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditing ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full text-2xl leading-none">&times;</button>
                </div>
                {/* Truyền discount xuống Form */}
                <DiscountForm onCancel={onClose} discount={discount} />
            </div>
        </div>
    );
}