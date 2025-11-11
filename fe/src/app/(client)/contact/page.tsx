'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import styles from './contact.module.css';

//  các tab chủ đề
const topicTabs = [
    'Phổ biến nhất', 'Thông tin chung', 'Tài khoản và bảo mật', 'Khách sạn',
    'Hoạt động lưu trú', 'Đưa đón sân bay', 'Traveloka Points',
];

// Dữ liệu cho các chủ đề trong tab "Phổ biến nhất"
const popularTopics = [
    { title: 'Cách đổi lịch vé máy bay của tôi', href: '/contact/doi-lich-dat-phong' },
    { title: 'Đặt chỗ trực tiếp để đảm bảo an toàn', href: '/contact/dat-cho-truc-tiep' },
    { title: 'Cách hủy vé và hoàn tiền cho đặt chỗ máy bay', href: '/contact/huy-ve-va-hoan-tien' },
    { title: 'Cách sửa hoặc hoàn tất tên hành khách bay', href: '/contact/sua-doi-ten-hanh-khach' },
];

// Mapping cho các topic tabs
const topicTabMapping: Record<string, string> = {
    'Phổ biến nhất': '/contact',
    'Thông tin chung': '/contact/thong-tin-chung',
    'Tài khoản và bảo mật': '/contact/tai-khoan-va-bao-mat',
    'Khách sạn': '/contact/khach-san',
    'Hoạt động lưu trú': '/contact/hoat-dong-du-lich',
    'Đưa đón sân bay': '/contact/dua-don-san-bay',
    'Traveloka Points': '/contact/holidate-points',
};

export default function ContactPage() {
    const { user } = useAuth();
    const [activeTopicTab, setActiveTopicTab] = useState('Phổ biến nhất');

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <div className="container text-center">
                    <h1 className="fw-bold">Liên Hệ Chúng Tôi</h1>
                    <p>Chúng tôi luôn sẵn sàng hỗ trợ, dù bạn ở bất cứ nơi đâu!</p>
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '50px' }}>
                {/* Tabs */}
                <div className={styles.contactTabsWrapper}>
                    <ul className="nav justify-content-center">
                        <li className="nav-item">
                            <a className={`nav-link active ${styles.tabLink}`} href="#">Hỗ trợ Khách hàng</a>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${styles.tabLink}`} href="/contact/tuyen-dung-doi-tac">Tuyển dụng & Đối tác</Link>
                        </li>
                    </ul>
                </div>

                {/* Card Bronze Priority */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4 position-relative">
                        <Image
                            src="/image/contact.webp"
                            alt="Support Agents"
                            width={150}
                            height={70}
                            className={styles.supportImage}
                        />
                        <Image
                            src="/image/title.webp"
                            alt="Bronze Priority"
                            width={120}
                            height={24}
                            className="mb-3"
                        />

                        {user && <p className="fs-5 mb-1"><span className="fw-bold">Xin chào bạn {user.fullName},</span></p>}
                        <p className="text-muted mb-4">Chúng tôi có thể giúp gì cho bạn?</p>

                        <div className={`border rounded p-3 ${styles.infoBox}`}>
                            <h5 className="fw-bold fs-6">Giờ hoạt động của Trung tâm chăm sóc khách hàng</h5>
                            <p className="mb-1 small">Tổng đài hoạt động: Thứ Hai-Chủ Nhật (từ 08:00 sáng - 10:00 tối)</p>
                            <p className="mb-1 small fw-bold">+84 28 3861 4599</p>
                            <p className="text-muted small mb-0">Tin nhắn: Hoạt động 24/7</p>
                        </div>
                    </div>
                </div>

                {/* Chủ đề phổ biến */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-4">
                            <span className="fs-4 me-3">📑</span>
                            <div>
                                <h5 className="fw-bold mb-0">Chủ đề phổ biến</h5>
                                <small className="text-muted">
                                    Xem thêm tại <Link href="/contact" className="text-primary fw-bold text-decoration-none">Trung tâm Hỗ trợ</Link>
                                </small>
                            </div>
                        </div>

                        {/* Tabs ngang */}
                        <div className={styles.topicTabsContainer}>
                            <ul className="nav nav-pills">
                                {topicTabs.map(tab => (
                                    <li className="nav-item" key={tab}>
                                        <Link
                                            className={`nav-link ${styles.topicTab} ${activeTopicTab === tab ? styles.active : ''}`}
                                            href={topicTabMapping[tab] || '/contact'}
                                            onClick={e => { setActiveTopicTab(tab); }}
                                        >
                                            {tab}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Nội dung */}
                        <div className="pt-4">
                            {activeTopicTab === 'Phổ biến nhất' && (
                                <div className="row g-3">
                                    {popularTopics.map((topic, idx) => (
                                        <div className="col-md-6" key={idx}>
                                            <Link href={topic.href} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border rounded h-100 ${styles.topicItem}`}>
                                                {topic.title}
                                                <span className={styles.topicArrow}>&gt;</span>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CTA cuối */}
                <div className="card border-0 shadow-sm mb-5">
                    <div className="card-body p-4 text-center">
                        <div className="mb-3"><span className={styles.emoji}>🤔</span></div>
                        <h5 className="fw-bold">Có vẻ như bạn không có bất kỳ đặt chỗ nào gần đây</h5>
                        <p className="text-muted">Không sao cả! Bạn vẫn có thể trò chuyện với chúng tôi để được giải đáp các câu hỏi chung hoặc hỗ trợ trước khi đặt chỗ.</p>
                        <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-primary rounded-pill px-4">Trò chuyện với chúng tôi</button>
                            <button className="btn btn-outline-primary rounded-pill px-4">Nhập mã đặt chỗ</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
