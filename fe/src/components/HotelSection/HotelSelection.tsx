// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { hotelService, HotelResponse } from '@/service/hotelService';
// import styles from './HotelSelection.module.css';

// const formatLocationNameForDisplay = (fullName: string) => {
//     return fullName.replace('Thành phố ', '').replace('Tỉnh ', '');
// };

// export default function HotelSelection() {
//     // STATE QUẢN LÝ
//     const [allHotels, setAllHotels] = useState<HotelResponse[]>([]);
//     const [displayedHotels, setDisplayedHotels] = useState<HotelResponse[]>([]);
//     const [locations, setLocations] = useState<string[]>([]);
//     const [activeLocation, setActiveLocation] = useState<string | null>(null);

//     // State cho UI
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const scrollContainerRef = useRef<HTMLDivElement>(null);
//     const [canScrollLeft, setCanScrollLeft] = useState(false);
//     const [canScrollRight, setCanScrollRight] = useState(true);
//     const router = useRouter();

//     useEffect(() => {
//         const fetchAllData = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 // Gọi API để lấy TẤT CẢ khách sạn
//                 const hotelsData = await hotelService.getAllHotels();
//                 setAllHotels(hotelsData);

//                 if (hotelsData.length > 0) {
//                     const cityNames = hotelsData.map(hotel => hotel.city.name);
//                     const uniqueCityNames = Array.from(new Set(cityNames));
//                     setLocations(uniqueCityNames);

//                     setActiveLocation(uniqueCityNames[0]);
//                 } else {
//                     setLocations([]);
//                     setActiveLocation(null);
//                 }

//             } catch (err: any) {
//                 let errorMessage = 'Có lỗi xảy ra khi tải dữ liệu';
//                 if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
//                     errorMessage = 'Không thể kết nối tới server. Vui lòng kiểm tra backend có đang chạy không.';
//                 } else if (err.response) {
//                     errorMessage = `Lỗi server: ${err.response.status} - ${err.response.data?.message || err.message}`;
//                 } else {
//                     errorMessage = err.message || errorMessage;
//                 }
//                 setError(errorMessage);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchAllData();
//     }, []);

//     useEffect(() => {
//         if (!activeLocation) {
//             setDisplayedHotels([]);
//             return;
//         }

//         const filtered = allHotels.filter(hotel => hotel.city.name === activeLocation);
//         setDisplayedHotels(filtered);

//     }, [activeLocation, allHotels]);


//     const handleLocationClick = (location: string) => {
//         setActiveLocation(location);
//     };

//     const checkScrollButtons = () => {
//         if (scrollContainerRef.current) {
//             const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
//             setCanScrollLeft(scrollLeft > 1);
//             setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
//         }
//     };

//     const handleScroll = (direction: 'left' | 'right') => {
//         if (scrollContainerRef.current) {
//             scrollContainerRef.current.scrollBy({
//                 left: direction === 'right' ? scrollContainerRef.current.clientWidth : -scrollContainerRef.current.clientWidth,
//                 behavior: 'smooth'
//             });
//         }
//     };

//     useEffect(() => {
//         const container = scrollContainerRef.current;
//         if (!container) return;
//         container.scrollLeft = 0;
//         const observer = new ResizeObserver(checkScrollButtons);
//         observer.observe(container);
//         container.addEventListener('scroll', checkScrollButtons, { passive: true });
//         const timer = setTimeout(checkScrollButtons, 100);
//         return () => {
//             clearTimeout(timer);
//             observer.disconnect();
//             if (container) container.removeEventListener('scroll', checkScrollButtons);
//         };
//     }, [displayedHotels]);

//     const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
//     const formatRating = (rating?: number) => rating ? `${rating.toFixed(1)}/10` : 'Chưa có đánh giá';
//     const getFullAddress = (hotel: HotelResponse) => [hotel.address, hotel.street?.name, hotel.ward?.name, hotel.district?.name, hotel.city?.name].filter(Boolean).join(', ');
//     const getHotelImageUrl = (hotel: HotelResponse) => {
//         if (hotel.photos && hotel.photos.length > 0) {
//             const firstCategory = hotel.photos[0];
//             if (Array.isArray(firstCategory.photos) && firstCategory.photos.length > 0) {
//                 return firstCategory.photos[0].url;
//             }
//         }
//         return '/placeholder.svg';
//     };

