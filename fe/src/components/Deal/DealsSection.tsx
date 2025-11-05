// components/DealsSection.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { getPublicDiscounts } from '@/lib/client/discountService';
import type { SuperDiscount } from '@/types';
import DiscountDetailModal from './DiscountDetailModal';
import styles from '../HotelSection/HotelSelection.module.css';

// Helper để chọn icon dựa trên percentage
function getDiscountIcon(percentage: number): string {
    if (percentage >= 50) return '🎁';
    if (percentage >= 20) return '🎟️';
    if (percentage >= 10) return '🏨';
    return '🌍';
}

export default function DealsSection() {
    const [discounts, setDiscounts] = useState<SuperDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDiscount, setSelectedDiscount] = useState<SuperDiscount | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadDiscounts = async () => {
            setIsLoading(true);
            try {
                // Lấy tất cả mã để có thể scroll
                const response = await getPublicDiscounts({
                    page: 0,
                    size: 100,
                    sortBy: 'validTo',
                    sortDir: 'asc' // Sắp xếp theo ngày hết hạn gần nhất
                });
                setDiscounts(response.content);
            } catch (error) {
                console.error('[DealsSection] Error loading discounts:', error);
                setDiscounts([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadDiscounts();
    }, []);

    // Xử lý scroll để hiển thị/ẩn nút < >
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        };

        container.scrollLeft = 0;
        const timer = setTimeout(handleScroll, 150);
        container.addEventListener('scroll', handleScroll, { passive: true });
        const observer = new ResizeObserver(handleScroll);
        observer.observe(container);

        return () => {
            clearTimeout(timer);
            container.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, [discounts]);

    const handleScrollButton = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const firstCard = container.firstElementChild as HTMLElement;
        if (!firstCard) return;

        // Tính scrollAmount = width của 1 card + gap
        const cardWidth = firstCard.offsetWidth;
        const scrollAmount = cardWidth + 8; // 8px là gap

        if (direction === 'left') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Hàm để tính số cards hiển thị dựa trên màn hình
    const getCardsPerView = () => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768 ? 2 : 3;
        }
        return 3;
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã: ${code}`);
    };

    const handleInfoClick = (discount: SuperDiscount) => {
        setSelectedDiscount(discount);
        setIsModalOpen(true);
    };

    return (
        <div className="container py-5">
            <h2 className="fw-bold mb-4 text-black">🎁 Mã Ưu Đãi Tặng Bạn Mới</h2>

            {isLoading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải mã ưu đãi...</p>
                </div>
            ) : discounts.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-muted">Hiện tại không có mã ưu đãi nào.</p>
                </div>
            ) : (
                <>
                    {/* Scroll container với nút < > */}
                    <div className="position-relative" style={{ overflow: 'visible' }}>
                        {/* Nút Previous - chỉ hiển thị khi có thể scroll về trước */}
                        {!isLoading && canScrollLeft && (
                            <button
                                className={`${styles.sliderNavButton} ${styles.prevButton}`}
                                onClick={() => handleScrollButton('left')}
                            >
                                &lt;
                            </button>
                        )}

                        {/* Nút Next - chỉ hiển thị khi có thể scroll tiếp */}
                        {!isLoading && canScrollRight && (
                            <button
                                className={`${styles.sliderNavButton} ${styles.nextButton}`}
                                onClick={() => handleScrollButton('right')}
                            >
                                &gt;
                            </button>
                        )}

                        {/* Scroll container */}
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .discount-scroll-container::-webkit-scrollbar {
                                display: none;
                            }
                            @media (max-width: 768px) {
                                .discount-card-item {
                                    flex: 0 0 calc(100% - 8px) !important;
                                    min-width: calc(100% - 8px) !important;
                                    max-width: calc(100% - 8px) !important;
                                }
                            }
                            @media (min-width: 769px) {
                                .discount-card-item {
                                    flex: 0 0 calc(33.333% - 5.33px) !important;
                                    min-width: calc(33.333% - 5.33px) !important;
                                    max-width: calc(33.333% - 5.33px) !important;
                                }
                            }
                        `}} />
                        <div
                            ref={scrollContainerRef}
                            className="row flex-nowrap discount-scroll-container"
                            style={{
                                overflowX: 'auto',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch',
                                scrollBehavior: 'smooth',
                                margin: 0,
                                gap: '8px'
                            }}
                        >
                            {discounts.map((discount) => (
                                <div key={discount.id} className="discount-card-item" style={{ flex: '0 0 calc(33.333% - 5.33px)', minWidth: 'calc(33.333% - 5.33px)', maxWidth: 'calc(33.333% - 5.33px)' }}>
                                    {/* Card với dark theme như hình mẫu */}
                                    <div
                                        className="card h-100 border-0"
                                        style={{
                                            backgroundColor: '#2d3748',
                                            borderRadius: '12px',
                                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                            width: '100%'
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
                                            {/* Top section với icon và info button */}
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div className="d-flex align-items-start gap-2 flex-grow-1">
                                                    {/* Icon circle với màu teal */}
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
                                                {/* Info button - clickable */}
                                                <button
                                                    onClick={() => handleInfoClick(discount)}
                                                    className="btn btn-link p-0 border-0"
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#4a5568',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#e2e8f0',
                                                        fontSize: '12px',
                                                        flexShrink: 0,
                                                        cursor: 'pointer',
                                                        textDecoration: 'none',
                                                        transition: 'background-color 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#5a6578';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#4a5568';
                                                    }}
                                                    title="Xem chi tiết"
                                                >
                                                    ⓘ
                                                </button>
                                            </div>

                                            {/* Dashed separator */}
                                            <hr
                                                className="my-2"
                                                style={{
                                                    borderTop: '1px dashed #4a5568',
                                                    borderBottom: 'none',
                                                    margin: '8px 0'
                                                }}
                                            />

                                            {/* Bottom section với promo code và copy button */}
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
                    </div>
                </>
            )}

            {/* Modal hiển thị chi tiết mã giảm giá */}
            <DiscountDetailModal
                discount={selectedDiscount}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDiscount(null);
                }}
            />
        </div>
    );
}
