// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { hotelService, HotelResponse } from '@/service/hotelService';
// import styles from './HotelSelection.module.css';
// import { locationService } from '@/service/locationService';

// // --- Các hàm tiện ích ---
// const formatLocationNameForDisplay = (fullName: string) => fullName.replace(/^(Thành phố|Tỉnh|Thủ đô)\s/, '');
// const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
// const formatRating = (rating?: number) => rating && rating > 0 ? `${rating.toFixed(1)}/10` : 'Chưa có đánh giá';
// const getFullAddress = (hotel: HotelResponse) =>
//     [hotel.address, hotel.ward?.name, hotel.district?.name, hotel.city?.name].filter(Boolean).join(', ');
// const getHotelImageUrl = (hotel: HotelResponse) => hotel.photos?.[0]?.photos?.[0]?.url || '/placeholder.svg';

// // --- Interface ---
// interface City {
//     id: string;
//     name: string;
// }
// interface Province {
//     id: string;
//     name: string;
// }
// interface LocationData {
//     hotels: HotelResponse[];
//     page: number;
//     totalPages: number;
// }

// export default function HotelSelection() {
//     // --- State ---

//     // const [featuredLocations, setFeaturedLocations] = useState<Province[]>([]);
//     // const [activeLocation, setActiveLocation] = useState<Province | null>(null);
//     // const [locationData, setLocationData] = useState<Map<string, LocationData>>(new Map());
//     const [featuredLocations, setFeaturedLocations] = useState<City[]>([]);
//     const [activeLocation, setActiveLocation] = useState<City | null>(null);
//     const [locationData, setLocationData] = useState<Map<string, LocationData>>(new Map());

//     const [isLoadingInitial, setIsLoadingInitial] = useState(true);
//     const [isLoadingTab, setIsLoadingTab] = useState(false);
//     const [isLoadingMore, setIsLoadingMore] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const scrollContainerRef = useRef<HTMLDivElement>(null);
//     const [canScrollLeft, setCanScrollLeft] = useState(false);
//     const [canScrollRight, setCanScrollRight] = useState(true);
//     const router = useRouter();

//     // Effect 1: Lấy danh sách các Thành phố
//     useEffect(() => {
//         const fetchAllProvinces = async () => { // Đổi tên hàm cho rõ nghĩa
//             setIsLoadingInitial(true);
//             setError(null);
//             try {
//                 // SỬA Ở ĐÂY: Gọi getProvinces thay vì getCities
//                 const provinces = await locationService.getCities();
//                 if (provinces && provinces.length > 0) {
//                     // Lọc ra các tỉnh thành phố trực thuộc trung ương như Đà Nẵng, HCM
//                     // và các tỉnh lớn như Khánh Hòa, Bình Thuận...
//                     setFeaturedLocations(provinces);
//                     setActiveLocation(provinces[0]);
//                 } else {
//                     setError("Không tìm thấy địa điểm nào.");
//                 }
//             } catch (err) {
//                 setError("Lỗi tải danh sách địa điểm.");
//             } finally {
//                 setIsLoadingInitial(false);
//             }
//         };
//         fetchAllProvinces();
//     }, []);
//     // Effect 2: Tải khách sạn cho Thành phố được chọn
//     useEffect(() => {
//         const fetchHotelsForTab = async () => {
//             if (!activeLocation || locationData.has(activeLocation.id)) {
//                 return;
//             }
//             setIsLoadingTab(true);
//             setError(null);
//             try {
//                 // SỬA Ở ĐÂY: Dùng 'city-id'
//                 const response = await hotelService.searchHotels({ 'city-id': activeLocation.id, page: 0, size: 6 }); // Lấy 6 cái ban đầu
//                 setLocationData(prev => new Map(prev).set(activeLocation.id, {
//                     hotels: response.content,
//                     page: response.page,
//                     totalPages: response.totalPages,
//                 }));
//             } catch (err) {
//                 setError(`Lỗi tải khách sạn tại ${activeLocation.name}.`);
//             } finally {
//                 setIsLoadingTab(false);
//             }
//         };
//         if (!isLoadingInitial && activeLocation) {
//             fetchHotelsForTab();
//         }
//     }, [activeLocation, isLoadingInitial]);

