// src/app/(admin)/hotels/new/page.tsx
'use client';

import { PageHeader } from "@/components/Admin/ui/PageHeader";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { createHotel } from "@/lib/AdminAPI/hotelService";

export default function NewHotelPage() {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // TODO: Thêm validation
            await createHotel({ name, address, status: 'PENDING' });
            alert('Tạo khách sạn thành công!');
            router.push('/hotels');
        } catch (error) {
            alert('Có lỗi xảy ra!');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <PageHeader title="Thêm khách sạn mới" />
            <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên khách sạn</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
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
                        required
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu khách sạn'}
                    </button>
                </div>
            </form>
        </div>
    );
}