//     return (
//         <div className="py-5">
//             <div className="container">
//                 <h2 className="fw-bold mb-4 text-black">🏨 Nhiều lựa chọn khách sạn</h2>

//                 <div className="mb-4">
//                     {locations.map((loc) => (
//                         <button
//                             key={loc}
//                             className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation === loc ? 'btn-primary' : 'bg-light text-primary border-0'}`}
//                             onClick={() => handleLocationClick(loc)}
//                         >
//                             {formatLocationNameForDisplay(loc)}
//                         </button>
//                     ))}
//                 </div>

//                 <div className="position-relative">
//                     {canScrollLeft && (
//                         <button className={`${styles.sliderNavButton} ${styles.prevButton}`} onClick={() => handleScroll('left')}>&lt;</button>
//                     )}
//                     {canScrollRight && (
//                         <button className={`${styles.sliderNavButton} ${styles.nextButton}`} onClick={() => handleScroll('right')}>&gt;</button>
//                     )}

//                     <div ref={scrollContainerRef} className="row flex-nowrap g-4" style={{ overflowX: 'hidden' }}>
//                         {loading ? (
//                             <div className="col-12 text-center py-5">
//                                 <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div>
//                                 <p className="mt-3 text-muted">Đang tải danh sách khách sạn...</p>
//                             </div>
//                         ) : error ? (
//                             <div className="col-12 text-center py-5">
//                                 <div className="alert alert-danger" role="alert">{error}</div>
//                             </div>
//                         ) : displayedHotels.length === 0 ? (
//                             <div className="col-12 text-center py-5">
//                                 <div className="text-muted">
//                                     <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
//                                     <p>Không tìm thấy khách sạn nào tại {activeLocation ? formatLocationNameForDisplay(activeLocation) : ''}</p>
//                                 </div>
//                             </div>
//                         ) : (
//                             displayedHotels.map((hotel) => (
//                                 <div
//                                     key={hotel.id}
//                                     className="col-lg-3 col-md-6 col-sm-8 col-10"
//                                     style={{ flex: '0 0 auto', cursor: 'pointer' }}
//                                     onClick={() => router.push(`/hotels/${hotel.id}`)}
//                                 >
//                                     <div className="card h-100 shadow-sm border-0">
//                                         <div className="position-relative">
//                                             <Image
//                                                 src={getHotelImageUrl(hotel)}
//                                                 width={400} height={300} alt={hotel.name}
//                                                 className="card-img-top" style={{ objectFit: 'cover', height: '200px' }}
//                                             />
//                                             {hotel.rawPricePerNight > hotel.currentPricePerNight && (
//                                                 <span className="badge bg-success position-absolute top-0 end-0 m-2">
//                                                     -{Math.round((1 - hotel.currentPricePerNight / hotel.rawPricePerNight) * 100)}%
//                                                 </span>
//                                             )}
//                                         </div>
//                                         <div className="card-body d-flex flex-column">
//                                             <h5 className="card-title fw-bold text-truncate">{hotel.name}</h5>
//                                             <p className="card-text text-primary small fw-bold">⭐ {formatRating(hotel.averageScore)}</p>
//                                             <p className="card-text text-muted small">📍 {getFullAddress(hotel)}</p>
//                                             <div className="mt-auto pt-2">
//                                                 <p className="card-text text-danger fw-bold fs-5 mb-0">{formatPrice(hotel.currentPricePerNight)}</p>
//                                                 {hotel.rawPricePerNight > hotel.currentPricePerNight && (
//                                                     <small className="text-muted text-decoration-line-through">{formatPrice(hotel.rawPricePerNight)}</small>
//                                                 )}
//                                                 <small className="text-muted d-block">Chưa bao gồm thuế và phí</small>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))
//                         )}
//                     </div>
//                 </div>

