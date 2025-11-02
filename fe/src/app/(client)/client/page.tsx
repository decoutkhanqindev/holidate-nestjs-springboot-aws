import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center text-center bg-light p-5">
            <h1 className="mb-4 display-4 fw-bold text-primary">
                Khám phá thế giới, đặt phòng dễ dàng
            </h1>
            <p className="mb-5 fs-5 text-secondary w-75">
                Hệ thống đặt phòng khách sạn đa dạng, từ những khu nghỉ dưỡng sang trọng đến những khách sạn ấm cúng.
            </p>

            {/* action  chính */}
            <div className="mb-5 d-flex gap-3 flex-wrap justify-content-center">
                <Link
                    href="/hotels"
                    className="btn btn-lg btn-primary px-5 py-3 fw-bold shadow"
                >
                    Xem Khách sạn
                </Link>
                <Link
                    href="/auth/register"
                    className="btn btn-lg btn-outline-primary px-5 py-3 fw-bold shadow"
                >
                    Đăng ký ngay
                </Link>
            </div>

            {/* liên kết đăng nhập */}
            <div className="d-flex gap-4 flex-wrap justify-content-center fs-5">
                <p className="text-dark">
                    Đã có tài khoản?{' '}
                    <Link href="/auth/login" className="fw-semibold text-primary">
                        Đăng nhập Client
                    </Link>
                </p>
                <p className="text-dark">
                    Bạn là quản trị viên?{' '}
                    <Link href="/admin-login" className="fw-semibold text-danger">
                        Đăng nhập Admin
                    </Link>
                </p>
            </div>
        </div>
    );
}
