

// 'use client';

// import { useSearchParams, useRouter } from 'next/navigation';
// import { useEffect, useState, useRef, useCallback } from 'react';
// import { hotelService, HotelResponse, HotelPhoto } from '@/service/hotelService';
// import { amenityService, Amenity, AmenityCategory } from '@/service/amenityService';
// import Image from 'next/image';
// import styles from './SearchPage.module.css';
// import AmenityFilter from './AmenityFilter';
// import PriceSlider from './PriceSlider';

// const getRatingText = (score: number) => {
//     if (score >= 9.0) return "Xuất sắc";
//     if (score >= 8.5) return "Rất tốt";
//     if (score >= 8.0) return "Tốt";
//     if (score >= 7.0) return "Khá";
//     if (score === 0) return "";
//     return "Bình thường";
// };

// const formatDateRange = (checkin: string, nights: string): string => {
//     if (!checkin || !nights) return 'Chọn ngày';
//     try {
//         const checkinDate = new Date(checkin);
//         const checkoutDate = new Date(checkin);
//         const numNights = parseInt(nights, 10);
//         if (isNaN(numNights)) return 'Số đêm không hợp lệ';
//         checkoutDate.setDate(checkinDate.getDate() + numNights);
//         const formatDate = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
//         return `${formatDate(checkinDate)} - ${formatDate(checkoutDate)}, ${nights} đêm`;
//     } catch (e) {
//         return 'Ngày không hợp lệ';
//     }
// };

// // --- CÁC COMPONENT PHỤ ---
// interface FilterSectionProps { title: string; children: React.ReactNode; }
// const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => {
//     const [isOpen, setIsOpen] = useState(true);
//     return (
//         <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
//             <div className={styles.filterSectionHeader} onClick={() => setIsOpen(!isOpen)}>
//                 <strong style={{ color: '#000' }}>{title}</strong>
//                 <button className={`${styles.filterToggleButton} ${!isOpen ? styles.collapsed : ''}`}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" /></svg></button>
//             </div>
//             <div className={`${styles.filterContent} ${!isOpen ? styles.collapsed : ''}`}>{children}</div>
//         </div>
//     );
// };
// const StarRating = ({ count }: { count: number }) => (
//     <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
//         <span>{count}</span>
//         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#ffc107' }}><path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" /></svg>
//     </div>
// );


// // --- COMPONENT CHÍNH ---
// export default function SearchPage() {
//     const router = useRouter();
//     const searchParams = useSearchParams();

//     // Lấy tất cả các tham số từ URL
//     const query = searchParams.get('query');
//     const cityId = searchParams.get('city-id');
//     const provinceId = searchParams.get('province-id');
//     const districtId = searchParams.get('district-id');
//     const checkin = searchParams.get('checkin');
//     const nights = searchParams.get('nights');
//     const guests = searchParams.get('guests');
//     const [currentQuery, setCurrentQuery] = useState(query || '');
//     const [currentCheckin, setCurrentCheckin] = useState(checkin || new Date().toISOString().split('T')[0]);
//     const [currentNights, setCurrentNights] = useState(parseInt(nights || '1', 10));
//     const [currentGuests, setCurrentGuests] = useState(guests || '2 người lớn, 0 Trẻ em, 1 phòng');
//     // State cho dữ liệu
//     const [hotels, setHotels] = useState<HotelResponse[]>([]);
//     const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
//     const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
//     // price
//     const DEFAULT_MIN_PRICE = 0;
//     const DEFAULT_MAX_PRICE = 30000000;
//     const [priceRange, setPriceRange] = useState<[number, number]>([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);

//     // State cho phân trang
//     const [page, setPage] = useState(0);
//     const [hasMore, setHasMore] = useState(true);
//     const [totalHotelsFound, setTotalHotelsFound] = useState(0);

//     // State cho loading
//     const [loading, setLoading] = useState(true);
//     const [loadingAmenities, setLoadingAmenities] = useState(true);
//     const [loadingMore, setLoadingMore] = useState(false);

//     // Ref cho infinite scroll
//     const observer = useRef<IntersectionObserver | null>(null);
//     const lastHotelElementRef = useCallback((node: HTMLDivElement) => {
//         if (loading || loadingMore) return;
//         if (observer.current) observer.current.disconnect();
//         observer.current = new IntersectionObserver(entries => {
//             if (entries[0].isIntersecting && hasMore) {
//                 setPage(prevPage => prevPage + 1);
//             }
//         });
//         if (node) observer.current.observe(node);
//     }, [loading, loadingMore, hasMore]);

