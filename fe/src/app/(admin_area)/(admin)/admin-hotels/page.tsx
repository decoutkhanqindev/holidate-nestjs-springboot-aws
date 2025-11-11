import { getHotels } from '@/lib/AdminAPI/hotelService';
import HotelsTable from '@/components/Admin/hotels/HotelsTable';
import AddHotelButton from '@/components/Admin/hotels/AddHotelButton';

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

interface HotelsPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
    // Await searchParams trước khi sử dụng (Next.js 15+)
    const params = await searchParams;

    // Lấy page từ query params, mặc định là 0 (trang đầu tiên)
    const currentPage = params.page ? parseInt(params.page, 10) - 1 : 0;
    const page = Math.max(0, currentPage); // Đảm bảo page >= 0
    const size = 10; // 10 khách sạn mỗi trang

    // Lấy dữ liệu với phân trang
    const paginatedData = await getHotels(page, size);

    return (
        <div className="p-6 md:p-8">
            <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700 }}>Quản lý Khách sạn</span>}>
                {/* NÚT THÊM MỚI - Chỉ hiện cho admin */}
                <AddHotelButton />
            </PageHeader>

            {/* BẢNG HIỂN THỊ DỮ LIỆU VỚI PHÂN TRANG */}
            <HotelsTable
                hotels={paginatedData.hotels}
                currentPage={page + 1} // Convert từ 0-based sang 1-based
                totalPages={paginatedData.totalPages}
                totalItems={paginatedData.totalItems}
            />
        </div>
    );
}