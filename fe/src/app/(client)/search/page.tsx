
// // 'use client';

// // import { useSearchParams, useRouter } from 'next/navigation';
// // import { useEffect, useState, useRef, useCallback } from 'react';

// // // Import cho DatePicker
// // import DatePicker, { registerLocale } from 'react-datepicker';
// // import { vi } from 'date-fns/locale/vi';
// // import 'react-datepicker/dist/react-datepicker.css';

// // // Import các service và component con
// // import { hotelService, HotelResponse, HotelPhoto } from '@/service/hotelService';
// // import { amenityService, AmenityCategory } from '@/service/amenityService';
// // import Image from 'next/image';
// // import styles from './SearchPage.module.css';
// // import AmenityFilter from './AmenityFilter';
// // import PriceSlider from './PriceSlider';
// // import LocationSearchInput from '@/components/Location/LocationSearchInput';
// // import { LocationSuggestion } from '@/service/locationService';
// // import GuestPicker from '@/components/DateSupport/GuestPicker';

// // registerLocale('vi', vi); // Đăng ký ngôn ngữ tiếng Việt

// // // --- CÁC HÀM TIỆN ÍCH ---
// // const getRatingText = (score: number) => {
// //     if (score >= 9.0) return "Xuất sắc";
// //     if (score >= 8.5) return "Rất tốt";
// //     if (score >= 8.0) return "Tốt";
// //     if (score >= 7.0) return "Khá";
// //     if (score === 0) return "Chưa có đánh giá";
// //     return "Bình thường";
// // };

// // const formatDateForDisplay = (checkin: Date, nights: number): string => {
// //     try {
// //         const checkoutDate = new Date(checkin);
// //         checkoutDate.setDate(checkin.getDate() + nights);
// //         const format = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
// //         return `${format(checkin)} - ${format(checkoutDate)}, ${nights} đêm`;
// //     } catch (e) {
// //         return 'Chọn ngày';
// //     }
// // };

// // const StarRating = ({ count }: { count: number }) => (
// //     <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
// //         <span>{count}</span>
// //         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#ffc107' }}><path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" /></svg>
// //     </div>
// // );

// // /**
// //  * HÀM TIỆN ÍCH MỚI
// //  * Tập trung logic xây dựng tham số API vào một nơi để tránh lặp code.
// //  */
// // const buildApiParams = (searchParams: URLSearchParams, options: { page: number, size: number }) => {
// //     const query = searchParams.get('query') || '';
// //     const cityId = searchParams.get('city-id');
// //     const provinceId = searchParams.get('province-id');
// //     const districtId = searchParams.get('district-id');

// //     const apiParams: any = {
// //         ...options, // Gộp page, size
// //         adults: searchParams.get('adults') || '2',
// //         children: searchParams.get('children') || '0',
// //         rooms: searchParams.get('rooms') || '1'
// //     };

// //     // Logic ưu tiên ID
// //     if (provinceId) {
// //         apiParams['province-id'] = provinceId;
// //     } else if (cityId) {
// //         apiParams['city-id'] = cityId;
// //     } else if (districtId) {
// //         apiParams['district-id'] = districtId;
// //     } else if (query) {
// //         apiParams.name = query;
// //     }
// //     return apiParams;
// // };


// // // --- COMPONENT CHÍNH ---
// // export default function SearchPage() {
// //     const router = useRouter();
// //     const searchParams = useSearchParams();

// //     // === STATE CHO CÁC GIÁ TRỊ TÌM KIẾM ===
// //     const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
// //     const [currentQuery, setCurrentQuery] = useState('');
// //     const [currentCheckin, setCurrentCheckin] = useState(new Date());
// //     const [currentNights, setCurrentNights] = useState(1);
// //     const [adults, setAdults] = useState(2);
// //     const [children, setChildren] = useState(0);
// //     const [rooms, setRooms] = useState(1);

// //     // === STATE CHO UI VÀ BỘ LỌC ===
// //     const [showDatePicker, setShowDatePicker] = useState(false);
// //     const [showGuestPicker, setShowGuestPicker] = useState(false);
// //     const [hotels, setHotels] = useState<HotelResponse[]>([]);
// //     const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
// //     const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
// //     const DEFAULT_MIN_PRICE = 0;
// //     const DEFAULT_MAX_PRICE = 30000000;
// //     const [priceRange, setPriceRange] = useState<[number, number]>([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);

// //     // === STATE CHO PHÂN TRANG VÀ LOADING ===
// //     const [page, setPage] = useState(0);
// //     const [hasMore, setHasMore] = useState(true);
// //     const [totalHotelsFound, setTotalHotelsFound] = useState(0);
// //     const [loading, setLoading] = useState(true);
// //     const [loadingAmenities, setLoadingAmenities] = useState(true);
// //     const [loadingMore, setLoadingMore] = useState(false);

// //     const datePickerRef = useRef<HTMLDivElement>(null);
// //     const guestPickerRef = useRef<HTMLDivElement>(null);

// //     // Đồng bộ state của component với URL mỗi khi nó thay đổi
// //     useEffect(() => {
// //         setCurrentQuery(searchParams.get('query') || '');
// //         setCurrentCheckin(new Date(searchParams.get('checkin') || new Date()));
// //         setCurrentNights(parseInt(searchParams.get('nights') || '1', 10));
// //         setAdults(parseInt(searchParams.get('adults') || '2', 10));
// //         setChildren(parseInt(searchParams.get('children') || '0', 10));
// //         setRooms(parseInt(searchParams.get('rooms') || '1', 10));
// //     }, [searchParams]);

// //     // === CÁC HÀM XỬ LÝ LOGIC ===
// //     const handleLocationSelect = (location: LocationSuggestion) => {
// //         setSelectedLocation(location);
// //         setCurrentQuery(location.name);
// //     };

// //     const handleNewSearch = () => {
// //         setShowDatePicker(false);
// //         setShowGuestPicker(false);
// //         const params = new URLSearchParams();

// //         // Xử lý địa điểm
// //         if (selectedLocation) {
// //             switch (selectedLocation.type) {
// //                 case 'PROVINCE': case 'CITY_PROVINCE': params.set('province-id', selectedLocation.id.replace('province-', '')); break;
// //                 case 'CITY': params.set('city-id', selectedLocation.id.replace('city-', '')); break;
// //                 case 'DISTRICT': params.set('district-id', selectedLocation.id.replace('district-', '')); break;
// //                 case 'HOTEL':
// //                     router.push(`/hotels/${selectedLocation.id.replace('hotel-', '')}`);
// //                     return;
// //             }
// //             params.set('query', selectedLocation.name);
// //         } else if (currentQuery.trim()) {
// //             params.set('query', currentQuery);
// //         }