//     const displayDate = formatDateRange(checkin || '', nights || '1');
//     const displayGuests = guests || '2 người lớn, 0 trẻ em, 1 phòng';

//     // Hàm xây dựng tham số tìm kiếm
//     const buildSearchParams = (currentPage: number) => {
//         const params: { [key: string]: any } = { page: currentPage, size: 10 };
//         if (provinceId) params['province-id'] = provinceId;
//         else if (cityId) params['city-id'] = cityId;
//         else if (districtId) params['district-id'] = districtId;
//         else params.name = query || '';

//         if (selectedAmenities.length > 0) {
//             params['amenity-ids'] = selectedAmenities.join(',');
//         }
//         //
//         if (priceRange[0] !== DEFAULT_MIN_PRICE) {
//             params['min-price'] = priceRange[0];
//         }
//         if (priceRange[1] !== DEFAULT_MAX_PRICE) {
//             params['max-price'] = priceRange[1];
//         }
//         return params;
//     };

//     // Effect tải dữ liệu LẦN ĐẦU hoặc KHI BỘ LỌC THAY ĐỔI
//     useEffect(() => {
//         setLoading(true);
//         setHotels([]);
//         setPage(0); // Reset trang về 0 mỗi khi có tìm kiếm mới

//         const params = buildSearchParams(0);
//         console.log(" Tìm kiếm với các tham số:", params);
//         hotelService.searchHotels(params)
//             .then(paginatedData => {
//                 setHotels(paginatedData.content);
//                 setTotalHotelsFound(paginatedData.totalItems);
//                 setHasMore(!paginatedData.last);
//             }).catch(console.error)
//             .finally(() => setLoading(false));

//     }, [query, cityId, provinceId, districtId, selectedAmenities, priceRange]);
//     const handlePriceChange = (min: number, max: number) => {
//         setPriceRange([min, max]);
//     };
//     // Effect để TẢI THÊM khi cuộn
//     useEffect(() => {
//         if (page > 0) {
//             setLoadingMore(true);
//             const params = buildSearchParams(page);

//             hotelService.searchHotels(params)
//                 .then(paginatedData => {
//                     setHotels(prevHotels => [...prevHotels, ...paginatedData.content]);
//                     setHasMore(!paginatedData.last);
//                 }).catch(console.error)
//                 .finally(() => setLoadingMore(false));
//         }
//     }, [page]);

//     // Effect để tải NHÓM tiện nghi (chỉ 1 lần)
//     useEffect(() => {
//         setLoadingAmenities(true);
//         amenityService.getAllAmenityCategories()
//             .then(data => setAmenityCategories(data))
//             .catch(error => console.error("Không thể tải nhóm tiện nghi:", error))
//             .finally(() => setLoadingAmenities(false));
//     }, []);

//     // Hàm xử lý khi check/uncheck tiện nghi
//     const handleAmenityChange = (amenityId: string, isSelected: boolean) => {
//         setSelectedAmenities(prev => {
//             const newSet = new Set(prev);
//             if (isSelected) {
//                 newSet.add(amenityId);
//             } else {
//                 newSet.delete(amenityId);
//             }
//             return Array.from(newSet);
//         });
//     };
//     const handleNewSearch = () => {
//         const params = new URLSearchParams();
//         // Lấy giá trị từ state của các ô input
//         params.set('query', currentQuery);
//         params.set('checkin', currentCheckin);
//         params.set('nights', currentNights.toString());
//         params.set('guests', currentGuests);

//         // Điều hướng đến URL mới, trang sẽ tự động tải lại dữ liệu
//         router.push(`/search?${params.toString()}`);
//     };
//     // Hàm điều hướng đến trang chi tiết
//     const handleSelectHotel = (hotelId: string) => {
//         const params = new URLSearchParams(searchParams.toString());
//         router.push(`/hotels/${hotelId}?${params.toString()}`);
//     };

