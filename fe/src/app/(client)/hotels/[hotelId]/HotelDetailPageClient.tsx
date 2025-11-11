'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

import { hotelService, HotelResponse, Room, PaginatedData } from "@/service/hotelService";
import GuestPicker from '@/components/DateSupport/GuestPicker';
import styles from './HotelDetailPage.module.css';

registerLocale('vi', vi);

// --- HÀM TIỆN ÍCH (GIỮ NGUYÊN) ---
const getFullAddress = (hotel: HotelResponse) => {
    return [
        hotel.address,
        hotel.street?.name,
        hotel.ward?.name,
        hotel.district?.name,
        hotel.city?.name
    ].filter(Boolean).join(', ');
};

const formatDateForDisplay = (checkin: Date, nights: number): string => {
    try {
        const checkoutDate = new Date(checkin);
        checkoutDate.setDate(checkin.getDate() + nights);
        const format = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
        return `${format(checkin)} - ${format(checkoutDate)}, ${nights} đêm`;
    } catch (e) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return `${today.getDate()} thg ${today.getMonth() + 1} - ${tomorrow.getDate()} thg ${tomorrow.getMonth() + 1}, 1 đêm`;
    }
};

const formatDistance = (distanceInMeters: number) => {
    if (distanceInMeters < 1000) {
        return `${distanceInMeters} m`;
    }
    return `${(distanceInMeters / 1000).toFixed(2)} km`;
};

const customStylesForPage = `
    .sticky-tab-bar { position: sticky !important; top: 0 !important; background: #fff !important; z-index: 1000 !important; border-bottom: 2px solid #e3e6ea !important; }
    .sticky-tab-bar .tab-item { cursor: pointer !important; font-weight: bold !important; padding: 0 18px !important; height: 48px !important; display: inline-flex !important; align-items: center !important; color: #6c757d !important; border: none !important; background: none !important; outline: none !important; font-size: 16px !important; transition: color 0.2s !important; }
    .sticky-tab-bar .tab-item.active { color: #1565c0 !important; border-bottom: 3px solid #1565c0 !important; background: none !important; }
    .sticky-tab-bar .tab-item:not(.active):hover { color: #0070f3 !important; }
`;