// //         // Xử lý các thông tin khác
// //         params.set('checkin', currentCheckin.toISOString().split('T')[0]);
// //         params.set('nights', currentNights.toString());
// //         params.set('adults', adults.toString());
// //         params.set('children', children.toString());
// //         params.set('rooms', rooms.toString());

// //         router.push(`/search?${params.toString()}`);
// //     };

// //     const handleDateChange = (date: Date | null) => {
// //         if (date) {
// //             setCurrentCheckin(date);
// //         }
// //     };

// //     // Cập nhật hàm xử lý GuestPicker
// //     const handleGuestApply = (data: { adults: number; children: number; rooms: number }) => {
// //         setAdults(data.adults);
// //         setChildren(data.children);
// //         setRooms(data.rooms);
// //     };

// //     const handleAmenityChange = (amenityId: string, isSelected: boolean) => {
// //         setPage(0);
// //         setHotels([]);
// //         setSelectedAmenities(prev => {
// //             const newSet = new Set(prev);
// //             if (isSelected) newSet.add(amenityId);
// //             else newSet.delete(amenityId);
// //             return Array.from(newSet);
// //         });
// //     };

// //     const handlePriceChange = (min: number, max: number) => {
// //         setPage(0);
// //         setHotels([]);
// //         setPriceRange([min, max]);
// //     };

// //     const handleSelectHotel = (hotelId: string) => {
// //         const params = new URLSearchParams();
// //         params.set('checkin', currentCheckin.toISOString().split('T')[0]);
// //         params.set('nights', currentNights.toString());
// //         params.set('adults', adults.toString());
// //         params.set('children', children.toString());
// //         params.set('rooms', rooms.toString());
// //         router.push(`/hotels/${hotelId}?${params.toString()}`);
// //     };

// //     // Xử lý click ra ngoài để đóng pop-up
// //     useEffect(() => {
// //         function handleClickOutside(event: MouseEvent) {
// //             if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
// //                 setShowDatePicker(false);
// //             }
// //             if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
// //                 setShowGuestPicker(false);
// //             }
// //         }
// //         document.addEventListener("mousedown", handleClickOutside);
// //         return () => document.removeEventListener("mousedown", handleClickOutside);
// //     }, []);

// //     // === USE EFFECT ĐỂ TẢI DỮ LIỆU ===
// //     useEffect(() => {
// //         setLoading(true);
// //         setHotels([]);
// //         setPage(0);

// //         const apiParams = buildApiParams(searchParams, { page: 0, size: 10 });

// //         if (selectedAmenities.length > 0) apiParams['amenity-ids'] = selectedAmenities.join(',');
// //         if (priceRange[0] !== DEFAULT_MIN_PRICE) apiParams['min-price'] = priceRange[0];
// //         if (priceRange[1] !== DEFAULT_MAX_PRICE) apiParams['max-price'] = priceRange[1];

// //         hotelService.searchHotels(apiParams)
// //             .then(paginatedData => {
// //                 setHotels(paginatedData.content);
// //                 setTotalHotelsFound(paginatedData.totalItems);
// //                 setHasMore(!paginatedData.last);
// //             })
// //             .catch(error => console.error("Lỗi tìm kiếm khách sạn:", error))
// //             .finally(() => setLoading(false));

// //     }, [searchParams, selectedAmenities, priceRange]);

// //     useEffect(() => {
// //         if (page > 0) {
// //             setLoadingMore(true);
// //             const apiParams = buildApiParams(searchParams, { page, size: 10 });

// //             if (selectedAmenities.length > 0) apiParams['amenity-ids'] = selectedAmenities.join(',');
// //             if (priceRange[0] !== DEFAULT_MIN_PRICE) apiParams['min-price'] = priceRange[0];
// //             if (priceRange[1] !== DEFAULT_MAX_PRICE) apiParams['max-price'] = priceRange[1];

// //             hotelService.searchHotels(apiParams)
// //                 .then(paginatedData => {
// //                     setHotels(prevHotels => [...prevHotels, ...paginatedData.content]);
// //                     setHasMore(!paginatedData.last);
// //                 }).catch(console.error)
// //                 .finally(() => setLoadingMore(false));
// //         }
// //     }, [page, searchParams, selectedAmenities, priceRange]);

// //     useEffect(() => {
// //         setLoadingAmenities(true);
// //         amenityService.getAllAmenityCategories()
// //             .then(data => setAmenityCategories(data))
// //             .catch(error => console.error("Không thể tải nhóm tiện nghi:", error))
// //             .finally(() => setLoadingAmenities(false));
// //     }, []);

// //     // Ref cho infinite scroll
// //     const observer = useRef<IntersectionObserver | null>(null);
// //     const lastHotelElementRef = useCallback((node: HTMLDivElement) => {
// //         if (loading || loadingMore) return;
// //         if (observer.current) observer.current.disconnect();
// //         observer.current = new IntersectionObserver(entries => {
// //             if (entries[0].isIntersecting && hasMore) {
// //                 setPage(prevPage => prevPage + 1);
// //             }
// //         });
// //         if (node) observer.current.observe(node);
// //     }, [loading, loadingMore, hasMore]);

// //     const displayGuests = `${adults} người lớn, ${children} Trẻ em, ${rooms} phòng`;

// //     return (
// //         <div className={styles.pageContainer}>
// //             <div className={styles.searchHeader}>
// //                 <div className="container">
// //                     <div className={styles.searchBar}>
// //                         <div className={`${styles.searchSection} ${styles.locationSection}`}>
// //                             <i className={`bi bi-geo-alt ${styles.searchIcon}`}></i>
// //                             <div className={styles.searchInput}>
// //                                 <label>Thành phố, địa điểm hoặc tên khách sạn:</label>
// //                                 <LocationSearchInput
// //                                     initialValue={currentQuery}
// //                                     onQueryChange={setCurrentQuery}
// //                                     onLocationSelect={handleLocationSelect}
// //                                 />
// //                             </div>
// //                         </div>

// //                         <div className={styles.divider}></div>

// //                         <div className={`${styles.searchSection} ${styles.dateSection}`} ref={datePickerRef}>
// //                             <i className={`bi bi-calendar3 ${styles.searchIcon}`}></i>
// //                             <div className={styles.searchInput} onClick={() => setShowDatePicker(!showDatePicker)}>
// //                                 <label>Ngày nhận phòng & Số đêm</label>
// //                                 <span>{formatDateForDisplay(currentCheckin, currentNights)}</span>
// //                             </div>

