'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { hotelService, HotelResponse } from '@/service/hotelService';
import { locationService, LocationSuggestion } from '@/service/locationService';
import styles from './HotelsCard.module.css';

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'HOTEL': return 'Khách sạn';
        case 'PROVINCE': return 'Tỉnh/Thành phố';
        case 'CITY': return 'Thành phố';
        case 'DISTRICT': return 'Quận/Huyện';
        case 'WARD': return 'Phường/Xã';
        default: return '';
    }
};

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
//         if (value.trim().length < 2) {
//             setSuggestions([]);
//             setIsLoading(false);
//             return;
//         }
//         const debounceTimer = setTimeout(async () => {
//             setIsLoading(true);
//             const hotels = await locationService.getHotelsByCity(value);
//             const hotelSuggestions: LocationSuggestion[] = hotels.length > 0
//                 ? hotels.map((h: any) => ({
//                     id: `hotel-${h.id}`,
//                     name: h.name,
//                     type: 'HOTEL',
//                     description: h.province?.name || h.city?.name || h.address || 'Khách sạn'
//                 }))
//                 : [];
//             setSuggestions(hotelSuggestions);
//             setIsLoading(false);
//         }, 500);
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
//             <input
//                 type="text"
//                 className="form-control"
//                 value={value}
//                 onChange={onChange}
//                 onFocus={() => setIsSuggestionsVisible(true)}
//                 placeholder="Nhập tên khách sạn hoặc địa điểm"
//                 autoComplete="off"
//             />
//             {isSuggestionsVisible && value.length > 1 && (
//                 <ul className={styles.suggestionsList}>
//                     {isLoading ? (
//                         <li className={styles.suggestionInfo}>Đang tìm kiếm...</li>
//                     ) : suggestions.length > 0 ? (
//                         suggestions.map((suggestion) => (
//                             <li
//                                 key={suggestion.id}
//                                 className={styles.suggestionItem}
//                                 onClick={() => handleSelectSuggestion(suggestion)}
//                             >
//                                 <strong>{suggestion.name}</strong>
//                                 <div style={{ fontSize: '0.9em', color: '#888' }}>{suggestion.description}</div>
//                             </li>
//                         ))
//                     ) : (
//                         <li className={styles.suggestionInfo}>Không tìm thấy kết quả phù hợp.</li>
//                     )}
//                 </ul>
//             )}
//         </div>
//     );
// };


interface LocationSearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onLocationSelect: (location: LocationSuggestion) => void;
    allLocations: string[];
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ value, onChange, onLocationSelect, allLocations }) => {
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.trim().length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setIsLoading(true);

            const citySuggestions: LocationSuggestion[] = allLocations
                .filter(loc => loc.toLowerCase().includes(value.toLowerCase()))
                .map(locName => ({
                    id: `city-${locName}`,
                    name: locName,
                    type: 'CITY',
                    description: 'Thành phố / Tỉnh'
                }));

            const hotels = await locationService.getHotelsByCity(value);
            const hotelSuggestions: LocationSuggestion[] = hotels.map((h: any) => ({
                id: `hotel-${h.id}`,
                name: h.name,
                type: 'HOTEL',
                description: h.city?.name || h.province?.name || 'Khách sạn'
            }));

            setSuggestions([...citySuggestions, ...hotelSuggestions]);
            setIsLoading(false);

        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [value, allLocations]);
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
            <input
                type="text" className="form-control" value={value} onChange={onChange}
                onFocus={() => setIsSuggestionsVisible(true)}
                placeholder="Nhập tên khách sạn hoặc địa điểm" autoComplete="off"
            />
            {isSuggestionsVisible && value.length > 1 && (
                <ul className={styles.suggestionsList}>
                    {isLoading ? (
                        <li className={styles.suggestionInfo}>Đang tìm kiếm...</li>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion) => (
                            <li key={suggestion.id} className={styles.suggestionItem} onClick={() => handleSelectSuggestion(suggestion)}>
                                <strong>{suggestion.name}</strong>
                                <div style={{ fontSize: '0.9em', color: '#888' }}>{suggestion.description}</div>
                            </li>
                        ))
                    ) : (
                        <li className={styles.suggestionInfo}>Không tìm thấy kết quả phù hợp.</li>
                    )}
                </ul>
            )}
        </div>
    );
};

const formatLocationNameForDisplay = (fullName: string) => {
    return fullName.replace('Thành phố ', '').replace('Tỉnh ', '');
};

