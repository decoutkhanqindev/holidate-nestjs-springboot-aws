// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { hotelService, HotelResponse } from '@/service/hotelService';
// import { locationService, LocationSuggestion, LocationType } from '@/service/locationService';
// import styles from './HotelsCard.module.css';

// // ---  hàm tiện ích  ---
// const formatLocationNameForDisplay = (fullName: string) => fullName.replace(/^(Thành phố|Tỉnh|Thủ đô)\s/, '');
// const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
// const formatRating = (rating?: number) => rating && rating > 0 ? `${rating.toFixed(1)}/10` : 'Chưa có đánh giá';
// const getHotelImageUrl = (hotel: HotelResponse) => hotel.photos?.[0]?.photos?.[0]?.url || '/placeholder.svg';
// const getTypeLabel = (type: LocationType) => {
//     switch (type) {
//         case 'HOTEL': return 'Khách sạn';
//         case 'PROVINCE': case 'CITY_PROVINCE': return 'Vùng';
//         case 'CITY': return 'Thành phố';
//         case 'DISTRICT': return 'Quận/Huyện';
//         default: return '';
//     }
// };

// // ---  LocationSearchInput ---
// interface LocationSearchInputProps {
//     value: string;
//     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     onLocationSelect: (location: LocationSuggestion) => void;
// }
// const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ value, onChange, onLocationSelect }) => {
//     const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
//     const wrapperRef = useRef<HTMLDivElement>(null);
//     useEffect(() => {
//         if (value.trim().length < 2) { setSuggestions([]); return; }
//         const debounceTimer = setTimeout(async () => {
//             setIsLoading(true);
//             try {
//                 const results = await locationService.searchLocations({ query: value });
//                 setSuggestions(results);
//             }
//             finally { setIsLoading(false); }
//         }, 350);
//         return () => clearTimeout(debounceTimer);
//     }, [value]);
//     const handleSelectSuggestion = (location: LocationSuggestion) => {
//         onLocationSelect(location);
//         setSuggestions([]);
//         setIsSuggestionsVisible(false);
//     };
//     useEffect(() => {
//         function handleClickOutside(event: MouseEvent) {
//             if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
//                 setIsSuggestionsVisible(false);
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, [wrapperRef]);
//     return (
//         <div className={styles.searchInputWrapper} ref={wrapperRef}>
//             <input type="text" className="form-control" value={value} onChange={onChange} onFocus={() => setIsSuggestionsVisible(true)} placeholder="Nhập tên khách sạn hoặc địa điểm" autoComplete="off" />
//             {isSuggestionsVisible && value.length > 1 && (
//                 <ul className={styles.suggestionsList}>
//                     {isLoading ? <li className={styles.suggestionInfo}>Đang tìm kiếm...</li>
//                         : suggestions.length > 0 ? suggestions.map((suggestion) => (
//                             <li key={suggestion.id} className={styles.suggestionItem} onClick={() => handleSelectSuggestion(suggestion)}>
//                                 <div className={styles.suggestionContent}><strong>{suggestion.name}</strong><div className={styles.suggestionDescription}>{suggestion.description}</div></div>
//                                 <div className={styles.suggestionMeta}><span className={styles.suggestionTypeLabel}>{getTypeLabel(suggestion.type)}</span>{suggestion.hotelCount && suggestion.hotelCount > 0 && (<span className={styles.suggestionHotelCount}>{suggestion.hotelCount.toLocaleString('vi-VN')} khách sạn</span>)}</div>
//                             </li>
//                         )) : <li className={styles.suggestionInfo}>Không tìm thấy kết quả phù hợp.</li>}
//                 </ul>
//             )}
//         </div>
//     );
// };

// // --- Interfaces      ---
// interface City {
//     id: string;
//     name: string;
// }
// interface LocationData {
//     hotels: HotelResponse[];
//     page: number;
//     totalPages: number;
// }


// export default function HotelsCard() {
//     const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
//     const [searchQuery, setSearchQuery] = useState('');
//     const today = new Date().toISOString().split('T')[0];
//     const [checkInDate, setCheckInDate] = useState(today);
//     const [numNights, setNumNights] = useState(1);
//     const [guests, setGuests] = useState('2 người lớn, 0 Trẻ em, 1 phòng');
//     const router = useRouter();

//     const [featuredLocations, setFeaturedLocations] = useState<City[]>([]);
//     const [activeLocation, setActiveLocation] = useState<City | null>(null);
//     const [locationData, setLocationData] = useState<Map<string, LocationData>>(new Map());

