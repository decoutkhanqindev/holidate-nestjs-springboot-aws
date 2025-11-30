// components/Admin/DiscountForm.tsx
"use client";

import { useFormStatus } from "react-dom";
import type { Discount } from "@/types"; // Import type

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
            {pending ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
        </button>
    );
}

// --- BẮT ĐẦU THAY ĐỔI ---
interface DiscountFormProps {
    onCancel: () => void;
    discount: Discount | null; // Thêm prop discount
}

// Helper để format ngày cho input type="date" (YYYY-MM-DD)
function formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}


export default function DiscountForm({ onCancel, discount }: DiscountFormProps) {
    const isEditing = !!discount;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const code = formData.get('code');

        if (isEditing) {
            alert(`(Giả lập) Đã cập nhật mã: ${code}`);
        } else {
            alert(`(Giả lập) Đã thêm mã: ${code}`);
        }

        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">Mã giảm giá</label>
                <input type="text" name="code" id="code" required
                    defaultValue={discount?.code || ''}
                    placeholder="VD: SUMMER2024"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">Giá trị giảm</label>
                    <input type="number" name="discountValue" id="discountValue" required
                        defaultValue={discount?.discountValue || ''}
                        placeholder="VD: 50000 hoặc 15"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">Loại giảm giá</label>
                    <select id="discountType" name="discountType"
                        defaultValue={discount?.discountType || 'AMOUNT'}
                        className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md">
                        <option value="AMOUNT">VND</option>
                        <option value="PERCENT">%</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">Ngày hết hạn</label>
                <input type="date" name="expiresAt" id="expiresAt" required
                    defaultValue={formatDateForInput(discount?.expiresAt)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>

            <div className="flex justify-end gap-4 pt-5 border-t border-gray-200">
                <button type="button" onClick={onCancel} className="py-2 px-6 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Hủy
                </button>
                <SubmitButton isEditing={isEditing} />
            </div>
        </form>
    );
}
// --- KẾT THÚC THAY ĐỔI ---