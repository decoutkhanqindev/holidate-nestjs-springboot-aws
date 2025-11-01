import Link from 'next/link';
import Image from 'next/image';

const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-secondary me-3" style={{ transition: 'color 0.2s' }}>
        {children}
    </a>
);

export default function Footer() {
    return (
        <footer style={{ backgroundColor: '#1A2027' }} className="text-light pt-5">
            <div className="container">
                <div className="row gy-4">

                    <div className="col-lg-4 col-md-6">
                        <h5 className="fw-bolder mb-2 fs-2">HoliDate</h5>
                        <p className="text-secondary mb-3" style={{ maxWidth: '300px' }}>
                            Nơi nghỉ dưỡng hoàn hảo cho mọi hành trình của bạn.
                        </p>
                        <h6 className="fw-bold text-white mb-3 mt-4">Theo dõi chúng tôi</h6>
                        <div className="d-flex">
                            <SocialIcon href="#">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14 13.5H16.5L17.5 9.5H14V7.5C14 6.47 14 5.5 16 5.5H17.5V2.14C17.174 2.097 15.943 2 14.643 2C11.928 2 10 3.657 10 6.7V9.5H7V13.5H10V22H14V13.5Z" /></svg>
                            </SocialIcon>
                            <SocialIcon href="#">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.148-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" /></svg>
                            </SocialIcon>
                            <SocialIcon href="#">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                            </SocialIcon>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-6">
                        <h6 className="fw-bold text-white mb-3">Về chúng tôi</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link href="/about" className="text-secondary text-decoration-none">Giới thiệu</Link></li>
                            <li className="mb-2"><Link href="/hotels" className="text-secondary text-decoration-none">Khách sạn</Link></li>
                            <li className="mb-2"><Link href="/help" className="text-secondary text-decoration-none">Trung tâm trợ giúp</Link></li>
                            <li className="mb-2"><Link href="/careers" className="text-secondary text-decoration-none">Tuyển dụng</Link></li>
                            <li className="mb-2"><Link href="/contact" className="text-secondary text-decoration-none">Liên hệ</Link></li>
                        </ul>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <h6 className="fw-bold text-white mb-3">Chính sách</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link href="/privacy" className="text-secondary text-decoration-none">Chính sách bảo mật</Link></li>
                            <li className="mb-2"><Link href="/terms-and-conditions" className="text-secondary text-decoration-none">Điều khoản & Điều kiện</Link></li>
                            <li className="mb-2"><Link href="/rules" className="text-secondary text-decoration-none">Quy chế hoạt động</Link></li>
                        </ul>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <h6 className="fw-bold text-white mb-3">Đối tác thanh toán</h6>
                        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', maxWidth: '120px' }}>
                            <Image src="/images/OIP.jpg" alt="VNPAY Logo" width={100} height={30} style={{ width: '100%', height: 'auto' }} />
                        </div>


                    </div>

                </div>

                {/* --- Đường kẻ ngang và Copyright --- */}
                <hr className="mt-5 mb-3" style={{ borderColor: '#4A5568' }} />
                <div className="text-center text-secondary pb-3 small">
                    <p className="mb-1">Công ty TNHH Đại Học Công Nghiệp Thành phố Hồ Chí Minh. MSỐ DN: 123456789</p>
                    <p className="mb-0">Copyright © {new Date().getFullYear()} CNTT-K17. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}