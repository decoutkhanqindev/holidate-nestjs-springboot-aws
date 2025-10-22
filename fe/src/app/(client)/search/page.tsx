

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { hotelService, HotelResponse, HotelPhoto } from '@/service/hotelService';
import { amenityService, Amenity, AmenityCategory } from '@/service/amenityService';
import Image from 'next/image';
import styles from './SearchPage.module.css';
import AmenityFilter from './AmenityFilter'; // Giả sử bạn đã tạo file này như hướng dẫn trước

// --- CÁC HÀM TIỆN ÍCH ---
const getRatingText = (score: number) => {
    if (score >= 9.0) return "Xuất sắc";
    if (score >= 8.5) return "Rất tốt";
    if (score >= 8.0) return "Tốt";
    if (score >= 7.0) return "Khá";
    if (score === 0) return "";
    return "Bình thường";
};

const formatDateRange = (checkin: string, nights: string): string => {
    if (!checkin || !nights) return 'Chọn ngày';
    try {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkin);
        const numNights = parseInt(nights, 10);
        if (isNaN(numNights)) return 'Số đêm không hợp lệ';
        checkoutDate.setDate(checkinDate.getDate() + numNights);
        const formatDate = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
        return `${formatDate(checkinDate)} - ${formatDate(checkoutDate)}, ${nights} đêm`;
    } catch (e) {
        return 'Ngày không hợp lệ';
    }
};

// --- CÁC COMPONENT PHỤ ---
interface FilterSectionProps { title: string; children: React.ReactNode; }
const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className={styles.filterSectionHeader} onClick={() => setIsOpen(!isOpen)}>
                <strong style={{ color: '#000' }}>{title}</strong>
                <button className={`${styles.filterToggleButton} ${!isOpen ? styles.collapsed : ''}`}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" /></svg></button>
            </div>
            <div className={`${styles.filterContent} ${!isOpen ? styles.collapsed : ''}`}>{children}</div>
        </div>
    );
};
const StarRating = ({ count }: { count: number }) => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span>{count}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#ffc107' }}><path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" /></svg>
    </div>
);


