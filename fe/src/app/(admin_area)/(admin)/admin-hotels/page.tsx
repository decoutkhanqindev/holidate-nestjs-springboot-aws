// src/app/(admin)/hotels/page.tsx

import { PageHeader } from '@/components/Admin/ui/PageHeader';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import HotelsTable from '@/components/Admin/HotelsTable';
import Link from 'next/link';

export default async function HotelsPage() {
    const hotels = await getHotels();
    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700, fontSize: '2rem' }}>Quản lý khách sạn</span>}>
                <Link
                    href="/hotels/new"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-semibold shadow"
                >
                    Thêm mới
                </Link>
            </PageHeader>
            <HotelsTable hotels={hotels} />
        </div>
    );
}