//                 <div className="text-center mt-5">
//                     <button className="btn btn-primary btn-lg">Xem thêm ưu đãi khách sạn</button>
//                 </div>
//             </div>
//         </div>
//     );
// }



//new
// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { hotelService, HotelResponse } from '@/service/hotelService';
// import styles from './HotelSelection.module.css';

// const formatLocationNameForDisplay = (fullName: string) => {
//     return fullName.replace(/^(Thành phố|Tỉnh|Thủ đô)\s/, '');
// };

// export default function HotelSelection() {
//     // --- STATE QUẢN LÝ ---
//     const featuredLocations = [
//         "Thành phố Hồ Chí Minh",
//         "Thành phố Đà Nẵng",
//         "Thủ đô Hà Nội",
//         "Thành phố Vũng Tàu",
//         "Thành phố Phan Thiết",
//     ];

//     const [hotelsByLocation, setHotelsByLocation] = useState<Map<string, HotelResponse[]>>(new Map());
//     const [activeLocation, setActiveLocation] = useState<string>(featuredLocations[0]);

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const scrollContainerRef = useRef<HTMLDivElement>(null);
//     const [canScrollLeft, setCanScrollLeft] = useState(false);
//     const [canScrollRight, setCanScrollRight] = useState(true);
//     const router = useRouter();

//     // --- LOGIC FETCH DATA MỚI ---
//     useEffect(() => {
//         const fetchHotelsForActiveLocation = async () => {
//             // Nếu không có tab nào được chọn, hoặc dữ liệu cho tab đó đã có trong cache (Map), thì không cần làm gì
//             if (!activeLocation || hotelsByLocation.has(activeLocation)) {
//                 setLoading(false); // Đảm bảo tắt loading nếu không fetch
//                 return;
//             }

//             setLoading(true);
//             setError(null);
//             try {
//                 // Gọi hàm searchHotels mới, chỉ lấy 6 khách sạn đầu tiên (page: 0, size: 6) cho thành phố đang được chọn
//                 const paginatedResponse = await hotelService.searchHotels({ city: activeLocation, size: 6 });

//                 // Cập nhật Map với dữ liệu mới tải về
//                 setHotelsByLocation(prevMap => new Map(prevMap).set(activeLocation, paginatedResponse.content));

//             } catch (err: any) {
//                 setError(`Không thể tải khách sạn tại ${activeLocation}.`);
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchHotelsForActiveLocation();
//     }, [activeLocation, hotelsByLocation]); // Effect này sẽ chạy lại mỗi khi người dùng click đổi tab (activeLocation thay đổi)

//     // Lấy danh sách khách sạn để hiển thị từ trong Map, dựa trên tab đang active
//     const displayedHotels = hotelsByLocation.get(activeLocation) || [];

//     // --- CÁC HÀM XỬ LÝ GIAO DIỆN CỦA BẠN (GIỮ NGUYÊN) ---
//     const handleLocationClick = (location: string) => {
//         setActiveLocation(location);
//     };

//     const checkScrollButtons = () => {
//         if (scrollContainerRef.current) {
//             const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
//             setCanScrollLeft(scrollLeft > 5);
//             setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
//         }
//     };

//     const handleScroll = (direction: 'left' | 'right') => {
//         if (scrollContainerRef.current) {
//             const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
//             scrollContainerRef.current.scrollBy({
//                 left: direction === 'right' ? scrollAmount : -scrollAmount,
//                 behavior: 'smooth'
//             });
//         }
//     };

//     useEffect(() => {
//         const container = scrollContainerRef.current;
//         if (!container) return;

//         container.scrollLeft = 0;
//         setTimeout(checkScrollButtons, 150);

//         const observer = new ResizeObserver(checkScrollButtons);
//         observer.observe(container);
//         container.addEventListener('scroll', checkScrollButtons, { passive: true });

//         return () => {
//             observer.disconnect();
//             if (container) {
//                 container.removeEventListener('scroll', checkScrollButtons);
//             }
//         };
//     }, [displayedHotels]);