//     // Hàm load more
//     const handleLoadMore = async () => {
//         if (!activeLocation || isLoadingMore) return;
//         const currentData = locationData.get(activeLocation.id);
//         if (!currentData || currentData.page >= currentData.totalPages - 1) {
//             return;
//         }
//         setIsLoadingMore(true);
//         try {
//             const nextPage = currentData.page + 1;
//             // SỬA Ở ĐÂY: Dùng 'city-id'
//             const response = await hotelService.searchHotels({ 'city-id': activeLocation.id, page: nextPage, size: 6 });
//             setLocationData(prev => {
//                 const existingData = prev.get(activeLocation.id)!;
//                 const updatedData = {
//                     hotels: [...existingData.hotels, ...response.content],
//                     page: response.page,
//                     totalPages: response.totalPages,
//                 };
//                 return new Map(prev).set(activeLocation.id, updatedData);
//             });
//         } catch (err) {
//             console.error("Lỗi tải thêm khách sạn:", err);
//         } finally {
//             setIsLoadingMore(false);
//         }
//     };

//     const handleLocationClick = (location: City) => {
//         if (activeLocation?.id !== location.id) {
//             setActiveLocation(location);
//         }
//     };

//     // useEffect cho việc cuộn (Không cần sửa)
//     useEffect(() => {
//         const container = scrollContainerRef.current;
//         if (!container) return;

//         const handleScroll = () => {
//             if (isLoadingMore || !activeLocation) return;
//             const { scrollLeft, scrollWidth, clientWidth } = container;
//             setCanScrollLeft(scrollLeft > 10);
//             const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
//             const currentData = locationData.get(activeLocation.id);
//             const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
//             setCanScrollRight(!isAtEnd || hasMorePages);
//             if (scrollLeft + clientWidth >= scrollWidth - 200 && hasMorePages) {
//                 handleLoadMore();
//             }
//         };

//         container.scrollLeft = 0;
//         const timer = setTimeout(handleScroll, 150);
//         container.addEventListener('scroll', handleScroll, { passive: true });
//         const observer = new ResizeObserver(handleScroll);
//         observer.observe(container);

//         return () => {
//             clearTimeout(timer);
//             container.removeEventListener('scroll', handleScroll);
//             observer.disconnect();
//         };
//     }, [activeLocation, locationData, isLoadingMore]);


//     const handleScrollButton = (direction: 'left' | 'right') => {
//         if (!scrollContainerRef.current || !activeLocation) return;
//         const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
//         const scrollAmount = clientWidth * 0.8;
//         if (direction === 'left') {
//             scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
//         } else {
//             const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
//             const currentData = locationData.get(activeLocation.id);
//             const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
//             if (isAtEnd && hasMorePages) {
//                 handleLoadMore();
//             } else {
//                 scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//             }
//         }
//     };

//     const currentHotels = activeLocation ? (locationData.get(activeLocation.id)?.hotels || []) : [];
//     const isLoading = isLoadingInitial || isLoadingTab;

//     // --- JSX (Không cần sửa) ---
//     return (
//         <div className="py-5">
//             <div className="container">
//                 <h2 className="fw-bold mb-4 text-black">🏨 Nhiều lựa chọn khách sạn</h2>
//                 {isLoadingInitial ? (
//                     <div className="text-center p-3"><div className="spinner-border text-primary spinner-border-sm"></div></div>
//                 ) : (
//                     <div className="mb-4">
//                         {featuredLocations.map(loc => (
//                             <button key={loc.id} className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation?.id === loc.id ? 'btn-primary' : 'bg-light text-primary border-0'}`} onClick={() => handleLocationClick(loc)}>
//                                 {formatLocationNameForDisplay(loc.name)}
//                             </button>
//                         ))}
//                     </div>
//                 )}
//                 <div className="position-relative">
//                     {!isLoading && canScrollLeft && <button className={`${styles.sliderNavButton} ${styles.prevButton}`} onClick={() => handleScrollButton('left')}>&lt;</button>}
//                     {!isLoading && canScrollRight && <button className={`${styles.sliderNavButton} ${styles.nextButton}`} onClick={() => handleScrollButton('right')}>&gt;</button>}