//     const [isLoadingInitial, setIsLoadingInitial] = useState(true);
//     const [isLoadingTab, setIsLoadingTab] = useState(false);
//     const [isLoadingMore, setIsLoadingMore] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const scrollContainerRef = useRef<HTMLDivElement>(null);
//     const [showPrevButton, setShowPrevButton] = useState(false);
//     const [showNextButton, setShowNextButton] = useState(true);


//     useEffect(() => {
//         const fetchAllCities = async () => {
//             setIsLoadingInitial(true);
//             setError(null);
//             try {
//                 const cities = await locationService.getCities();
//                 if (cities && cities.length > 0) {
//                     setFeaturedLocations(cities);
//                     setActiveLocation(cities[0]);
//                 } else {
//                     setError("Không tìm thấy địa điểm nào.");
//                 }
//             } catch (err) {
//                 setError("Lỗi tải danh sách địa điểm.");
//             } finally {
//                 setIsLoadingInitial(false);
//             }
//         };
//         fetchAllCities();
//     }, []);

//     useEffect(() => {
//         const fetchHotelsForTab = async () => {
//             if (!activeLocation || locationData.has(activeLocation.id)) return;
//             setIsLoadingTab(true);
//             setError(null);
//             try {
//                 const response = await hotelService.searchHotels({ 'city-id': activeLocation.id, page: 0, size: 8 });
//                 setLocationData(prev => new Map(prev).set(activeLocation.id, {
//                     hotels: response.content || [],
//                     page: response.page,
//                     totalPages: response.totalPages,
//                 }));
//             } catch (err) {
//                 setError(`Lỗi tải khách sạn tại ${activeLocation.name}.`);
//                 setLocationData(prev => new Map(prev).set(activeLocation.id, { hotels: [], page: 0, totalPages: 0 }));
//             } finally {
//                 setIsLoadingTab(false);
//             }
//         };
//         if (!isLoadingInitial && activeLocation) {
//             fetchHotelsForTab();
//         }
//     }, [activeLocation, isLoadingInitial]);

//     const handleLoadMore = async () => {
//         if (!activeLocation || isLoadingMore) return;
//         const currentData = locationData.get(activeLocation.id);
//         if (!currentData || currentData.page >= currentData.totalPages - 1) return;

//         setIsLoadingMore(true);
//         try {
//             const nextPage = currentData.page + 1;
//             const response = await hotelService.searchHotels({ 'city-id': activeLocation.id, page: nextPage, size: 4 });
//             setLocationData(prev => {
//                 const existingData = prev.get(activeLocation.id)!;
//                 return new Map(prev).set(activeLocation.id, {
//                     hotels: [...existingData.hotels, ...response.content],
//                     page: response.page,
//                     totalPages: response.totalPages,
//                 });
//             });
//         } catch (err) {
//             
//         } finally {
//             setIsLoadingMore(false);
//         }
//     };

//     const handleLocationSelect = (location: LocationSuggestion) => {
//         setSelectedLocation(location);
//         setSearchQuery(location.name);
//     };

//     useEffect(() => {
//         const container = scrollContainerRef.current;
//         if (!container) return;

//         const handleScroll = () => {
//             if (isLoadingMore || !activeLocation) return;
//             const { scrollLeft, scrollWidth, clientWidth } = container;
//             setShowPrevButton(scrollLeft > 10);
//             const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
//             const currentData = locationData.get(activeLocation.id);
//             const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
//             setShowNextButton(!isAtEnd || hasMorePages);
//             if (scrollLeft + clientWidth >= scrollWidth - 200 && hasMorePages) {
//                 handleLoadMore();
//             }
//         };

//         container.scrollLeft = 0;
//         const timer = setTimeout(handleScroll, 150);
//         container.addEventListener('scroll', handleScroll, { passive: true });
//         window.addEventListener('resize', handleScroll);

//         return () => {
//             clearTimeout(timer);
//             container.removeEventListener('scroll', handleScroll);
//             window.removeEventListener('resize', handleScroll);
//         };
//     }, [activeLocation, locationData, isLoadingMore]);

//     const handleScrollButton = (direction: 'left' | 'right') => {
//         const container = scrollContainerRef.current;
//         if (!container || !activeLocation) return;

//         if (direction === 'left') {
//             container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' });
//         } else {
//             const { scrollLeft, scrollWidth, clientWidth } = container;
//             const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 20;
//             const currentData = locationData.get(activeLocation.id);
//             const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
//             if (isAtEnd && hasMorePages) {
//                 handleLoadMore();
//             } else {
//                 container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' });
//             }
//         }
//     };