//     const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
//     const formatRating = (rating?: number) => rating && rating > 0 ? `${rating.toFixed(1)}/10` : 'Chưa có đánh giá';
//     const getFullAddress = (hotel: HotelResponse) => [hotel.address, hotel.street?.name, hotel.ward?.name, hotel.district?.name, hotel.city?.name].filter(Boolean).join(', ');
//     const getHotelImageUrl = (hotel: HotelResponse) => hotel.photos?.[0]?.photos?.[0]?.url || '/placeholder.svg';

//     return (
//         <div className="py-5">
//             <div className="container">
//                 <h2 className="fw-bold mb-4 text-black">🏨 Nhiều lựa chọn khách sạn</h2>

//                 <div className="mb-4">
//                     {featuredLocations.map((loc) => (
//                         <button
//                             key={loc}
//                             className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation === loc ? 'btn-primary' : 'bg-light text-primary border-0'}`}
//                             onClick={() => handleLocationClick(loc)}
//                         >
//                             {formatLocationNameForDisplay(loc)}
//                         </button>
//                     ))}
//                 </div>

//                 <div className="position-relative">
//                     {canScrollLeft && <button className={`${styles.sliderNavButton} ${styles.prevButton}`} onClick={() => handleScroll('left')}>&lt;</button>}
//                     {canScrollRight && <button className={`${styles.sliderNavButton} ${styles.nextButton}`} onClick={() => handleScroll('right')}>&gt;</button>}

//                     <div ref={scrollContainerRef} className="row flex-nowrap g-4" style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
//                         {loading ? (
//                             <div className="col-12 text-center py-5">
//                                 <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div>
//                                 <p className="mt-3 text-muted">Đang tải danh sách khách sạn...</p>
//                             </div>
//                         ) : error ? (
//                             <div className="col-12 text-center py-5">
//                                 <div className="alert alert-danger" role="alert">{error}</div>
//                             </div>
//                         ) : displayedHotels.length === 0 ? (
//                             <div className="col-12 text-center py-5">
//                                 <div className="text-muted">
//                                     <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
//                                     <p>Không tìm thấy khách sạn nào tại {activeLocation ? formatLocationNameForDisplay(activeLocation) : ''}</p>
//                                 </div>
//                             </div>
//                         ) : (
//                             displayedHotels.map((hotel) => (
//                                 <div
//                                     key={hotel.id}
//                                     className="col-lg-3 col-md-6 col-sm-8 col-10"
//                                     style={{ flex: '0 0 auto', cursor: 'pointer' }}
//                                     onClick={() => router.push(`/hotels/${hotel.id}`)}
//                                 >
//                                     <div className="card h-100 shadow-sm border-0">
//                                         <div className="position-relative">
//                                             <Image
//                                                 src={getHotelImageUrl(hotel)}
//                                                 width={400} height={300} alt={hotel.name}
//                                                 className="card-img-top" style={{ objectFit: 'cover', height: '200px' }}
//                                             />
//                                             {hotel.rawPricePerNight > hotel.currentPricePerNight && (
//                                                 <span className="badge bg-success position-absolute top-0 end-0 m-2">
//                                                     -{Math.round((1 - hotel.currentPricePerNight / hotel.rawPricePerNight) * 100)}%
//                                                 </span>
//                                             )}
//                                         </div>
//                                         <div className="card-body d-flex flex-column">
//                                             <h5 className="card-title fw-bold text-truncate">{hotel.name}</h5>
//                                             <p className="card-text text-primary small fw-bold">⭐ {formatRating(hotel.averageScore)}</p>
//                                             <p className="card-text text-muted small text-truncate">📍 {getFullAddress(hotel)}</p>
//                                             <div className="mt-auto pt-2">
//                                                 <p className="card-text text-danger fw-bold fs-5 mb-0">{formatPrice(hotel.currentPricePerNight)}</p>
//                                                 {hotel.rawPricePerNight > hotel.currentPricePerNight && (
//                                                     <small className="text-muted text-decoration-line-through">{formatPrice(hotel.rawPricePerNight)}</small>
//                                                 )}
//                                                 <small className="text-muted d-block">Chưa bao gồm thuế và phí</small>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))
//                         )}
//                     </div>
//                 </div>