//     return (
//         <div className={styles.pageContainer}>
//             <div className={styles.searchBarWrapper}>
//                 <div className={styles.searchBar}>
//                     <div className={styles.searchBarSection}>
//                         <i className={`bi bi-geo-alt-fill ${styles.searchBarIcon}`}></i>
//                         <input type="text" value={currentQuery} onChange={(e) => setCurrentQuery(e.target.value)} className={styles.searchBarInput} />
//                     </div>
//                     <div className={styles.searchBarSection}>
//                         <i className={`bi bi-calendar3 ${styles.searchBarIcon}`}></i>
//                         {/* Logic cho date picker sẽ phức tạp hơn, tạm dùng input date */}
//                         <input type="date" value={currentCheckin} onChange={(e) => setCurrentCheckin(e.target.value)} className={styles.searchBarInput} />
//                     </div>
//                     <div className={styles.searchBarSection}>
//                         <i className={`bi bi-person-fill ${styles.searchBarIcon}`}></i>
//                         <input type="text" value={currentGuests} onChange={(e) => setCurrentGuests(e.target.value)} className={styles.searchBarInput} />
//                     </div>
//                     <button className={styles.searchButton} onClick={handleNewSearch}>
//                         <i className="bi bi-search"></i>
//                         Tìm khách sạn
//                     </button>
//                 </div>
//             </div>

//             <div className={styles.mainContainer}>
//                 <aside className={styles.sidebar}>

//                     <PriceSlider
//                         minDefault={DEFAULT_MIN_PRICE}
//                         maxDefault={DEFAULT_MAX_PRICE}
//                         onPriceChange={handlePriceChange}
//                     />
//                     {loadingAmenities ? (
//                         <div style={{ background: '#fff', padding: 16, borderRadius: 12 }}>Đang tải bộ lọc...</div>
//                     ) : (
//                         amenityCategories.map(category => (
//                             <AmenityFilter
//                                 key={category.id}
//                                 categoryId={category.id}
//                                 categoryName={category.name}
//                                 selectedAmenities={selectedAmenities}
//                                 onAmenityChange={handleAmenityChange}
//                             />
//                         ))
//                     )}
//                 </aside>

//                 <main className={styles.mainContent}>
//                     <div className={styles.listHeader}>
//                         <div>
//                             <h2 style={{ margin: 0, color: '#000' }}>{query || 'Kết quả tìm kiếm'}</h2>
//                             <p style={{ margin: 0, color: '#666' }}>Tìm thấy {totalHotelsFound} nơi lưu trú</p>
//                         </div>
//                     </div>

//                     {loading ? <div style={{ textAlign: 'center', padding: 50 }}>Đang tải kết quả...</div>
//                         : hotels.length === 0 ? <div style={{ textAlign: 'center', padding: 50 }}>Không tìm thấy khách sạn nào phù hợp.</div>
//                             : (
//                                 <div className={styles.hotelList}>
//                                     {hotels.map((hotel, index) => {
//                                         const allPhotos = hotel.photos?.flatMap((p: HotelPhoto) => p.photos.map(photo => photo.url)) || [];
//                                         const mainImage = allPhotos[0] || '/placeholder.svg';
//                                         const thumbnailImages = allPhotos.slice(1, 4);
//                                         const ratingScore = hotel.averageScore;
//                                         const ratingText = getRatingText(ratingScore);
//                                         const reviewCount = 78; // Dữ liệu giả

//                                         const cardContent = (
//                                             <div className={styles.hotelCard} onClick={() => handleSelectHotel(hotel.id)} style={{ cursor: 'pointer' }}>
//                                                 <div className={styles.imageColumn}><div className={styles.mainImageWrapper}><Image src={mainImage} alt={hotel.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} /></div>{thumbnailImages.length > 0 && (<div className={styles.thumbnailGrid} style={{ gridTemplateColumns: `repeat(${thumbnailImages.length}, 1fr)` }}>{thumbnailImages.map((imgUrl, idx) => (<div key={idx} className={styles.thumbnailWrapper}><Image src={imgUrl} alt={`${hotel.name} thumbnail ${idx + 1}`} fill sizes="10vw" style={{ objectFit: 'cover' }} /></div>))}</div>)}</div>
//                                                 <div className={styles.infoColumn}><h3 className="fw-bold text-dark mb-1 fs-5">{hotel.name}</h3><div className="d-flex align-items-center gap-2 mb-2">{ratingScore > 0 && (<><span className={styles.ratingBadge}>{ratingScore.toFixed(1)}</span><span className="fw-bold text-dark">{ratingText}</span><span className="text-muted small">({reviewCount} đánh giá)</span></>)}</div><div className="d-flex align-items-center gap-2 mb-2"><span className="badge bg-light text-dark border">Khách sạn</span><StarRating count={hotel.starRating || 0} /></div><div className="text-muted small mb-3"><i className="bi bi-geo-alt-fill text-danger me-1"></i>{hotel.ward?.name}, {hotel.district?.name}</div><div className="text-muted small">Dịch vụ trả phòng cấp tốc</div><div className="mt-auto pt-2"><div className="d-flex align-items-center gap-2 border-top pt-2"><span className={`badge ${styles.bgInfoSoft} ${styles.textInfo} fw-bold`}><i className="bi bi-wallet2 me-1"></i>Mã giảm đến 200K có sẵn!</span></div></div></div>
//                                                 <div className={styles.priceColumn}><div className="text-end"><span className={`badge ${styles.bgPrimarySoft} ${styles.textPrimary} mb-2`}><i className="bi bi-tsunami me-1"></i> Gần biển</span></div><div className="text-end text-muted text-decoration-line-through small">{hotel.rawPricePerNight > hotel.currentPricePerNight ? `${hotel.rawPricePerNight?.toLocaleString('vi-VN')} VND` : <span>&nbsp;</span>}</div><div className={`text-end mb-1 ${styles.priceFinal}`}>{hotel.currentPricePerNight?.toLocaleString('vi-VN')} VND</div><div className="text-end text-muted small mb-2">Chỉ còn 2 phòng có giá này!</div><button className={styles.selectRoomButton} onClick={(e) => { e.stopPropagation(); handleSelectHotel(hotel.id); }}>Xem các loại phòng</button></div>
//                                             </div>
//                                         );