// //                             {showDatePicker && (
// //                                 <div className={styles.datePickerWrapper}>
// //                                     <DatePicker
// //                                         selected={currentCheckin}
// //                                         onChange={handleDateChange}
// //                                         inline
// //                                         locale="vi"
// //                                         minDate={new Date()}
// //                                     />
// //                                     <div className={styles.nightsSelector}>
// //                                         <label>Số đêm</label>
// //                                         <div className={styles.counter}>
// //                                             <button
// //                                                 onClick={() => setCurrentNights(n => Math.max(1, n - 1))}
// //                                                 disabled={currentNights <= 1}
// //                                             >
// //                                                 -
// //                                             </button>
// //                                             <span>{currentNights}</span>
// //                                             <button onClick={() => setCurrentNights(n => n + 1)}>+</button>
// //                                         </div>
// //                                     </div>
// //                                     <button className={styles.applyButton} onClick={() => setShowDatePicker(false)}>Xong</button>
// //                                 </div>
// //                             )}
// //                         </div>

// //                         <div className={styles.divider}></div>

// //                         <div className={`${styles.searchSection} ${styles.guestSection}`} ref={guestPickerRef}>
// //                             <i className={`bi bi-person ${styles.searchIcon}`}></i>
// //                             <div className={styles.searchInput} onClick={() => setShowGuestPicker(!showGuestPicker)}>
// //                                 <label>Khách và Phòng</label>
// //                                 <span>{displayGuests}</span>
// //                             </div>

// //                             {showGuestPicker && (
// //                                 <GuestPicker
// //                                     initialAdults={adults}
// //                                     initialChildren={children}
// //                                     initialRooms={rooms}
// //                                     onApply={handleGuestApply}
// //                                     onClose={() => setShowGuestPicker(false)}
// //                                 />
// //                             )}
// //                         </div>

// //                         <button className={styles.searchButton} onClick={handleNewSearch}>
// //                             <i className="bi bi-search"></i>
// //                             <span>Tìm</span>
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>

// //             <div className={`${styles.mainContainer} container`}>
// //                 <aside className={styles.sidebar}>
// //                     <PriceSlider
// //                         minDefault={DEFAULT_MIN_PRICE}
// //                         maxDefault={DEFAULT_MAX_PRICE}
// //                         onPriceChange={handlePriceChange}
// //                     />
// //                     {loadingAmenities ? (
// //                         <div style={{ background: '#fff', padding: 16, borderRadius: 12 }}>Đang tải bộ lọc...</div>
// //                     ) : (
// //                         amenityCategories.map(category => (
// //                             <AmenityFilter
// //                                 key={category.id}
// //                                 categoryId={category.id}
// //                                 categoryName={category.name}
// //                                 selectedAmenities={selectedAmenities}
// //                                 onAmenityChange={handleAmenityChange}
// //                             />
// //                         ))
// //                     )}
// //                 </aside>

// //                 <main className={styles.mainContent}>
// //                     <div className={styles.listHeader}>
// //                         <div>
// //                             <h2 style={{ margin: 0, color: '#000' }}>{searchParams.get('query') || 'Kết quả tìm kiếm'}</h2>
// //                             <p style={{ margin: 0, color: '#666' }}>Tìm thấy {totalHotelsFound} nơi lưu trú</p>
// //                         </div>
// //                     </div>

// //                     {loading ? <div style={{ textAlign: 'center', padding: 50 }}>Đang tải kết quả...</div>
// //                         : hotels.length === 0 ? <div style={{ textAlign: 'center', padding: 50 }}>Không tìm thấy khách sạn nào phù hợp.</div>
// //                             : (
// //                                 <div className={styles.hotelList}>
// //                                     {hotels.map((hotel, index) => {
// //                                         const allPhotos = hotel.photos?.flatMap((p: HotelPhoto) => p.photos.map(photo => photo.url)) || [];
// //                                         const mainImage = allPhotos[0] || '/placeholder.svg';
// //                                         const thumbnailImages = allPhotos.slice(1, 4);
// //                                         const cardContent = (
// //                                             <div className={styles.hotelCard} onClick={() => handleSelectHotel(hotel.id)}>
// //                                                 <div className={styles.imageColumn}>
// //                                                     <div className={styles.mainImageWrapper}>
// //                                                         <Image src={mainImage} alt={hotel.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
// //                                                     </div>
// //                                                     {thumbnailImages.length > 0 && (
// //                                                         <div className={styles.thumbnailGrid} style={{ gridTemplateColumns: `repeat(${thumbnailImages.length}, 1fr)` }}>
// //                                                             {thumbnailImages.map((imgUrl, idx) => (
// //                                                                 <div key={idx} className={styles.thumbnailWrapper}>
// //                                                                     <Image src={imgUrl} alt={`${hotel.name} thumbnail ${idx + 1}`} fill sizes="10vw" style={{ objectFit: 'cover' }} />
// //                                                                 </div>
// //                                                             ))}
// //                                                         </div>
// //                                                     )}
// //                                                 </div>
// //                                                 <div className={styles.infoColumn}>
// //                                                     <h3 className="fw-bold text-dark mb-1 fs-5">{hotel.name}</h3>
// //                                                     <div className="d-flex align-items-center gap-2 mb-2">
// //                                                         {hotel.averageScore > 0 && (
// //                                                             <>
// //                                                                 <span className={styles.ratingBadge}>{hotel.averageScore.toFixed(1)}</span>
// //                                                                 <span className="fw-bold text-dark">{getRatingText(hotel.averageScore)}</span>
// //                                                             </>
// //                                                         )}
// //                                                     </div>
// //                                                     <div className="d-flex align-items-center gap-2 mb-2">
// //                                                         <span className="badge bg-light text-dark border">Khách sạn</span>
// //                                                         <StarRating count={hotel.starRating || 0} />
// //                                                     </div>
// //                                                     <div className="text-muted small mb-3">
// //                                                         <i className="bi bi-geo-alt-fill text-danger me-1"></i>
// //                                                         {[hotel.ward?.name, hotel.district?.name].filter(Boolean).join(', ')}
// //                                                     </div>
// //                                                 </div>
// //                                                 <div className={styles.priceColumn}>
// //                                                     <div className="text-end text-muted text-decoration-line-through small">
// //                                                         {hotel.rawPricePerNight > hotel.currentPricePerNight ? `${hotel.rawPricePerNight?.toLocaleString('vi-VN')} VND` : <span>&nbsp;</span>}
// //                                                     </div>
// //                                                     <div className={`text-end mb-1 ${styles.priceFinal}`}>{hotel.currentPricePerNight > 0 ? `${hotel.currentPricePerNight?.toLocaleString('vi-VN')} VND` : 'Liên hệ giá'}</div>
// //                                                     <div className="text-end text-muted small mb-2">Chưa bao gồm thuế và phí</div>
// //                                                     <button className={styles.selectRoomButton} onClick={(e) => { e.stopPropagation(); handleSelectHotel(hotel.id); }}>Xem các loại phòng</button>
// //                                                 </div>
// //                                             </div>
// //                                         );