//                 <div className="text-center mt-5">
//                     {/* onClick={() => router.push('/search')} */}
//                     <button className="btn btn-primary btn-lg">Xem thêm ưu đãi khách sạn</button>
//                 </div>
//             </div>
//         </div>
//     );
// }
//end new



'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { hotelService, HotelResponse } from '@/service/hotelService';
import styles from './HotelSelection.module.css';

const formatLocationNameForDisplay = (fullName: string) => fullName.replace(/^(Thành phố|Tỉnh|Thủ đô)\s/, '');
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
const formatRating = (rating?: number) => rating && rating > 0 ? `${rating.toFixed(1)}/10` : 'Chưa có đánh giá';
const getFullAddress = (hotel: HotelResponse) =>
    [hotel.address,
    hotel.street?.name,
    hotel.ward?.name,
    hotel.district?.name,
    hotel.city?.name].filter(Boolean).join(', ');
const getHotelImageUrl = (hotel: HotelResponse) => hotel.photos?.[0]?.photos?.[0]?.url || '/placeholder.svg';

interface LocationData {
    hotels: HotelResponse[];
    page: number;
    totalPages: number;
}

export default function HotelSelection() {
    // --- STATE QUẢN LÝ ---
    const [featuredLocations, setFeaturedLocations] = useState<string[]>([]);
    const [cityIdMap, setCityIdMap] = useState<Map<string, string>>(new Map());
    const [activeLocation, setActiveLocation] = useState<string>('');
    const [locationData, setLocationData] = useState<Map<string, LocationData>>(new Map());

    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingTab, setIsLoadingTab] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const router = useRouter();


    useEffect(() => {
        const fetchLocationsAndCreateIdMap = async () => {
            try {
                const response = await hotelService.searchHotels({ page: 0, size: 50 });
                if (response.content?.length > 0) {
                    const uniqueCities = new Map<string, string>();
                    response.content.forEach(hotel => {
                        if (!uniqueCities.has(hotel.city.name)) {
                            uniqueCities.set(hotel.city.name, hotel.city.id);
                        }
                    });

                    const cityNames = Array.from(uniqueCities.keys());
                    setFeaturedLocations(cityNames);
                    setCityIdMap(uniqueCities); // << LƯU LẠI BẢN ĐỒ ID
                    setActiveLocation(cityNames[0]);
                } else {
                    setError("Không tìm thấy khách sạn nào.");
                }
            } catch (err) {
                setError("Lỗi tải danh sách địa điểm.");
            } finally {
                setIsLoadingInitial(false);
            }
        };
        fetchLocationsAndCreateIdMap();
    }, []);

    useEffect(() => {
        const fetchHotelsForTab = async () => {
            if (!activeLocation || locationData.has(activeLocation) || cityIdMap.size === 0) {
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
                const response = await hotelService.searchHotels({ 'city-id': cityId, page: 0, size: 6 });
                setLocationData(prev => new Map(prev).set(activeLocation, {
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
    }, [activeLocation, isLoadingInitial, cityIdMap]);

    const handleLoadMore = async () => {
        const currentData = locationData.get(activeLocation);
        const cityId = cityIdMap.get(activeLocation);

        if (!currentData || !cityId || currentData.page >= currentData.totalPages - 1 || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);
        try {
            const nextPage = currentData.page + 1;
            const response = await hotelService.searchHotels({ 'city-id': cityId, page: nextPage, size: 6 });
            setLocationData(prev => {
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

    const handleLocationClick = (location: string) => {
        if (location !== activeLocation) setActiveLocation(location);
    };

    const handleScrollButton = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const scrollAmount = clientWidth * 0.8;
        if (direction === 'left') {
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
            const currentData = locationData.get(activeLocation);
            const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
            if (isAtEnd && hasMorePages) handleLoadMore();
            else scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        const checkScroll = () => {
            if (container) {
                const { scrollLeft, scrollWidth, clientWidth } = container;
                setCanScrollLeft(scrollLeft > 5);
                const currentData = locationData.get(activeLocation);
                const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
                setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5 || hasMorePages);
            }
        };
        if (container) {
            container.scrollLeft = 0;
            const timer = setTimeout(checkScroll, 150);
            const observer = new ResizeObserver(checkScroll);
            observer.observe(container);
            container.addEventListener('scroll', checkScroll, { passive: true });
            return () => {
                clearTimeout(timer);
                container.removeEventListener('scroll', checkScroll);
                observer.disconnect();
            };
        }
    }, [locationData, activeLocation]);

    const currentHotels = locationData.get(activeLocation)?.hotels || [];
    const isLoading = isLoadingInitial || isLoadingTab;

    return (
        <div className="py-5">
            <div className="container">
                <h2 className="fw-bold mb-4 text-black">🏨 Nhiều lựa chọn khách sạn</h2>
                {!isLoadingInitial && (
                    <div className="mb-4">
                        {featuredLocations.map(loc => (
                            <button key={loc} className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation === loc ? 'btn-primary' : 'bg-light text-primary border-0'}`} onClick={() => handleLocationClick(loc)}>
                                {formatLocationNameForDisplay(loc)}
                            </button>
                        ))}
                    </div>
                )}
                <div className="position-relative">
                    {!isLoading && canScrollLeft && <button className={`${styles.sliderNavButton} ${styles.prevButton}`} onClick={() => handleScrollButton('left')}>&lt;</button>}
                    {!isLoading && canScrollRight && <button className={`${styles.sliderNavButton} ${styles.nextButton}`} onClick={() => handleScrollButton('right')}>&gt;</button>}
                    <div ref={scrollContainerRef} className="row flex-nowrap g-4 align-items-stretch" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {isLoading ? (
                            <div className="col-12 text-center py-5 d-flex justify-content-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
                        ) : error ? (
                            <div className="col-12 text-center py-5"><div className="alert alert-danger">{error}</div></div>
                        ) : currentHotels.length === 0 && !isLoadingTab ? (
                            <div className="col-12 text-center py-5 text-muted">
                                <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
                                <p>Không tìm thấy khách sạn nào tại {formatLocationNameForDisplay(activeLocation)}</p>
                            </div>
                        ) : (
                            <>
                                {currentHotels.map((hotel) => (
                                    <div key={hotel.id} className="col-lg-3 col-md-6 col-sm-8 col-10" style={{ flex: '0 0 auto' }} onClick={() => router.push(`/hotels/${hotel.id}`)}>
                                        <div className="card h-100 shadow-sm border-0" style={{ cursor: 'pointer' }}>
                                            <div className="position-relative">
                                                <Image src={getHotelImageUrl(hotel)} width={400} height={300} alt={hotel.name} className="card-img-top" style={{ objectFit: 'cover', height: '200px' }} />
                                                {hotel.rawPricePerNight > hotel.currentPricePerNight && (<span className="badge bg-success position-absolute top-0 end-0 m-2">-{Math.round((1 - hotel.currentPricePerNight / hotel.rawPricePerNight) * 100)}%</span>)}
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title fw-bold text-truncate">{hotel.name}</h5>
                                                <p className="card-text text-primary small fw-bold">⭐ {formatRating(hotel.averageScore)}</p>
                                                <p className="card-text text-muted small ">📍 {getFullAddress(hotel)}</p>
                                                <div className="mt-auto pt-2">
                                                    <p className="card-text text-danger fw-bold fs-5 mb-0">{formatPrice(hotel.currentPricePerNight)}</p>
                                                    {hotel.rawPricePerNight > hotel.currentPricePerNight && (<small className="text-muted text-decoration-line-through">{formatPrice(hotel.rawPricePerNight)}</small>)}
                                                    <small className="text-muted d-block">Chưa bao gồm thuế và phí</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoadingMore && (
                                    <div className="col-auto d-flex align-items-center justify-content-center p-5" style={{ flex: '0 0 auto' }}>
                                        <div className="spinner-border text-primary spinner-border-sm" role="status"><span className="visually-hidden">Đang tải thêm...</span></div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className="text-center mt-5">
                    <button onClick={() => router.push('/search')} className="btn btn-primary btn-lg">Xem thêm ưu đãi khách sạn</button>
                </div>
            </div>
        </div>
    );
}