//                                         if (hotels.length === index + 1) {
//                                             return <div ref={lastHotelElementRef} key={hotel.id}>{cardContent}</div>;
//                                         }
//                                         return <div key={hotel.id}>{cardContent}</div>;
//                                     })}
//                                     {loadingMore && <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải thêm khách sạn...</div>}
//                                     {!hasMore && hotels.length > 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Bạn đã xem hết tất cả kết quả.</div>}
//                                 </div>
//                             )
//                     }
//                 </main>
//             </div>
//         </div>
//     );
// }


'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { hotelService, HotelResponse, HotelPhoto } from '@/service/hotelService';
import { amenityService, AmenityCategory } from '@/service/amenityService';
import Image from 'next/image';
import styles from './SearchPage.module.css';
import AmenityFilter from './AmenityFilter';
import PriceSlider from './PriceSlider';
import LocationSearchInput from '@/components/Location/LocationSearchInput'; // Đảm bảo đường dẫn này đúng
import { LocationSuggestion } from '@/service/locationService';

// --- CÁC HÀM TIỆN ÍCH ---
const getRatingText = (score: number) => {
    if (score >= 9.0) return "Xuất sắc";
    if (score >= 8.5) return "Rất tốt";
    if (score >= 8.0) return "Tốt";
    if (score >= 7.0) return "Khá";
    if (score === 0) return "";
    return "Bình thường";
};