//     // const handleMainSearch = () => {
//     //     const params = new URLSearchParams();

//     //     if (selectedLocation) {
//     //         switch (selectedLocation.type) {
//     //             case 'PROVINCE':
//     //             case 'CITY_PROVINCE':
//     //                 params.set('province-id', selectedLocation.id.replace('province-', ''));
//     //                 break;
//     //             case 'CITY':
//     //                 params.set('city-id', selectedLocation.id.replace('city-', ''));
//     //                 break;
//     //             case 'DISTRICT':
//     //                 params.set('district-id', selectedLocation.id.replace('district-', ''));
//     //                 break;
//     //             case 'HOTEL':
//     //                 router.push(`/hotels/${selectedLocation.id.replace('hotel-', '')}`);
//     //                 return;
//     //         }
//     //         params.set('query', selectedLocation.name);

//     //     } else {
//     //         params.set('query', searchQuery);
//     //     }

//     //     if (checkInDate) params.set('checkin', checkInDate);
//     //     params.set('nights', numNights.toString());
//     //     params.set('guests', guests);

//     //     router.push(`/search?${params.toString()}`);
//     // };

//     // Trong file HotelsCard.tsx

//     // ... (các import và state giữ nguyên)

//     const handleMainSearch = () => {
//         const params = new URLSearchParams();

//         // 1. Xử lý địa điểm
//         if (selectedLocation) { // Ưu tiên địa điểm đã chọn từ gợi ý
//             switch (selectedLocation.type) {
//                 case 'PROVINCE':
//                 case 'CITY_PROVINCE':
//                     params.set('province-id', selectedLocation.id.replace('province-', ''));
//                     break;
//                 case 'CITY':
//                     params.set('city-id', selectedLocation.id.replace('city-', ''));
//                     break;
//                 case 'DISTRICT':
//                     params.set('district-id', selectedLocation.id.replace('district-', ''));
//                     break;
//                 case 'HOTEL':
//                     // Nếu là khách sạn, chuyển thẳng đến trang chi tiết
//                     router.push(`/hotels/${selectedLocation.id.replace('hotel-', '')}`);
//                     return; // Dừng hàm
//             }
//             // Luôn gửi `query` để hiển thị lại tên trong ô input ở trang sau
//             params.set('query', selectedLocation.name);
//         } else if (searchQuery.trim()) {
//             // Nếu không chọn từ gợi ý, gửi đi chuỗi người dùng đã gõ
//             params.set('query', searchQuery);
//         }

//         // 2. Xử lý ngày tháng và số đêm
//         if (checkInDate) {
//             params.set('checkin', checkInDate);
//         }
//         params.set('nights', numNights.toString());

//         // 3. Xử lý số lượng khách (cần sửa lại thành các state riêng)
//         // Tạm thời, chúng ta sẽ gửi đi chuỗi text và xử lý nó ở SearchPage
//         params.set('guestsText', guests); // Gửi chuỗi text để hiển thị
//         // Giả sử bạn có các state riêng:
//         // params.set('adults', adults.toString());
//         // params.set('children', children.toString());
//         // params.set('rooms', rooms.toString());

//         // 4. Chuyển hướng
//         router.push(`/search?${params.toString()}`);
//     };

//     const currentHotels = activeLocation ? (locationData.get(activeLocation.id)?.hotels || []) : [];
//     const isLoading = isLoadingInitial || isLoadingTab;

