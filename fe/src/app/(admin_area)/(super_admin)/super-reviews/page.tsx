"use client";

import { useState, useEffect } from "react";
import { getReviews, type GetReviewsParams } from "@/lib/AdminAPI/reviewService";
import { getBookingById } from "@/lib/AdminAPI/bookingService";
import type { Review } from "@/types";
import Pagination from "@/components/Admin/pagination/Pagination";
import { FaStar, FaEye, FaTrash, FaEdit, FaUser, FaHotel, FaCalendarAlt } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

const formatDate = (date: Date): string => {
    try {
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch {
        return '';
    }
};

const formatDateTime = (date: Date): string => {
    try {
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
};

const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 2); // 1-10 scale, convert to 1-5 stars
    const hasHalfStar = (score % 2) === 1;
    
    for (let i = 0; i < fullStars; i++) {
        stars.push(<FaStar key={i} className="text-warning" />);
    }
    if (hasHalfStar) {
        stars.push(<FaStar key="half" className="text-warning" style={{ opacity: 0.5 }} />);
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<FaStar key={`empty-${i}`} className="text-muted" style={{ opacity: 0.3 }} />);
    }
    return stars;
};

export default function SuperReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Filter states
    const [filterHotelId, setFilterHotelId] = useState<string>('');
    const [filterUserId, setFilterUserId] = useState<string>('');
    const [filterBookingId, setFilterBookingId] = useState<string>('');
    const [filterMinScore, setFilterMinScore] = useState<string>('');
    const [filterMaxScore, setFilterMaxScore] = useState<string>('');
    
    // Sort states
    const [sortBy, setSortBy] = useState<string>('created-at');
    const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

    const fetchReviews = async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const params: GetReviewsParams = {
                page,
                size: ITEMS_PER_PAGE,
                sortBy,
                sortDir,
            };

            if (filterHotelId.trim()) params.hotelId = filterHotelId.trim();
            if (filterUserId.trim()) params.userId = filterUserId.trim();
            if (filterBookingId.trim()) params.bookingId = filterBookingId.trim();
            if (filterMinScore.trim()) {
                const minScore = parseInt(filterMinScore.trim());
                if (!isNaN(minScore) && minScore >= 1 && minScore <= 10) {
                    params.minScore = minScore;
                }
            }
            if (filterMaxScore.trim()) {
                const maxScore = parseInt(filterMaxScore.trim());
                if (!isNaN(maxScore) && maxScore >= 1 && maxScore <= 10) {
                    params.maxScore = maxScore;
                }
            }

            const result = await getReviews(params);
            
            // Nếu review thiếu room name và có bookingId, fetch booking detail để lấy room name
            const reviewsWithRoomInfo = await Promise.all(
                result.data.map(async (review) => {
                    if ((!review.roomName || review.roomName === 'N/A') && review.bookingId) {
                        try {
                            const booking = await getBookingById(review.bookingId);
                            if (booking && booking.roomNumbers && booking.roomNumbers.length > 0) {
                                return {
                                    ...review,
                                    roomName: booking.roomNumbers[0] // Lấy tên phòng đầu tiên
                                };
                            }
                        } catch (err) {
                            // Nếu không fetch được, giữ nguyên review
                        }
                    }
                    return review;
                })
            );
            
            setReviews(reviewsWithRoomInfo);
            setTotalPages(result.totalPages);
            setTotalItems(result.totalItems);
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách đánh giá');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(currentPage);
    }, [currentPage, sortBy, sortDir, filterHotelId, filterUserId, filterBookingId, filterMinScore, filterMaxScore]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1); // Pagination component uses 1-based, backend uses 0-based
    };

    const handleClearFilters = () => {
        setFilterHotelId('');
        setFilterUserId('');
        setFilterBookingId('');
        setFilterMinScore('');
        setFilterMaxScore('');
        setCurrentPage(0);
    };

    const hasActiveFilters = filterHotelId.trim() || filterUserId.trim() || filterBookingId.trim() || 
                            filterMinScore.trim() || filterMaxScore.trim();

    return (
        <div className="container-fluid px-4 py-3" style={{ paddingLeft: 'calc(2cm + 1rem)' }}>
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h1 className="h4 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
                        <FaStar className="text-warning" />
                        Quản lý đánh giá
                    </h1>
                    {!isLoading && (
                        <p className="text-muted small mb-0 mt-2">
                            Tổng cộng: <span className="fw-semibold text-primary">{totalItems}</span> đánh giá
                        </p>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải danh sách đánh giá...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger border-0 shadow-sm" role="alert">
                    <strong>Lỗi:</strong> {error}
                </div>
            ) : (
                <>
                    {/* Filters Section */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">🔍 ID Khách sạn</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="UUID khách sạn"
                                        value={filterHotelId}
                                        onChange={(e) => setFilterHotelId(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">👤 ID Người dùng</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="UUID người dùng"
                                        value={filterUserId}
                                        onChange={(e) => setFilterUserId(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">📋 ID Đơn hàng</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="UUID đơn hàng"
                                        value={filterBookingId}
                                        onChange={(e) => setFilterBookingId(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">⭐ Điểm tối thiểu</label>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="1-10"
                                        min="1"
                                        max="10"
                                        value={filterMinScore}
                                        onChange={(e) => setFilterMinScore(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">⭐ Điểm tối đa</label>
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="1-10"
                                        min="1"
                                        max="10"
                                        value={filterMaxScore}
                                        onChange={(e) => setFilterMaxScore(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3 d-flex align-items-end">
                                    {hasActiveFilters && (
                                        <button
                                            className="btn btn-outline-secondary btn-sm w-100"
                                            onClick={handleClearFilters}
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sort Section */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold text-muted">Sắp xếp theo</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="created-at">Ngày tạo</option>
                                        <option value="score">Điểm đánh giá</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold text-muted">Thứ tự</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={sortDir}
                                        onChange={(e) => setSortDir(e.target.value as 'ASC' | 'DESC')}
                                    >
                                        <option value="DESC">Mới nhất / Cao nhất</option>
                                        <option value="ASC">Cũ nhất / Thấp nhất</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            <div className="table-responsive" style={{ 
                                overflowX: 'auto',
                                overflowY: 'visible',
                                width: '100%',
                                display: 'block',
                                maxWidth: '100%'
                            }}>
                                <table className="table table-hover align-middle mb-0" style={{
                                    minWidth: '29.5cm',
                                    width: 'max-content',
                                    marginBottom: 0
                                }}>
                                    <thead>
                                        <tr style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '1cm', minWidth: '1cm', whiteSpace: 'nowrap', padding: '12px 8px', textAlign: 'left' }}>STT</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '4cm', minWidth: '4cm', whiteSpace: 'nowrap', padding: '12px 8px', textAlign: 'left' }}>Người đánh giá</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '4cm', minWidth: '4cm', whiteSpace: 'nowrap', padding: '12px 8px', textAlign: 'left' }}>Khách sạn</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '3.5cm', minWidth: '3.5cm', whiteSpace: 'nowrap', padding: '12px 8px', textAlign: 'left' }}>Phòng</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', whiteSpace: 'nowrap', padding: '12px 8px', textAlign: 'left' }}>Điểm đánh giá</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '5cm', minWidth: '5cm', whiteSpace: 'nowrap', padding: '12px 8px', textAlign: 'left' }}>Bình luận</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', whiteSpace: 'nowrap', padding: '12px 8px', textAlign: 'left' }}>Ảnh</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', whiteSpace: 'nowrap', padding: '12px 8px', textAlign: 'left' }}>Ngày tạo</th>
                                            <th scope="col" className="fw-bold text-dark" style={{ width: '3cm', minWidth: '3cm', whiteSpace: 'nowrap', padding: '12px 8px', textAlign: 'left' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-5">
                                                    <div className="text-muted">
                                                        <FaStar className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
                                                        <p className="mb-0 fs-5">Không có đánh giá nào</p>
                                                        <p className="small mb-0 mt-2">Hiện tại chưa có đánh giá nào trong hệ thống</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            reviews.map((review, index) => (
                                                <tr
                                                    key={review.id}
                                                    className="border-bottom"
                                                    style={{
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'default'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '';
                                                        e.currentTarget.style.boxShadow = '';
                                                    }}
                                                >
                                                    <td className="align-middle" style={{ padding: '12px 8px', width: '1cm', textAlign: 'left' }}>
                                                        <span className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                            {(currentPage * ITEMS_PER_PAGE) + index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle" style={{ padding: '12px 8px', width: '4cm', textAlign: 'left' }}>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {review.userAvatar ? (
                                                                <img
                                                                    src={review.userAvatar}
                                                                    alt={review.userName}
                                                                    className="rounded-circle"
                                                                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                                        if (fallback) fallback.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <span
                                                                className={`rounded-circle d-${review.userAvatar ? 'none' : 'flex'} align-items-center justify-content-center text-white fw-semibold`}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    backgroundColor: '#6c757d',
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                {review.userName.charAt(0).toUpperCase()}
                                                            </span>
                                                            <div>
                                                                <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                                                                    {review.userName}
                                                                </div>
                                                                <div className="small text-muted" style={{ fontSize: '0.85rem' }}>
                                                                    {review.userId.substring(0, 8)}...
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle" style={{ padding: '12px 8px', width: '4cm', textAlign: 'left' }}>
                                                        <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                                                            {review.hotelName}
                                                        </div>
                                                        <div className="small text-muted" style={{ fontSize: '0.85rem' }}>
                                                            {review.hotelId.substring(0, 8)}...
                                                        </div>
                                                    </td>
                                                    <td className="align-middle" style={{ padding: '12px 8px', width: '3.5cm', textAlign: 'left' }}>
                                                        <div className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>
                                                            {review.roomName}
                                                        </div>
                                                    </td>
                                                    <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                        <div className="d-flex align-items-center gap-1 mb-1">
                                                            {renderStars(review.score)}
                                                        </div>
                                                        <div className="small text-muted fw-medium" style={{ fontSize: '0.85rem' }}>
                                                            {review.score}/10
                                                        </div>
                                                    </td>
                                                    <td className="align-middle" style={{ padding: '12px 8px', width: '5cm', textAlign: 'left' }}>
                                                        <div
                                                            className="text-dark"
                                                            style={{
                                                                fontSize: '0.9rem',
                                                                maxWidth: '5cm',
                                                                width: '5cm',
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'normal',
                                                                overflowWrap: 'break-word'
                                                            }}
                                                        >
                                                            {review.comment || <span className="text-muted">Không có bình luận</span>}
                                                        </div>
                                                    </td>
                                                    <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                        {review.photos && review.photos.length > 0 ? (
                                                            <div className="d-flex gap-1 flex-wrap">
                                                                {review.photos.slice(0, 3).map((photo) => (
                                                                    <img
                                                                        key={photo.id}
                                                                        src={photo.url}
                                                                        alt="Review photo"
                                                                        className="rounded"
                                                                        style={{
                                                                            width: '35px',
                                                                            height: '35px',
                                                                            objectFit: 'cover',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        onClick={() => window.open(photo.url, '_blank')}
                                                                    />
                                                                ))}
                                                                {review.photos.length > 3 && (
                                                                    <div
                                                                        className="rounded d-flex align-items-center justify-content-center text-muted bg-light"
                                                                        style={{
                                                                            width: '35px',
                                                                            height: '35px',
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    >
                                                                        +{review.photos.length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small" style={{ fontSize: '0.85rem' }}>Không có</span>
                                                        )}
                                                    </td>
                                                    <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                        <div className="text-dark" style={{ fontSize: '0.9rem' }}>
                                                            {formatDateTime(review.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="align-middle" style={{ padding: '12px 8px', width: '3cm', textAlign: 'left' }}>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center rounded-circle"
                                                                style={{
                                                                    width: '38px',
                                                                    height: '38px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                title="Xem chi tiết"
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(13, 110, 253, 0.3)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                                onClick={() => {
                                                                    // TODO: Navigate to review detail page
                                                                    console.log('View review:', review.id);
                                                                }}
                                                            >
                                                                <FaEye />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-warning d-inline-flex align-items-center justify-content-center rounded-circle"
                                                                style={{
                                                                    width: '38px',
                                                                    height: '38px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                title="Chỉnh sửa"
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 193, 7, 0.3)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                                onClick={() => {
                                                                    // TODO: Open edit modal
                                                                    console.log('Edit review:', review.id);
                                                                }}
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center rounded-circle"
                                                                style={{
                                                                    width: '38px',
                                                                    height: '38px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                title="Xóa"
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                                onClick={() => {
                                                                    // TODO: Delete review
                                                                    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                                                                        console.log('Delete review:', review.id);
                                                                    }
                                                                }}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 d-flex justify-content-center">
                            <Pagination
                                currentPage={currentPage + 1}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