// //                                         if (hotels.length === index + 1) {
// //                                             return <div ref={lastHotelElementRef} key={hotel.id}>{cardContent}</div>;
// //                                         }
// //                                         return <div key={hotel.id}>{cardContent}</div>;
// //                                     })}
// //                                     {loadingMore && <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải thêm khách sạn...</div>}
// //                                     {!hasMore && hotels.length > 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Bạn đã xem hết tất cả kết quả.</div>}
// //                                 </div>
// //                             )
// //                     }
// //                 </main>
// //             </div>
// //         </div>
// //     );
// // }


// 'use client';

// import { useSearchParams, useRouter } from 'next/navigation';
// import { useEffect, useState, useRef, useCallback } from 'react';

// // Import cho DatePicker
// import DatePicker, { registerLocale } from 'react-datepicker';
// import { vi } from 'date-fns/locale/vi';
// import 'react-datepicker/dist/react-datepicker.css';

// // Import các service và component con
// import { hotelService, HotelResponse, HotelPhoto } from '@/service/hotelService';
// import { amenityService, AmenityCategory } from '@/service/amenityService';
// import Image from 'next/image';
// import styles from './SearchPage.module.css';
// import AmenityFilter from './AmenityFilter';
// import PriceSlider from './PriceSlider';
// import LocationSearchInput from '@/components/Location/LocationSearchInput';
// import { LocationSuggestion } from '@/service/locationService';
// import GuestPicker from '@/components/DateSupport/GuestPicker';

// registerLocale('vi', vi); // Đăng ký ngôn ngữ tiếng Việt

// // --- CÁC HÀM TIỆN ÍCH ---
// const getRatingText = (score: number) => {
//     if (score >= 9.0) return "Xuất sắc";
//     if (score >= 8.5) return "Rất tốt";
//     if (score >= 8.0) return "Tốt";
//     if (score >= 7.0) return "Khá";
//     if (score === 0) return "Chưa có đánh giá";
//     return "Bình thường";
// };

// const formatDateForDisplay = (checkin: Date, nights: number): string => {
//     try {
//         const checkoutDate = new Date(checkin);
//         checkoutDate.setDate(checkin.getDate() + nights);
//         const format = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
//         return `${format(checkin)} - ${format(checkoutDate)}, ${nights} đêm`;
//     } catch (e) {
//         return 'Chọn ngày';
//     }
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

//     // === STATE CHO CÁC GIÁ TRỊ TÌM KIẾM ===
//     const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
//     const [currentQuery, setCurrentQuery] = useState(searchParams.get('query') || '');
//     const [currentCheckin, setCurrentCheckin] = useState(new Date(searchParams.get('checkin') || new Date()));
//     const [currentNights, setCurrentNights] = useState(parseInt(searchParams.get('nights') || '1', 10));
//     const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '2', 10));
//     const [children, setChildren] = useState(parseInt(searchParams.get('children') || '0', 10));
//     const [rooms, setRooms] = useState(parseInt(searchParams.get('rooms') || '1', 10));

//     // === STATE CHO CÁC POP-UP ===
//     const [showDatePicker, setShowDatePicker] = useState(false);
//     const [showGuestPicker, setShowGuestPicker] = useState(false);
//     const datePickerRef = useRef<HTMLDivElement>(null);
//     const guestPickerRef = useRef<HTMLDivElement>(null);

//     // === STATE CHO DỮ LIỆU VÀ BỘ LỌC ===
//     const [hotels, setHotels] = useState<HotelResponse[]>([]);
//     const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
//     const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
//     const DEFAULT_MIN_PRICE = 0;
//     const DEFAULT_MAX_PRICE = 30000000;
//     const [priceRange, setPriceRange] = useState<[number, number]>([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);

//     // === STATE CHO PHÂN TRANG VÀ LOADING ===
//     const [page, setPage] = useState(0);
//     const [hasMore, setHasMore] = useState(true);
//     const [totalHotelsFound, setTotalHotelsFound] = useState(0);
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

//     // === CÁC HÀM XỬ LÝ LOGIC ===
//     const handleLocationSelect = (location: LocationSuggestion) => {
//         setSelectedLocation(location);
//         setCurrentQuery(location.name);
//     };

//     const handleNewSearch = () => {
//         setShowDatePicker(false);
//         setShowGuestPicker(false);
//         const params = new URLSearchParams();
//         if (selectedLocation) {
//             switch (selectedLocation.type) {
//                 case 'PROVINCE': case 'CITY_PROVINCE': params.set('province-id', selectedLocation.id); break;
//                 case 'CITY': params.set('city-id', selectedLocation.id); break;
//                 case 'DISTRICT': params.set('district-id', selectedLocation.id); break;
//                 case 'HOTEL':
//                     router.push(`/hotels/${selectedLocation.id.replace('hotel-', '')}`);
//                     return;
//             }
//             params.set('query', selectedLocation.name);
//         } else if (currentQuery.trim()) {
//             params.set('query', currentQuery);
//         }
//         params.set('checkin', currentCheckin.toISOString().split('T')[0]);
//         params.set('nights', currentNights.toString());
//         params.set('adults', adults.toString());
//         params.set('children', children.toString());
//         params.set('rooms', rooms.toString());
//         router.push(`/search?${params.toString()}`);
//     };
//     // const handleSelectHotel = (hotelId: string) => {
//     //     const params = new URLSearchParams(searchParams);
//     //     router.push(`/hotels/${hotelId}?${params.toString()}`);
//     // };
//     // Hàm mới đã sửa lỗi
//     const handleSelectHotel = (hotelId: string) => {
//         // Xây dựng lại params từ các state hiện tại để đảm bảo dữ liệu luôn mới nhất
//         const params = new URLSearchParams();

//         // Lấy lại các thông số địa điểm từ URL hiện tại
//         const query = searchParams.get('query');
//         const cityId = searchParams.get('city-id');
//         const provinceId = searchParams.get('province-id');
//         const districtId = searchParams.get('district-id');

//         if (provinceId) params.set('province-id', provinceId);
//         else if (cityId) params.set('city-id', cityId);
//         else if (districtId) params.set('district-id', districtId);
//         if (query) params.set('query', query);

//         // << QUAN TRỌNG: Sử dụng các giá trị từ STATE, không phải từ URL cũ >>
//         params.set('checkin', currentCheckin.toISOString().split('T')[0]);
//         params.set('nights', currentNights.toString());
//         params.set('adults', adults.toString());
//         params.set('children', children.toString());
//         params.set('rooms', rooms.toString());


//         const destinationUrl = `/hotels/${hotelId}?${params.toString()}`;

//         console.log("Đang chuẩn bị chuyển hướng đến Hotel Detail với URL:", destinationUrl);

//         router.push(destinationUrl);
//     };

//     const handleDateChange = (date: Date | null) => {
//         if (date) {
//             setCurrentCheckin(date);
//         }
//     };

//     const handleGuestChange = (newAdults: number, newChildren: number, newRooms: number) => {
//         setAdults(newAdults);
//         setChildren(newChildren);
//         setRooms(newRooms);
//         setShowGuestPicker(false);
//     };

