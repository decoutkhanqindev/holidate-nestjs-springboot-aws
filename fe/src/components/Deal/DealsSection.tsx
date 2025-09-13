// File: components/DealsSection.tsx
'use client';
import Link from 'next/link';

// Dữ liệu mẫu cho các mã ưu đãi
const dealsData = [
    {
        title: 'Giảm ngay 50K',
        description: 'Áp dụng cho lần đặt đầu tiên trên ứng dụng Traveloka.',
        code: 'TVLKBANMOI',
        icon: '🎟️'
    },
    {
        title: '8% giảm giá Khách sạn',
        description: 'Áp dụng cho lần đặt đầu tiên trên ứng dụng Traveloka.',
        code: 'TVLKBANMOI',
        icon: '🏨'
    },
    {
        title: '8% giảm Hoạt động Du lịch',
        description: 'Áp dụng cho lần đặt đầu tiên trên ứng dụng Traveloka.',
        code: 'TVLKBANMOI',
        icon: '🌍'
    }
];

export default function DealsSection() {
    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã: ${code}`);
    };

    return (
        <div className="container py-5 bg-light">
            <h2 className="fw-bold mb-4 text-black ">🎁 Mã Ưu Đãi Tặng Bạn Mới</h2>
            <div className="row">
                {dealsData.map((deal, index) => (
                    <div key={index} className="col-md-4 mb-3">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 className="card-title fw-bold">{deal.icon} {deal.title}</h5>
                                        <p className="card-text text-muted small">{deal.description}</p>
                                    </div>
                                    <span className="text-muted">ⓘ</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">📋 {deal.code}</span>
                                    <button onClick={() => handleCopy(deal.code)} className="btn btn-sm btn-outline-primary">
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}