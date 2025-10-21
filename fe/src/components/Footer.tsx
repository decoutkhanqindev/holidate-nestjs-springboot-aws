// File: components/Footer.tsx (PHIÊN BẢN SỬA LỖI HOÀN CHỈNH)
import Link from 'next/link';
import Image from 'next/image';

// Dữ liệu mẫu cho các logo thanh toán
const paymentMethods = [
    "MASTERCARD", "VISA", "JCB", "AMEX", "VIETQR", "SACOMBANK",
    "VNPAY", "VTC", "VIR", "VIETCOMBANK", "ONEPAY", "MB",
    "HSBC", "ACB", "TPBANK", "BIDV", "CITIBANK", "ALEPAY"
];

export default function Footer() {
    return (
        // Sử dụng màu nền #1A2027 gần giống với Traveloka
        <footer style={{ backgroundColor: '#1A2027' }} className="text-light pt-5">
            <div className="container">
                <div className="row gy-5">

                    {/* === CỘT 1: THƯƠNG HIỆU & THANH TOÁN === */}
                    <div className="col-lg-4 col-md-12">
                        <h5 className="fw-bolder mb-3 fs-2">Traveloka</h5>

                        <div className="d-flex align-items-center mb-3">
                            <span className="border border-secondary rounded p-2 me-2 small">IATA</span>
                            <span className="border border-secondary rounded p-2 me-2 small">CERTIFIED</span>
                            <span className="border border-secondary rounded p-2 small">ĐÃ ĐĂNG KÝ</span>
                        </div>

                        <button className="btn w-100 mb-4" style={{ backgroundColor: '#4A5568', color: 'white' }}>
                            Hợp tác với Traveloka
                        </button>

                        <h6 className="fw-bold mb-3">Đối tác thanh toán</h6>
                        <div className="row g-2">
                            {paymentMethods.slice(0, 18).map((method) => (
                                <div key={method} className="col-2">
                                    <div
                                        className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                                        style={{ height: '35px', overflow: 'hidden' }}
                                    >
                                        <span
                                            className="text-dark fw-bold"
                                            style={{ fontSize: '10px', whiteSpace: 'nowrap' }}
                                        >
                                            {method}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* === CỘT 2: VỀ TRAVELOKA & MẠNG XÃ HỘI === */}
                    <div className="col-lg-2 col-md-6 offset-lg-1">
                        <h6 className="fw-bold text-white mb-3">Về Traveloka</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Cách đặt chỗ</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Liên hệ chúng tôi</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Trợ giúp</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Tuyển dụng</Link></li>
                        </ul>

                        <h6 className="fw-bold text-white mt-4 mb-3">Theo dõi chúng tôi trên</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Facebook</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Instagram</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">TikTok</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Youtube</Link></li>
                        </ul>
                    </div>

                    {/* === CỘT 3: SẢN PHẨM === */}
                    <div className="col-lg-2 col-md-6">
                        <h6 className="fw-bold text-white mb-3">Sản phẩm</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Khách sạn</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Vé máy bay</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Vé xe khách</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Đưa đón sân bay</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Cho thuê xe</Link></li>
                        </ul>
                    </div>

                    {/* === CỘT 4: KHÁC & TẢI ỨNG DỤNG === */}
                    <div className="col-lg-3 col-md-12">
                        <h6 className="fw-bold text-white mb-3">Khác</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Traveloka Affiliate</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Chính Sách Quyền Riêng Tư</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Điều khoản & Điều kiện</Link></li>
                            <li className="mb-2"><Link href="#" className="text-secondary text-decoration-none">Quy chế hoạt động</Link></li>
                        </ul>

                        <h6 className="fw-bold text-white mt-4 mb-3">Tải ứng dụng Traveloka</h6>
                        <div className="d-flex flex-column">
                            <a href="#" className="btn btn-dark border border-light text-start mb-2 py-2">
                                <div className="d-flex align-items-center">
                                    <Image src="/google-play.png" alt="Google Play" width={24} height={24} />
                                    <div className="ms-2">
                                        <div className="small lh-1">GET IT ON</div>
                                        <div className="fw-bold fs-6 lh-1">Google Play</div>
                                    </div>
                                </div>
                            </a>
                            <a href="#" className="btn btn-dark border border-light text-start py-2">
                                <div className="d-flex align-items-center">
                                    <Image src="/app-store.png" alt="App Store" width={24} height={24} />
                                    <div className="ms-2">
                                        <div className="small lh-1">Download on the</div>
                                        <div className="fw-bold fs-6 lh-1">App Store</div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* --- Đường kẻ ngang và Copyright --- */}
                <hr className="mt-5 mb-4" style={{ borderColor: '#4A5568' }} />
                <div className="text-center text-secondary pb-4 small">
                    <p className="mb-1">Công ty TNHH Traveloka Việt Nam. MSỐ DN: 0313581779. Tòa nhà An Phú, 117-119 Lý Chính Thắng, Phường Xuân Hân, TPHCM</p>
                    <p className="mb-0">Copyright © 2025 Traveloka. All rights reserved</p>
                </div>
            </div>
        </footer>
    );
}