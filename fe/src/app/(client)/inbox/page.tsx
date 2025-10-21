'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './inbox.module.css';

export default function InboxPage() {
    return (
        <div className={styles.inboxPage}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Hộp thư của tôi</h1>
                        <p className={styles.subtitle}>
                            Theo dõi lịch sử trò chuyện với bộ phận Hỗ trợ Khách hàng Holidate
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container">
                <div className={styles.mainContent}>
                    <div className={styles.supportSection}>
                        <div className={styles.supportImageContainer}>
                            <Image
                                src="/image/support.svg"
                                alt="Customer support illustration"
                                width={400}
                                height={300}
                                className={styles.supportImage}
                            />
                        </div>

                        <div className={styles.supportContent}>
                            <h2 className={styles.supportTitle}>Bạn cần trợ giúp về đặt chỗ?</h2>

                            <div className={styles.buttonGroup}>
                                <Link href="/help" className={styles.faqButton}>
                                    Xem Những câu hỏi thường gặp
                                </Link>

                                <Link href="/contact" className={styles.contactButton}>
                                    Hỏi chúng tôi
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
