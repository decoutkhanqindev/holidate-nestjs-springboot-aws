import Link from "next/link";

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8 pt-20">
            <h1 className="mb-6 text-4xl font-bold text-red-800">Chào mừng, Admin!</h1>
            <p className="text-lg text-red-700">Đây là bảng điều khiển quản trị hệ thống khách sạn của bạn.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-2 text-2xl font-semibold text-red-600">Quản lý Khách sạn</h2>
                    <p className="text-gray-700">Thêm, sửa, xóa thông tin khách sạn, hình ảnh, tiện ích.</p>
                    <Link href="/admin/hotels" className="mt-4 inline-block text-red-500 hover:underline">
                        Đi đến &rarr;
                    </Link>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-2 text-2xl font-semibold text-red-600">Quản lý Đặt phòng</h2>
                    <p className="text-gray-700">Xem, xác nhận, hủy các đặt phòng của khách hàng.</p>
                    <Link href="/admin/bookings" className="mt-4 inline-block text-red-500 hover:underline">
                        Đi đến &rarr;
                    </Link>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="mb-2 text-2xl font-semibold text-red-600">Quản lý Ưu đãi/Giảm giá</h2>
                    <p className="text-gray-700">Tạo, chỉnh sửa các chương trình khuyến mãi.</p>
                    <Link href="/admin/deals" className="mt-4 inline-block text-red-500 hover:underline">
                        Đi đến &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}