//                     <div ref={scrollContainerRef} className="row flex-nowrap g-4 align-items-stretch" style={{ overflowX: 'auto', scrollbarWidth: 'none', minHeight: '300px' }}>
//                         {isLoading ? (
//                             <div className="col-12 text-center py-5 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
//                         ) : error && currentHotels.length === 0 ? (
//                             <div className="col-12 text-center py-5"><div className="alert alert-danger">{error}</div></div>
//                         ) : currentHotels.length === 0 && !isLoadingTab ? (
//                             <div className="col-12 text-center py-5 text-muted d-flex justify-content-center align-items-center">
//                                 <div>
//                                     <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
//                                     <p>Không tìm thấy khách sạn nào tại {activeLocation ? formatLocationNameForDisplay(activeLocation.name) : ''}</p>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 {currentHotels.map((hotel) => (
//                                     <div key={hotel.id} className="col-lg-3 col-md-6 col-sm-8 col-10" style={{ flex: '0 0 auto' }} onClick={() => router.push(`/hotels/${hotel.id}`)}>
//                                         <div className="card h-100 shadow-sm border-0" style={{ cursor: 'pointer' }}>
//                                             <div className="position-relative">
//                                                 <Image src={getHotelImageUrl(hotel)} width={400} height={300} alt={hotel.name} className="card-img-top" style={{ objectFit: 'cover', height: '200px' }} />
//                                                 {hotel.rawPricePerNight > hotel.currentPricePerNight && (<span className="badge bg-success position-absolute top-0 end-0 m-2">-{Math.round((1 - hotel.currentPricePerNight / hotel.rawPricePerNight) * 100)}%</span>)}
//                                             </div>
//                                             <div className="card-body d-flex flex-column">
//                                                 <h5 className="card-title fw-bold text-truncate">{hotel.name}</h5>
//                                                 <p className="card-text text-primary small fw-bold">⭐ {formatRating(hotel.averageScore)}</p>
//                                                 <p className="card-text text-muted small " title={getFullAddress(hotel)}>📍 {getFullAddress(hotel)}</p>
//                                                 <div className="mt-auto pt-2">
//                                                     <p className="card-text text-danger fw-bold fs-5 mb-0">{formatPrice(hotel.currentPricePerNight)}</p>
//                                                     {hotel.rawPricePerNight > hotel.currentPricePerNight && (<small className="text-muted text-decoration-line-through">{formatPrice(hotel.rawPricePerNight)}</small>)}
//                                                     <small className="text-muted d-block">Chưa bao gồm thuế và phí</small>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {isLoadingMore && (
//                                     <div className="col-auto d-flex align-items-center justify-content-center p-5" style={{ flex: '0 0 auto' }}>
//                                         <div className="spinner-border text-primary spinner-border-sm" role="status"><span className="visually-hidden">Đang tải thêm...</span></div>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 </div>
//                 <div className="text-center mt-5">
//                     <button onClick={() => router.push('/search')} className="btn btn-primary btn-lg">Xem thêm ưu đãi khách sạn</button>
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
import styles from './HotelSelection.module.css';
import { locationService } from '@/service/locationService';

// --- Các hàm tiện ích (Không đổi) ---
const formatLocationNameForDisplay = (fullName: string) => fullName.replace(/^(Thành phố|Tỉnh|Thủ đô)\s/, '');
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
const formatRating = (rating?: number) => rating && rating > 0 ? `${rating.toFixed(1)}/10` : 'Chưa có đánh giá';
const getFullAddress = (hotel: HotelResponse) =>
    [hotel.address, hotel.ward?.name, hotel.district?.name, hotel.city?.name].filter(Boolean).join(', ');
const getHotelImageUrl = (hotel: HotelResponse) => hotel.photos?.[0]?.photos?.[0]?.url || '/placeholder.svg';

// --- Interface (Không đổi) ---
interface City {
    id: string;
    name: string;
}
interface LocationData {
    hotels: HotelResponse[];
    page: number;
    totalPages: number;
}

