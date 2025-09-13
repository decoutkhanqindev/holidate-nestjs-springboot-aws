'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HotelDetailPage({ params }: { params: { hotelId: string } }) {
    const { hotelId } = params;
    const router = useRouter();

    const hotelDetails: { [key: string]: any } = {
        '1': { name: 'Khách sạn Mây Tre', city: 'Hà Nội', description: 'Một khách sạn yên bình giữa lòng Hà Nội cổ kính.', price: 120, imageUrl: 'https://images.unsplash.com/photo-1571896349881-f09b52a558dd?auto=format&fit=crop&w=1200&q=80' },
        '2': { name: 'Khu nghỉ dưỡng Biển Xanh', city: 'Đà Nẵng', description: 'Nghỉ dưỡng sang trọng bên bãi biển tuyệt đẹp.', price: 250, imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbf6db?auto=format&fit=crop&w=1200&q=80' },
        '3': { name: 'Khách sạn Phố Cổ', city: 'Hội An', description: 'Trải nghiệm văn hóa Hội An tại khách sạn truyền thống.', price: 90, imageUrl: 'https://images.unsplash.com/photo-1566073771259-d368f5616f73?auto=format&fit=crop&w=1200&q=80' },
    };

    const hotel = hotelDetails[hotelId];

    if (!hotel) {
        return (
            <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
                <h1 className="fw-bold text-secondary">Không tìm thấy khách sạn!</h1>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <div className="card shadow-lg">
                <img src={hotel.imageUrl} alt={hotel.name} className="card-img-top" style={{ height: '400px', objectFit: 'cover' }} />
                <div className="card-body">
                    <h1 className="card-title display-5 fw-bold text-primary">{hotel.name}</h1>
                    <p className="fs-4 text-muted">{hotel.city}</p>
                    <p className="card-text">{hotel.description}</p>
                    <div className="d-flex justify-content-between align-items-baseline my-3">
                        <span className="fs-2 fw-bold text-success">${hotel.price}</span>
                        <span className="fs-5 text-secondary">/đêm</span>
                    </div>
                    <button
                        onClick={() => alert('Chức năng đặt phòng (DEMO)! Yêu cầu đăng nhập.')}
                        className="btn btn-lg btn-primary w-100 mb-3"
                    >
                        Đặt phòng ngay
                    </button>
                    <Link href="/hotels" className="btn btn-link w-100">
                        &larr; Quay lại danh sách khách sạn
                    </Link>
                </div>
            </div>
        </div>
    );
}