// --- COMPONENT CHÍNH ---
export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Lấy tất cả các tham số từ URL
    const query = searchParams.get('query');
    const cityId = searchParams.get('city-id');
    const provinceId = searchParams.get('province-id');
    const districtId = searchParams.get('district-id');
    const checkin = searchParams.get('checkin');
    const nights = searchParams.get('nights');
    const guests = searchParams.get('guests');
    const [currentQuery, setCurrentQuery] = useState(query || '');
    const [currentCheckin, setCurrentCheckin] = useState(checkin || new Date().toISOString().split('T')[0]);
    const [currentNights, setCurrentNights] = useState(parseInt(nights || '1', 10));
    const [currentGuests, setCurrentGuests] = useState(guests || '2 người lớn, 0 Trẻ em, 1 phòng');
    // State cho dữ liệu
    const [hotels, setHotels] = useState<HotelResponse[]>([]);
    const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    // State cho phân trang
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalHotelsFound, setTotalHotelsFound] = useState(0);

    // State cho loading
    const [loading, setLoading] = useState(true);
    const [loadingAmenities, setLoadingAmenities] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Ref cho infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastHotelElementRef = useCallback((node: HTMLDivElement) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const displayDate = formatDateRange(checkin || '', nights || '1');
    const displayGuests = guests || '2 người lớn, 0 trẻ em, 1 phòng';

    // Hàm xây dựng tham số tìm kiếm
    const buildSearchParams = (currentPage: number) => {
        const params: { [key: string]: any } = { page: currentPage, size: 10 };
        if (provinceId) params['province-id'] = provinceId;
        else if (cityId) params['city-id'] = cityId;
        else if (districtId) params['district-id'] = districtId;
        else params.name = query || '';

        if (selectedAmenities.length > 0) {
            params['amenity-ids'] = selectedAmenities.join(',');
        }
        return params;
    };

    // Effect tải dữ liệu LẦN ĐẦU hoặc KHI BỘ LỌC THAY ĐỔI
    useEffect(() => {
        setLoading(true);
        setHotels([]);
        setPage(0); // Reset trang về 0 mỗi khi có tìm kiếm mới

        const params = buildSearchParams(0);

        hotelService.searchHotels(params)
            .then(paginatedData => {
                setHotels(paginatedData.content);
                setTotalHotelsFound(paginatedData.totalItems);
                setHasMore(!paginatedData.last);
            }).catch(console.error)
            .finally(() => setLoading(false));

    }, [query, cityId, provinceId, districtId, selectedAmenities]); // Chạy lại khi các bộ lọc thay đổi

    // Effect để TẢI THÊM khi cuộn
    useEffect(() => {
        if (page > 0) {
            setLoadingMore(true);
            const params = buildSearchParams(page);

            hotelService.searchHotels(params)
                .then(paginatedData => {
                    setHotels(prevHotels => [...prevHotels, ...paginatedData.content]);
                    setHasMore(!paginatedData.last);
                }).catch(console.error)
                .finally(() => setLoadingMore(false));
        }
    }, [page]); // Chỉ chạy khi 'page' tăng

    // Effect để tải NHÓM tiện nghi (chỉ 1 lần)
    useEffect(() => {
        setLoadingAmenities(true);
        amenityService.getAllAmenityCategories()
            .then(data => setAmenityCategories(data))
            .catch(error => console.error("Không thể tải nhóm tiện nghi:", error))
            .finally(() => setLoadingAmenities(false));
    }, []);

    // Hàm xử lý khi check/uncheck tiện nghi
    const handleAmenityChange = (amenityId: string, isSelected: boolean) => {
        setSelectedAmenities(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(amenityId);
            } else {
                newSet.delete(amenityId);
            }
            return Array.from(newSet);
        });
    };
    const handleNewSearch = () => {
        const params = new URLSearchParams();
        // Lấy giá trị từ state của các ô input
        params.set('query', currentQuery);
        params.set('checkin', currentCheckin);
        params.set('nights', currentNights.toString());
        params.set('guests', currentGuests);

        // Điều hướng đến URL mới, trang sẽ tự động tải lại dữ liệu
        router.push(`/search?${params.toString()}`);
    };
    // Hàm điều hướng đến trang chi tiết
    const handleSelectHotel = (hotelId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/hotels/${hotelId}?${params.toString()}`);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.searchBarWrapper}>
                <div className={styles.searchBar}>
                    <div className={styles.searchBarSection}>
                        <i className={`bi bi-geo-alt-fill ${styles.searchBarIcon}`}></i>
                        <input type="text" value={currentQuery} onChange={(e) => setCurrentQuery(e.target.value)} className={styles.searchBarInput} />
                    </div>
                    <div className={styles.searchBarSection}>
                        <i className={`bi bi-calendar3 ${styles.searchBarIcon}`}></i>
                        {/* Logic cho date picker sẽ phức tạp hơn, tạm dùng input date */}
                        <input type="date" value={currentCheckin} onChange={(e) => setCurrentCheckin(e.target.value)} className={styles.searchBarInput} />
                    </div>
                    <div className={styles.searchBarSection}>
                        <i className={`bi bi-person-fill ${styles.searchBarIcon}`}></i>
                        <input type="text" value={currentGuests} onChange={(e) => setCurrentGuests(e.target.value)} className={styles.searchBarInput} />
                    </div>
                    <button className={styles.searchButton} onClick={handleNewSearch}>
                        <i className="bi bi-search"></i>
                        Tìm khách sạn
                    </button>
                </div>
            </div>

            <div className={styles.mainContainer}>
                <aside className={styles.sidebar}>


                    {loadingAmenities ? (
                        <div style={{ background: '#fff', padding: 16, borderRadius: 12 }}>Đang tải bộ lọc...</div>
                    ) : (
                        amenityCategories.map(category => (
                            <AmenityFilter
                                key={category.id}
                                categoryId={category.id}
                                categoryName={category.name}
                                selectedAmenities={selectedAmenities}
                                onAmenityChange={handleAmenityChange}
                            />
                        ))
                    )}
                </aside>

                <main className={styles.mainContent}>
                    <div className={styles.listHeader}>
                        <div>
                            <h2 style={{ margin: 0, color: '#000' }}>{query || 'Kết quả tìm kiếm'}</h2>
                            <p style={{ margin: 0, color: '#666' }}>Tìm thấy {totalHotelsFound} nơi lưu trú</p>
                        </div>
                    </div>

                    {loading ? <div style={{ textAlign: 'center', padding: 50 }}>Đang tải kết quả...</div>
                        : hotels.length === 0 ? <div style={{ textAlign: 'center', padding: 50 }}>Không tìm thấy khách sạn nào phù hợp.</div>
                            : (
                                <div className={styles.hotelList}>
                                    {hotels.map((hotel, index) => {
                                        const allPhotos = hotel.photos?.flatMap((p: HotelPhoto) => p.photos.map(photo => photo.url)) || [];
                                        const mainImage = allPhotos[0] || '/placeholder.svg';
                                        const thumbnailImages = allPhotos.slice(1, 4);
                                        const ratingScore = hotel.averageScore;
                                        const ratingText = getRatingText(ratingScore);
                                        const reviewCount = 78; // Dữ liệu giả

                                        const cardContent = (
                                            <div className={styles.hotelCard} onClick={() => handleSelectHotel(hotel.id)} style={{ cursor: 'pointer' }}>
                                                <div className={styles.imageColumn}><div className={styles.mainImageWrapper}><Image src={mainImage} alt={hotel.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} /></div>{thumbnailImages.length > 0 && (<div className={styles.thumbnailGrid} style={{ gridTemplateColumns: `repeat(${thumbnailImages.length}, 1fr)` }}>{thumbnailImages.map((imgUrl, idx) => (<div key={idx} className={styles.thumbnailWrapper}><Image src={imgUrl} alt={`${hotel.name} thumbnail ${idx + 1}`} fill sizes="10vw" style={{ objectFit: 'cover' }} /></div>))}</div>)}</div>
                                                <div className={styles.infoColumn}><h3 className="fw-bold text-dark mb-1 fs-5">{hotel.name}</h3><div className="d-flex align-items-center gap-2 mb-2">{ratingScore > 0 && (<><span className={styles.ratingBadge}>{ratingScore.toFixed(1)}</span><span className="fw-bold text-dark">{ratingText}</span><span className="text-muted small">({reviewCount} đánh giá)</span></>)}</div><div className="d-flex align-items-center gap-2 mb-2"><span className="badge bg-light text-dark border">Khách sạn</span><StarRating count={hotel.starRating || 0} /></div><div className="text-muted small mb-3"><i className="bi bi-geo-alt-fill text-danger me-1"></i>{hotel.ward?.name}, {hotel.district?.name}</div><div className="text-muted small">Dịch vụ trả phòng cấp tốc</div><div className="mt-auto pt-2"><div className="d-flex align-items-center gap-2 border-top pt-2"><span className={`badge ${styles.bgInfoSoft} ${styles.textInfo} fw-bold`}><i className="bi bi-wallet2 me-1"></i>Mã giảm đến 200K có sẵn!</span></div></div></div>
                                                <div className={styles.priceColumn}><div className="text-end"><span className={`badge ${styles.bgPrimarySoft} ${styles.textPrimary} mb-2`}><i className="bi bi-tsunami me-1"></i> Gần biển</span></div><div className="text-end text-muted text-decoration-line-through small">{hotel.rawPricePerNight > hotel.currentPricePerNight ? `${hotel.rawPricePerNight?.toLocaleString('vi-VN')} VND` : <span>&nbsp;</span>}</div><div className={`text-end mb-1 ${styles.priceFinal}`}>{hotel.currentPricePerNight?.toLocaleString('vi-VN')} VND</div><div className="text-end text-muted small mb-2">Chỉ còn 2 phòng có giá này!</div><button className={styles.selectRoomButton} onClick={(e) => { e.stopPropagation(); handleSelectHotel(hotel.id); }}>Xem các loại phòng</button></div>
                                            </div>
                                        );

                                        if (hotels.length === index + 1) {
                                            return <div ref={lastHotelElementRef} key={hotel.id}>{cardContent}</div>;
                                        }
                                        return <div key={hotel.id}>{cardContent}</div>;
                                    })}
                                    {loadingMore && <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải thêm khách sạn...</div>}
                                    {!hasMore && hotels.length > 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Bạn đã xem hết tất cả kết quả.</div>}
                                </div>
                            )
                    }
                </main>
            </div>
        </div>
    );
}