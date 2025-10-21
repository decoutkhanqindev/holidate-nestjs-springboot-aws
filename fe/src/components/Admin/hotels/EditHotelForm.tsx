// src/components/admin/hotels/EditHotelForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/Admin/ui/PageHeader';
import { Hotel } from '@/types';
import { updateHotel } from '@/lib/AdminAPI/hotelService';

interface EditHotelFormProps {
    hotel: Hotel;
}

export default function EditHotelForm({ hotel }: EditHotelFormProps) {
    const [name, setName] = useState(hotel.name);
    const [address, setAddress] = useState(hotel.address);
    const [status, setStatus] = useState(hotel.status);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateHotel(hotel.id, { name, address, status });
            alert('Cập nhật thành công!');
            router.push('/hotels');
            router.refresh(); // Làm mới data ở trang hotels
        } catch (error) {
            alert('Có lỗi xảy ra!');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <PageHeader title={`Chỉnh sửa: ${hotel.name}`} />
            <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên khách sạn</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Hotel['status'])}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="HIDDEN">Ẩn</option>
                    </select>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}