'use client';

import { useState, useEffect } from 'react';
import { getPublicDiscounts } from '@/lib/client/discountService';
import type { SuperDiscount, PagedResponse } from '@/types';
import Link from 'next/link';

// Helper để format ngày
function formatDate(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Helper để chọn icon dựa trên percentage
function getDiscountIcon(percentage: number): string {
    if (percentage >= 50) return '🎁';
    if (percentage >= 20) return '🎟️';
    if (percentage >= 10) return '🏨';
    return '🌍';
}

interface DiscountsPageClientProps {
    initialDiscounts: SuperDiscount[];
    initialTotalPages: number;
    initialPage: number;
}

export default function DiscountsPageClient({
    initialDiscounts = [],
    initialTotalPages = 0,
    initialPage = 0,
}: DiscountsPageClientProps) {
    const [discounts, setDiscounts] = useState<SuperDiscount[]>(initialDiscounts);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(initialTotalPages);

    // Fetch discounts nếu chưa có initial data hoặc page thay đổi
    useEffect(() => {
        // Nếu đã có initial data và đang ở page 0, không cần fetch lại
        if (initialDiscounts.length > 0 && currentPage === 0) {
            return;
        }

        const loadDiscounts = async () => {
            setIsLoading(true);
            try {
                const response = await getPublicDiscounts({
                    page: currentPage,
                    size: 12,
                    sortBy: 'validTo',
                    sortDir: 'asc',
                });
                setDiscounts(response.content);
                setTotalPages(response.totalPages);
            } catch (error) {
                console.error('[DiscountsPageClient] Error loading discounts:', error);
                setDiscounts([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadDiscounts();
    }, [currentPage, initialDiscounts.length]);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã: ${code}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1); // Convert từ 1-based sang 0-based
    };

    return (
        <div className="container py-5">
            <div className="mb-4">
                <Link href="/" className="text-decoration-none text-primary">
                    ← Về trang chủ
                </Link>
            </div>

            <h1 className="fw-bold mb-4 text-dark">🎁 Tất cả Mã Ưu Đãi</h1>

            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải mã ưu đãi...</p>
                </div>
            ) : discounts.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">Hiện tại không có mã ưu đãi nào.</p>
                </div>
            ) : (
                <>
                    <div className="row g-3">
                        {discounts.map((discount) => (
                            <div key={discount.id} className="col-md-4 mb-3">
                                <div
                                    className="card h-100 border-0"
                                    style={{
                                        backgroundColor: '#2d3748',
                                        borderRadius: '12px',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-start gap-2 mb-2">
                                            <div
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#14b8a6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    marginTop: '2px'
                                                }}
                                            >
                                                <span style={{ color: 'white', fontSize: '18px' }}>
                                                    {getDiscountIcon(discount.percentage)}
                                                </span>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6
                                                    className="mb-1 fw-semibold"
                                                    style={{
                                                        color: '#e2e8f0',
                                                        fontSize: '14px',
                                                        lineHeight: '1.4'
                                                    }}
                                                >
                                                    Giảm {discount.percentage}%
                                                </h6>
                                                <p
                                                    className="mb-0 small"
                                                    style={{
                                                        color: '#a0aec0',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {discount.description || 'Áp dụng cho đơn hàng của bạn.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-2" style={{ fontSize: '11px' }}>
                                            <div style={{ color: '#a0aec0', marginBottom: '4px' }}>
                                                <strong style={{ color: '#cbd5e0' }}>Đơn tối thiểu:</strong> {new Intl.NumberFormat('vi-VN').format(discount.minBookingPrice)} VNĐ
                                            </div>
                                            <div style={{ color: '#a0aec0', marginBottom: '4px' }}>
                                                <strong style={{ color: '#cbd5e0' }}>Ưu đãi tới ngày:</strong> {formatDate(discount.validTo)}
                                            </div>
                                            <div style={{ color: '#a0aec0' }}>
                                                <strong style={{ color: '#cbd5e0' }}>Đã sử dụng:</strong> {discount.timesUsed} / {discount.usageLimit}
                                            </div>
                                        </div>

                                        <hr
                                            className="my-2"
                                            style={{
                                                borderTop: '1px dashed #4a5568',
                                                borderBottom: 'none',
                                                margin: '8px 0'
                                            }}
                                        />

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-2">
                                                <span style={{ color: '#a0aec0', fontSize: '14px' }}>📋</span>
                                                <span
                                                    className="fw-semibold"
                                                    style={{
                                                        color: '#e2e8f0',
                                                        fontSize: '14px',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    {discount.code}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(discount.code)}
                                                className="btn btn-sm"
                                                style={{
                                                    backgroundColor: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '4px 12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    transition: 'background-color 0.2s ease, transform 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#2563eb';
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav>
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage)}
                                            disabled={currentPage === 0}
                                        >
                                            Trước
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <li
                                            key={page}
                                            className={`page-item ${currentPage === page - 1 ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage + 2)}
                                            disabled={currentPage >= totalPages - 1}
                                        >
                                            Sau
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}




