// --- COMPONENT ROOMCARD (GIỮ NGUYÊN) ---
function RoomCard({ room, handleSelectRoom, innerRef }: { room: Room; handleSelectRoom: (room: Room, price: number, includesBreakfast: boolean) => void; innerRef?: (node: HTMLDivElement | null) => void }) {
    const roomPhotos = room.photos?.flatMap(cat => cat.photos.map(p => p.url)) || [];
    const basePrice = room.basePricePerNight ?? 0;
    const originalPrice = basePrice * 1.25;
    const priceWithBreakfast = basePrice + 100000;

    return (
        <div ref={innerRef} className="bg-white rounded shadow-sm p-3 mb-3 text-dark">
            <div className="row g-3">
                <div className="col-lg-4">
                    <h5 className="fw-bold d-block d-lg-none mb-2">{room.name}</h5>
                    <Image src={roomPhotos[0] || "/placeholder.svg"} width={400} height={250} alt={room.name} style={{ objectFit: "cover", borderRadius: "8px", width: "100%", height: "auto" }} />
                    <div className="mt-2 small text-muted">
                        {room.area > 0 && <div className="mb-1"><i className="bi bi-rulers me-2 text-primary"></i> {room.area} m²</div>}
                        {room.view && <div className="mb-1"><i className="bi bi-image me-2 text-primary"></i> {room.view}</div>}
                    </div>
                    <a href="#" className="text-primary small fw-bold mt-2 d-inline-block">Xem chi tiết phòng</a>
                </div>
                <div className="col-lg-8">
                    <h5 className="fw-bold d-none d-lg-block">{room.name}</h5>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center border rounded p-3 mt-2">
                        <div className="flex-grow-1">
                            <div className="fw-bold mb-2">Không bao gồm bữa sáng</div>
                            <div className="text-muted small mb-1">{room.bedType?.name || 'Giường phù hợp'}</div>
                            <div className="text-success small mb-1"><i className="bi bi-check-circle-fill me-1"></i> Không cần thanh toán ngay hôm nay</div>
                        </div>
                        <div className="mx-md-3 my-3 my-md-0 text-center">
                            <i className="bi bi-people-fill fs-4 text-primary"></i>
                            <div className="fw-bold">{room.maxAdults}</div>
                        </div>
                        <div className="text-md-end ms-md-auto" style={{ minWidth: '180px' }}>
                            <span className="badge bg-danger mb-1">Ưu đãi có hạn!</span>
                            <div className="text-muted text-decoration-line-through small">{originalPrice.toLocaleString("vi-VN")} VND</div>
                            <div className="fw-bold text-warning fs-5">{basePrice.toLocaleString("vi-VN")} VND</div>
                            <div className="text-muted small mb-2">Chưa bao gồm thuế và phí</div>
                            <button className="btn btn-primary fw-bold w-100" onClick={() => handleSelectRoom(room, basePrice, false)}>Chọn</button>
                        </div>
                    </div>
                    {room.breakfastIncluded && (
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center border rounded p-3 mt-2">
                            <div className="flex-grow-1">
                                <div className="fw-bold mb-2">Bao gồm bữa sáng</div>
                                <div className="text-muted small mb-1">{room.bedType?.name || 'Giường phù hợp'}</div>
                            </div>
                            <div className="mx-md-3 my-3 my-md-0 text-center">
                                <i className="bi bi-people-fill fs-4 text-primary"></i>
                                <div className="fw-bold">{room.maxAdults}</div>
                            </div>
                            <div className="text-md-end ms-md-auto" style={{ minWidth: '180px' }}>
                                <div className="fw-bold text-warning fs-5">{priceWithBreakfast.toLocaleString("vi-VN")} VND</div>
                                <div className="text-muted small mb-2">Chưa bao gồm thuế và phí</div>
                                <button className="btn btn-primary fw-bold w-100" onClick={() => handleSelectRoom(room, priceWithBreakfast, true)}>Chọn</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Props để nhận initial data từ Server Component
interface HotelDetailPageClientProps {
    initialHotel: HotelResponse | null;
    initialRooms: Room[];
    initialHasMore: boolean;
    initialPage: number;
}

export default function HotelDetailPageClient({
    initialHotel,
    initialRooms = [],
    initialHasMore = false,
    initialPage = 0,
}: HotelDetailPageClientProps) {
    const { hotelId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [hotel, setHotel] = useState<HotelResponse | null>(initialHotel);
    const [isHotelLoading, setIsHotelLoading] = useState(!initialHotel);
    const [hotelError, setHotelError] = useState<string | null>(null);
    const [rooms, setRooms] = useState<Room[]>(initialRooms);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [initialRoomsLoading, setInitialRoomsLoading] = useState(!initialHotel && initialRooms.length === 0);
    const [roomsError, setRoomsError] = useState<string | null>(null);

    const [currentCheckin, setCurrentCheckin] = useState(new Date());
    const [currentNights, setCurrentNights] = useState(1);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [roomsCount, setRoomsCount] = useState(1);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const guestPickerRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState("overview");
    const isScrollingByClick = useRef(false);
    const overviewRef = useRef<HTMLDivElement>(null);
    const roomsSectionRef = useRef<HTMLDivElement>(null);
    const amenitiesRef = useRef<HTMLDivElement>(null);
    const policyRef = useRef<HTMLDivElement>(null);
    const reviewRef = useRef<HTMLDivElement>(null);
    const tabLabels = [{ key: "overview", label: "Tổng quan" }, { key: "rooms", label: "Phòng" }, { key: "location", label: "Vị trí" }, { key: "amenities", label: "Tiện ích" }, { key: "policy", label: "Chính sách" }, { key: "review", label: "Đánh giá" }];

    const priceDisplayOptions = ["Mỗi phòng mỗi đêm (chưa bao gồm thuế và phí)", "Mỗi phòng mỗi đêm (bao gồm thuế và phí)", "Tổng giá (chưa bao gồm thuế và phí)", "Tổng giá (bao gồm thuế và phí)"];
    const [selectedPriceDisplay, setSelectedPriceDisplay] = useState(priceDisplayOptions[0]);

    const observer = useRef<IntersectionObserver | null>(null);

    const loadMoreRooms = useCallback(async () => {
        if (!hotelId || isFetchingMore) return;
        setIsFetchingMore(true);
        try {
            const nextPage = page + 1;
            const response = await hotelService.getRoomsByHotelId(hotelId as string, nextPage, 10);
            setRooms(prev => [...prev, ...response.content]);
            setPage(response.page);
            setHasMore(!response.last);
        } catch (error) {
            console.error("Lỗi khi tải thêm phòng:", error);
        } finally {
            setIsFetchingMore(false);
        }
    }, [hotelId, isFetchingMore, page]);

    const lastRoomElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isFetchingMore) return;
        if (observer.current) observer.current.disconnect();
        if (typeof window !== 'undefined' && window.IntersectionObserver) {
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMoreRooms();
                }
            });
            if (node) observer.current.observe(node);
        }
    }, [isFetchingMore, hasMore, loadMoreRooms]);

    useEffect(() => {
        const checkinParam = searchParams.get('checkin');
        const nightsParam = searchParams.get('nights');
        const adultsParam = searchParams.get('adults');
        const childrenParam = searchParams.get('children');
        const roomsParam = searchParams.get('rooms');

        setCurrentCheckin(checkinParam ? new Date(checkinParam) : new Date());
        setCurrentNights(nightsParam ? parseInt(nightsParam, 10) : 1);
        setAdults(adultsParam ? parseInt(adultsParam, 10) : 2);
        setChildren(childrenParam ? parseInt(childrenParam, 10) : 0);
        setRoomsCount(roomsParam ? parseInt(roomsParam, 10) : 1);
    }, [searchParams]);

    // Fetch hotel nếu chưa có initial data
    useEffect(() => {
        if (!hotelId || initialHotel) return;
        const hotelIdStr = hotelId as string;
        const fetchHotelData = async () => {
            setIsHotelLoading(true);
            setHotelError(null);
            try {
                const hotelData = await hotelService.getHotelById(hotelIdStr);
                setHotel(hotelData);
            } catch (err) {
                console.error("LỖI: Không thể tải thông tin khách sạn.", err);
                setHotelError("Không thể tải thông tin chi tiết khách sạn.");
            } finally {
                setIsHotelLoading(false);
            }
        };
        fetchHotelData();
    }, [hotelId, initialHotel]);

    // Fetch rooms nếu chưa có initial data
    useEffect(() => {
        if (!hotelId || (initialRooms.length > 0 && initialHotel)) return;
        const hotelIdStr = hotelId as string;
        const fetchInitialRooms = async () => {
            setInitialRoomsLoading(true);
            setRoomsError(null);
            try {
                const initialRoomsData = await hotelService.getRoomsByHotelId(hotelIdStr, 0, 10);
                setRooms(initialRoomsData.content);
                setPage(initialRoomsData.page);
                setHasMore(!initialRoomsData.last);
            } catch (err) {
                console.error("Lỗi khi tải danh sách phòng:", err);
                setRoomsError("Có lỗi xảy ra khi tải danh sách phòng.");
            } finally {
                setInitialRoomsLoading(false);
            }
        };
        fetchInitialRooms();
    }, [hotelId, initialRooms.length, initialHotel]);

    const handleRefetchAvailability = () => {
        setShowDatePicker(false);
        setShowGuestPicker(false);
        const params = new URLSearchParams();
        params.set('checkin', currentCheckin.toISOString().split('T')[0]);
        params.set('nights', currentNights.toString());
        params.set('adults', adults.toString());
        params.set('children', children.toString());
        params.set('rooms', roomsCount.toString());
        router.push(`/hotels/${hotelId}?${params.toString()}`);
    };

    const handleTabClick = (tab: string) => {
        isScrollingByClick.current = true;
        setActiveTab(tab);
        const refMap = { overview: overviewRef, rooms: roomsSectionRef, amenities: amenitiesRef, policy: policyRef, review: reviewRef };
        const sectionRef = refMap[tab as keyof typeof refMap];
        if (sectionRef?.current) {
            window.scrollTo({ top: sectionRef.current.offsetTop - 60, behavior: "smooth" });
            setTimeout(() => { isScrollingByClick.current = false; }, 1000);
        }
    };

    const handleScrollSync = useCallback(() => {
        if (isScrollingByClick.current) return;
        const sections = [
            { tab: "overview", ref: overviewRef },
            { tab: "rooms", ref: roomsSectionRef },
            { tab: "amenities", ref: amenitiesRef },
            { tab: "policy", ref: policyRef },
            { tab: "review", ref: reviewRef }
        ];
        const scrollPosition = window.scrollY + 120;
        let currentActiveTab = "";
        for (const section of sections) {
            if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
                currentActiveTab = section.tab;
            }
        }
        if (currentActiveTab) {
            setActiveTab(currentActiveTab);
        }
    }, []);

    const handleSelectRoom = (room: Room, price: number, includesBreakfast: boolean) => {
        if (!hotel) return;
        const params = new URLSearchParams({
            roomId: room.id.toString(),
            price: price.toString(),
            checkin: currentCheckin.toISOString().split('T')[0],
            nights: currentNights.toString(),
            adults: adults.toString(),
            children: children.toString(),
            rooms: roomsCount.toString(),
            hotelName: hotel.name,
            hotelImageUrl: hotel.photos?.[0]?.photos?.[0]?.url || '',
            breakfast: includesBreakfast.toString(),
            roomView: room.view || '',
        });
        router.push(`/booking?${params.toString()}`);
    };

    const handleDateChange = (date: Date | null) => { if (date) setCurrentCheckin(date); };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
            if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
                setShowGuestPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => { window.addEventListener("scroll", handleScrollSync, { passive: true }); return () => window.removeEventListener("scroll", handleScrollSync); }, [handleScrollSync]);

    if (isHotelLoading || initialRoomsLoading) return <div className="container py-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>;
    if (hotelError || !hotel) return <div className="container py-5"><div className="alert alert-danger">{hotelError || "Không tìm thấy khách sạn"}</div></div>;

    const displayGuests = `${adults} người lớn, ${children} Trẻ em, ${roomsCount} phòng`;
    const dateDisplayString = formatDateForDisplay(currentCheckin, currentNights);
    const allPhotoUrls = hotel.photos.flatMap(cat => Array.isArray(cat.photos) ? cat.photos.map(p => p.url) : []) || [];
    const displayPhotos = allPhotoUrls.length > 0 ? allPhotoUrls : Array(5).fill("/placeholder.svg");
    const mainAmenities = hotel.amenities?.flatMap(group => group.amenities).slice(0, 6) || [];
    const nearbyVenues = hotel.entertainmentVenues?.flatMap(group => group.entertainmentVenues).slice(0, 5) || [];
    const lowestPrice = rooms.length > 0 ? Math.min(...rooms.map(room => room.basePricePerNight)) : hotel.currentPricePerNight ?? 0;

    return (
        <div className={styles['hotel-detail-page']}>
            <style>{customStylesForPage}</style>

            <div className={styles.searchHeader}>
                <div className="container">
                    <div className={styles.searchBar}>
                        <div className={`${styles.searchSection} ${styles.locationSection}`}>
                            <i className={`bi bi-geo-alt ${styles.searchIcon}`}></i>
                            <div className={styles.searchInput}>
                                <label>Khách sạn</label>
                                <span>{hotel.name}</span>
                            </div>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={`${styles.searchSection} ${styles.dateSection}`} ref={datePickerRef}>
                            <i className={`bi bi-calendar3 ${styles.searchIcon}`}></i>
                            <div className={styles.searchInput} onClick={() => setShowDatePicker(!showDatePicker)}>
                                <label>Ngày nhận phòng & Số đêm</label>
                                <span>{dateDisplayString}</span>
                            </div>
                            {showDatePicker && (
                                <div className={styles.datePickerWrapper}>
                                    <DatePicker selected={currentCheckin} onChange={handleDateChange} inline locale="vi" minDate={new Date()} />
                                    <div className={styles.nightsSelector}>
                                        <label>Số đêm</label>
                                        <div className={styles.counter}>
                                            <button onClick={() => setCurrentNights(n => Math.max(1, n - 1))} disabled={currentNights <= 1}>-</button>
                                            <span>{currentNights}</span>
                                            <button onClick={() => setCurrentNights(n => n + 1)}>+</button>
                                        </div>
                                    </div>
                                    <button className={styles.applyButton} onClick={() => setShowDatePicker(false)}>Xong</button>
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
                                <div className={styles.guestPickerWrapper}>
                                    <GuestPicker
                                        adults={adults}
                                        children={children}
                                        rooms={roomsCount}
                                        setAdults={setAdults}
                                        setChildren={setChildren}
                                        setRooms={setRoomsCount}
                                        onClose={() => setShowGuestPicker(false)}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.divider}></div>
                        <button className={styles.searchButton} onClick={handleRefetchAvailability}>
                            <i className="bi bi-search"></i>
                            <span>Tìm lại</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="sticky-tab-bar">
                <div className="container">
                    <div className="tab-list" style={{ position: "relative" }}>
                        {tabLabels.map((tab) => (
                            <button key={tab.key} className={`tab-item${activeTab === tab.key ? " active" : ""}`} onClick={() => handleTabClick(tab.key)} type="button">
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div ref={overviewRef} className="container py-4">
                <div className="row g-2 mb-4">
                    <div className="col-lg-7">
                        <div style={{ borderRadius: '16px', overflow: 'hidden', width: '100%', height: '410px', position: 'relative' }}>
                            <Image src={displayPhotos[0]} fill style={{ objectFit: 'cover' }} alt="Hotel main photo" priority />
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="row g-2" style={{ height: '410px' }}>
                            {displayPhotos.slice(1, 5).map((url, idx) => (
                                <div key={idx} className="col-6">
                                    <div style={{ borderRadius: '10px', overflow: 'hidden', width: '100%', height: '201px', position: 'relative' }}>
                                        <Image src={url} fill style={{ objectFit: 'cover' }} alt={`Hotel side photo ${idx + 1}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="row gx-lg-4 gy-4">
                    <div className="col-lg-8">
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <div className="d-flex align-items-center mb-3 flex-wrap">
                                <span className="badge bg-primary me-2 fs-6 py-2">Khách Sạn</span>
                                {hotel.starRating > 0 && <span className="text-warning fw-bold fs-5 ms-2">{'★'.repeat(hotel.starRating)}</span>}
                            </div>
                            <h1 className="fw-bold fs-2 text-dark mb-3">{hotel.name}</h1>
                            <div className="mb-4 d-flex align-items-start">
                                <i className="bi bi-geo-alt-fill text-danger fs-5 me-2 mt-1"></i>
                                <span className="text-muted">{getFullAddress(hotel)}</span>
                            </div>
                            <div className="d-flex align-items-center flex-wrap bg-light p-3 rounded-3">
                                <div className="me-auto">
                                    <span className="fw-bold">Giá phòng/đêm từ:</span>
                                    <span className="text-danger fw-bold ms-2 fs-4">{lowestPrice > 0 ? lowestPrice.toLocaleString("vi-VN") : 'Liên hệ'} VND</span>
                                </div>
                                <button className="btn btn-warning btn-lg fw-bold px-4 mt-2 mt-sm-0" onClick={() => handleTabClick('rooms')}>
                                    Chọn phòng ngay
                                </button>
                            </div>
                        </div>

                        <div ref={amenitiesRef} className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <h5 className="fw-bold mb-3">Tiện ích chính</h5>
                            <div className="row">
                                {mainAmenities.map((item) => (
                                    <div key={item.id} className="col-md-6 mb-3">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-check-circle text-primary me-2 fs-5"></i>
                                            <span className="text-dark">{item.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-4 shadow-sm p-4">
                            <h5 className="fw-bold mb-3">Mô tả khách sạn</h5>
                            <p className="mb-0 text-dark" style={{ lineHeight: 1.7 }}>{hotel.description}</p>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="bg-white rounded-4 shadow-sm p-4">
                            <h5 className="fw-bold mb-3">Trong khu vực</h5>
                            <ul className="list-unstyled mb-0">
                                {nearbyVenues.map((item) => (
                                    <li key={item.id} className="mb-3 d-flex align-items-center">
                                        <i className="bi bi-geo-alt text-primary me-3 fs-5"></i>
                                        <div>
                                            <div className="fw-semibold">{item.name}</div>
                                            <div className="small text-muted">{formatDistance(item.distance)}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div ref={roomsSectionRef} className="container mb-5">
                <h4 className="fw-bold mb-3 text-dark pt-4">Những phòng còn trống tại {hotel.name}</h4>
                <div className="bg-white p-4 mb-3" style={{ borderBottom: '1px solid #e3e6ea' }}>
                    <h5 className="fw-bold mb-3 text-dark">Tìm kiếm nhanh hơn bằng cách chọn những tiện nghi bạn cần</h5>
                    <div className="row align-items-start">
                        <div className="col-lg-4 col-md-6">
                            <label className={styles['custom-checkbox-wrapper']}>Miễn phí hủy phòng
                                <input type="checkbox" />
                                <span className={styles.checkmark}></span>
                            </label>
                            <label className={styles['custom-checkbox-wrapper']}>Thanh toán gần ngày đến ở
                                <input type="checkbox" />
                                <span className={styles.checkmark}></span>
                                <div className="text-muted" style={{ fontSize: '12px', marginLeft: '28px', marginTop: '-8px' }}>Không cần thanh toán ngay hôm nay</div>
                            </label>
                            <label className={styles['custom-checkbox-wrapper']}>Thanh Toán Tại Khách Sạn <i className="bi bi-info-circle ms-1"></i>
                                <input type="checkbox" />
                                <span className={styles.checkmark}></span>
                            </label>
                        </div>
                        <div className="col-lg-4 col-md-6 text-dark">
                            <label className={styles['custom-checkbox-wrapper']}>Giường lớn <i className="bi bi-info-circle ms-1"></i>
                                <input type="checkbox" />
                                <span className={styles.checkmark}></span>
                            </label>
                            <label className={styles['custom-checkbox-wrapper']}>Miễn phí bữa sáng
                                <input type="checkbox" />
                                <span className={styles.checkmark}></span>
                            </label>
                        </div>
                        <div className="col-lg-4 col-md-12 mt-3 mt-lg-0">
                            <div className="fw-semibold text-dark small mb-1">Hiển thị giá</div>
                            <div className="dropdown">
                                <a className="dropdown-toggle text-primary text-decoration-none fw-semibold small" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {selectedPriceDisplay}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="priceDisplayDropdown">
                                    {priceDisplayOptions.map((option, index) => (
                                        <li key={index}>
                                            <a className={`dropdown-item ${selectedPriceDisplay === option ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setSelectedPriceDisplay(option); }}>
                                                {selectedPriceDisplay === option ? <i className="bi bi-check-circle-fill text-primary me-2"></i> : <i className="bi bi-circle me-2" style={{ visibility: 'hidden' }}></i>}
                                                {option}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {initialRoomsLoading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div></div>
                ) : roomsError ? (
                    <div className="alert alert-danger">{roomsError}</div>
                ) : rooms.length === 0 ? (
                    <div className="alert alert-info text-center" role="alert">Không có phòng nào khả dụng.</div>
                ) : (
                    <div>
                        {rooms.map((room, index) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                handleSelectRoom={handleSelectRoom}
                                innerRef={rooms.length === index + 1 ? lastRoomElementRef : undefined}
                            />
                        ))}
                        {isFetchingMore && <div className="text-center p-4"><div className="spinner-border text-primary" role="status"></div></div>}
                    </div>
                )}
            </div>
        </div>
    );
}