//     return (
//         <div className="bg-light min-vh-100">
//             <div style={{ background: "linear-gradient(90deg,#1e90ff 0,#00bfff 100%)", padding: "40px 0 60px 0" }}>
//                 <div className="container">
//                     <h2 className="fw-bold text-white mb-3" style={{ fontSize: "2rem" }}>Tìm & đặt phòng khách sạn giá rẻ chỉ với 3 bước đơn giản!</h2>
//                     <p className="text-white fs-5 mb-4">Khám phá ngay những ưu đãi tốt nhất dành cho bạn tại Traveloka!</p>
//                 </div>
//             </div>
//             <div className="container" style={{ marginTop: "-60px", marginBottom: "40px" }}>
//                 <div className="bg-white shadow rounded-4 p-4">
//                     <div className="row g-3 align-items-end">
//                         <div className="col-md-6">
//                             <label className="fw-semibold mb-2 text-dark">Thành phố, địa điểm hoặc tên khách sạn:</label>
//                             <LocationSearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onLocationSelect={handleLocationSelect} />
//                         </div>
//                         <div className="col-md-3">
//                             <label className="fw-semibold mb-2 text-dark">Nhận phòng:</label>
//                             <input type="date" className="form-control" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} min={today} />
//                         </div>
//                         <div className="col-md-3">
//                             <label className="fw-semibold mb-2 text-dark">Số đêm:</label>
//                             <select className="form-select" value={numNights} onChange={(e) => setNumNights(Number(e.target.value))}>
//                                 {[...Array(5)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} đêm</option>)}
//                             </select>
//                         </div>
//                         <div className="col-md-6 mt-3">
//                             <label className="fw-semibold mb-2 text-dark">Khách và Phòng:</label>
//                             <input type="text" className="form-control" value={guests} onChange={(e) => setGuests(e.target.value)} />
//                         </div>
//                         <div className="col-md-6 mt-3 d-flex align-items-end justify-content-end">
//                             <button className="btn btn-primary px-4 py-2 fw-bold" style={{ fontSize: "1.1rem" }} onClick={handleMainSearch}>
//                                 <i className="bi bi-search me-2"></i>Tìm kiếm
//                             </button>
//                         </div>
//                     </div>
//                     <div className="mt-3">
//                         <a href="#" className="text-primary fw-semibold text-decoration-none"><i className="bi bi-credit-card me-2"></i>Thanh Toán Tại Khách Sạn</a>
//                     </div>
//                 </div>
//             </div>

//             <div className="container">
//                 <h2 className="fw-bold mb-4 text-black">🌴 Chơi cuối tuần gần nhà</h2>
//                 {isLoadingInitial ? (
//                     <div className="text-center p-3"><div className="spinner-border text-primary spinner-border-sm"></div></div>
//                 ) : (
//                     <div className="mb-4">
//                         {featuredLocations.map((loc) => (
//                             <button key={loc.id} className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation?.id === loc.id ? 'btn-primary' : 'bg-light text-primary border-0'}`} onClick={() => setActiveLocation(loc)}>
//                                 {formatLocationNameForDisplay(loc.name)}
//                             </button>
//                         ))}
//                     </div>
//                 )}

//                 <div className={styles.hotelScrollWrapper}>
//                     {showPrevButton && <button className={`${styles.hotelNavButton} ${styles.hotelPrevButton}`} onClick={() => handleScrollButton('left')}>&lt;</button>}
//                     <div ref={scrollContainerRef} className={styles.hotelListContainer} style={{ minHeight: '300px' }}>
//                         {isLoading ? (
//                             <div className="w-100 text-center py-5 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
//                         ) : error && currentHotels.length === 0 ? (
//                             <div className="w-100 text-center py-5"><div className="alert alert-danger" role="alert">{error}</div></div>
//                         ) : currentHotels.length === 0 && !isLoadingTab ? (
//                             <div className="w-100 text-center py-5 d-flex justify-content-center align-items-center">
//                                 <div>
//                                     <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
//                                     <p>Không tìm thấy khách sạn nào tại {activeLocation ? formatLocationNameForDisplay(activeLocation.name) : ''}</p>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 {currentHotels.map((hotel) => (
//                                     <div key={hotel.id} className={styles.hotelCardWrapper} onClick={() => router.push(`/hotels/${hotel.id}`)}>
//                                         <div className="card h-100 shadow-sm border-0 position-relative">
//                                             <Image src={getHotelImageUrl(hotel)} width={400} height={200} alt={hotel.name} className="card-img-top" style={{ objectFit: 'cover', height: '180px', borderRadius: '12px 12px 0 0' }} />
//                                             <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-dark bg-opacity-75 text-white rounded fw-bold small">
//                                                 <i className="bi bi-geo-alt-fill me-1"></i> {hotel.district?.name || hotel.city?.name}
//                                             </div>
//                                             {hotel.rawPricePerNight > hotel.currentPricePerNight && (
//                                                 <div className="position-absolute top-0 end-0 m-2 px-2 py-1 bg-warning text-white rounded fw-bold small">
//                                                     Tiết kiệm {Math.round((1 - hotel.currentPricePerNight / hotel.rawPricePerNight) * 100)}%
//                                                 </div>
//                                             )}
//                                             <div className="card-body">
//                                                 <h6 className="fw-bold mb-1 text-truncate">{hotel.name}</h6>
//                                                 <div className="mb-1 text-success fw-semibold"><i className="bi bi-star-fill text-warning me-1"></i>{formatRating(hotel.averageScore)}</div>
//                                                 {hotel.rawPricePerNight > hotel.currentPricePerNight && (<div className="mb-1 text-muted text-decoration-line-through small">{formatPrice(hotel.rawPricePerNight)}</div>)}
//                                                 <div className="mb-1 fw-bold text-danger fs-5">{formatPrice(hotel.currentPricePerNight)}</div>
//                                                 <div className="text-muted small">Chưa bao gồm thuế và phí</div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {isLoadingMore && (
//                                     <div className={styles.loadingMoreSpinner}>
//                                         <div className="spinner-border text-primary spinner-border-sm" role="status">
//                                             <span className="visually-hidden">Đang tải thêm...</span>
//                                         </div>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                     {showNextButton && <button className={`${styles.hotelNavButton} ${styles.hotelNextButton}`} onClick={() => handleScrollButton('right')}>&gt;</button>}
//                 </div>
//             </div>
//         </div>
//     );
// }




