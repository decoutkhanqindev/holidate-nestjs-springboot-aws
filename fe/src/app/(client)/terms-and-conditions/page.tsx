// src/app/terms-and-conditions/page.tsx

import styles from './Terms.module.css';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.documentContainer}>
                <header className={styles.header}>
                    <h1>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN SỬ DỤNG</h1>
                    <p>Sửa đổi lần cuối vào ngày 1 tháng 7 năm 2025</p>
                </header>

                <section className={styles.section}>
                    <p>
                        Trang Web www.holidate.com và ứng dụng (“Trang Web”) được quản lý bởi Tập đoàn Holidate bao gồm các công ty con và công ty liên kết (“chúng tôi” hoặc “Holidate”).
                    </p>
                    <p>
                        Với tư cách là người dùng (“bạn” hoặc “người dùng”), bạn xác nhận và đồng ý rằng đã đọc và hiểu Bản Điều Khoản và Điều Kiện Sử Dụng này (“Bản Điều Khoản”) cũng như các chính sách và tài liệu khác được đề cập trong Bản Điều Khoản này. Việc bạn truy cập, tìm kiếm, sử dụng hoặc giao dịch trên Trang Web có nghĩa rằng bạn chấp nhận Bản Điều Khoản này...
                    </p>
                    <p>
                        Vui lòng quay lại trang này, vào hoặc trước thời điểm truy cập, sử dụng hoặc giao dịch trên Trang Web để xác nhận và đồng ý với phiên bản mới nhất của Bản Điều Khoản này...
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>1. TRANG WEB VÀ DỊCH VỤ CỦA CHÚNG TÔI</h2>
                    <p>
                        Holidate vận hành và quản lý Trang Web cung cấp một nền tảng trực tuyến để kết nối bạn với các nhà cung cấp...
                    </p>
                    <ul className={styles.list}>
                        <li><b>“Sản Phẩm Du Lịch”</b>: bao gồm Đặt Chuyến Bay, Vận Chuyển Đường Bộ, Dịch Vụ Lưu Trú, Hoạt Động Du Lịch...</li>
                        <li><b>“Dịch Vụ Tài Chính”</b>: bao gồm tài trợ, bảo hiểm...</li>
                        <li><b>“Hoạt Động”</b>: bao gồm trò chơi, chiến dịch, khuyến mãi...</li>
                        <li><b>“Các Sản Phẩm Khác”</b>: bao gồm phiếu quà tặng, phiếu du lịch...</li>
                    </ul>
                    <p>
                        Trừ khi chúng tôi đề cập rõ ràng trên Trang Web rằng Sản Phẩm được vận hành và cung cấp bởi Holidate, tất cả các Sản Phẩm đều được vận hành và cung cấp cho bạn bởi bên thứ ba (được gọi là “Nhà Cung Cấp”)...
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>2. ĐẶT CHỖ VÀ GIAO DỊCH TRÊN TRANG WEB</h2>
                    <p>
                        Bạn đồng ý việc đặt chỗ, đặt trước, sử dụng hoặc mua Sản Phẩm liên quan trên Trang Web được thực hiện với Nhà Cung Cấp hoặc với Holidate trong trường hợp Sản Phẩm được chúng tôi cung cấp...
                    </p>
                    <p>
                        Tại thời điểm bạn đặt chỗ, bạn cũng chấp nhận và đồng ý với Điều Khoản Sản Phẩm do chúng tôi, Nhà Cung Cấp quy định...
                    </p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>3. YÊU CẦU ĐẶC BIỆT</h2>
                    <p>
                        Bạn có thể gửi các yêu cầu đặc biệt đối với một Sản Phẩm cụ thể khi thực hiện đặt chỗ trên Trang Web hoặc liên hệ trực tiếp với bộ phận Dịch Vụ Khách Hàng của chúng tôi...
                    </p>
                </section>

                {/* Bạn có thể tiếp tục thêm các section khác ở đây */}
                {/* Ví dụ: */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>4. HỦY BỎ, THAY ĐỔI, HOÀN TIỀN</h2>
                    <p>
                        Trong trường hợp bạn muốn thay đổi hoặc điều chỉnh thông tin chi tiết về việc đặt chỗ của mình... bạn có thể thay đổi, điều chỉnh hoặc hủy bỏ, thông qua các tính năng có sẵn của chúng tôi trên Trang Web...
                    </p>
                </section>

                <footer className={styles.footer}>
                    <p>© Holidate {new Date().getFullYear()}</p>
                </footer>
            </div>
        </div>
    );
}