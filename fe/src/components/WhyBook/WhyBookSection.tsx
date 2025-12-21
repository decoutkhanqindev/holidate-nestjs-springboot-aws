'use client';

const reasonsData = [
    {
        icon: '👜',
        title: 'Đáp ứng mọi nhu cầu của bạn',
        description: 'Từ chuyến bay, lưu trú, đến điểm tham quan, bạn có thể tin chọn sản phẩm hoàn chỉnh và Hướng Dẫn Du Lịch của chúng tôi.'
    },
    {
        icon: '🔄',
        title: 'Tùy chọn đặt chỗ linh hoạt',
        description: 'Kế hoạch thay đổi bất ngờ? Đừng lo! Đổi lịch hoặc Hoàn tiền dễ dàng.'
    },
    {
        icon: '🛡️',
        title: 'Thanh toán an toàn và thuận tiện',
        description: 'Tận hưởng 5 nhiều cách thanh toán an toàn, bằng loại tiền thuận tiện nhất cho bạn.'
    }
];

export default function WhyBookSection() {

    const sectionStyle = {
        backgroundImage: `url('/images/camnang.webp')`,

        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };

    return (
        <div className="container-fluid py-5" style={sectionStyle}>
            <div className="container">
                <h2 className="fw-bold text-center mb-5 text-black">Lý do nên đặt chỗ với Traveloka?</h2>
                <div className="row g-4">
                    {reasonsData.map((reason, index) => (
                        <div key={index} className="col-md-4">
                            <div className="card border-0 text-center bg-transparent">
                                <div className="card-body">
                                    <div className="display-4 mb-3">{reason.icon}</div>
                                    <h5 className="card-title fw-bold">{reason.title}</h5>
                                    <p className="card-text text-muted">{reason.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}