'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { hotelService, HotelResponse } from '@/service/hotelService';
import { locationService, LocationSuggestion, LocationType } from '@/service/locationService';
import ReviewRatingDisplay from '@/components/Review/ReviewRatingDisplay';
import styles from './HotelsCard.module.css';

// ---  hàm tiện ích  ---
const formatLocationNameForDisplay = (fullName: string) => fullName.replace(/^(Thành phố|Tỉnh|Thủ đô)\s/, '');
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
const getHotelImageUrl = (hotel: HotelResponse) => hotel.photos?.[0]?.photos?.[0]?.url || '/placeholder.svg';
const getTypeLabel = (type: LocationType) => {
    switch (type) {
        case 'HOTEL': return 'Khách sạn';
        case 'PROVINCE': case 'CITY_PROVINCE': return 'Vùng';
        case 'CITY': return 'Thành phố';
        case 'DISTRICT': return 'Quận/Huyện';
        default: return '';
    }
};

// ---  LocationSearchInput ---
interface LocationSearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onLocationSelect: (location: LocationSuggestion) => void;
}
const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ value, onChange, onLocationSelect }) => {
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (value.trim().length < 2) { setSuggestions([]); return; }
        const debounceTimer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await locationService.searchLocations({ query: value });
                setSuggestions(results);
            } catch (error) { console.error("Lỗi khi tìm kiếm địa điểm:", error); }
            finally { setIsLoading(false); }
        }, 350);
        return () => clearTimeout(debounceTimer);
    }, [value]);
    const handleSelectSuggestion = (location: LocationSuggestion) => {
        onLocationSelect(location);
        setSuggestions([]);
        setIsSuggestionsVisible(false);
    };
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsSuggestionsVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    return (
        <div className={styles.searchInputWrapper} ref={wrapperRef}>
            <input type="text" className="form-control" value={value} onChange={onChange} onFocus={() => setIsSuggestionsVisible(true)} placeholder="Nhập tên khách sạn hoặc địa điểm" autoComplete="off" />
            {isSuggestionsVisible && value.length > 1 && (
                <ul className={styles.suggestionsList}>
                    {isLoading ? <li className={styles.suggestionInfo}>Đang tìm kiếm...</li>
                        : suggestions.length > 0 ? suggestions.map((suggestion) => (
                            <li key={suggestion.id} className={styles.suggestionItem} onClick={() => handleSelectSuggestion(suggestion)}>
                                <div className={styles.suggestionContent}><strong>{suggestion.name}</strong><div className={styles.suggestionDescription}>{suggestion.description}</div></div>
                                <div className={styles.suggestionMeta}><span className={styles.suggestionTypeLabel}>{getTypeLabel(suggestion.type)}</span>{suggestion.hotelCount && suggestion.hotelCount > 0 && (<span className={styles.suggestionHotelCount}>{suggestion.hotelCount.toLocaleString('vi-VN')} khách sạn</span>)}</div>
                            </li>
                        )) : <li className={styles.suggestionInfo}>Không tìm thấy kết quả phù hợp.</li>}
                </ul>
            )}
        </div>
    );
};

// --- Interfaces      ---
interface City {
    id: string;
    name: string;
}
interface LocationData {
    hotels: HotelResponse[];
    page: number;
    totalPages: number;
}


