// app/admin-reviews/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getReviews, type GetReviewsParams } from '@/lib/AdminAPI/reviewService';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import Pagination from '@/components/Admin/pagination/Pagination';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import LoadingSpinner from '@/components/Admin/common/LoadingSpinner';
import type { Review } from '@/types';
import type { Hotel } from '@/types';
import apiClient, { ApiResponse } from '@/service/apiClient';
import { FaStar } from "react-icons/fa";

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

export default function ReviewsPage() {
    const { effectiveUser } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Hotels list (for partner dropdown)
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selectedHotelId, setSelectedHotelId] = useState<string>(''); // Filter theo hotel được chọn

    // Filter states
    const [filterHotelId, setFilterHotelId] = useState<string>('');
    const [filterUserId, setFilterUserId] = useState<string>('');
    const [filterBookingId, setFilterBookingId] = useState<string>('');
    const [filterMinScore, setFilterMinScore] = useState<string>('');
    const [filterMaxScore, setFilterMaxScore] = useState<string>('');
    
    // Sort states
    const [sortBy, setSortBy] = useState<string>('created-at');
    const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

    // Load hotels list (for partner)
    useEffect(() => {
        async function loadHotels() {
            const userId = effectiveUser?.id;
            const roleName = effectiveUser?.role?.name;

            if (roleName?.toLowerCase() === 'partner' && userId) {
                try {
                    const allHotels: Hotel[] = [];
                    let hotelPage = 0;
                    const hotelPageSize = 50;
                    let hasMoreHotels = true;

                    while (hasMoreHotels) {
                        try {
                            const hotelsData = await getHotels(
                                hotelPage,
                                hotelPageSize,
                                undefined,
                                undefined,
                                userId,
                                'PARTNER'
                            );
                            
                            allHotels.push(...hotelsData.hotels);
                            
                            hasMoreHotels = hotelsData.hasNext || false;
                            hotelPage++;
                        } catch (err: any) {
                            console.error(`Error fetching hotels page ${hotelPage}:`, err);
                            hasMoreHotels = false;
                        }
                    }

                    setHotels(allHotels);
                    
                    // Nếu chưa có hotel được chọn và có hotels, chọn hotel đầu tiên
                    if (allHotels.length > 0 && !selectedHotelId) {
                        setSelectedHotelId(allHotels[0].id);
                    }
                } catch (err: any) {
                    console.error('Error loading hotels:', err);
                }
            }
        }

        loadHotels();
    }, [effectiveUser?.id, effectiveUser?.role?.name]);

    useEffect(() => {
        async function loadReviews() {
            setIsLoading(true);
            try {
                const userId = effectiveUser?.id;
                const roleName = effectiveUser?.role?.name;


                // Nếu role là PARTNER, lấy reviews của hotels được chọn (hoặc tất cả nếu chưa chọn)
                if (roleName?.toLowerCase() === 'partner' && userId) {
                    // Nếu đã chọn hotel cụ thể, chỉ lấy reviews của hotel đó
                    const hotelIdsToFetch = selectedHotelId 
                        ? [selectedHotelId] 
                        : hotels.map(h => h.id);

                    if (hotelIdsToFetch.length === 0) {
                        // Partner không có hotels
                            setReviews([]);
                            setTotalPages(0);
                            setTotalItems(0);
                            setIsLoading(false);
                            return;
                        }

                    // 2. Lấy reviews của hotels được chọn (pagination cho mỗi hotel)
                    const allReviews: Review[] = [];
                    for (const hotelId of hotelIdsToFetch) {
                        try {
                            let reviewPage = 0;
                            const reviewPageSize = 50;
                            let hasMoreReviews = true;

                            while (hasMoreReviews) {
                                // Dùng getReviews từ service để có logic map đúng
                                const reviewsResponse = await getReviews({
                                    hotelId: hotelId, // QUAN TRỌNG: Chỉ lấy reviews của hotel này
                                    page: reviewPage,
                                    size: reviewPageSize,
                        sortBy: 'createdAt',
                        sortDir: 'DESC',
                        roleName: roleName,
                        currentUserId: userId,
                    });
                    
                                if (reviewsResponse.data && reviewsResponse.data.length > 0) {
                                    // Fetch booking detail để lấy room name từ booking
                                    // (Booking có room với name field)
                                    const { getBookingById } = await import('@/lib/AdminAPI/bookingService');
                                    
                                    const reviewsWithRoomName = await Promise.allSettled(
                                        reviewsResponse.data.map(async (review) => {
                                            // Nếu đã có room name, giữ nguyên
                                            if (review.roomName && review.roomName !== 'N/A' && review.roomId) {
                                                return review;
                                            }
                                            
                                            // Nếu có bookingId, fetch booking để lấy room name
                                            if (review.bookingId) {
                                                try {
                                                    const booking = await getBookingById(review.bookingId);
                                                    
                                                    if (booking) {
                                                        // Lấy room name từ booking.roomNumbers (array)
                                                        // Hoặc có thể lấy từ booking response trực tiếp nếu có room.name
                                                        let roomName = 'N/A';
                                                        
                                                        if (booking.roomNumbers && booking.roomNumbers.length > 0) {
                                                            // roomNumbers là array, lấy phần tử đầu tiên
                                                            roomName = booking.roomNumbers[0];
                                                        }
                                                        
                                                        return {
                                                            ...review,
                                                            roomName: roomName,
                                                            // roomId có thể lấy từ booking nếu có trong response
                                                        };
                                                    }
                                                } catch (err) {
                                                    // Nếu fetch booking fail, thử fetch review detail
                                                    console.error(`Error fetching booking ${review.bookingId} for review ${review.id}:`, err);
                                                    
                                                    try {
                                                        const { getReviewById } = await import('@/lib/AdminAPI/reviewService');
                                                        const detailReview = await getReviewById(review.id);
                                                        
                                                        return {
                                                            ...review,
                                                            roomName: detailReview.roomName || 'N/A',
                                                            roomId: detailReview.roomId || '',
                                                        };
                                                    } catch (reviewErr) {
                                                        console.error(`Error fetching review detail for ${review.id}:`, reviewErr);
                                                        return review;
                                                    }
                                                }
                                            }
                                            
                                            // Nếu không có bookingId, thử fetch review detail
                                            try {
                                                const { getReviewById } = await import('@/lib/AdminAPI/reviewService');
                                                const detailReview = await getReviewById(review.id);
                                                
                                                return {
                                                    ...review,
                                                    roomName: detailReview.roomName || 'N/A',
                                                    roomId: detailReview.roomId || '',
                                                };
                                            } catch (err) {
                                                console.error(`Error fetching review detail for ${review.id}:`, err);
                                                return review;
                                            }
                                        })
                                    );
                                    
                                    // Lọc các reviews thành công
                                    const successfulReviews = reviewsWithRoomName
                                        .filter((result): result is PromiseFulfilledResult<Review> => 
                                            result.status === 'fulfilled'
                                        )
                                        .map(result => result.value);
                                    
                                    allReviews.push(...successfulReviews);
                                    
                                    // Kiểm tra xem còn trang tiếp theo không
                                    hasMoreReviews = reviewsResponse.totalPages > reviewPage + 1;
                                    reviewPage++;
                                } else {
                                    hasMoreReviews = false;
                                }
                            }
                        } catch (err: any) {
                            console.error(`Error fetching reviews for hotel ${hotelId}:`, err);
                        }
                    }

                    // 3. Apply filters (nếu có)
                    let filteredReviews = allReviews;
                    
                    if (filterHotelId.trim()) {
                        filteredReviews = filteredReviews.filter(r => 
                            r.hotelId.toLowerCase().includes(filterHotelId.trim().toLowerCase())
                        );
                    }
                    if (filterUserId.trim()) {
                        filteredReviews = filteredReviews.filter(r => 
                            r.userId.toLowerCase().includes(filterUserId.trim().toLowerCase())
                        );
                    }
                    if (filterBookingId.trim()) {
                        filteredReviews = filteredReviews.filter(r => 
                            r.bookingId && r.bookingId.toLowerCase().includes(filterBookingId.trim().toLowerCase())
                        );
                    }
                    if (filterMinScore.trim()) {
                        const minScore = parseInt(filterMinScore.trim());
                        if (!isNaN(minScore) && minScore >= 1 && minScore <= 10) {
                            filteredReviews = filteredReviews.filter(r => r.score >= minScore);
                        }
                    }
                    if (filterMaxScore.trim()) {
                        const maxScore = parseInt(filterMaxScore.trim());
                        if (!isNaN(maxScore) && maxScore >= 1 && maxScore <= 10) {
                            filteredReviews = filteredReviews.filter(r => r.score <= maxScore);
                        }
                    }

                    // 4. Sort
                    if (sortBy === 'score') {
                        filteredReviews.sort((a, b) => 
                            sortDir === 'DESC' ? b.score - a.score : a.score - b.score
                        );
                    } else {
                        filteredReviews.sort((a, b) => 
                            sortDir === 'DESC' 
                                ? b.createdAt.getTime() - a.createdAt.getTime()
                                : a.createdAt.getTime() - b.createdAt.getTime()
                        );
                    }

                    // 5. Paginate
                    const totalItems = filteredReviews.length;
                    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
                    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                    const endIndex = startIndex + ITEMS_PER_PAGE;
                    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

                    setReviews(paginatedReviews);
                    setTotalPages(totalPages);
                    setTotalItems(totalItems);
                } else {
                    // ADMIN: Lấy tất cả reviews với filters
                    const params: GetReviewsParams = {
                        page: currentPage - 1,
                        size: ITEMS_PER_PAGE,
                        sortBy: sortBy === 'created-at' ? 'createdAt' : sortBy,
                        sortDir: sortDir,
                        roleName: roleName,
                        currentUserId: userId,
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

                    const reviewsResponse = await getReviews(params);

                setReviews(reviewsResponse.data);
                setTotalPages(reviewsResponse.totalPages);
                setTotalItems(reviewsResponse.totalItems);
                }

            } catch (error: any) {

                const errorMessage = error.message || 'Lỗi không xác định';
                alert('Không thể tải danh sách đánh giá: ' + errorMessage);

                setReviews([]);
                setTotalPages(0);
                setTotalItems(0);
            } finally {
                setIsLoading(false);
            }
        }

        loadReviews();
    }, [currentPage, effectiveUser?.id, effectiveUser?.role?.name, selectedHotelId, hotels, filterHotelId, filterUserId, filterBookingId, filterMinScore, filterMaxScore, sortBy, sortDir]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleClearFilters = () => {
        setFilterHotelId('');
        setFilterUserId('');
        setFilterBookingId('');
        setFilterMinScore('');
        setFilterMaxScore('');
        setCurrentPage(1);
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
                <LoadingSpinner message="Đang tải danh sách đánh giá..." />
            ) : reviews.length === 0 ? (
                <div className="alert alert-info border-0 shadow-sm" role="alert">
                    <strong>Thông báo:</strong> Không có đánh giá nào.
                    {effectiveUser?.role?.name?.toLowerCase() === 'partner' && (
                        <div className="mt-2 small">
                            (Nếu bạn có khách sạn và có đánh giá, chúng sẽ hiển thị ở đây)
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Filters Section */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body">
                            <div className="row g-3">
                                {/* Hotel Dropdown (chỉ hiển thị cho partner) */}
                                {effectiveUser?.role?.name?.toLowerCase() === 'partner' && hotels.length > 0 && (
                                    <div className="col-md-3">
                                        <label className="form-label small fw-semibold text-muted">🏨 Chọn Khách sạn</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={selectedHotelId}
                                            onChange={(e) => {
                                                setSelectedHotelId(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            <option value="">Tất cả khách sạn</option>
                                            {hotels.map((hotel) => (
                                                <option key={hotel.id} value={hotel.id}>
                                                    {hotel.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">🔍 ID Khách sạn</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="UUID khách sạn"
                                        value={filterHotelId}
                                        onChange={(e) => {
                                            setFilterHotelId(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">👤 ID Người dùng</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="UUID người dùng"
                                        value={filterUserId}
                                        onChange={(e) => {
                                            setFilterUserId(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-semibold text-muted">📋 ID Đơn hàng</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="UUID đơn hàng"
                                        value={filterBookingId}
                                        onChange={(e) => {
                                            setFilterBookingId(e.target.value);
                                            setCurrentPage(1);
                                        }}
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
                                        onChange={(e) => {
                                            setFilterMinScore(e.target.value);
                                            setCurrentPage(1);
                                        }}
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
                                        onChange={(e) => {
                                            setFilterMaxScore(e.target.value);
                                            setCurrentPage(1);
                                        }}
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
                                        onChange={(e) => {
                                            setSortBy(e.target.value);
                                            setCurrentPage(1);
                                        }}
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
                                        onChange={(e) => {
                                            setSortDir(e.target.value as 'ASC' | 'DESC');
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <option value="DESC">Mới nhất / Cao nhất</option>
                                        <option value="ASC">Cũ nhất / Thấp nhất</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="card shadow-sm">
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
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col" className="p-3">STT</th>
                                            <th scope="col" className="p-3">Người đánh giá</th>
                                            <th scope="col" className="p-3">Khách sạn</th>
                                            <th scope="col" className="p-3">Phòng</th>
                                            <th scope="col" className="p-3">Điểm đánh giá</th>
                                            <th scope="col" className="p-3">Bình luận</th>
                                            <th scope="col" className="p-3">Ảnh</th>
                                            <th scope="col" className="p-3">Ngày tạo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map((review, index) => (
                                            <tr key={review.id}>
                                                <td className="p-3">
                                                    <span className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                                    </span>
                                                </td>
                                                <td className="p-3">
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
                                                <td className="p-3">
                                                    <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                                                        {review.hotelName}
                                                    </div>
                                                    <div className="small text-muted" style={{ fontSize: '0.85rem' }}>
                                                        {review.hotelId.substring(0, 8)}...
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>
                                                        {review.roomName && review.roomName !== 'N/A' ? review.roomName : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="d-flex align-items-center gap-1 mb-1">
                                                        {renderStars(review.score)}
                                                    </div>
                                                    <div className="small text-muted fw-medium" style={{ fontSize: '0.85rem' }}>
                                                        {review.score}/10
                                                    </div>
                                                </td>
                                                <td className="p-3">
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
                                                <td className="p-3">
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
                                                <td className="p-3">
                                                    <div className="text-dark" style={{ fontSize: '0.9rem' }}>
                                                        {formatDateTime(review.createdAt)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 d-flex justify-content-center">
                    <Pagination
                        currentPage={currentPage}
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

