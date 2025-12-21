'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './help.module.css';

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const popularTopics = [
        { title: "Cách đổi lịch đặt khách sạn của tôi", slug: "doi-lich-dat-phong" },
        { title: "Đặt chỗ trực tiếp để đảm bảo an toàn", slug: "dat-cho-truc-tiep" },
        { title: "Cách hủy vé và hoàn tiền cho đặt chỗ khách sạn", slug: "huy-ve-va-hoan-tien" },
        { title: "Cách sửa hoặc đổi tên hành khách", slug: "sua-doi-ten-hanh-khach" }
    ];

    const productCategories = [
        {
            icon: "💡",
            title: "Thông tin chung",
            slug: "thong-tin-chung",
            color: "#17a2b8"
        },
        {
            icon: "👤",
            title: "Tài khoản và bảo mật",
            slug: "tai-khoan-va-bao-mat",
            color: "#007bff"
        },
        {
            icon: "✈️",
            title: "Vé máy bay",
            slug: "ve-may-bay",
            color: "#28a745"
        },
        {
            icon: "🏢",
            title: "Khách sạn",
            slug: "khach-san",
            color: "#fd7e14"
        },
        {
            icon: "❌",
            title: "Hoạt động du lịch",
            slug: "hoat-dong-du-lich",
            color: "#dc3545"
        },

        {
            icon: "🎁",
            title: "Đưa đón sân bay",
            slug: "dua-don-san-bay",
            color: "#20c997"
        },
        {
            icon: "💰",
            title: "Holidate Points",
            slug: "holidate-points",
            color: "#ffc107"
        },

        {
            icon: "✈️",
            title: "Khách sạn",
            slug: "khach-san",
            color: "#e83e8c"
        },
        {
            icon: "🛡️",
            title: "Bảo hiểm",
            slug: "bao-hiem",
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
                        <p className={styles.subtitle}>Liên hệ chúng tôi để được hỗ trợ </p>
                        {/* 
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
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container">
                <div className="row mt-3">
                    {/* Popular Topics */}
                    <div className="col-lg-6 mb-4">
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Chủ đề phổ biến</h2>
                            <div className={styles.topicsList}>
                                {popularTopics.map((topic, index) => (
                                    <Link key={index} href={`/help/${topic.slug}`} className={styles.topicItem}>
                                        <span className={styles.topicText}>{topic.title}</span>
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
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Categories */}
                    <div className="col-lg-6 mb-4">
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Phân loại theo dịch vụ</h2>
                            <div className={styles.categoriesGrid}>
                                {productCategories.map((category, index) => (
                                    <Link key={index} href={`/help/${category.slug}`} className={styles.categoryItem}>
                                        <div
                                            className={styles.categoryIcon}
                                            style={{ backgroundColor: category.color }}
                                        >
                                            {category.icon}
                                        </div>
                                        <span className={styles.categoryTitle}>{category.title}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="row mt-2 mb-2">
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