const formatDateForDisplay = (checkin: string, nights: number): string => {
    try {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkinDate);
        checkoutDate.setDate(checkinDate.getDate() + nights);

        const format = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

        return `${format(checkinDate)} - ${format(checkoutDate)}, ${nights} đêm`;
    } catch (e) {
        return 'Chọn ngày';
    }
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

    // === LẤY DỮ LIỆU TỪ URL VÀ KHỞI TẠO STATE ===
    const query = searchParams.get('query') || '';
    const cityId = searchParams.get('city-id');
    const provinceId = searchParams.get('province-id');
    const districtId = searchParams.get('district-id');
    const checkin = searchParams.get('checkin') || new Date().toISOString().split('T')[0];
    const nights = parseInt(searchParams.get('nights') || '1', 10);
    const guestsText = searchParams.get('guestsText') || '2 người lớn, 1 phòng';

    // State cho thanh tìm kiếm (để người dùng có thể thay đổi)
    const [currentCheckin, setCurrentCheckin] = useState(checkin);
    const [currentNights, setCurrentNights] = useState(nights);
    const [currentGuests, setCurrentGuests] = useState(guestsText);

    // State cho dữ liệu và bộ lọc
    const [hotels, setHotels] = useState<HotelResponse[]>([]);
    const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const DEFAULT_MIN_PRICE = 0;
    const DEFAULT_MAX_PRICE = 30000000;
    const [priceRange, setPriceRange] = useState<[number, number]>([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);

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

    // === CÁC HÀM XỬ LÝ LOGIC ===
    const buildSearchParams = (currentPage: number) => {
        const params: { [key: string]: any } = { page: currentPage, size: 10 };
        if (provinceId) params['province-id'] = provinceId;
        else if (cityId) params['city-id'] = cityId;
        else if (districtId) params['district-id'] = districtId;
        else if (query) params.name = query;

        if (selectedAmenities.length > 0) params['amenity-ids'] = selectedAmenities.join(',');
        if (priceRange[0] !== DEFAULT_MIN_PRICE) params['min-price'] = priceRange[0];
        if (priceRange[1] !== DEFAULT_MAX_PRICE) params['max-price'] = priceRange[1];

        return params;
    };

    const handleLocationSelect = (location: LocationSuggestion) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('query');
        params.delete('province-id');
        params.delete('city-id');
        params.delete('district-id');

        switch (location.type) {
            case 'PROVINCE': case 'CITY_PROVINCE': params.set('province-id', location.id.replace('province-', '')); break;
            case 'CITY': params.set('city-id', location.id.replace('city-', '')); break;
            case 'DISTRICT': params.set('district-id', location.id.replace('district-', '')); break;
            case 'HOTEL':
                router.push(`/hotels/${location.id.replace('hotel-', '')}`);
                return;
        }
        params.set('query', location.name);
        router.push(`/search?${params.toString()}`);
    };

    const handleNewSearch = () => {
        const params = new URLSearchParams();
        // Giữ lại các param địa điểm hiện tại từ URL
        if (provinceId) params.set('province-id', provinceId);
        if (cityId) params.set('city-id', cityId);
        if (districtId) params.set('district-id', districtId);
        params.set('query', query);

        // Cập nhật các param mới
        params.set('checkin', currentCheckin);
        params.set('nights', currentNights.toString());
        params.set('guestsText', currentGuests);
        router.push(`/search?${params.toString()}`);
    };

    const handleSelectHotel = (hotelId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/hotels/${hotelId}?${params.toString()}`);
    };

    const handleAmenityChange = (amenityId: string, isSelected: boolean) => {
        setSelectedAmenities(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(amenityId);
            else newSet.delete(amenityId);
            return Array.from(newSet);
        });
    };

    const handlePriceChange = (min: number, max: number) => {
        setPriceRange([min, max]);
    };

    // === USE EFFECT HOOKS ===
    useEffect(() => {
        setLoading(true);
        setHotels([]);
        setPage(0);

        const params = buildSearchParams(0);
        hotelService.searchHotels(params)
            .then(paginatedData => {
                setHotels(paginatedData.content);
                setTotalHotelsFound(paginatedData.totalItems);
                setHasMore(!paginatedData.last);
            }).catch(console.error)
            .finally(() => setLoading(false));
    }, [query, cityId, provinceId, districtId, selectedAmenities, priceRange]);

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
    }, [page]);

    useEffect(() => {
        setLoadingAmenities(true);
        amenityService.getAllAmenityCategories()
            .then(data => setAmenityCategories(data))
            .catch(error => console.error("Không thể tải nhóm tiện nghi:", error))
            .finally(() => setLoadingAmenities(false));
    }, []);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.searchBarWrapper}>
                <div className={styles.searchBar}>
                    <div className={styles.searchBarSection}>
                        <i className={`bi bi-geo-alt-fill ${styles.searchBarIcon}`}></i>
                        <LocationSearchInput
                            initialValue={query}
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>
                    <div className={styles.searchBarSection}>
                        <i className={`bi bi-calendar3 ${styles.searchBarIcon}`}></i>
                        {/* Thay thế bằng một DatePicker component sau này */}
                        <div className={styles.datePickerPlaceholder}>
                            <input
                                type="date"
                                value={currentCheckin}
                                onChange={(e) => setCurrentCheckin(e.target.value)}
                                className={styles.dateInput}
                            />
                            <select
                                value={currentNights}
                                onChange={(e) => setCurrentNights(parseInt(e.target.value, 10))}
                                className={styles.nightsSelect}
                            >
                                {[...Array(10)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} đêm</option>)}
                            </select>
                        </div>
                        <div className={styles.dateDisplay}>
                            {formatDateForDisplay(currentCheckin, currentNights)}
                        </div>
                    </div>
                    <div className={styles.searchBarSection}>
                        <i className={`bi bi-person-fill ${styles.searchBarIcon}`}></i>
                        <input
                            type="text"
                            value={currentGuests}
                            onChange={(e) => setCurrentGuests(e.target.value)}
                            className={styles.searchBarInput}
                        />
                    </div>
                    <button className={styles.searchButton} onClick={handleNewSearch}>
                        <i className="bi bi-search"></i>
                        Tìm khách sạn
                    </button>
                </div>
            </div>

            <div className={styles.mainContainer}>
                <aside className={styles.sidebar}>
                    <PriceSlider
                        minDefault={DEFAULT_MIN_PRICE}
                        maxDefault={DEFAULT_MAX_PRICE}
                        onPriceChange={handlePriceChange}
                    />
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

