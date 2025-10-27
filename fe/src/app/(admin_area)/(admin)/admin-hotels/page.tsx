import Link from 'next/link';
import { getHotels } from '@/lib/AdminAPI/hotelService'; // Đổi đường dẫn nếu cần
import HotelsTable from '@/components/Admin/HotelsTable';
import { PlusIcon } from '@heroicons/react/24/solid';

// Component PageHeader để code gọn hơn
function PageHeader({ title, children }: { title: React.ReactNode, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

export const dynamic = 'force-dynamic'; // Đảm bảo trang luôn lấy dữ liệu mới nhất khi F5

export default async function HotelsPage() {
    // 1. Lấy dữ liệu mẫu từ service
    const hotels = await getHotels();

    // 2. Render giao diện
    return (
        <div className="p-6 md:p-8">
            <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700 }}>Quản lý Khách sạn</span>}>
                {/* NÚT THÊM MỚI */}
                <Link
                    href="/admin-hotels/new" // << SỬA Ở ĐÂY
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm khách sạn
                </Link>
            </PageHeader>

            {/* BẢNG HIỂN THỊ DỮ LIỆU */}
            <HotelsTable hotels={hotels} />
        </div>
    );
}