export default function HotelsCard() {
    const router = useRouter();

    // === STATE CHO THANH TÌM KIẾM ===
    const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [checkInDate, setCheckInDate] = useState(today);
    const [numNights, setNumNights] = useState(1);

    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const guestPickerRef = useRef<HTMLDivElement>(null);
    const [guestPickerError, setGuestPickerError] = useState('');

    // === STATE CHO DỮ LIỆU TRANG ===
    const [featuredLocations, setFeaturedLocations] = useState<City[]>([]);
    const [activeLocation, setActiveLocation] = useState<City | null>(null);
    const [locationData, setLocationData] = useState<Map<string, LocationData>>(new Map());
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingTab, setIsLoadingTab] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showPrevButton, setShowPrevButton] = useState(false);
    const [showNextButton, setShowNextButton] = useState(true);

    // === CÁC HÀM XỬ LÝ LOGIC ===
    useEffect(() => {
        const fetchAllCities = async () => {
            setIsLoadingInitial(true);
            setError(null);
            try {
                const cities = await locationService.getCities();
                if (cities && cities.length > 0) {
                    setFeaturedLocations(cities);
                    setActiveLocation(cities[0]);
                } else { setError("Không tìm thấy địa điểm nào."); }
            } catch (err) { setError("Lỗi tải danh sách địa điểm."); }
            finally { setIsLoadingInitial(false); }
        };
        fetchAllCities();
    }, []);

    useEffect(() => {
        const fetchHotelsForTab = async () => {
            if (!activeLocation || locationData.has(activeLocation.id)) return;
            setIsLoadingTab(true);
            setError(null);
            try {
                const response = await hotelService.searchHotels({ 'city-id': activeLocation.id, page: 0, size: 8 });
                setLocationData(prev => new Map(prev).set(activeLocation.id, {
                    hotels: response.content || [],
                    page: response.page,
                    totalPages: response.totalPages,
                }));
            } catch (err) {
                setError(`Lỗi tải khách sạn tại ${activeLocation.name}.`);
                setLocationData(prev => new Map(prev).set(activeLocation.id, { hotels: [], page: 0, totalPages: 0 }));
            } finally {
                setIsLoadingTab(false);
            }
        };
        if (!isLoadingInitial && activeLocation) {
            fetchHotelsForTab();
        }
    }, [activeLocation, isLoadingInitial, locationData]);

    const handleLoadMore = async () => {
        if (!activeLocation || isLoadingMore) return;
        const currentData = locationData.get(activeLocation.id);
        if (!currentData || currentData.page >= currentData.totalPages - 1) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentData.page + 1;
            const response = await hotelService.searchHotels({ 'city-id': activeLocation.id, page: nextPage, size: 4 });
            setLocationData(prev => {
                const existingData = prev.get(activeLocation.id)!;
                return new Map(prev).set(activeLocation.id, {
                    hotels: [...existingData.hotels, ...response.content],
                    page: response.page,
                    totalPages: response.totalPages,
                });
            });
        } catch (err) {
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleLocationSelect = (location: LocationSuggestion) => {
        setSelectedLocation(location);
        setSearchQuery(location.name);
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const handleScroll = () => {
            if (isLoadingMore || !activeLocation) return;
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowPrevButton(scrollLeft > 10);
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
            const currentData = locationData.get(activeLocation.id);
            const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
            setShowNextButton(!isAtEnd || hasMorePages);
            if (scrollLeft + clientWidth >= scrollWidth - 200 && hasMorePages) {
                handleLoadMore();
            }
        };
        container.scrollLeft = 0;
        const timer = setTimeout(handleScroll, 150);
        container.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        return () => {
            clearTimeout(timer);
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [activeLocation, locationData, isLoadingMore]);

    const handleScrollButton = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container || !activeLocation) return;
        if (direction === 'left') {
            container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' });
        } else {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 20;
            const currentData = locationData.get(activeLocation.id);
            const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
            if (isAtEnd && hasMorePages) {
                handleLoadMore();
            } else {
                container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' });
            }
        }
    };

    const handleMainSearch = () => {
        const params = new URLSearchParams();
        if (selectedLocation) {
            switch (selectedLocation.type) {
                // ▼▼▼ SỬA LẠI 3 DÒNG NÀY ▼▼▼
                case 'PROVINCE': case 'CITY_PROVINCE':
                    params.set('province-id', selectedLocation.id.replace('province-', ''));
                    break;
                case 'CITY':
                    params.set('city-id', selectedLocation.id.replace('city-', ''));
                    break;
                case 'DISTRICT':
                    params.set('district-id', selectedLocation.id.replace('district-', ''));
                    break;
                case 'HOTEL':
                    router.push(`/hotels/${selectedLocation.id.replace('hotel-', '')}`);
                    return;
            }
            params.set('query', selectedLocation.name);
        } else if (searchQuery.trim()) {
            params.set('query', searchQuery);
        }
        if (checkInDate) params.set('checkin', checkInDate);
        params.set('nights', numNights.toString());

        params.set('adults', adults.toString());
        params.set('children', children.toString());
        params.set('rooms', rooms.toString());
        params.set('guestsText', `${adults} người lớn, ${children} Trẻ em, ${rooms} phòng`);

        router.push(`/search?${params.toString()}`);
    };

    // Tự động điều chỉnh số phòng và xóa lỗi
    useEffect(() => {
        if (rooms > adults) {
            setRooms(adults);
        }
        if (guestPickerError) {
            setGuestPickerError('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adults]);

    // Đóng pop-up khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
                setShowGuestPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [guestPickerRef]);

    // Hàm xử lý tăng số phòng với điều kiện
    const handleIncreaseRooms = () => {
        if (rooms < adults) {
            setRooms(r => r + 1);
        } else {
            setGuestPickerError('Số phòng không thể nhiều hơn số khách người lớn');
            setTimeout(() => setGuestPickerError(''), 3000);
        }
    };

    const currentHotels = activeLocation ? (locationData.get(activeLocation.id)?.hotels || []) : [];
    const isLoading = isLoadingInitial || isLoadingTab;
    const displayGuests = `${adults} người lớn, ${children} Trẻ em, ${rooms} phòng`;

    return (
        <div className="bg-light min-vh-100">
            <div style={{ background: "linear-gradient(90deg,#1e90ff 0,#00bfff 100%)", padding: "40px 0 60px 0" }}>
                <div className="container">
                    <h2 className="fw-bold text-white mb-3" style={{ fontSize: "2rem" }}>Tìm & đặt phòng khách sạn giá rẻ chỉ với 3 bước đơn giản!</h2>
                    <p className="text-white fs-5 mb-4">Khám phá ngay những ưu đãi tốt nhất dành cho bạn tại Traveloka!</p>
                </div>
            </div>
            <div className="container" style={{ marginTop: "-60px", marginBottom: "40px" }}>
                <div className="bg-white shadow rounded-4 p-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="fw-semibold mb-2 text-dark">Thành phố, địa điểm hoặc tên khách sạn:</label>
                            <LocationSearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onLocationSelect={handleLocationSelect} />
                        </div>
                        <div className="col-md-3">
                            <label className="fw-semibold mb-2 text-dark">Nhận phòng:</label>
                            <input type="date" className="form-control" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} min={today} />
                        </div>
                        <div className="col-md-3">
                            <label className="fw-semibold mb-2 text-dark">Số đêm:</label>
                            <select className="form-select" value={numNights} onChange={(e) => setNumNights(Number(e.target.value))}>
                                {[...Array(5)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} đêm</option>)}
                            </select>
                        </div>

                        <div className="col-md-6 mt-3 position-relative" ref={guestPickerRef}>
                            <label className="fw-semibold mb-2 text-dark">Khách và Phòng:</label>
                            <div className={styles.guestInputDisplay} onClick={() => setShowGuestPicker(!showGuestPicker)}>
                                {displayGuests}
                            </div>

                            {showGuestPicker && (
                                <div className={styles.guestPickerContainer}>
                                    {guestPickerError && <div className={styles.errorBanner}>{guestPickerError}</div>}

                                    <div className={styles.pickerRow}>
                                        <label>Người lớn</label>
                                        <div className={styles.counter}>
                                            <button onClick={() => setAdults(p => Math.max(1, p - 1))} disabled={adults <= 1}>-</button>
                                            <span>{adults}</span>
                                            <button onClick={() => setAdults(p => p + 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className={styles.pickerRow}>
                                        <label>Trẻ em</label>
                                        <div className={styles.counter}>
                                            <button onClick={() => setChildren(p => Math.max(0, p - 1))} disabled={children <= 0}>-</button>
                                            <span>{children}</span>
                                            <button onClick={() => setChildren(p => p + 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className={styles.pickerRow}>
                                        <label>Phòng</label>
                                        <div className={styles.counter}>
                                            <button onClick={() => setRooms(p => Math.max(1, p - 1))} disabled={rooms <= 1}>-</button>
                                            <span>{rooms}</span>
                                            <button onClick={handleIncreaseRooms}>+</button>
                                        </div>
                                    </div>
                                    <div className={styles.buttonWrapper}>
                                        <button onClick={() => setShowGuestPicker(false)} className={styles.applyButton}>Xong</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-md-6 mt-3 d-flex align-items-end justify-content-end">
                            <button className="btn btn-primary px-4 py-2 fw-bold" style={{ fontSize: "1.1rem" }} onClick={handleMainSearch}>
                                <i className="bi bi-search me-2"></i>Tìm kiếm
                            </button>
                        </div>
                    </div>
                    <div className="mt-3">
                        <a href="#" className="text-primary fw-semibold text-decoration-none"><i className="bi bi-credit-card me-2"></i>Thanh Toán Tại Khách Sạn</a>
                    </div>
                </div>
            </div>

            <div className="container">
                <h2 className="fw-bold mb-4 text-black">🌴 Chơi cuối tuần gần nhà</h2>
                {isLoadingInitial ? (
                    <div className="text-center p-3"><div className="spinner-border text-primary spinner-border-sm"></div></div>
                ) : (
                    <div className="mb-4">
                        {featuredLocations.map((loc) => (
                            <button key={loc.id} className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation?.id === loc.id ? 'btn-primary' : 'bg-light text-primary border-0'}`} onClick={() => setActiveLocation(loc)}>
                                {formatLocationNameForDisplay(loc.name)}
                            </button>
                        ))}
                    </div>
                )}

                <div className={styles.hotelScrollWrapper}>
                    {showPrevButton && <button className={`${styles.hotelNavButton} ${styles.hotelPrevButton}`} onClick={() => handleScrollButton('left')}>&lt;</button>}
                    <div ref={scrollContainerRef} className={styles.hotelListContainer} style={{ minHeight: '300px' }}>
                        {isLoading ? (
                            <div className="w-100 text-center py-5 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
                        ) : error && currentHotels.length === 0 ? (
                            <div className="w-100 text-center py-5"><div className="alert alert-danger" role="alert">{error}</div></div>
                        ) : currentHotels.length === 0 && !isLoadingTab ? (
                            <div className="w-100 text-center py-5 d-flex justify-content-center align-items-center">
                                <div>
                                    <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
                                    <p>Không tìm thấy khách sạn nào tại {activeLocation ? formatLocationNameForDisplay(activeLocation.name) : ''}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {currentHotels.map((hotel) => (
                                    <Link key={hotel.id} href={`/hotels/${hotel.id}`} className={styles.hotelCardWrapper} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="card h-100 shadow-sm border-0 position-relative">
                                            <Image src={getHotelImageUrl(hotel)} width={400} height={200} alt={hotel.name} className="card-img-top" style={{ objectFit: 'cover', height: '180px', borderRadius: '12px 12px 0 0' }} />
                                            <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-dark bg-opacity-75 text-white rounded fw-bold small">
                                                <i className="bi bi-geo-alt-fill me-1"></i> {hotel.district?.name || hotel.city?.name}
                                            </div>
                                            {hotel.rawPricePerNight > hotel.currentPricePerNight && (
                                                <div className="position-absolute top-0 end-0 m-2 px-2 py-1 bg-warning text-white rounded fw-bold small">
                                                    Tiết kiệm {Math.round((1 - hotel.currentPricePerNight / hotel.rawPricePerNight) * 100)}%
                                                </div>
                                            )}
                                            <div className="card-body">
                                                <h6 className="fw-bold mb-1 text-truncate">{hotel.name}</h6>
                                                <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                                                    <ReviewRatingDisplay
                                                        hotelId={hotel.id}
                                                        categoryLabel="Khách sạn"
                                                        lazyLoad={true}
                                                        showLabel={false}
                                                    />
                                                </div>
                                                {hotel.rawPricePerNight > hotel.currentPricePerNight && (<div className="mb-1 text-muted text-decoration-line-through small">{formatPrice(hotel.rawPricePerNight)}</div>)}
                                                <div className="mb-1 fw-bold text-danger fs-5">{formatPrice(hotel.currentPricePerNight)}</div>
                                                <div className="text-muted small">Chưa bao gồm thuế và phí</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {isLoadingMore && (
                                    <div className={styles.loadingMoreSpinner}>
                                        <div className="spinner-border text-primary spinner-border-sm" role="status">
                                            <span className="visually-hidden">Đang tải thêm...</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {showNextButton && <button className={`${styles.hotelNavButton} ${styles.hotelNextButton}`} onClick={() => handleScrollButton('right')}>&gt;</button>}
                </div>
            </div>
        </div>
    );
}

