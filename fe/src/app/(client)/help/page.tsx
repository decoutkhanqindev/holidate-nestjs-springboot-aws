'use client';

import { useState } from 'react';
import styles from './help.module.css';

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const popularTopics = [
        "Cách đổi lịch vé máy bay của tôi",
        "Đặt chỗ trực tiếp để đảm bảo an toàn",
        "Cách hủy vé và hoàn tiền cho đặt chỗ máy bay",
        "Cách sửa hoặc đổi tên hành khách bay"
    ];

    const productCategories = [
        {
            icon: "💡",
            title: "Thông tin chung",
            color: "#17a2b8"
        },
        {
            icon: "👤",
            title: "Tài khoản và bảo mật",
            color: "#007bff"
        },
        {
            icon: "✈️",
            title: "Vé máy bay",
            color: "#28a745"
        },
        {
            icon: "🏢",
            title: "Khách sạn",
            color: "#fd7e14"
        },
        {
            icon: "❌",
            title: "Hoạt động du lịch",
            color: "#dc3545"
        },
        {
            icon: "💳",
            title: "HolidatePay",
            color: "#6f42c1"
        },
        {
            icon: "🎁",
            title: "Đưa đón sân bay",
            color: "#20c997"
        },
        {
            icon: "💰",
            title: "Holidate Points",
            color: "#ffc107"
        },
        {
            icon: "✈️",
            title: "Vé xe khách",
            color: "#6c757d"
        },
        {
            icon: "✈️",
            title: "Vé máy bay + Khách sạn",
            color: "#e83e8c"
        },
        {
            icon: "🛡️",
            title: "Bảo hiểm",
            color: "#17a2b8"
        }
    ];

    return (
        <div className={styles.helpPage}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Trung tâm Hỗ trợ Holidate</h1>
                        <p className={styles.subtitle}>Mọi câu trả lời dành cho bạn</p>

                        <div className={styles.searchContainer}>
                            <div className={styles.searchBox}>
                                <svg
                                    className={styles.searchIcon}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Nhập chủ đề ở đây (ví dụ hoàn tiền)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container">
                <div className="row mt-5">
                    {/* Popular Topics */}
                    <div className="col-lg-6 mb-4">
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Chủ đề phổ biến</h2>
                            <div className={styles.topicsList}>
                                {popularTopics.map((topic, index) => (
                                    <div key={index} className={styles.topicItem}>
                                        <span className={styles.topicText}>{topic}</span>
                                        <svg
                                            className={styles.arrowIcon}
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                        >
                                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Categories */}
                    <div className="col-lg-6 mb-4">
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Phân loại theo sản phẩm</h2>
                            <div className={styles.categoriesGrid}>
                                {productCategories.map((category, index) => (
                                    <div key={index} className={styles.categoryItem}>
                                        <div
                                            className={styles.categoryIcon}
                                            style={{ backgroundColor: category.color }}
                                        >
                                            {category.icon}
                                        </div>
                                        <span className={styles.categoryTitle}>{category.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="row mt-5 mb-5">
                    <div className="col-12">
                        <div className={styles.contactSection}>
                            <h2 className={styles.contactTitle}>Liên hệ chúng tôi</h2>
                            <p className={styles.contactDescription}>
                                Kết nối với đội ngũ Hỗ trợ Khách hàng của chúng tôi bằng cách quét mã QR bên dưới
                            </p>
                            <a href="/contact" className={styles.contactLink}>
                                Liên hệ chúng tôi
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
