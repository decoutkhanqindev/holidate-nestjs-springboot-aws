// src/app/about-us/page.tsx

import Image from 'next/image';
import styles from './AboutUs.module.css';
import Link from 'next/link';

export default function AboutUsPage() {
    return (
        <div className={styles.pageContainer}>
            {/* Top Header with Breadcrumb */}
            <header className={styles.topHeader}>
                <div className={styles.headerContainer}>
                    <div className={styles.breadcrumb}>
                        <Link href="/" className={styles.homeLink}>
                            <svg className={styles.homeIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <span className={styles.breadcrumbSeparator}>/</span>
                        <span className={styles.breadcrumbText}>Giới thiệu</span>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Nền tảng đặt phòng khách sạn hàng đầu Việt Nam</h1>
                    <p className={styles.heroSubtitle}>Giúp người dùng tiếp cận đa dạng các sản phẩm du lịch - tất cả đều có trên trang web và ứng dụng Holidate.</p>
                </div>
            </section>

            {/* Main Content */}
            <div className={styles.contentWrapper}>
                {/* Introduction Section */}
                <section className={styles.introSection}>
                    <div className={styles.introImage}>
                        <Image
                            src="/images/about-1.jpg"
                            alt="Holidate - Nền tảng du lịch"
                            width={600}
                            height={400}
                            className={styles.introImg}
                        />
                    </div>
                    <div className={styles.introText}>
                        <p>
                            Holidate là nền tảng đặt phòng khách sạn hàng đầu tại Việt Nam, cho phép người dùng khám phá,
                            đặt phòng và tận hưởng một loạt các sản phẩm du lịch đa dạng. Nền tảng này cung cấp các lựa chọn
                            vận chuyển, bao gồm máy bay, xe buýt, tàu hỏa, cho thuê xe ô tô và đưa đón sân bay.
                            Các lựa chọn chỗ ở của Holidate cũng rất đa dạng, bao gồm khách sạn, căn hộ, nhà nghỉ, homestay,
                            khu nghỉ dưỡng và biệt thự. Ngoài ra, nền tảng còn nâng cao trải nghiệm du lịch bằng cách cung cấp
                            các gói du lịch và truy cập vào các điểm tham quan địa phương khác nhau như công viên giải trí,
                            bảo tàng, tour du lịch trong ngày và hơn thế nữa.
                        </p>
                        <p>
                            Được thành lập tại Việt Nam, Holidate cam kết cung cấp dịch vụ khách hàng xuất sắc với hỗ trợ 24/7
                            bằng tiếng Việt và chấp nhận nhiều phương thức thanh toán phổ biến. Với mục tiêu trở thành nền tảng
                            đặt phòng khách sạn phổ biến nhất tại Việt Nam, Holidate không ngừng nỗ lực để trở thành người bạn
                            đồng hành đáng tin cậy của mọi tín đồ du lịch.
                        </p>
                    </div>
                </section>

                {/* Products Section */}
                <section className={styles.productsSection}>
                    <h2 className={styles.sectionTitle}>Sản Phẩm</h2>
                    <div className={styles.productsGrid}>
                        <div className={styles.productCard}>
                            <div className={styles.productIcon}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 16V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7 22V16h10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Lưu trú</h3>
                            <p className={styles.productStat}>10K+ Khách sạn, căn hộ, resort & villa</p>
                            <p className={styles.productDesc}>tại Việt Nam và quốc tế</p>
                        </div>
                        <div className={styles.productCard}>
                            <div className={styles.productIcon}>🎢</div>
                            <h3>Vé vui chơi</h3>
                            <p className={styles.productStat}>5K+ Hoạt động vui chơi</p>
                            <p className={styles.productDesc}>tại các điểm đến du lịch</p>
                        </div>
                        <div className={styles.productCard}>
                            <div className={styles.productIcon}>🚗</div>
                            <h3>Thuê xe & Đưa đón</h3>
                            <p className={styles.productStat}>500+ Nhà cung cấp</p>
                            <p className={styles.productDesc}>trên 20 tỉnh thành</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Statistics Section - Full Width */}
            <section className={styles.statsSection}>
                <div className={styles.statsContainer}>
                    <h2 className={styles.sectionTitle}>Ấn tượng Holidate</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>5M+</div>
                            <div className={styles.statLabel}>Người dùng đã đặt phòng</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>10K+</div>
                            <div className={styles.statLabel}>Khách sạn và resort</div>
                            <div className={styles.statSubtext}>Tại hơn 50 tỉnh thành Việt Nam</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>10+</div>
                            <div className={styles.statLabel}>Danh mục sản phẩm</div>
                            <div className={styles.statSubtext}>Du lịch và Dịch vụ địa phương</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>10+</div>
                            <div className={styles.statLabel}>Phương thức thanh toán</div>
                            <div className={styles.statSubtext}>VNPay và nhiều lựa chọn khác</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ecosystem Section */}
            <div className={styles.contentWrapper}>
                <section className={styles.ecosystemSection}>
                    <h2 className={styles.sectionTitle}>Phát triển hệ sinh thái du lịch</h2>
                    <div className={styles.ecosystemGrid}>
                        <div className={styles.ecosystemCard}>
                            <div className={styles.ecosystemIcon}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                </svg>
                            </div>
                            <h3>Giúp khách hàng chủ động</h3>
                            <p>
                                Cung cấp các sản phẩm và dịch vụ du lịch được cá nhân hóa tối đa nhờ tận dụng
                                sức mạnh công nghệ, giúp khách hàng dễ dàng tìm kiếm và so sánh để lựa chọn
                                phù hợp nhất với nhu cầu và ngân sách.
                            </p>
                        </div>
                        <div className={styles.ecosystemCard}>
                            <div className={styles.ecosystemIcon}>🤝</div>
                            <h3>Đóng góp cho cộng đồng</h3>
                            <p>
                                Triển khai các hoạt động và sáng kiến có trách nhiệm nhằm mang lại lợi ích
                                kinh tế, xã hội tích cực cho cộng đồng, hỗ trợ phát triển du lịch bền vững
                                tại Việt Nam.
                            </p>
                        </div>
                        <div className={styles.ecosystemCard}>
                            <div className={styles.ecosystemIcon}>🌐</div>
                            <h3>Tăng cường hợp tác</h3>
                            <p>
                                Xây dựng các mối quan hệ hợp tác chiến lược với các khách sạn, nhà cung cấp
                                dịch vụ du lịch để không ngừng làm giàu hệ sinh thái du lịch và mang đến
                                trải nghiệm tốt nhất cho khách hàng.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}