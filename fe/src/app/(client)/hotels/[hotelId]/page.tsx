'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

import { hotelService, HotelResponse, Room, AmenityGroup, EntertainmentVenue } from "@/service/hotelService";
import GuestPicker from '@/components/DateSupport/GuestPicker';

registerLocale('vi', vi);

// --- HÀM TIỆN ÍCH ---
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

const customStyles = `
    /* --- Checkbox --- */
    .custom-checkbox-wrapper { position: relative !important; padding-left: 28px !important; cursor: pointer !important; font-size: 14px !important; color: #333 !important; user-select: none !important; display: block !important; margin-bottom: 12px !important; }
    .custom-checkbox-wrapper input { position: absolute !important; opacity: 0 !important; cursor: pointer !important; height: 0 !important; width: 0 !important; }
    .checkmark { position: absolute !important; top: 0 !important; left: 0 !important; height: 18px !important; width: 18px !important; background-color: #fff !important; border: 1px solid #ced4da !important; border-radius: 4px !important; }
    .custom-checkbox-wrapper:hover input ~ .checkmark { border-color: #007bff !important; }
    .custom-checkbox-wrapper input:checked ~ .checkmark { background-color: #0d6efd !important; border-color: #0d6efd !important; }
    .checkmark:after { content: "" !important; position: absolute !important; display: none !important; }
    .custom-checkbox-wrapper input:checked ~ .checkmark:after { display: block !important; }
    .custom-checkbox-wrapper .checkmark:after { left: 6px !important; top: 2px !important; width: 5px !important; height: 10px !important; border: solid white !important; border-width: 0 2px 2px 0 !important; transform: rotate(45deg) !important; }

    /* --- Sticky Tab --- */
    .sticky-tab-bar { position: sticky !important; top: 0 !important; background: #fff !important; z-index: 1000 !important; border-bottom: 2px solid #e3e6ea !important; }
    .sticky-tab-bar .tab-item { cursor: pointer !important; font-weight: bold !important; padding: 0 18px !important; height: 48px !important; display: inline-flex !important; align-items: center !important; color: #6c757d !important; border: none !important; background: none !important; outline: none !important; font-size: 16px !important; transition: color 0.2s !important; }
    .sticky-tab-bar .tab-item.active { color: #1565c0 !important; border-bottom: 3px solid #1565c0 !important; background: none !important; }
    .sticky-tab-bar .tab-item:not(.active):hover { color: #0070f3 !important; }

    /* --- CSS MỚI CHO HEADER --- */
    .headerBox { background: rgba(255, 255, 255, 0.15); border-radius: 6px; padding: 8px 12px; color: white; display: flex; align-items: center; }
    .headerBoxInteractive { background: rgba(255, 255, 255, 0.15); border-radius: 6px; padding: 8px 12px; color: white; display: flex; align-items: center; cursor: pointer; position: relative; transition: background-color 0.2s; }
    .headerBoxInteractive:hover { background: rgba(255, 255, 255, 0.25); }
    .datePickerWrapper { position: absolute; top: calc(100% + 8px); left: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1010; padding: 16px; border: 1px solid #e0e0e0; color: #333; }
    .datePickerWrapper .react-datepicker { border: none; font-family: inherit; }
    .datePickerWrapper .react-datepicker__header { background-color: #f8f9fa; border-bottom: none; }
    .datePickerWrapper .react-datepicker__day--selected { background-color: #0d6efd; }
    .nightsSelector { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
    .nightsSelector label { font-weight: 500; font-size: 16px; }
    .counter { display: flex; align-items: center; gap: 12px; }
    .counter button { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #0d6efd; background-color: white; color: #0d6efd; font-size: 20px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
    .counter button:disabled { border-color: #ced4da; color: #ced4da; cursor: not-allowed; }
    .counter span { font-size: 16px; font-weight: bold; min-width: 20px; text-align: center; }
    .applyButton { background-color: #0d6efd; color: white; border: none; border-radius: 6px; padding: 10px; font-weight: bold; cursor: pointer; margin-top: 16px; width: 100%; }
`;

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

