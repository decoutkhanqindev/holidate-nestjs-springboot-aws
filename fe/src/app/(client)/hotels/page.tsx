'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { hotelService, HotelResponse } from '@/service/hotelService';
import { locationService, LocationSuggestion, LocationType } from '@/service/locationService';
import styles from './HotelsCard.module.css';

const getTypeLabel = (type: LocationType) => {
    switch (type) {
        case 'HOTEL': return 'Khách sạn';
        case 'PROVINCE': return 'Vùng';
        case 'CITY_PROVINCE': return 'Vùng';
        case 'CITY': return 'Thành phố';
        case 'DISTRICT': return 'Quận/Huyện';
        default: return '';
    }
}; const formatLocationNameForDisplay = (fullName: string) => {
    return fullName.replace(/^(Thành phố|Tỉnh|Thủ đô)\s/, '');
};
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
const formatRating = (rating?: number) => rating && rating > 0 ? `${rating.toFixed(1)}/10` : 'Chưa có đánh giá';
const getHotelImageUrl = (hotel: HotelResponse) => hotel.photos?.[0]?.photos?.[0]?.url || '/placeholder.svg';


// --- THAY THẾ TOÀN BỘ COMPONENT LocationSearchInput CŨ BẰNG CODE NÀY ---
interface LocationSearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onLocationSelect: (location: LocationSuggestion) => void;
    // allLocations không còn cần thiết nữa, nhưng giữ lại để không lỗi ở component cha
    allLocations: string[];
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ value, onChange, onLocationSelect }) => {
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Chỉ tìm kiếm khi người dùng nhập ít nhất 2 ký tự
        if (value.trim().length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        // Sử dụng debounce để tránh gọi API liên tục
        const debounceTimer = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Gọi hàm searchLocations đa năng từ service
                const results = await locationService.searchLocations({ query: value });
                setSuggestions(results);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm địa điểm:", error);
                setSuggestions([]); // Xóa gợi ý nếu có lỗi
            } finally {
                setIsLoading(false);
            }
        }, 350); // Đợi 350ms sau khi người dùng ngừng gõ

        return () => clearTimeout(debounceTimer);
    }, [value]);

    const handleSelectSuggestion = (location: LocationSuggestion) => {
        onLocationSelect(location);
        setSuggestions([]);
        setIsSuggestionsVisible(false);
    };

    // Xử lý click ra ngoài để ẩn box gợi ý
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
                type="text"
                className="form-control"
                value={value}
                onChange={onChange}
                onFocus={() => setIsSuggestionsVisible(true)}
                placeholder="Nhập tên khách sạn hoặc địa điểm"
                autoComplete="off"
            />
            {isSuggestionsVisible && value.length > 1 && (
                <ul className={styles.suggestionsList}>
                    {isLoading ? (
                        <li className={styles.suggestionInfo}>Đang tìm kiếm...</li>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion) => (
                            <li key={suggestion.id} className={styles.suggestionItem} onClick={() => handleSelectSuggestion(suggestion)}>
                                {/* Phần bên trái: Tên và mô tả */}
                                <div className={styles.suggestionContent}>
                                    <strong>{suggestion.name}</strong>
                                    <div className={styles.suggestionDescription}>{suggestion.description}</div>
                                </div>
                                {/* Phần bên phải: Loại và số lượng khách sạn */}
                                <div className={styles.suggestionMeta}>
                                    <span className={styles.suggestionTypeLabel}>{getTypeLabel(suggestion.type)}</span>
                                    {suggestion.hotelCount && suggestion.hotelCount > 0 && (
                                        <span className={styles.suggestionHotelCount}>
                                            {suggestion.hotelCount.toLocaleString('vi-VN')} khách sạn
                                        </span>
                                    )}
                                </div>
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
// --- Cấu trúc dữ liệu cho state mới ---
interface LocationData {
    hotels: HotelResponse[];
    page: number;
    totalPages: number;
}


// --- COMPONENT CHÍNH ĐÃ ĐƯỢC SỬA LỖI ---
export default function HotelsCard() {
    // --- STATE CHO PHẦN TÌM KIẾM (Giữ nguyên) ---
    const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [checkInDate, setCheckInDate] = useState(today);
    const [numNights, setNumNights] = useState(1);
    const [guests, setGuests] = useState('2 người lớn, 0 Trẻ em, 1 phòng');
    const router = useRouter();


    // --- STATE MỚI CHO PHẦN HIỂN THỊ KHÁCH SẠN ---
    const [locations, setLocations] = useState<string[]>([]);
    const [cityIdMap, setCityIdMap] = useState<Map<string, string>>(new Map());
    const [activeLocation, setActiveLocation] = useState<string>('');
    const [hotelDataByCity, setHotelDataByCity] = useState<Map<string, LocationData>>(new Map());

    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingTab, setIsLoadingTab] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showPrevButton, setShowPrevButton] = useState(false);
    const [showNextButton, setShowNextButton] = useState(true);

    // --- LOGIC MỚI ĐỂ LẤY DỮ LIỆU ---

    // Effect 1: Lấy danh sách thành phố ban đầu
    useEffect(() => {
        const fetchInitialLocations = async () => {
            setIsLoadingInitial(true);
            setError(null);
            try {
                // Lấy 50 khách sạn đầu tiên để có danh sách thành phố đa dạng
                const response = await hotelService.searchHotels({ page: 0, size: 50 });
                if (response.content?.length > 0) {
                    const uniqueCities = new Map<string, string>();
                    response.content.forEach(hotel => {
                        if (hotel.city?.name && !uniqueCities.has(hotel.city.name)) {
                            uniqueCities.set(hotel.city.name, hotel.city.id);
                        }
                    });

                    const cityNames = Array.from(uniqueCities.keys());
                    setLocations(cityNames);
                    setCityIdMap(uniqueCities);
                    if (cityNames.length > 0) {
                        setActiveLocation(cityNames[0]);
                    }
                } else {
                    setError("Không tìm thấy khách sạn nào.");
                }
            } catch (err) {
                setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.");
            } finally {
                setIsLoadingInitial(false);
            }
        };
        fetchInitialLocations();
    }, []);

    // Effect 2: Tải khách sạn khi người dùng đổi tab (thành phố)
    useEffect(() => {
        const fetchHotelsForTab = async () => {
            // Chỉ chạy khi có thành phố được chọn và chưa có dữ liệu cho thành phố đó
            if (!activeLocation || hotelDataByCity.has(activeLocation) || cityIdMap.size === 0) {
                return;
            }

            const cityId = cityIdMap.get(activeLocation);
            if (!cityId) {
                setError(`Không tìm thấy ID cho ${activeLocation}`);
                return;
            }

            setIsLoadingTab(true);
            setError(null);
            try {
                // Lấy 8 khách sạn đầu tiên cho tab mới
                const response = await hotelService.searchHotels({ 'city-id': cityId, page: 0, size: 8 });
                setHotelDataByCity(prev => new Map(prev).set(activeLocation, {
                    hotels: response.content,
                    page: response.page,
                    totalPages: response.totalPages,
                }));
            } catch (err) {
                setError(`Lỗi tải khách sạn tại ${activeLocation}.`);
            } finally {
                setIsLoadingTab(false);
            }
        };

        if (!isLoadingInitial) {
            fetchHotelsForTab();
        }
    }, [activeLocation, isLoadingInitial, cityIdMap, hotelDataByCity]);

    // Hàm để tải thêm khách sạn
    const handleLoadMore = async () => {
        const currentData = hotelDataByCity.get(activeLocation);
        const cityId = cityIdMap.get(activeLocation);

        if (!currentData || !cityId || currentData.page >= currentData.totalPages - 1 || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);
        try {
            const nextPage = currentData.page + 1;
            const response = await hotelService.searchHotels({ 'city-id': cityId, page: nextPage, size: 4 });

            setHotelDataByCity(prev => {
                const updatedData = {
                    hotels: [...currentData.hotels, ...response.content],
                    page: response.page,
                    totalPages: response.totalPages,
                };
                return new Map(prev).set(activeLocation, updatedData);
            });
        } catch (err) {
            console.error("Lỗi tải thêm khách sạn:", err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleLocationSelect = (location: LocationSuggestion) => {
        setSelectedLocation(location);
        setSearchQuery(location.name);

        let cityToActivate: string | null = null;
        if (location.type === 'CITY' || location.type === 'PROVINCE') {
            cityToActivate = location.name;
        } else if (location.type === 'HOTEL' && location.description) {
            // Giả sử description chứa tên thành phố
            cityToActivate = location.description;
        }

        // Nếu thành phố được chọn có trong danh sách tab, kích hoạt nó
        if (cityToActivate && locations.includes(cityToActivate)) {
            setActiveLocation(cityToActivate);
        }
    };

    // Logic cuộn và kiểm tra nút
    const checkScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowPrevButton(scrollLeft > 10);

            const currentData = hotelDataByCity.get(activeLocation);
            const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;

            // Hiển thị nút next nếu chưa cuộn hết HOẶC còn trang để tải
            setShowNextButton(scrollLeft < scrollWidth - clientWidth - 10 || hasMorePages);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            // Reset scroll về đầu khi đổi tab
            container.scrollLeft = 0;
            const timer = setTimeout(checkScrollButtons, 150);
            container.addEventListener('scroll', checkScrollButtons);
            window.addEventListener('resize', checkScrollButtons);

            return () => {
                clearTimeout(timer);
                container.removeEventListener('scroll', checkScrollButtons);
                window.removeEventListener('resize', checkScrollButtons);
            };
        }
    }, [activeLocation, hotelDataByCity]);


    const handleScroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (direction === 'left') {
            container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' });
        } else {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 20;
            const currentData = hotelDataByCity.get(activeLocation);
            const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;

            // Nếu đang ở cuối và còn trang, tải thêm. Ngược lại, cuộn tiếp.
            if (isAtEnd && hasMorePages) {
                handleLoadMore();
            } else {
                container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' });
            }
        }
    };

    const handleMainSearch = () => {
        // (Giữ nguyên logic tìm kiếm chính)
        const params = new URLSearchParams();
        if (selectedLocation?.type === 'HOTEL') {
            params.set('hotelId', selectedLocation.id.replace('hotel-', ''));
        }
        params.set('query', searchQuery);
        if (checkInDate) params.set('checkin', checkInDate);
        params.set('nights', numNights.toString());
        params.set('guests', guests);
        router.push(`/search?${params.toString()}`);
    };

    const currentHotels = hotelDataByCity.get(activeLocation)?.hotels || [];
    const isLoading = isLoadingInitial || isLoadingTab;

    return (
        <div className="bg-light min-vh-100">
            {/* --- PHẦN HEADER VÀ FORM TÌM KIẾM (Không đổi) --- */}
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

            {/* --- PHẦN HIỂN THỊ KHÁCH SẠN (Đã được cập nhật) --- */}
            <div className="container">
                <h2 className="fw-bold mb-4 text-black">🌴 Chơi cuối tuần gần nhà</h2>
                {!isLoadingInitial && (
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
                )}

                <div className={styles.hotelScrollWrapper}>
                    {showPrevButton && <button className={`${styles.hotelNavButton} ${styles.hotelPrevButton}`} onClick={() => handleScroll('left')}>&lt;</button>}

                    <div className={styles.hotelListContainer} ref={scrollContainerRef}>
                        {isLoading ? (
                            <div className="w-100 text-center py-5 d-flex justify-content-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
                        ) : error ? (
                            <div className="w-100 text-center py-5">
                                <div className="alert alert-danger" role="alert">{error}</div>
                                <button className="btn btn-primary" onClick={() => window.location.reload()}>Tải lại trang</button>
                            </div>
                        ) : currentHotels.length === 0 && !isLoadingTab ? (
                            <div className="w-100 text-center py-5">
                                <div className="text-muted">
                                    <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
                                    <p>Không tìm thấy khách sạn nào tại {activeLocation ? formatLocationNameForDisplay(activeLocation) : ''}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {currentHotels.map((hotel) => (
                                    <div key={hotel.id} className={styles.hotelCardWrapper} onClick={() => router.push(`/hotels/${hotel.id}`)}>
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
                                                <div className="mb-1 text-success fw-semibold"><i className="bi bi-star-fill text-warning me-1"></i>{formatRating(hotel.averageScore)}</div>
                                                {hotel.rawPricePerNight > hotel.currentPricePerNight && (<div className="mb-1 text-muted text-decoration-line-through small">{formatPrice(hotel.rawPricePerNight)}</div>)}
                                                <div className="mb-1 fw-bold text-danger fs-5">{formatPrice(hotel.currentPricePerNight)}</div>
                                                <div className="text-muted small">Chưa bao gồm thuế và phí</div>
                                            </div>
                                        </div>
                                    </div>
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

                    {showNextButton && <button className={`${styles.hotelNavButton} ${styles.hotelNextButton}`} onClick={() => handleScroll('right')}>&gt;</button>}
                </div>
            </div>
        </div>
    );
}