//     const handleAmenityChange = (amenityId: string, isSelected: boolean) => {
//         setPage(0);
//         setHotels([]);
//         setSelectedAmenities(prev => {
//             const newSet = new Set(prev);
//             if (isSelected) newSet.add(amenityId);
//             else newSet.delete(amenityId);
//             return Array.from(newSet);
//         });
//     };

//     const handlePriceChange = (min: number, max: number) => {
//         setPage(0);
//         setHotels([]);
//         setPriceRange([min, max]);
//     };

//     // BÊN TRONG FILE SearchPage.tsx


//     // Xử lý click ra ngoài để đóng pop-up
//     useEffect(() => {
//         function handleClickOutside(event: MouseEvent) {
//             if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
//                 setShowDatePicker(false);
//             }
//             if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
//                 setShowGuestPicker(false);
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     // === USE EFFECT ĐỂ TẢI DỮ LIỆU ===
//     useEffect(() => {
//         setLoading(true);
//         setHotels([]);
//         setPage(0);

//         const query = searchParams.get('query') || '';
//         const cityId = searchParams.get('city-id');
//         const provinceId = searchParams.get('province-id');
//         const districtId = searchParams.get('district-id');

//         const apiParams: any = {
//             page: 0,
//             size: 10,
//             adults: searchParams.get('adults') || '2',
//             children: searchParams.get('children') || '0',
//             rooms: searchParams.get('rooms') || '1'
//         };

//         // LOGIC ĐÃ SỬA: Ưu tiên tìm theo ID, nếu không có ID mới tìm theo tên (query)
//         if (provinceId) {
//             apiParams['province-id'] = provinceId;
//         } else if (cityId) {
//             apiParams['city-id'] = cityId;
//         } else if (districtId) {
//             apiParams['district-id'] = districtId;
//         } else if (query) {
//             apiParams.name = query;
//         }

//         if (selectedAmenities.length > 0) apiParams['amenity-ids'] = selectedAmenities.join(',');
//         if (priceRange[0] !== DEFAULT_MIN_PRICE) apiParams['min-price'] = priceRange[0];
//         if (priceRange[1] !== DEFAULT_MAX_PRICE) apiParams['max-price'] = priceRange[1];

//         console.log("Đang gửi yêu cầu API với:", apiParams); // Thêm dòng này để debug

//         hotelService.searchHotels(apiParams)
//             .then(paginatedData => {
//                 setHotels(paginatedData.content);
//                 setTotalHotelsFound(paginatedData.totalItems);
//                 setHasMore(!paginatedData.last);
//             })
//             .catch(error => console.error("Lỗi tìm kiếm khách sạn:", error))
//             .finally(() => setLoading(false));

//     }, [searchParams, selectedAmenities, priceRange]);
//     useEffect(() => {
//         if (page > 0) {
//             setLoadingMore(true);
//             const query = searchParams.get('query') || '';
//             const cityId = searchParams.get('city-id');
//             const provinceId = searchParams.get('province-id');
//             const districtId = searchParams.get('district-id');

//             const apiParams: any = {
//                 page,
//                 size: 10,
//                 adults: searchParams.get('adults') || '2',
//                 children: searchParams.get('children') || '0',
//                 rooms: searchParams.get('rooms') || '1'
//             };

//             // LOGIC ĐÃ SỬA: Ưu tiên tìm theo ID, nếu không có ID mới tìm theo tên (query)
//             if (provinceId) {
//                 apiParams['province-id'] = provinceId;
//             } else if (cityId) {
//                 apiParams['city-id'] = cityId;
//             } else if (districtId) {
//                 apiParams['district-id'] = districtId;
//             } else if (query) {
//                 apiParams.name = query;
//             }

//             if (selectedAmenities.length > 0) apiParams['amenity-ids'] = selectedAmenities.join(',');
//             if (priceRange[0] !== DEFAULT_MIN_PRICE) apiParams['min-price'] = priceRange[0];
//             if (priceRange[1] !== DEFAULT_MAX_PRICE) apiParams['max-price'] = priceRange[1];

//             hotelService.searchHotels(apiParams)
//                 .then(paginatedData => {
//                     setHotels(prevHotels => [...prevHotels, ...paginatedData.content]);
//                     setHasMore(!paginatedData.last);
//                 }).catch(console.error)
//                 .finally(() => setLoadingMore(false));
//         }
//     }, [page, searchParams, selectedAmenities, priceRange]);
//     useEffect(() => {
//         setLoadingAmenities(true);
//         amenityService.getAllAmenityCategories()
//             .then(data => setAmenityCategories(data))
//             .catch(error => console.error("Không thể tải nhóm tiện nghi:", error))
//             .finally(() => setLoadingAmenities(false));
//     }, []);

//     const displayGuests = `${adults} người lớn, ${children} Trẻ em, ${rooms} phòng`;

//     return (
//         <div className={styles.pageContainer}>
//             <div className={styles.searchHeader}>
//                 <div className="container">
//                     <div className={styles.searchBar}>
//                         <div className={`${styles.searchSection} ${styles.locationSection}`}>
//                             <i className={`bi bi-geo-alt ${styles.searchIcon}`}></i>
//                             <div className={styles.searchInput}>
//                                 <label>Thành phố, địa điểm hoặc tên khách sạn:</label>
//                                 <LocationSearchInput
//                                     initialValue={currentQuery}
//                                     onQueryChange={setCurrentQuery}
//                                     onLocationSelect={handleLocationSelect}
//                                 />
//                             </div>
//                         </div>

//                         <div className={styles.divider}></div>

//                         <div className={`${styles.searchSection} ${styles.dateSection}`} ref={datePickerRef}>
//                             <i className={`bi bi-calendar3 ${styles.searchIcon}`}></i>
//                             <div className={styles.searchInput} onClick={() => setShowDatePicker(!showDatePicker)}>
//                                 <label>Ngày nhận phòng & Số đêm</label>
//                                 <span>{formatDateForDisplay(currentCheckin, currentNights)}</span>
//                             </div>

//                             {showDatePicker && (
//                                 <div className={styles.datePickerWrapper}>
//                                     <DatePicker
//                                         selected={currentCheckin}
//                                         onChange={handleDateChange}
//                                         inline
//                                         locale="vi"
//                                         minDate={new Date()}
//                                     />
//                                     <div className={styles.nightsSelector}>
//                                         <label>Số đêm</label>
//                                         <div className={styles.counter}>
//                                             <button
//                                                 onClick={() => setCurrentNights(n => Math.max(1, n - 1))}
//                                                 disabled={currentNights <= 1}
//                                             >
//                                                 -
//                                             </button>
//                                             <span>{currentNights}</span>
//                                             <button onClick={() => setCurrentNights(n => n + 1)}>+</button>
//                                         </div>
//                                     </div>
//                                     <button className={styles.applyButton} onClick={() => setShowDatePicker(false)}>Xong</button>
//                                 </div>
//                             )}
//                         </div>