export default function HotelSelection() {
    // --- State (Không đổi) ---
    const [featuredLocations, setFeaturedLocations] = useState<City[]>([]);
    const [activeLocation, setActiveLocation] = useState<City | null>(null);
    const [locationData, setLocationData] = useState<Map<string, LocationData>>(new Map());
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingTab, setIsLoadingTab] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const router = useRouter();

    // Effect 1: Lấy danh sách các Thành phố
    useEffect(() => {
        const fetchAllCities = async () => {
            setIsLoadingInitial(true);
            setError(null);
            try {
                const cities = await locationService.getCities();

                // DEBUG 1: KIỂM TRA DANH SÁCH THÀNH PHỐ TỪ API
                console.log('DEBUG 1: Tất cả thành phố đã tải:', cities);

                if (cities && cities.length > 0) {
                    setFeaturedLocations(cities);
                    setActiveLocation(cities[0]);
                } else {
                    setError("Không tìm thấy địa điểm nào.");
                }
            } catch (err) {
                setError("Lỗi tải danh sách địa điểm.");
            } finally {
                setIsLoadingInitial(false);
            }
        };
        fetchAllCities();
    }, []);

    // Effect 2: Tải khách sạn cho Thành phố được chọn
    useEffect(() => {
        const fetchHotelsForTab = async () => {
            if (!activeLocation || locationData.has(activeLocation.id)) {
                return;
            }
            setIsLoadingTab(true);
            setError(null);

            // DEBUG 2: KIỂM TRA XEM ĐANG TẢI CHO THÀNH PHỐ NÀO VÀ ID LÀ GÌ
            console.log(`DEBUG 2: Chuẩn bị tải khách sạn cho: "${activeLocation.name}" (ID: ${activeLocation.id})`);

            try {
                const response = await hotelService.searchHotels({ 'city-id': activeLocation.id, page: 0, size: 6 });

                // DEBUG 3: XEM KẾT QUẢ TRẢ VỀ TỪ BACKEND
                console.log(`DEBUG 3: Phản hồi từ API cho "${activeLocation.name}":`, response);

                // Cập nhật state ngay cả khi content rỗng để UI biết là đã tải xong
                setLocationData(prev => new Map(prev).set(activeLocation.id, {
                    hotels: response.content || [],
                    page: response.page,
                    totalPages: response.totalPages,
                }));

            } catch (err) {
                setError(`Lỗi tải khách sạn tại ${activeLocation.name}.`);
                // Nếu lỗi, cũng set một giá trị rỗng để UI không bị treo
                setLocationData(prev => new Map(prev).set(activeLocation.id, {
                    hotels: [], page: 0, totalPages: 0,
                }));
            } finally {
                setIsLoadingTab(false);
            }
        };
        if (!isLoadingInitial && activeLocation) {
            fetchHotelsForTab();
        }
    }, [activeLocation, isLoadingInitial]);

    // Các hàm còn lại không cần thay đổi, giữ nguyên như code của bạn
    const handleLoadMore = async () => {
        if (!activeLocation || isLoadingMore) return;
        const currentData = locationData.get(activeLocation.id);
        if (!currentData || currentData.page >= currentData.totalPages - 1) {
            return;
        }
        setIsLoadingMore(true);
        try {
            const nextPage = currentData.page + 1;
            const response = await hotelService.searchHotels({ 'city-id': activeLocation.id, page: nextPage, size: 6 });
            setLocationData(prev => {
                const existingData = prev.get(activeLocation.id)!;
                const updatedData = {
                    hotels: [...existingData.hotels, ...response.content],
                    page: response.page,
                    totalPages: response.totalPages,
                };
                return new Map(prev).set(activeLocation.id, updatedData);
            });
        } catch (err) {
            console.error("Lỗi tải thêm khách sạn:", err);
        } finally {
            setIsLoadingMore(false);
        }
    };
    const handleLocationClick = (location: City) => {
        if (activeLocation?.id !== location.id) {
            setActiveLocation(location);
        }
    };
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const handleScroll = () => {
            if (isLoadingMore || !activeLocation) return;
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 10);
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
            const currentData = locationData.get(activeLocation.id);
            const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
            setCanScrollRight(!isAtEnd || hasMorePages);
            if (scrollLeft + clientWidth >= scrollWidth - 200 && hasMorePages) {
                handleLoadMore();
            }
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
    }, [activeLocation, locationData, isLoadingMore]);
    const handleScrollButton = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current || !activeLocation) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const scrollAmount = clientWidth * 0.8;
        if (direction === 'left') {
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
            const currentData = locationData.get(activeLocation.id);
            const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
            if (isAtEnd && hasMorePages) {
                handleLoadMore();
            } else {
                scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };
    const currentHotels = activeLocation ? (locationData.get(activeLocation.id)?.hotels || []) : [];
    const isLoading = isLoadingInitial || isLoadingTab;

    return (
        <div className="py-5">
            <div className="container">
                <h2 className="fw-bold mb-4 text-black">🏨 Nhiều lựa chọn khách sạn</h2>
                {isLoadingInitial ? (
                    <div className="text-center p-3"><div className="spinner-border text-primary spinner-border-sm"></div></div>
                ) : (
                    <div className="mb-4">
                        {featuredLocations.map(loc => (
                            <button key={loc.id} className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation?.id === loc.id ? 'btn-primary' : 'bg-light text-primary border-0'}`} onClick={() => handleLocationClick(loc)}>
                                {formatLocationNameForDisplay(loc.name)}
                            </button>
                        ))}
                    </div>
                )}
                <div className="position-relative">
                    {!isLoading && canScrollLeft && <button className={`${styles.sliderNavButton} ${styles.prevButton}`} onClick={() => handleScrollButton('left')}>&lt;</button>}
                    {!isLoading && canScrollRight && <button className={`${styles.sliderNavButton} ${styles.nextButton}`} onClick={() => handleScrollButton('right')}>&gt;</button>}
                    <div ref={scrollContainerRef} className="row flex-nowrap g-4 align-items-stretch" style={{ overflowX: 'auto', scrollbarWidth: 'none', minHeight: '300px' }}>
                        {isLoading ? (
                            <div className="col-12 text-center py-5 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
                        ) : error && currentHotels.length === 0 ? (
                            <div className="col-12 text-center py-5"><div className="alert alert-danger">{error}</div></div>
                        ) : currentHotels.length === 0 && !isLoadingTab ? (
                            <div className="col-12 text-center py-5 text-muted d-flex justify-content-center align-items-center">
                                <div>
                                    <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
                                    <p>Không tìm thấy khách sạn nào tại {activeLocation ? formatLocationNameForDisplay(activeLocation.name) : ''}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {currentHotels.map((hotel) => (
                                    <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="col-lg-3 col-md-6 col-sm-8 col-10" style={{ flex: '0 0 auto', textDecoration: 'none', color: 'inherit' }}>
                                        <div className="card h-100 shadow-sm border-0" style={{ cursor: 'pointer' }}>
                                            <div className="position-relative">
                                                <Image src={getHotelImageUrl(hotel)} width={400} height={300} alt={hotel.name} className="card-img-top" style={{ objectFit: 'cover', height: '200px' }} />
                                                {hotel.rawPricePerNight > hotel.currentPricePerNight && (<span className="badge bg-success position-absolute top-0 end-0 m-2">-{Math.round((1 - hotel.currentPricePerNight / hotel.rawPricePerNight) * 100)}%</span>)}
                                            </div>
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title fw-bold text-truncate">{hotel.name}</h5>
                                                <p className="card-text text-primary small fw-bold">⭐ {formatRating(hotel.averageScore)}</p>
                                                <p className="card-text text-muted small " title={getFullAddress(hotel)}>📍 {getFullAddress(hotel)}</p>
                                                <div className="mt-auto pt-2">
                                                    <p className="card-text text-danger fw-bold fs-5 mb-0">{formatPrice(hotel.currentPricePerNight)}</p>
                                                    {hotel.rawPricePerNight > hotel.currentPricePerNight && (<small className="text-muted text-decoration-line-through d-block">{formatPrice(hotel.rawPricePerNight)}</small>)}
                                                    <small className="text-muted d-block">Chưa bao gồm thuế và phí</small>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
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

// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { hotelService, HotelResponse } from '@/service/hotelService';
// import styles from './HotelSelection.module.css';
// import { locationService } from '@/service/locationService';

// // --- Các hàm tiện ích ---
// const formatLocationNameForDisplay = (fullName: string) => fullName.replace(/^(Thành phố|Tỉnh|Thủ đô)\s/, '');
// const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' VND';
// const formatRating = (rating?: number) => rating && rating > 0 ? `${rating.toFixed(1)}/10` : 'Chưa có đánh giá';
// const getFullAddress = (hotel: HotelResponse) =>
//     [hotel.address, hotel.ward?.name, hotel.district?.name, hotel.city?.name].filter(Boolean).join(', ');
// const getHotelImageUrl = (hotel: HotelResponse) => hotel.photos?.[0]?.photos?.[0]?.url || '/placeholder.svg';

// // --- Interface mới để kết hợp dữ liệu ---
// interface FeaturedLocation {
//     id: string;          // ID của Tỉnh (dùng làm key và định danh)
//     displayName: string; // Tên Thành phố chính (để hiển thị)
//     filterId: string;    // ID của Tỉnh (dùng để lọc API)
// }
// interface LocationData {
//     hotels: HotelResponse[];
//     page: number;
//     totalPages: number;
// }
// // Giả sử API /cities trả về cấu trúc này
// interface CityFromAPI {
//     id: string;
//     name: string;
//     provinceId: string;
// }

// export default function HotelSelection() {
//     // --- State sử dụng interface mới ---
//     const [featuredLocations, setFeaturedLocations] = useState<FeaturedLocation[]>([]);
//     const [activeLocation, setActiveLocation] = useState<FeaturedLocation | null>(null);
//     const [locationData, setLocationData] = useState<Map<string, LocationData>>(new Map());

//     const [isLoadingInitial, setIsLoadingInitial] = useState(true);
//     const [isLoadingTab, setIsLoadingTab] = useState(false);
//     const [isLoadingMore, setIsLoadingMore] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const scrollContainerRef = useRef<HTMLDivElement>(null);
//     const [canScrollLeft, setCanScrollLeft] = useState(false);
//     const [canScrollRight, setCanScrollRight] = useState(true);
//     const router = useRouter();

//     // Effect 1: Lấy cả Province và City để xử lý logic
//     useEffect(() => {
//         const fetchAndMapLocations = async () => {
//             setIsLoadingInitial(true);
//             setError(null);
//             try {
//                 // 1. Gọi song song cả hai API
//                 const [provinces, cities] = await Promise.all([
//                     locationService.getProvinces(),
//                     locationService.getCities()
//                 ]);

//                 if (!provinces?.length) {
//                     throw new Error("Không thể tải danh sách Tỉnh/Thành phố.");
//                 }

//                 // 2. Tạo một Map để tra cứu các thành phố theo provinceId
//                 const citiesByProvince = new Map<string, CityFromAPI[]>();
//                 cities.forEach((city: CityFromAPI) => {
//                     if (!citiesByProvince.has(city.provinceId)) {
//                         citiesByProvince.set(city.provinceId, []);
//                     }
//                     citiesByProvince.get(city.provinceId)!.push(city);
//                 });

//                 // 3. Xây dựng danh sách hiển thị cuối cùng
//                 const finalLocations: FeaturedLocation[] = provinces.map(province => {
//                     let displayName = province.name; // Mặc định là tên tỉnh

//                     // Nếu là TP TTTW (ví dụ: 'Thành phố Đà Nẵng'), tên hiển thị là chính nó
//                     if (province.name.startsWith('Thành phố')) {
//                         displayName = province.name;
//                     } else {
//                         // Nếu là Tỉnh (ví dụ: 'Tỉnh Khánh Hòa'), tìm thành phố chính của nó
//                         const mainCities = citiesByProvince.get(province.id);
//                         if (mainCities && mainCities.length > 0) {
//                             // Ưu tiên thành phố có tên gần giống tên tỉnh, hoặc lấy cái đầu tiên
//                             displayName = mainCities[0].name; // Lấy 'Thành phố Nha Trang'
//                         }
//                     }

//                     return {
//                         id: province.id, // Dùng ID tỉnh làm key
//                         displayName: displayName, // Tên để hiển thị
//                         filterId: province.id, // Luôn dùng ID tỉnh để lọc
//                     };
//                 });

//                 setFeaturedLocations(finalLocations);
//                 setActiveLocation(finalLocations[0]);

//             } catch (err: any) {
//                 console.error("Lỗi khi xử lý địa điểm:", err);
//                 setError(err.message || "Lỗi tải danh sách địa điểm.");
//             } finally {
//                 setIsLoadingInitial(false);
//             }
//         };

//         fetchAndMapLocations();
//     }, []);

//     // Effect 2: Tải khách sạn DÙNG `filterId` (tức province-id)
//     useEffect(() => {
//         const fetchHotelsForTab = async () => {
//             if (!activeLocation || locationData.has(activeLocation.id)) {
//                 return;
//             }
//             setIsLoadingTab(true);
//             setError(null);
//             try {
//                 const response = await hotelService.searchHotels({ 'province-id': activeLocation.filterId, page: 0, size: 6 });
//                 setLocationData(prev => new Map(prev).set(activeLocation.id, {
//                     hotels: response.content || [],
//                     page: response.page,
//                     totalPages: response.totalPages,
//                 }));
//             } catch (err) {
//                 setError(`Lỗi tải khách sạn tại ${activeLocation.displayName}.`);
//                 setLocationData(prev => new Map(prev).set(activeLocation.id, {
//                     hotels: [], page: 0, totalPages: 0,
//                 }));
//             } finally {
//                 setIsLoadingTab(false);
//             }
//         };
//         if (!isLoadingInitial && activeLocation) {
//             fetchHotelsForTab();
//         }
//     }, [activeLocation, isLoadingInitial]);

//     // Hàm load more DÙNG `filterId`
//     const handleLoadMore = async () => {
//         if (!activeLocation || isLoadingMore) return;
//         const currentData = locationData.get(activeLocation.id);
//         if (!currentData || currentData.page >= currentData.totalPages - 1) {
//             return;
//         }
//         setIsLoadingMore(true);
//         try {
//             const nextPage = currentData.page + 1;
//             const response = await hotelService.searchHotels({ 'province-id': activeLocation.filterId, page: nextPage, size: 6 });
//             setLocationData(prev => {
//                 const existingData = prev.get(activeLocation.id)!;
//                 const updatedData = {
//                     hotels: [...existingData.hotels, ...response.content],
//                     page: response.page,
//                     totalPages: response.totalPages,
//                 };
//                 return new Map(prev).set(activeLocation.id, updatedData);
//             });
//         } catch (err) {
//             console.error("Lỗi tải thêm khách sạn:", err);
//         } finally {
//             setIsLoadingMore(false);
//         }
//     };

//     const handleLocationClick = (location: FeaturedLocation) => {
//         if (activeLocation?.id !== location.id) {
//             setActiveLocation(location);
//         }
//     };

//     // (Phần còn lại của code không cần thay đổi)

//     useEffect(() => {
//         const container = scrollContainerRef.current;
//         if (!container) return;
//         const handleScroll = () => {
//             if (isLoadingMore || !activeLocation) return;
//             const { scrollLeft, scrollWidth, clientWidth } = container;
//             setCanScrollLeft(scrollLeft > 10);
//             const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
//             const currentData = locationData.get(activeLocation.id);
//             const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
//             setCanScrollRight(!isAtEnd || hasMorePages);
//             if (scrollLeft + clientWidth >= scrollWidth - 200 && hasMorePages) {
//                 handleLoadMore();
//             }
//         };
//         container.scrollLeft = 0;
//         const timer = setTimeout(handleScroll, 150);
//         container.addEventListener('scroll', handleScroll, { passive: true });
//         const observer = new ResizeObserver(handleScroll);
//         observer.observe(container);
//         return () => {
//             clearTimeout(timer);
//             container.removeEventListener('scroll', handleScroll);
//             observer.disconnect();
//         };
//     }, [activeLocation, locationData, isLoadingMore]);

//     const handleScrollButton = (direction: 'left' | 'right') => {
//         if (!scrollContainerRef.current || !activeLocation) return;
//         const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
//         const scrollAmount = clientWidth * 0.8;
//         if (direction === 'left') {
//             scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
//         } else {
//             const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
//             const currentData = locationData.get(activeLocation.id);
//             const hasMorePages = currentData ? currentData.page < currentData.totalPages - 1 : false;
//             if (isAtEnd && hasMorePages) {
//                 handleLoadMore();
//             } else {
//                 scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//             }
//         }
//     };

//     const currentHotels = activeLocation ? (locationData.get(activeLocation.id)?.hotels || []) : [];
//     const isLoading = isLoadingInitial || isLoadingTab;

//     return (
//         <div className="py-5">
//             <div className="container">
//                 <h2 className="fw-bold mb-4 text-black">🏨 Nhiều lựa chọn khách sạn</h2>
//                 {isLoadingInitial ? (
//                     <div className="text-center p-3"><div className="spinner-border text-primary spinner-border-sm"></div></div>
//                 ) : (
//                     <div className="mb-4">
//                         {featuredLocations.map(loc => (
//                             <button key={loc.id} className={`btn rounded-pill me-2 mb-2 fw-semibold ${activeLocation?.id === loc.id ? 'btn-primary' : 'bg-light text-primary border-0'}`} onClick={() => handleLocationClick(loc)}>
//                                 {formatLocationNameForDisplay(loc.displayName)}
//                             </button>
//                         ))}
//                     </div>
//                 )}
//                 <div className="position-relative">
//                     {!isLoading && canScrollLeft && <button className={`${styles.sliderNavButton} ${styles.prevButton}`} onClick={() => handleScrollButton('left')}>&lt;</button>}
//                     {!isLoading && canScrollRight && <button className={`${styles.sliderNavButton} ${styles.nextButton}`} onClick={() => handleScrollButton('right')}>&gt;</button>}
//                     <div ref={scrollContainerRef} className="row flex-nowrap g-4 align-items-stretch" style={{ overflowX: 'auto', scrollbarWidth: 'none', minHeight: '300px' }}>
//                         {isLoading ? (
//                             <div className="col-12 text-center py-5 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
//                         ) : error && currentHotels.length === 0 ? (
//                             <div className="col-12 text-center py-5"><div className="alert alert-danger">{error}</div></div>
//                         ) : currentHotels.length === 0 && !isLoadingTab ? (
//                             <div className="col-12 text-center py-5 text-muted d-flex justify-content-center align-items-center">
//                                 <div>
//                                     <i className="bi bi-house-door mb-3" style={{ fontSize: '3rem' }}></i>
//                                     <p>Không tìm thấy khách sạn nào tại {activeLocation ? formatLocationNameForDisplay(activeLocation.displayName) : ''}</p>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 {currentHotels.map((hotel) => (
//                                     <div key={hotel.id} className="col-lg-3 col-md-6 col-sm-8 col-10" style={{ flex: '0 0 auto' }} onClick={() => router.push(`/hotels/${hotel.id}`)}>
//                                         <div className="card h-100 shadow-sm border-0" style={{ cursor: 'pointer' }}>
//                                             <div className="position-relative">
//                                                 <Image src={getHotelImageUrl(hotel)} width={400} height={300} alt={hotel.name} className="card-img-top" style={{ objectFit: 'cover', height: '200px' }} />
//                                                 {hotel.rawPricePerNight > hotel.currentPricePerNight && (<span className="badge bg-success position-absolute top-0 end-0 m-2">-{Math.round((1 - hotel.currentPricePerNight / hotel.rawPricePerNight) * 100)}%</span>)}
//                                             </div>
//                                             <div className="card-body d-flex flex-column">
//                                                 <h5 className="card-title fw-bold text-truncate">{hotel.name}</h5>
//                                                 <p className="card-text text-primary small fw-bold">⭐ {formatRating(hotel.averageScore)}</p>
//                                                 <p className="card-text text-muted small " title={getFullAddress(hotel)}>📍 {getFullAddress(hotel)}</p>
//                                                 <div className="mt-auto pt-2">
//                                                     <p className="card-text text-danger fw-bold fs-5 mb-0">{formatPrice(hotel.currentPricePerNight)}</p>
//                                                     {hotel.rawPricePerNight > hotel.currentPricePerNight && (<small className="text-muted text-decoration-line-through">{formatPrice(hotel.rawPricePerNight)}</small>)}
//                                                     <small className="text-muted d-block">Chưa bao gồm thuế và phí</small>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {isLoadingMore && (
//                                     <div className="col-auto d-flex align-items-center justify-content-center p-5" style={{ flex: '0 0 auto' }}>
//                                         <div className="spinner-border text-primary spinner-border-sm" role="status"><span className="visually-hidden">Đang tải thêm...</span></div>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 </div>
//                 <div className="text-center mt-5">
//                     <button onClick={() => router.push('/search')} className="btn btn-primary btn-lg">Xem thêm ưu đãi khách sạn</button>
//                 </div>
//             </div>
//         </div>
//     );
// }