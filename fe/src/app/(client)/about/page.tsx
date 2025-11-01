// src/app/about-us/page.tsx

import Image from 'next/image';
import styles from './AboutUs.module.css';

export default function AboutUsPage() {
    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1>Về Holidate</h1>
                <p>Nền tảng đặt phòng và trải nghiệm du lịch cho tương lai</p>
            </header>

            <section className={styles.section}>
                <div className={styles.textContainer}>
                    <h2>Sứ mệnh của chúng tôi</h2>
                    <p>
                        Holidate là một nền tảng du lịch trực tuyến, sản phẩm đồ án tốt nghiệp với sứ mệnh
                        giúp người dùng khám phá, đặt phòng và tận hưởng một loạt các sản phẩm du lịch đa dạng một cách dễ dàng.
                        Nền tảng này cung cấp các lựa chọn từ các chuyến bay, bao gồm máy bay, xe buýt, tàu hỏa, cho thuê xe ô tô và đưa đón sân bay.
                    </p>
                    <p>
                        Các lựa chọn chỗ ở trên Holidate cũng rất đa dạng, bao gồm khách sạn, căn hộ, nhà nghỉ, homestay,
                        khu nghỉ dưỡng và biệt thự. Ngoài ra, nền tảng còn không ngừng nâng cao trải nghiệm du lịch bằng cách
                        cung cấp các gói du lịch biển và truy cập vào các điểm tham quan địa phương khác nhau như công viên giải trí,
                        bảo tàng, tour du lịch trong ngày và hơn thế nữa.
                    </p>
                </div>
                <div className={styles.imageContainer}>
                    <Image src="/images/about-1.jpg" alt="Nhóm bạn tận hưởng kỳ nghỉ trên bãi biển" width={500} height={350} className={styles.image} />
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.imageContainer}>
                    <Image src="/images/about-2.jpg" alt="Người dùng đặt phòng trên điện thoại" width={500} height={350} className={styles.image} />
                </div>
                <div className={styles.textContainer}>
                    <h2>Công nghệ và Tầm nhìn</h2>
                    <p>
                        Được phát triển với những công nghệ web hiện đại nhất, Holidate cam kết cung cấp dịch vụ khách hàng xuất sắc
                        với hỗ trợ 24/7. Chúng tôi hiểu rằng mỗi chuyến đi là một kỷ niệm, và mục tiêu của chúng tôi là làm cho quá trình
                        lên kế hoạch trở nên liền mạch và thú vị.
                    </p>
                    <p>
                        Là một trong những ứng dụng du lịch phổ biến nhất trong khu vực, Holidate không ngừng nỗ lực để trở thành
                        người bạn đồng hành đáng tin cậy của mọi tín đồ du lịch. Để biết thêm thông tin, vui lòng khám phá trang web của chúng tôi.
                    </p>
                </div>
            </section>
        </div>
    );
}