//                         <div className={styles.divider}></div>

//                         <div className={`${styles.searchSection} ${styles.guestSection}`} ref={guestPickerRef}>
//                             <i className={`bi bi-person ${styles.searchIcon}`}></i>
//                             <div className={styles.searchInput} onClick={() => setShowGuestPicker(!showGuestPicker)}>
//                                 <label>Khách và Phòng</label>
//                                 <span>{displayGuests}</span>
//                             </div>

//                             {showGuestPicker && (
//                                 <GuestPicker
//                                     adults={adults}
//                                     children={children}
//                                     rooms={rooms}
//                                     setAdults={setAdults}
//                                     setChildren={setChildren}
//                                     setRooms={setRooms}
//                                     onClose={() => setShowGuestPicker(false)}
//                                 />
//                             )}
//                         </div>

//                         <button className={styles.searchButton} onClick={handleNewSearch}>
//                             <i className="bi bi-search"></i>
//                             <span>Tìm</span>
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className={`${styles.mainContainer} container`}>
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
//                             <h2 style={{ margin: 0, color: '#000' }}>{searchParams.get('query') || 'Kết quả tìm kiếm'}</h2>
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
//                                         const cardContent = (
//                                             <div className={styles.hotelCard} onClick={() => handleSelectHotel(hotel.id)}>
//                                                 <div className={styles.imageColumn}>
//                                                     <div className={styles.mainImageWrapper}>
//                                                         <Image src={mainImage} alt={hotel.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
//                                                     </div>
//                                                     {thumbnailImages.length > 0 && (
//                                                         <div className={styles.thumbnailGrid} style={{ gridTemplateColumns: `repeat(${thumbnailImages.length}, 1fr)` }}>
//                                                             {thumbnailImages.map((imgUrl, idx) => (
//                                                                 <div key={idx} className={styles.thumbnailWrapper}>
//                                                                     <Image src={imgUrl} alt={`${hotel.name} thumbnail ${idx + 1}`} fill sizes="10vw" style={{ objectFit: 'cover' }} />
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                                 <div className={styles.infoColumn}>
//                                                     <h3 className="fw-bold text-dark mb-1 fs-5">{hotel.name}</h3>
//                                                     <div className="d-flex align-items-center gap-2 mb-2">
//                                                         {hotel.averageScore > 0 && (
//                                                             <>
//                                                                 <span className={styles.ratingBadge}>{hotel.averageScore.toFixed(1)}</span>
//                                                                 <span className="fw-bold text-dark">{getRatingText(hotel.averageScore)}</span>
//                                                             </>
//                                                         )}
//                                                     </div>
//                                                     <div className="d-flex align-items-center gap-2 mb-2">
//                                                         <span className="badge bg-light text-dark border">Khách sạn</span>
//                                                         <StarRating count={hotel.starRating || 0} />
//                                                     </div>
//                                                     <div className="text-muted small mb-3">
//                                                         <i className="bi bi-geo-alt-fill text-danger me-1"></i>
//                                                         {[hotel.ward?.name, hotel.district?.name].filter(Boolean).join(', ')}
//                                                     </div>
//                                                 </div>
//                                                 <div className={styles.priceColumn}>
//                                                     <div className="text-end text-muted text-decoration-line-through small">
//                                                         {hotel.rawPricePerNight > hotel.currentPricePerNight ? `${hotel.rawPricePerNight?.toLocaleString('vi-VN')} VND` : <span>&nbsp;</span>}
//                                                     </div>
//                                                     <div className={`text-end mb-1 ${styles.priceFinal}`}>{hotel.currentPricePerNight > 0 ? `${hotel.currentPricePerNight?.toLocaleString('vi-VN')} VND` : 'Liên hệ giá'}</div>
//                                                     <div className="text-end text-muted small mb-2">Chưa bao gồm thuế và phí</div>
//                                                     <button className={styles.selectRoomButton} onClick={(e) => { e.stopPropagation(); handleSelectHotel(hotel.id); }}>Xem các loại phòng</button>
//                                                 </div>
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

// DatePicker
import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

// Services & components
import { hotelService, HotelResponse, HotelPhoto } from '@/service/hotelService';
import { amenityService, AmenityCategory } from '@/service/amenityService';
import Image from 'next/image';
import styles from './SearchPage.module.css';
import AmenityFilter from './AmenityFilter';
import PriceSlider from './PriceSlider';
import LocationSearchInput from '@/components/Location/LocationSearchInput';
import { LocationSuggestion } from '@/service/locationService';
import GuestPicker from '@/components/DateSupport/GuestPicker';

registerLocale('vi', vi);

// Utils
const getRatingText = (score: number) => {
    if (score >= 9.0) return 'Xuất sắc';
    if (score >= 8.5) return 'Rất tốt';
    if (score >= 8.0) return 'Tốt';
    if (score >= 7.0) return 'Khá';
    if (score === 0) return 'Chưa có đánh giá';
    return 'Bình thường';
};

const formatDateForDisplay = (checkin: Date, nights: number): string => {
    try {
        const checkoutDate = new Date(checkin);
        checkoutDate.setDate(checkin.getDate() + nights);
        const format = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
        return `${format(checkin)} - ${format(checkoutDate)}, ${nights} đêm`;
    } catch {
        return 'Chọn ngày';
    }
};

const StarRating = ({ count }: { count: number }) => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span>{count}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#ffc107' }}>
            <path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" />
        </svg>
    </div>
);

