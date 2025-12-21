'use client';

import Link from 'next/link';
import styles from '../contact.module.css';

export default function TuyenDungDoiTacPage() {
    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <div className="container text-center">
                    <h1 className="fw-bold">Tuyển dụng & Đối tác</h1>
                    <p>Hãy cùng Holidate xây dựng tương lai của ngành du lịch</p>
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '20px', paddingTop: '0px' }}>
                <Link href="/contact" className="text-decoration-none text-secondary mb-4 d-inline-block">
                    ← Quay lại Trang Liên hệ
                </Link>

                {/* Tuyển dụng */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h2 className="fw-bold mb-4" style={{ color: '#0ea5e9' }}>Tuyển dụng</h2>
                        <p className="mb-3">
                            Holidate luôn tìm kiếm những tài năng xuất sắc để cùng phát triển và xây dựng tương lai của ngành du lịch.
                        </p>
                        <p className="mb-3">
                            Chúng tôi cung cấp môi trường làm việc năng động, chuyên nghiệp và nhiều cơ hội phát triển sự nghiệp.
                        </p>

                        <h5 className="fw-bold mt-4 mb-3">Các vị trí tuyển dụng:</h5>
                        <ul className="mb-4">
                            <li className="mb-2">Nhân viên lễ tân - Số lượng: 3-4 </li>
                            <li className="mb-2">Quản lý khách sạn -Số lượng: 3-4 </li>
                            <li className="mb-2">Bảo vệ - Số lượng: 3-4</li>
                            <li className="mb-2">Tạp vụ - Số lượng: 3-4 </li>
                            <li className="mb-2">Đầu bếp - Số lượng: 3-4 </li>
                            <li className="mb-2">Nhân viên an ninh (số lượng 3-4)</li>
                        </ul>

                        <div className="border rounded p-3 bg-light">
                            <p className="mb-2"><strong>Gửi CV về:</strong></p>
                            <p className="mb-0">Email: <a href="mailto:hr@holidate.vn" className="text-primary">hr@holidate.vn</a></p>
                        </div>
                    </div>
                </div>

                {/* Đối tác Khách sạn */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h2 className="fw-bold mb-4" style={{ color: '#0ea5e9' }}>Đối tác Khách sạn</h2>
                        <p className="mb-3">
                            Holidate hợp tác với hàng ngàn khách sạn và resort trên khắp Việt Nam để mang đến cho khách hàng những trải nghiệm tuyệt vời nhất.
                        </p>

                        <h5 className="fw-bold mt-4 mb-3">Lợi ích khi trở thành đối tác của Holidate:</h5>
                        <ul className="mb-4">
                            <li className="mb-2">Tăng độ phủ sóng và tiếp cận với hàng triệu khách hàng tiềm năng</li>
                            <li className="mb-2">Hệ thống quản lý đặt phòng hiện đại và dễ sử dụng</li>
                            <li className="mb-2">Hỗ trợ marketing và quảng bá hình ảnh khách sạn</li>
                            <li className="mb-2">Thanh toán nhanh chóng và minh bạch</li>
                            <li className="mb-2">Dữ liệu phân tích chi tiết về khách hàng</li>
                        </ul>

                        <div className="border rounded p-3 bg-light">
                            <p className="mb-2"><strong>Liên hệ:</strong></p>
                            <p className="mb-1">Email: <a href="mailto:partners@holidate.vn" className="text-primary">partners@holidate.vn</a></p>
                            <p className="mb-0">Hotline: <strong>1900-xxxx</strong></p>
                        </div>
                    </div>
                </div>

                {/* Đối tác Chiến lược */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <h2 className="fw-bold mb-4" style={{ color: '#0ea5e9' }}>Đối tác Chiến lược</h2>
                        <p className="mb-3">
                            Holidate luôn tìm kiếm các đối tác chiến lược trong các lĩnh vực:
                        </p>
                        <ul className="mb-4">
                            <li className="mb-2">Dịch vụ du lịch (tour, xe, hướng dẫn viên)</li>
                            <li className="mb-2">Thanh toán và công nghệ tài chính</li>
                            <li className="mb-2">Marketing và truyền thông</li>
                            <li className="mb-2">Công nghệ và giải pháp số</li>
                        </ul>

                        <div className="border rounded p-3 bg-light">
                            <p className="mb-2"><strong>Liên hệ để thảo luận về cơ hội hợp tác:</strong></p>
                            <p className="mb-0">Email: <a href="mailto:business@holidate.vn" className="text-primary">business@holidate.vn</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