export default function HotelsCard() {
    // State cho phần hiển thị khách sạn theo thành phố
    const [allHotels, setAllHotels] = useState<HotelResponse[]>([]);
    const [displayedHotels, setDisplayedHotels] = useState<HotelResponse[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [activeLocation, setActiveLocation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State cho UI
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showPrevButton, setShowPrevButton] = useState(false);
    const [showNextButton, setShowNextButton] = useState(false);

    // State quản lý toàn bộ form tìm kiếm
    const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [checkInDate, setCheckInDate] = useState(today);
    const [numNights, setNumNights] = useState(1);
    const [guests, setGuests] = useState('2 người lớn, 0 Trẻ em, 1 phòng');

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                const hotelsData = await hotelService.getAllHotels();
                setAllHotels(hotelsData);

                if (hotelsData.length > 0) {
                    const cityNames = hotelsData.map(hotel => hotel.city.name);
                    const uniqueCityNames = Array.from(new Set(cityNames));
                    setLocations(uniqueCityNames);
                    setActiveLocation(uniqueCityNames[0]);
                } else {
                    setLocations([]);
                    setActiveLocation(null);
                }

            } catch (err: any) {
                setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    useEffect(() => {
        if (!activeLocation) {
            setDisplayedHotels([]);
            return;
        }
        const filtered = allHotels.filter(hotel => hotel.city.name === activeLocation);
        setDisplayedHotels(filtered);
    }, [activeLocation, allHotels]);

    // const handleLocationSelect = (location: LocationSuggestion) => {
    //    
    //     setSelectedLocation(location);
    //     setSearchQuery(location.name);

    //     // --- LOGIC MỚI ĐƯỢC THÊM VÀO ---
    //     // Biến để lưu tên thành phố cần kích hoạt
    //     let cityToActivate: string | null = null;

    //     // Nếu người dùng chọn một thành phố/tỉnh từ gợi ý
    //     if (location.type === 'CITY' || location.type === 'PROVINCE') {
    //         cityToActivate = location.name;
    //     }
    //     // Nếu người dùng chọn một khách sạn, ta lấy tên thành phố từ mô tả
    //     else if (location.type === 'HOTEL') {
    //         cityToActivate = location.description; // Giả sử description chứa tên thành phố
    //     }

    //     // Kiểm tra xem thành phố này có trong danh sách nút bấm không
    //     // Nếu có, cập nhật activeLocation để đồng bộ giao diện
    //     if (cityToActivate && locations.includes(cityToActivate)) {
    //         setActiveLocation(cityToActivate);
    //     }
    // };


    const handleLocationSelect = (location: LocationSuggestion) => {
        setSelectedLocation(location);
        setSearchQuery(location.name);

        if (location.type === 'HOTEL' && location.id.startsWith('hotel-')) {
            const hotelId = location.id.substring(6);

            const foundHotel = allHotels.find(h => h.id === hotelId);

            if (foundHotel && foundHotel.city?.name) {
                setActiveLocation(foundHotel.city.name);
            }
        }
        //  thêm else if cho CITY/PROVINCEcomponent con được nâng cấp sau này
    };

    const checkScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowPrevButton(scrollLeft > 10);
            setShowNextButton(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            setTimeout(() => checkScrollButtons(), 100);
            window.addEventListener('resize', checkScrollButtons);
            return () => window.removeEventListener('resize', checkScrollButtons);
        }
    }, [displayedHotels]);

    const handleScroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const card = container.querySelector(`.${styles.hotelCardWrapper}`);
            const cardWidth = card ? (card as HTMLElement).offsetWidth : 320;
            const scrollAmount = cardWidth + 24;
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
    const formatRating = (rating?: number) => rating ? `${rating.toFixed(1)}/10` : 'Chưa có đánh giá';
    const getHotelImageUrl = (hotel: HotelResponse) => {
        if (hotel.photos && hotel.photos.length > 0) {
            const firstCategory = hotel.photos[0];
            if (Array.isArray(firstCategory.photos) && firstCategory.photos.length > 0) {
                return firstCategory.photos[0].url;
            }
        }
        return '/placeholder.svg';
    };

    const handleMainSearch = () => {
        const params = new URLSearchParams();
        if (selectedLocation && selectedLocation.type === 'HOTEL') {
            params.set('hotelId', selectedLocation.id.replace('hotel-', ''));
        }
        params.set('query', searchQuery);
        if (checkInDate) params.set('checkin', checkInDate);
        params.set('nights', numNights.toString());
        params.set('guests', guests);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="bg-light min-vh-100">
            <div style={{ background: "linear-gradient(90deg,#1e90ff 0,#00bfff 100%)", padding: "40px 0 60px 0" }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h2 className="fw-bold text-white mb-3" style={{ fontSize: "2rem" }}>
                                Tìm & đặt phòng khách sạn giá rẻ chỉ với 3 bước đơn giản!
                            </h2>
                            <p className="text-white fs-5 mb-4">
                                Khám phá ngay những ưu đãi tốt nhất dành cho bạn tại Traveloka!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container" style={{ marginTop: "-60px", marginBottom: "40px" }}>
                <div className="bg-white shadow rounded-4 p-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="fw-semibold mb-2 text-dark">Thành phố, địa điểm hoặc tên khách sạn:</label>
                            <LocationSearchInput
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onLocationSelect={handleLocationSelect}
                                allLocations={locations}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="fw-semibold mb-2 text-dark">Nhận phòng:</label>
                            <input type="date" className="form-control" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} min={today} />
                        </div>
                        <div className="col-md-3">
                            <label className="fw-semibold mb-2 text-dark">Số đêm:</label>
                            <select className="form-select" value={numNights} onChange={(e) => setNumNights(Number(e.target.value))}>
                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} đêm</option>)}
                            </select>
                        </div>
                        <div className="col-md-6 mt-3">
                            <label className="fw-semibold mb-2 text-dark">Khách và Phòng:</label>
                            <input type="text" className="form-control" value={guests} onChange={(e) => setGuests(e.target.value)} />
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

            {/* --- PHẦN HIỂN THỊ KHÁCH SẠN --- */}
            <div className="container">
                <h2 className="fw-bold mb-4 text-black">🌴 Chơi cuối tuần gần nhà</h2>
                <div className="mb-4">
                    {locations.map((loc) => (
                        <button
                            key={loc}
                            className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation === loc ? 'btn-primary' : 'bg-light text-primary border-0'}`}
                            onClick={() => setActiveLocation(loc)}
                        >
                            {formatLocationNameForDisplay(loc)}
                        </button>
                    ))}
                </div>

                <div className={styles.hotelScrollWrapper}>
                    {showPrevButton && <button className={`${styles.hotelNavButton} ${styles.hotelPrevButton}`} onClick={() => handleScroll('left')}>&lt;</button>}

                    <div className={styles.hotelListContainer} ref={scrollContainerRef} onScroll={checkScrollButtons}>
                        {loading ? (
                            <div className="w-100 text-center py-5">
                                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div>
                                <p className="mt-3 text-muted">Đang tải danh sách khách sạn...</p>
                            </div>
                        ) : error ? (
                            <div className="w-100 text-center py-5">
                                <div className="alert alert-danger" role="alert">{error}</div>
                                <button className="btn btn-primary" onClick={() => window.location.reload()}>Tải lại trang</button>
                            </div>
                        ) : displayedHotels.length === 0 ? (
                            <div className="w-100 text-center py-5">
                                <div className="text-muted">
                                    <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
                                    <p>Không tìm thấy khách sạn nào tại {activeLocation ? formatLocationNameForDisplay(activeLocation) : ''}</p>
                                </div>
                            </div>
                        ) : (
                            displayedHotels.map((hotel) => (
                                <div key={hotel.id} className={styles.hotelCardWrapper} onClick={() => router.push(`/hotels/${hotel.id}`)}>
                                    <div className="card h-100 shadow-sm border-0 position-relative">
                                        <Image src={getHotelImageUrl(hotel)} width={400} height={200} alt={hotel.name} className="card-img-top" style={{ objectFit: 'cover', height: '180px', borderRadius: '12px 12px 0 0' }} />
                                        <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-dark bg-opacity-75 text-white rounded fw-bold small">
                                            <i className="bi bi-geo-alt-fill me-1"></i> {hotel.ward?.name || hotel.city?.name || hotel.address}
                                        </div>
                                        {hotel.rawPricePerNight > hotel.currentPricePerNight && (
                                            <div className="position-absolute top-0 end-0 m-2 px-2 py-1 bg-warning text-white rounded fw-bold small">
                                                Tiết kiệm {Math.round((1 - hotel.currentPricePerNight / hotel.rawPricePerNight) * 100)}%
                                            </div>
                                        )}
                                        <div className="card-body">
                                            <h6 className="fw-bold mb-1">{hotel.name}</h6>
                                            <div className="mb-1 text-success fw-semibold"><i className="bi bi-star-fill text-warning me-1"></i>{formatRating(hotel.averageScore)}</div>
                                            {hotel.rawPricePerNight > hotel.currentPricePerNight && (<div className="mb-1 text-muted text-decoration-line-through small">{formatPrice(hotel.rawPricePerNight)}</div>)}
                                            <div className="mb-1 fw-bold text-warning fs-5">{formatPrice(hotel.currentPricePerNight)}</div>
                                            <div className="text-muted small">Chưa bao gồm thuế và phí</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {showNextButton && <button className={`${styles.hotelNavButton} ${styles.hotelNextButton}`} onClick={() => handleScroll('right')}>&gt;</button>}
                </div>
            </div>
        </div>
    );
}