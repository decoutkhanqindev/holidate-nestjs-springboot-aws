"use client";

import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Hotel } from "@/types";

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
            {pending ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Gửi duyệt')}
        </button>
    );
}

interface HotelFormProps {
    hotel?: Hotel | null;
    formAction: (formData: FormData) => void;
    // Thêm prop này để kiểm soát vai trò, ví dụ: isSuperAdmin={user.role === 'SUPER_ADMIN'}
    isSuperAdmin?: boolean;
}

export default function HotelForm({ hotel, formAction, isSuperAdmin = false }: HotelFormProps) {
    const isEditing = !!hotel;

    return (
        <div className="bg-white rounded-lg shadow-md mt-4">
            <form action={formAction} className="p-8 space-y-6">
                {/* ... Các trường STT, Tên, Địa chỉ, Mô tả giữ nguyên ... */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1"><label htmlFor="stt" className="block text-sm font-medium text-gray-700">Số thứ tự (STT)</label><input type="number" name="stt" id="stt" defaultValue={hotel?.stt || ''} placeholder="VD: 1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                    <div className="md:col-span-2"><label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên khách sạn</label><input type="text" name="name" id="name" required defaultValue={hotel?.name} placeholder="VD: Khách sạn Grand Saigon" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                </div>
                <div><label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label><input type="text" name="address" id="address" required defaultValue={hotel?.address} placeholder="VD: 123 Đồng Khởi, Q.1, TP.HCM" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" /></div>
                <div><label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label><textarea id="description" name="description" rows={4} defaultValue={hotel?.description || ''} placeholder="Mô tả ngắn về khách sạn..." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea></div>

                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Ảnh đại diện khách sạn
                    </label>
                    <div className="mt-2 flex items-center gap-x-4">
                        {/* Hiển thị ảnh cũ nếu đang sửa */}
                        {isEditing && hotel?.imageUrl && (
                            <img src={hotel.imageUrl} alt="Ảnh hiện tại" className="h-20 w-20 rounded-md object-cover" />
                        )}
                        <div className="flex text-sm text-gray-600">
                            <span>Tải ảnh lên</span>
                            <input id="image" name="image" type="file" className="sr-only" accept="image/*" />

                            <p className="pl-1">hoặc kéo và thả</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                </div>
                {isEditing && isSuperAdmin && (
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Trạng thái (chỉ Super Admin có thể sửa)
                        </label>
                        <select
                            id="status" name="status"
                            defaultValue={hotel?.status}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="ACTIVE">Đang hoạt động</option>
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="HIDDEN">Ẩn</option>
                        </select>
                    </div>
                )}

                {/* Hiển thị trạng thái hiện tại (chỉ đọc) cho admin thường khi sửa */}
                {isEditing && !isSuperAdmin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Trạng thái hiện tại</label>
                        <p className="mt-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600">
                            {hotel?.status === 'ACTIVE' ? 'Đã được duyệt' : hotel?.status === 'PENDING' ? 'Đang chờ duyệt' : 'Đã ẩn'}
                        </p>
                    </div>
                )}

                {/* Các nút hành động */}
                <div className="flex justify-end gap-4 pt-5 border-t border-gray-200">
                    <Link href="/admin-hotels" className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Hủy
                    </Link>
                    <SubmitButton isEditing={isEditing} />
                </div>
            </form>
        </div>
    );
}