export default function HotelDetailPage() {
    const { hotelId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [hotel, setHotel] = useState<HotelResponse | null>(null);
    const [isHotelLoading, setIsHotelLoading] = useState(true);
    const [hotelError, setHotelError] = useState<string | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [initialRoomsLoading, setInitialRoomsLoading] = useState(true);
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
    }, [hotelId, isFetchingMore, page, hasMore]);

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

    useEffect(() => {
        if (!hotelId) return;
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
        fetchHotelData();
        fetchInitialRooms();
    }, [hotelId]);

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
    const handleGuestChange = (newAdults: number, newChildren: number, newRooms: number) => {
        setAdults(newAdults);
        setChildren(newChildren);
        setRoomsCount(newRooms);
    };

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
        <div style={{ background: '#f7f9fb', minHeight: '100vh' }}>
            <style>{customStyles}</style>

            <div style={{ background: 'linear-gradient(90deg,#1e3c72 0,#2a5298 100%)', color: '#fff', padding: '16px 0' }}>
                <div className="container d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <div className="headerBox">
                            <i className="bi bi-geo-alt-fill me-2"></i>
                            <span className="fw-bold">{hotel.name}</span>
                        </div>
                        <div className="headerBoxInteractive" ref={datePickerRef} onClick={() => setShowDatePicker(!showDatePicker)}>
                            <i className="bi bi-calendar-event me-2"></i>
                            <span>{dateDisplayString}</span>
                            {showDatePicker && (
                                <div className="datePickerWrapper">
                                    <DatePicker selected={currentCheckin} onChange={handleDateChange} inline locale="vi" minDate={new Date()} />
                                    <div className="nightsSelector">
                                        <label>Số đêm</label>
                                        <div className="counter">
                                            <button onClick={(e) => { e.stopPropagation(); setCurrentNights(n => Math.max(1, n - 1)); }} disabled={currentNights <= 1}>-</button>
                                            <span>{currentNights}</span>
                                            <button onClick={(e) => { e.stopPropagation(); setCurrentNights(n => n + 1); }}>+</button>
                                        </div>
                                    </div>
                                    <button className="applyButton" onClick={(e) => { e.stopPropagation(); setShowDatePicker(false); }}>Xong</button>
                                </div>
                            )}
                        </div>
                        <div className="headerBoxInteractive" ref={guestPickerRef} onClick={() => setShowGuestPicker(!showGuestPicker)}>
                            <i className="bi bi-person me-2"></i>
                            <span>{displayGuests}</span>
                            {showGuestPicker && (
                                <GuestPicker
                                    adults={adults}
                                    children={children}
                                    rooms={roomsCount}
                                    setAdults={setAdults}
                                    setChildren={setChildren}
                                    setRooms={setRoomsCount}
                                    onClose={() => setShowGuestPicker(false)}
                                />
                            )}
                        </div>
                    </div>
                    <div>
                        <button className="btn btn-warning fw-bold px-4">
                            <i className="bi bi-search me-2"></i>
                            Tìm lại phòng trống
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

            <div ref={overviewRef} className="container mt-4">
                <div className="row g-2">
                    <div className="col-md-7">
                        <div style={{ borderRadius: '16px', overflow: 'hidden', width: '100%', height: '320px' }}>
                            <Image src={displayPhotos[0]} width={700} height={320} alt="Hotel main photo" style={{ objectFit: 'cover', width: '100%', height: '100%' }} priority />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="row g-2" style={{ minHeight: '320px' }}>
                            {displayPhotos.slice(1, 5).map((url, idx) => (
                                <div key={idx} className="col-6">
                                    <div style={{ borderRadius: '10px', overflow: 'hidden', width: '100%', height: '154px' }}>
                                        <Image src={url} width={200} height={154} alt={`Hotel side photo ${idx + 1}`} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container" style={{ marginTop: '32px' }}>
                    <div className="row gx-4 gy-4">
                        <div className="col-lg-8">
                            <div className="card shadow-lg p-4 mb-4" style={{ borderRadius: '18px' }}>
                                <div className="d-flex align-items-center mb-2">
                                    <span className="badge bg-primary me-2">Khách Sạn</span>
                                    {hotel.starRating > 0 && <span className="text-warning fw-bold">{'★'.repeat(hotel.starRating)}</span>}
                                    <span className="ms-3 fw-bold fs-4 text-dark">{hotel.name}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="fw-bold">Địa chỉ:</span> {getFullAddress(hotel)}
                                </div>
                                <div className="mb-2 d-flex align-items-center flex-wrap">
                                    <span className="fw-bold">Giá phòng/đêm từ:</span>
                                    <span className="text-danger fw-bold ms-2 fs-5">{lowestPrice > 0 ? lowestPrice.toLocaleString("vi-VN") : 'Liên hệ'} VND</span>
                                    <button className="btn btn-warning btn-lg fw-bold px-4 ms-auto mt-2 mt-lg-0" onClick={() => handleTabClick('rooms')}>Chọn phòng</button>
                                </div>
                            </div>
                            <div ref={amenitiesRef} className="card shadow p-4 mb-4">
                                <h5 className="fw-bold mb-3">Tiện ích chính</h5>
                                <div className="d-flex flex-wrap">
                                    {mainAmenities.map((item) => (
                                        <span key={item.id} className="me-4 mb-3 d-flex align-items-center" style={{ minWidth: '150px' }}>
                                            <i className="bi bi-check-circle text-primary me-2" style={{ fontSize: "1.1rem" }}></i>
                                            <span className="text-dark small fw-semibold">{item.name}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="card shadow p-4">
                                <h5 className="fw-bold mb-2">Mô tả khách sạn</h5>
                                <p className="mb-0 text-dark">{hotel.description}</p>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card shadow-lg p-4 mb-4">
                                <h5 className="fw-bold mb-3">Trong khu vực</h5>
                                <ul className="list-unstyled mb-0">
                                    {nearbyVenues.map((item) => (
                                        <li key={item.id} className="mb-2 d-flex align-items-center">
                                            <i className="bi bi-geo-alt text-primary me-2"></i>
                                            <span className="fw-semibold">{item.name}</span>
                                            <span className="ms-auto text-muted">{formatDistance(item.distance)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
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
                            <label className="custom-checkbox-wrapper">Miễn phí hủy phòng
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                            </label>
                            <label className="custom-checkbox-wrapper">Thanh toán gần ngày đến ở
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                <div className="text-muted" style={{ fontSize: '12px', marginLeft: '28px', marginTop: '-8px' }}>Không cần thanh toán ngay hôm nay</div>
                            </label>
                            <label className="custom-checkbox-wrapper">Thanh Toán Tại Khách Sạn <i className="bi bi-info-circle ms-1"></i>
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                            </label>
                        </div>
                        <div className="col-lg-4 col-md-6 text-dark">
                            <label className="custom-checkbox-wrapper">Giường lớn <i className="bi bi-info-circle ms-1"></i>
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                            </label>
                            <label className="custom-checkbox-wrapper">Miễn phí bữa sáng
                                <input type="checkbox" />
                                <span className="checkmark"></span>
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