// Helper build params
const buildApiParams = (sp: URLSearchParams, page: number, size: number, selectedAmenities: string[], priceRange: [number, number], defaults: { min: number; max: number }) => {
    const query = sp.get('query') || '';
    const provinceId = sp.get('province-id');
    const cityId = sp.get('city-id');
    const districtId = sp.get('district-id');
    const hotelId = sp.get('hotel-id');

    const apiParams: any = {
        page,
        size,
        adults: sp.get('adults') || '2',
        children: sp.get('children') || '0',
        rooms: sp.get('rooms') || '1',
    };

    // Ưu tiên ID -> hotel-id, province-id, city-id, district-id -> name
    if (hotelId) apiParams['hotel-id'] = hotelId;
    else if (provinceId) apiParams['province-id'] = provinceId;
    else if (cityId) apiParams['city-id'] = cityId;
    else if (districtId) apiParams['district-id'] = districtId;
    else if (query) apiParams.name = query;

    if (selectedAmenities.length > 0) apiParams['amenity-ids'] = selectedAmenities.join(',');
    if (priceRange[0] !== defaults.min) apiParams['min-price'] = priceRange[0];
    if (priceRange[1] !== defaults.max) apiParams['max-price'] = priceRange[1];

    return apiParams;
};

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // States
    const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
    const [currentQuery, setCurrentQuery] = useState(searchParams.get('query') || '');
    const ciParam = searchParams.get('checkin');
    const [currentCheckin, setCurrentCheckin] = useState(ciParam ? new Date(`${ciParam}T00:00:00`) : new Date());
    const [currentNights, setCurrentNights] = useState(parseInt(searchParams.get('nights') || '1', 10));
    const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '2', 10));
    const [children, setChildren] = useState(parseInt(searchParams.get('children') || '0', 10));
    const [rooms, setRooms] = useState(parseInt(searchParams.get('rooms') || '1', 10));

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const guestPickerRef = useRef<HTMLDivElement>(null);

    const [hotels, setHotels] = useState<HotelResponse[]>([]);
    const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const DEFAULT_MIN_PRICE = 0;
    const DEFAULT_MAX_PRICE = 30000000;
    const [priceRange, setPriceRange] = useState<[number, number]>([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalHotelsFound, setTotalHotelsFound] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingAmenities, setLoadingAmenities] = useState(true);

    // Sync state khi URL thay đổi
    useEffect(() => {
        setCurrentQuery(searchParams.get('query') || '');
        const ci = searchParams.get('checkin');
        setCurrentCheckin(ci ? new Date(`${ci}T00:00:00`) : new Date());
        setCurrentNights(parseInt(searchParams.get('nights') || '1', 10));
        setAdults(parseInt(searchParams.get('adults') || '2', 10));
        setChildren(parseInt(searchParams.get('children') || '0', 10));
        setRooms(parseInt(searchParams.get('rooms') || '1', 10));
    }, [searchParams]);

    // Handlers
    const handleLocationSelect = (location: LocationSuggestion) => {
        setSelectedLocation(location);
        setCurrentQuery(location.name);
    };

    const handleNewSearch = () => {
        setShowDatePicker(false);
        setShowGuestPicker(false);
        const params = new URLSearchParams();

        // Địa điểm: luôn ở lại trang search
        if (selectedLocation) {
            switch (selectedLocation.type) {
                case 'PROVINCE':
                case 'CITY_PROVINCE':
                    params.set('province-id', selectedLocation.id.replace(/^province-/, ''));
                    break;
                case 'CITY':
                    params.set('city-id', selectedLocation.id.replace(/^city-/, ''));
                    break;
                case 'DISTRICT':
                    params.set('district-id', selectedLocation.id.replace(/^district-/, ''));
                    break;
                case 'HOTEL':
                    // Không chuyển Detail. Lọc ngay trên trang search.
                    params.set('hotel-id', selectedLocation.id.replace(/^hotel-/, ''));
                    params.set('query', selectedLocation.name);
                    break;
            }
            if (!params.get('query')) params.set('query', selectedLocation.name);
        } else if (currentQuery.trim()) {
            params.set('query', currentQuery);
        }

        // Ngày/khách/phòng
        params.set('checkin', currentCheckin.toISOString().split('T')[0]);
        params.set('nights', currentNights.toString());
        params.set('adults', adults.toString());
        params.set('children', children.toString());
        params.set('rooms', rooms.toString());

        router.push(`/search?${params.toString()}`);
    };

    // Khi click 1 khách sạn: không đi detail, chỉ lọc theo hotel-id ngay tại search
    const handleSelectHotel = (hotelId: string) => {
        const params = new URLSearchParams();

        // Giữ lại thông tin đã có trên URL
        const query = searchParams.get('query');
        const provinceId = searchParams.get('province-id');
        const cityId = searchParams.get('city-id');
        const districtId = searchParams.get('district-id');
        if (provinceId) params.set('province-id', provinceId);
        if (cityId) params.set('city-id', cityId);
        if (districtId) params.set('district-id', districtId);
        if (query) params.set('query', query);

        // Set hotel-id để lọc 1 khách sạn
        params.set('hotel-id', hotelId);

        // Ngày/khách/phòng từ state mới nhất
        params.set('checkin', currentCheckin.toISOString().split('T')[0]);
        params.set('nights', currentNights.toString());
        params.set('adults', adults.toString());
        params.set('children', children.toString());
        params.set('rooms', rooms.toString());

        router.push(`/search?${params.toString()}`);
    };
    const handleGoToHotelDetail = (hotelId: string) => {
        const params = new URLSearchParams();
        params.set('checkin', currentCheckin.toISOString().split('T')[0]);
        params.set('nights', currentNights.toString());
        params.set('adults', adults.toString());
        params.set('children', children.toString());
        params.set('rooms', rooms.toString());
        router.push(`/hotels/${hotelId}?${params.toString()}`);
    }
    const handleDateChange = (date: Date | null) => {
        if (date) setCurrentCheckin(date);
    };

    const handleAmenityChange = (amenityId: string, isSelected: boolean) => {
        setPage(0);
        setHotels([]);
        setSelectedAmenities(prev => {
            const s = new Set(prev);
            if (isSelected) s.add(amenityId);
            else s.delete(amenityId);
            return Array.from(s);
        });
    };

    const handlePriceChange = (min: number, max: number) => {
        setPage(0);
        setHotels([]);
        setPriceRange([min, max]);
    };

    // Close popups khi click ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
            if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
                setShowGuestPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load amenities
    useEffect(() => {
        setLoadingAmenities(true);
        amenityService
            .getAllAmenityCategories()
            .then(setAmenityCategories)
            .catch(err => console.error('Không thể tải nhóm tiện nghi:', err))
            .finally(() => setLoadingAmenities(false));
    }, []);

    // Fetch page 0
    useEffect(() => {
        setLoading(true);
        setHotels([]);
        setPage(0);

        const apiParams = buildApiParams(searchParams, 0, 10, selectedAmenities, priceRange, {
            min: DEFAULT_MIN_PRICE,
            max: DEFAULT_MAX_PRICE,
        });

        hotelService
            .searchHotels(apiParams)
            .then(data => {
                setHotels(data.content);
                setTotalHotelsFound(data.totalItems);
                setHasMore(!data.last);
            })
            .catch(err => console.error('Lỗi tìm kiếm khách sạn:', err))
            .finally(() => setLoading(false));
    }, [searchParams, selectedAmenities, priceRange]);

    // Infinite load next pages
    const observer = useRef<IntersectionObserver | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const lastHotelElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (loading || loadingMore) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prev => prev + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, loadingMore, hasMore]
    );

    useEffect(() => {
        if (page > 0) {
            setLoadingMore(true);
            const apiParams = buildApiParams(searchParams, page, 10, selectedAmenities, priceRange, {
                min: DEFAULT_MIN_PRICE,
                max: DEFAULT_MAX_PRICE,
            });

            hotelService
                .searchHotels(apiParams)
                .then(data => {
                    setHotels(prev => [...prev, ...data.content]);
                    setHasMore(!data.last);
                })
                .catch(console.error)
                .finally(() => setLoadingMore(false));
        }
    }, [page, searchParams, selectedAmenities, priceRange]);

    const displayGuests = `${adults} người lớn, ${children} Trẻ em, ${rooms} phòng`;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.searchHeader}>
                <div className="container">
                    <div className={styles.searchBar}>
                        <div className={`${styles.searchSection} ${styles.locationSection}`}>
                            <i className={`bi bi-geo-alt ${styles.searchIcon}`}></i>
                            <div className={styles.searchInput}>
                                <label>Thành phố, địa điểm hoặc tên khách sạn:</label>
                                <LocationSearchInput initialValue={currentQuery} onQueryChange={setCurrentQuery} onLocationSelect={handleLocationSelect} />
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={`${styles.searchSection} ${styles.dateSection}`} ref={datePickerRef}>
                            <i className={`bi bi-calendar3 ${styles.searchIcon}`}></i>
                            <div className={styles.searchInput} onClick={() => setShowDatePicker(!showDatePicker)}>
                                <label>Ngày nhận phòng & Số đêm</label>
                                <span>{formatDateForDisplay(currentCheckin, currentNights)}</span>
                            </div>

                            {showDatePicker && (
                                <div className={styles.datePickerWrapper}>
                                    <DatePicker selected={currentCheckin} onChange={handleDateChange} inline locale="vi" minDate={new Date()} />
                                    <div className={styles.nightsSelector}>
                                        <label>Số đêm</label>
                                        <div className={styles.counter}>
                                            <button onClick={() => setCurrentNights(n => Math.max(1, n - 1))} disabled={currentNights <= 1}>
                                                -
                                            </button>
                                            <span>{currentNights}</span>
                                            <button onClick={() => setCurrentNights(n => n + 1)}>+</button>
                                        </div>
                                    </div>
                                    <button className={styles.applyButton} onClick={() => setShowDatePicker(false)}>
                                        Xong
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.divider}></div>

                        <div className={`${styles.searchSection} ${styles.guestSection}`} ref={guestPickerRef}>
                            <i className={`bi bi-person ${styles.searchIcon}`}></i>
                            <div className={styles.searchInput} onClick={() => setShowGuestPicker(!showGuestPicker)}>
                                <label>Khách và Phòng</label>
                                <span>{displayGuests}</span>
                            </div>

                            {showGuestPicker && (
                                <GuestPicker
                                    adults={adults}
                                    children={children}
                                    rooms={rooms}
                                    setAdults={setAdults}
                                    setChildren={setChildren}
                                    setRooms={setRooms}
                                    onClose={() => setShowGuestPicker(false)}
                                />
                            )}
                        </div>

                        <button className={styles.searchButton} onClick={handleNewSearch}>
                            <i className="bi bi-search"></i>
                            <span>Tìm</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`${styles.mainContainer} container`}>
                <aside className={styles.sidebar}>
                    <PriceSlider minDefault={DEFAULT_MIN_PRICE} maxDefault={DEFAULT_MAX_PRICE} onPriceChange={handlePriceChange} />
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
                            <h2 style={{ margin: 0, color: '#000' }}>{searchParams.get('query') || 'Kết quả tìm kiếm'}</h2>
                            <p style={{ margin: 0, color: '#666' }}>Tìm thấy {totalHotelsFound} nơi lưu trú</p>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 50 }}>Đang tải kết quả...</div>
                    ) : hotels.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 50 }}>Không tìm thấy khách sạn nào phù hợp.</div>
                    ) : (
                        <div className={styles.hotelList}>
                            {hotels.map((hotel, index) => {
                                const allPhotos = hotel.photos?.flatMap((p: HotelPhoto) => p.photos.map(photo => photo.url)) || [];
                                const mainImage = allPhotos[0] || '/placeholder.svg';
                                const thumbnailImages = allPhotos.slice(1, 4);
                                const cardContent = (
                                    <div className={styles.hotelCard} onClick={() => handleSelectHotel(hotel.id)}>
                                        <div className={styles.imageColumn}>
                                            <div className={styles.mainImageWrapper}>
                                                <Image src={mainImage} alt={hotel.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                                            </div>
                                            {thumbnailImages.length > 0 && (
                                                <div className={styles.thumbnailGrid} style={{ gridTemplateColumns: `repeat(${thumbnailImages.length}, 1fr)` }}>
                                                    {thumbnailImages.map((imgUrl, idx) => (
                                                        <div key={idx} className={styles.thumbnailWrapper}>
                                                            <Image src={imgUrl} alt={`${hotel.name} thumbnail ${idx + 1}`} fill sizes="10vw" style={{ objectFit: 'cover' }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.infoColumn}>
                                            <h3 className="fw-bold text-dark mb-1 fs-5">{hotel.name}</h3>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                {hotel.averageScore > 0 && (
                                                    <>
                                                        <span className={styles.ratingBadge}>{hotel.averageScore.toFixed(1)}</span>
                                                        <span className="fw-bold text-dark">{getRatingText(hotel.averageScore)}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <span className="badge bg-light text-dark border">Khách sạn</span>
                                                <StarRating count={hotel.starRating || 0} />
                                            </div>
                                            <div className="text-muted small mb-3">
                                                <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                                                {[hotel.ward?.name, hotel.district?.name].filter(Boolean).join(', ')}
                                            </div>
                                        </div>
                                        <div className={styles.priceColumn}>
                                            <div className="text-end text-muted text-decoration-line-through small">
                                                {hotel.rawPricePerNight > hotel.currentPricePerNight ? `${hotel.rawPricePerNight?.toLocaleString('vi-VN')} VND` : <span>&nbsp;</span>}
                                            </div>
                                            <div className={`text-end mb-1 ${styles.priceFinal}`}>
                                                {hotel.currentPricePerNight > 0 ? `${hotel.currentPricePerNight?.toLocaleString('vi-VN')} VND` : 'Liên hệ giá'}
                                            </div>
                                            <div className="text-end text-muted small mb-2">Chưa bao gồm thuế và phí</div>
                                            <button
                                                className={styles.selectRoomButton}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleGoToHotelDetail(hotel.id);
                                                }}
                                            >
                                                Xem các loại phòng
                                            </button>
                                        </div>
                                    </div>
                                );

                                if (hotels.length === index + 1) {
                                    return (
                                        <div ref={lastHotelElementRef} key={hotel.id}>
                                            {cardContent}
                                        </div>
                                    );
                                }
                                return <div key={hotel.id}>{cardContent}</div>;
                            })}
                            {loadingMore && <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải thêm khách sạn...</div>}
                            {!hasMore && hotels.length > 0 && (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Bạn đã xem hết tất cả kết quả.</div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

