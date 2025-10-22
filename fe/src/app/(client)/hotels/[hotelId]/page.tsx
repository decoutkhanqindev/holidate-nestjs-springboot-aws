


// "use client";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Image from "next/image";
// import { hotelService, HotelResponse, Room, AmenityGroup } from "@/service/hotelService";

// // --- HÀM TIỆN ÍCH ---
// const getFullAddress = (hotel: HotelResponse) => {
//     return [
//         hotel.address,
//         hotel.street?.name,
//         hotel.ward?.name,
//         hotel.district?.name,
//         hotel.city?.name
//     ].filter(Boolean).join(', ');
// };

// const customStyles = `
//     /* --- Checkbox --- */
//     .custom-checkbox-wrapper { 
//         position: relative !important; 
//         padding-left: 28px !important; 
//         cursor: pointer !important; 
//         font-size: 14px !important; 
//         color: #333 !important; 
//         user-select: none !important; 
//         display: block !important; 
//         margin-bottom: 12px !important; 
//     }
//     .custom-checkbox-wrapper input { 
//         position: absolute !important; 
//         opacity: 0 !important; 
//         cursor: pointer !important; 
//         height: 0 !important; 
//         width: 0 !important; 
//     }
//     .checkmark { 
//         position: absolute !important; 
//         top: 0 !important; 
//         left: 0 !important; 
//         height: 18px !important; 
//         width: 18px !important; 
//         background-color: #fff !important; 
//         border: 1px solid #ced4da !important; 
//         border-radius: 4px !important; 
//     }
//     .custom-checkbox-wrapper:hover input ~ .checkmark { 
//         border-color: #007bff !important; 
//     }
//     .custom-checkbox-wrapper input:checked ~ .checkmark { 
//         background-color: #0d6efd !important; 
//         border-color: #0d6efd !important; 
//     }
//     .checkmark:after { 
//         content: "" !important; 
//         position: absolute !important; 
//         display: none !important; 
//     }
//     .custom-checkbox-wrapper input:checked ~ .checkmark:after { 
//         display: block !important; 
//     }
//     .custom-checkbox-wrapper .checkmark:after { 
//         left: 6px !important; 
//         top: 2px !important; 
//         width: 5px !important; 
//         height: 10px !important; 
//         border: solid white !important; 
//         border-width: 0 2px 2px 0 !important; 
//         transform: rotate(45deg) !important; 
//     }

//     /* --- Sticky Tab --- */
//     .sticky-tab-bar {
//         position: sticky !important;
//         top: 0 !important;
//         background: #fff !important;
//         z-index: 1000 !important;
//         border-bottom: 2px solid #e3e6ea !important;
//     }

//     .sticky-tab-bar .tab-item {
//         cursor: pointer !important;
//         font-weight: bold !important;
//         padding: 0 18px !important;
//         height: 48px !important;
//         display: inline-flex !important;
//         align-items: center !important;
//         color: #6c757d !important;
//         border: none !important;
//         background: none !important;
//         outline: none !important;
//         font-size: 16px !important;
//         transition: color 0.2s !important;
//     }

//     .sticky-tab-bar .tab-item.active {
//         color: #1565c0 !important;
//         border-bottom: 3px solid #1565c0 !important;
//         background: none !important;
//     }

//     .sticky-tab-bar .tab-item:not(.active):hover {
//         color: #0070f3 !important;
//     }
// `;

// // --- COMPONENT RIÊNG CHO MỘT CARD PHÒNG ---
// function RoomCard({ room, handleSelectRoom, innerRef }: { room: Room; handleSelectRoom: (room: Room, price: number, includesBreakfast: boolean) => void; innerRef?: (node: HTMLDivElement | null) => void }) {
//     const roomPhotos = room.photos?.flatMap(cat => cat.photos.map(p => p.url)) || [];
//     const basePrice = room.basePricePerNight ?? 0;
//     const originalPrice = basePrice * 1.25;
//     const priceWithBreakfast = basePrice + 100000;

//     return (
//         <div ref={innerRef} className="bg-white rounded shadow-sm p-3 mb-3 text-dark">
//             <div className="row g-3">
//                 <div className="col-lg-4">
//                     <h5 className="fw-bold d-block d-lg-none mb-2">{room.name}</h5>
//                     <Image src={roomPhotos[0] || "/placeholder.svg"} width={400} height={250} alt={room.name} style={{ objectFit: "cover", borderRadius: "8px", width: "100%", height: "auto" }} />
//                     <div className="mt-2 small text-muted">
//                         {room.area > 0 && <div className="mb-1"><i className="bi bi-rulers me-2 text-primary"></i> {room.area} m²</div>}
//                         {room.view && <div className="mb-1"><i className="bi bi-image me-2 text-primary"></i> {room.view}</div>}
//                     </div>
//                     <a href="#" className="text-primary small fw-bold mt-2 d-inline-block">Xem chi tiết phòng</a>
//                 </div>
//                 <div className="col-lg-8">
//                     <h5 className="fw-bold d-none d-lg-block">{room.name}</h5>
//                     <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center border rounded p-3 mt-2">
//                         <div className="flex-grow-1">
//                             <div className="fw-bold mb-2">Không bao gồm bữa sáng</div>
//                             <div className="text-muted small mb-1">{room.bedType?.name || 'Giường phù hợp'}</div>
//                             <div className="text-success small mb-1"><i className="bi bi-check-circle-fill me-1"></i> Không cần thanh toán ngay hôm nay</div>
//                         </div>
//                         <div className="mx-md-3 my-3 my-md-0 text-center">
//                             <i className="bi bi-people-fill fs-4 text-primary"></i>
//                             <div className="fw-bold">{room.maxAdults}</div>
//                         </div>
//                         <div className="text-md-end ms-md-auto" style={{ minWidth: '180px' }}>
//                             <span className="badge bg-danger mb-1">Ưu đãi có hạn!</span>
//                             <div className="text-muted text-decoration-line-through small">{originalPrice.toLocaleString("vi-VN")} VND</div>
//                             <div className="fw-bold text-warning fs-5">{basePrice.toLocaleString("vi-VN")} VND</div>
//                             <div className="text-muted small mb-2">Chưa bao gồm thuế và phí</div>
//                             <button className="btn btn-primary fw-bold w-100" onClick={() => handleSelectRoom(room, basePrice, false)}>Chọn</button>
//                         </div>
//                     </div>
//                     {room.breakfastIncluded && (
//                         <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center border rounded p-3 mt-2">
//                             <div className="flex-grow-1">
//                                 <div className="fw-bold mb-2">Bao gồm bữa sáng</div>
//                                 <div className="text-muted small mb-1">{room.bedType?.name || 'Giường phù hợp'}</div>
//                             </div>
//                             <div className="mx-md-3 my-3 my-md-0 text-center">
//                                 <i className="bi bi-people-fill fs-4 text-primary"></i>
//                                 <div className="fw-bold">{room.maxAdults}</div>
//                             </div>
//                             <div className="text-md-end ms-md-auto" style={{ minWidth: '180px' }}>
//                                 <div className="fw-bold text-warning fs-5">{priceWithBreakfast.toLocaleString("vi-VN")} VND</div>
//                                 <div className="text-muted small mb-2">Chưa bao gồm thuế và phí</div>
//                                 <button className="btn btn-primary fw-bold w-100" onClick={() => handleSelectRoom(room, priceWithBreakfast, true)}>Chọn</button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default function HotelDetailPage() {
//     const { hotelId } = useParams();
//     const router = useRouter();

//     const [hotel, setHotel] = useState<HotelResponse | null>(null);
//     const [isPageLoading, setIsPageLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [hotelAmenities, setHotelAmenities] = useState<AmenityGroup[]>([]);

//     const [rooms, setRooms] = useState<Room[]>([]);
//     const [page, setPage] = useState(0);
//     const [hasMore, setHasMore] = useState(true);
//     const [isFetchingMore, setIsFetchingMore] = useState(false);
//     const [initialRoomsLoading, setInitialRoomsLoading] = useState(true);
//     const [roomsError, setRoomsError] = useState<string | null>(null);

//     const [activeTab, setActiveTab] = useState("overview");
//     const overviewRef = useRef<HTMLDivElement>(null);
//     const roomsSectionRef = useRef<HTMLDivElement>(null);
//     const locationRef = useRef<HTMLDivElement>(null);
//     const amenitiesRef = useRef<HTMLDivElement>(null);
//     const policyRef = useRef<HTMLDivElement>(null);
//     const reviewRef = useRef<HTMLDivElement>(null);
//     const tabLabels = [{ key: "overview", label: "Tổng quan" }, { key: "rooms", label: "Phòng" }, { key: "location", label: "Vị trí" }, { key: "amenities", label: "Tiện ích" }, { key: "policy", label: "Chính sách" }, { key: "review", label: "Đánh giá" }];
//     const tabRefs = tabLabels.map(() => useRef<HTMLButtonElement>(null));
//     const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
//     const priceDisplayOptions = ["Mỗi phòng mỗi đêm (chưa bao gồm thuế và phí)", "Mỗi phòng mỗi đêm (bao gồm thuế và phí)", "Tổng giá (chưa bao gồm thuế và phí)", "Tổng giá (bao gồm thuế và phí)"];
//     const [selectedPriceDisplay, setSelectedPriceDisplay] = useState(priceDisplayOptions[0]);

//     const loadMoreRooms = useCallback(async () => {
//         if (!hotelId) return;
//         setIsFetchingMore(true);
//         try {
//             const nextPage = page + 1;
//             const response = await hotelService.getRoomsByHotelId(hotelId as string, nextPage, 5);
//             setRooms(prev => [...prev, ...response.content]);
//             setPage(response.page);
//             setHasMore(!response.last);
//         } catch (error) {
//             console.error("Lỗi khi tải thêm phòng:", error);
//             setRoomsError("Có lỗi xảy ra khi tải thêm phòng.");
//         } finally {
//             setIsFetchingMore(false);
//         }
//     }, [page, hasMore, hotelId]);

//     const observer = useRef<IntersectionObserver | null>(null);
//     const lastRoomElementRef = useCallback((node: HTMLDivElement | null) => {
//         if (isFetchingMore) return;
//         if (observer.current) observer.current.disconnect();
//         if (typeof window !== 'undefined' && window.IntersectionObserver) {
//             observer.current = new IntersectionObserver(entries => {
//                 if (entries[0].isIntersecting && hasMore) {
//                     loadMoreRooms();
//                 }
//             });
//             if (node) observer.current.observe(node);
//         }
//     }, [isFetchingMore, hasMore, loadMoreRooms]);

//     useEffect(() => {
//         if (!hotelId) return;
//         const hotelIdStr = hotelId as string;
//         const fetchInitialData = async () => {
//             setIsPageLoading(true);
//             setInitialRoomsLoading(true);
//             setError(null);
//             setRoomsError(null);
//             try {
//                 const [hotelData, initialRoomsData] = await Promise.all([
//                     hotelService.getHotelById(hotelIdStr),
//                     hotelService.getRoomsByHotelId(hotelIdStr, 0, 5)
//                 ]);
//                 setHotel(hotelData);
//                 setRooms(initialRoomsData.content);
//                 setPage(initialRoomsData.page);
//                 setHasMore(!initialRoomsData.last);
//             } catch (err: any) {
//                 console.error("Lỗi khi tải dữ liệu ban đầu:", err);
//                 setError("Không thể tải thông tin khách sạn. Vui lòng thử lại sau.");
//             } finally {
//                 setIsPageLoading(false);
//                 setInitialRoomsLoading(false);
//             }
//         };
//         fetchInitialData();
//     }, [hotelId]);

//     const handleTabClick = (tab: string) => {
//         setActiveTab(tab);
//         const sectionRef = { overview: overviewRef, rooms: roomsSectionRef, location: locationRef, amenities: amenitiesRef, policy: policyRef, review: reviewRef }[tab] as React.RefObject<HTMLDivElement> | undefined;
//         if (sectionRef?.current) {
//             window.scrollTo({ top: sectionRef.current.offsetTop - 60, behavior: "smooth" });
//         }
//     };

//     const handleSelectRoom = (room: Room, price: number, includesBreakfast: boolean) => {
//         if (!hotelId) return;
//         const checkin = new Date().toISOString().split('T')[0];
//         const nights = 1;
//         const guests = room.maxAdults;
//         const params = new URLSearchParams({ hotelId: hotelId as string, roomId: room.id.toString(), roomName: room.name, price: price.toString(), checkin: checkin, nights: nights.toString(), guests: guests.toString(), breakfast: includesBreakfast.toString() });
//         router.push(`/booking?${params.toString()}`);
//     };

//     useEffect(() => {
//         const handleScroll = () => {
//             const sections = [{ tab: "overview", ref: overviewRef }, { tab: "rooms", ref: roomsSectionRef }, { tab: "location", ref: locationRef }, { tab: "amenities", ref: amenitiesRef }, { tab: "policy", ref: policyRef }, { tab: "review", ref: reviewRef }];
//             const scrollPosition = window.scrollY + 120;
//             let currentTab = "overview";
//             for (const section of sections) {
//                 if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
//                     currentTab = section.tab;
//                 }
//             }
//             setActiveTab(currentTab);
//         };
//         window.addEventListener("scroll", handleScroll, { passive: true });
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);

//     useEffect(() => {
//         const idx = tabLabels.findIndex(tab => tab.key === activeTab);
//         const btn = tabRefs[idx]?.current;
//         if (btn) {
//             const rect = btn.getBoundingClientRect();
//             const parentRect = btn.parentElement?.getBoundingClientRect();
//             if (parentRect) {
//                 setUnderlineStyle({ left: rect.left - parentRect.left, width: rect.width });
//             }
//         }
//     }, [activeTab, tabRefs]);

//     if (isPageLoading) return <div className="container py-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>;
//     if (error || !hotel) return <div className="container py-5"><div className="alert alert-danger" role="alert">{error || "Không tìm thấy khách sạn"}</div></div>;

//     const allPhotoUrls = hotel.photos.flatMap(cat => Array.isArray(cat.photos) ? cat.photos.map(p => p.url) : []);
//     const displayPhotos = allPhotoUrls.length > 0 ? allPhotoUrls : Array(5).fill("/placeholder.svg");

//     const demoAmenities = [
//         { icon: "bi bi-wifi", label: "WiFi" },
//         { icon: "bi bi-snow", label: "Máy lạnh" },
//         { icon: "bi bi-building", label: "Nhà hàng" },
//         { icon: "bi bi-clock", label: "Lễ tân 24h" },
//         { icon: "bi bi-elevator", label: "Thang máy" },
//         { icon: "bi bi-p-circle", label: "Chỗ đậu xe" },
//     ];

//     const demoNearby = [
//         { name: "Biển Mỹ Khê", distance: "868 m" },
//         { name: "Four Points by Sheraton Danang", distance: "2.65 km" },
//         { name: "Số 294 Trưng Nữ Vương", distance: "2.96 km" },
//         { name: "Khách sạn Mường Thanh Đà Nẵng", distance: "92 m" },
//         { name: "Apple Hotel", distance: "86 m" },
//     ];

//     const demoReview = {
//         score: hotel.averageScore ?? 8.7,
//         text: "Rất tốt",
//         count: 1071,
//         tags: [
//             { label: "Khoảng Cách Đến Trung Tâm", count: 46 },
//             { label: "Khu Vực Xung Quanh", count: 46 },
//             { label: "Không Gian Phòng", count: 38 },
//             { label: "Nhân Viên Thân Thiện", count: 35 },
//         ],
//         comment: "Nhân viên rất nhiệt tình, từ nhân viên buồng giúp hành lý, nhân viên lễ tân. Giải thích dễ hiểu, thân thiện. Phòng cảm ơn tốt, dọn dẹp sạch sẽ. Phòng rộng rãi, thoáng mát, tiện nghi.",
//         user: "L***e",
//         userScore: 8.4,
//     };

//     return (
//         <div style={{ background: '#f7f9fb', minHeight: '100vh' }}>
//             <style>{customStyles}</style>

//             {/* Thanh tìm kiếm màu xanh đậm */}
//             <div style={{ background: 'linear-gradient(90deg,#1e3c72 0,#2a5298 100%)', color: '#fff', padding: '30px 0 8px 0' }}>
//                 <div className="container d-flex align-items-center justify-content-between py-2">
//                     <div className="d-flex align-items-center gap-3">
//                         <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
//                             <i className="bi bi-geo-alt-fill me-2"></i>
//                             <span className="fw-bold">{hotel.name}</span>
//                         </div>
//                         <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
//                             <i className="bi bi-calendar-event me-2"></i>
//                             <span>20 thg 10 - 21 thg 10, 1 đêm</span>
//                         </div>
//                         <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
//                             <i className="bi bi-person me-2"></i>
//                             <span>2 người lớn, 1 phòng</span>
//                         </div>
//                     </div>
//                     <div>
//                         <button className="btn btn-light fw-bold px-4">
//                             <i className="bi bi-search me-2"></i>
//                             Tìm khách sạn
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="sticky-tab-bar">
//                 <div className="container">
//                     <div className="tab-list" style={{ position: "relative" }}>
//                         {tabLabels.map((tab, idx) => (
//                             <button key={tab.key} ref={tabRefs[idx]} className={`tab-item${activeTab === tab.key ? " active" : ""}`} onClick={() => handleTabClick(tab.key)} type="button">
//                                 {tab.label}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             <div ref={overviewRef} className="container mt-4">
//                 <div className="row g-2">
//                     <div className="col-md-7">
//                         <div style={{ borderRadius: '16px', overflow: 'hidden', width: '100%', height: '320px' }}>
//                             <Image src={displayPhotos[0]} width={700} height={320} alt="Hotel main photo" style={{ objectFit: 'cover', width: '100%', height: '100%' }} priority />
//                         </div>
//                     </div>
//                     <div className="col-md-5">
//                         <div className="row g-2" style={{ minHeight: '320px' }}>
//                             {displayPhotos.slice(1, 5).map((url, idx) => (
//                                 <div key={idx} className="col-6">
//                                     <div style={{ borderRadius: '10px', overflow: 'hidden', width: '100%', height: '154px' }}>
//                                         <Image src={url} width={200} height={154} alt={`Hotel side photo ${idx + 1}`} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="container" style={{ marginTop: '32px', position: 'relative', zIndex: 2 }}>
//                 <div className="row gx-4 gy-4">
//                     <div className="col-lg-8">
//                         <div className="card shadow-lg p-4 mb-4" style={{ borderRadius: '18px', background: '#fff' }}>
//                             <div className="d-flex align-items-center mb-2">
//                                 <span className="badge bg-primary me-2">Khách Sạn</span>
//                                 {hotel.starRating > 0 && <span className="text-warning fw-bold">{'★'.repeat(hotel.starRating)}</span>}
//                                 <span className="ms-3 fw-bold fs-4 text-dark">{hotel.name}</span>
//                             </div>
//                             <div className="mb-2">
//                                 <span className="fw-bold">Địa chỉ:</span> {getFullAddress(hotel)}
//                             </div>
//                             <div className="mb-2 d-flex align-items-center flex-wrap">
//                                 <span className="fw-bold">Giá phòng/đêm từ:</span>
//                                 <span className="text-danger fw-bold ms-2">{(hotel.currentPricePerNight ?? 0).toLocaleString("vi-VN")} VND</span>
//                                 {(hotel.rawPricePerNight > hotel.currentPricePerNight) && (<span className="text-muted text-decoration-line-through ms-2">{(hotel.rawPricePerNight ?? 0).toLocaleString("vi-VN")} VND</span>)}
//                                 <button className="btn btn-warning btn-lg fw-bold px-4 ms-3 mt-2 mt-lg-0" onClick={() => handleTabClick('rooms')}>Chọn phòng</button>
//                             </div>
//                             <div className="mb-2" ref={amenitiesRef}>
//                                 <span className="fw-bold">Tiện ích chính:</span>
//                                 <div className="d-flex flex-wrap mt-2">
//                                     {demoAmenities.map((item, idx) => (
//                                         <span key={idx} className="me-3 mb-2 d-flex align-items-center">
//                                             <i className={`${item.icon} text-primary me-2`} style={{ fontSize: "1.1rem" }}></i>
//                                             <span className="text-dark small fw-semibold">{item.label}</span>
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                         {/* Card Review */}
//                         <div ref={reviewRef} className="card shadow p-4 mb-4" style={{ borderRadius: '16px', background: '#fff' }}>
//                             <div className="d-flex align-items-center mb-2">
//                                 <span className="fs-2 fw-bold text-primary">{demoReview.score}</span>
//                                 <span className="ms-2 fw-bold">{demoReview.text}</span>
//                                 <span className="ms-2 text-muted">{demoReview.count} đánh giá</span>
//                             </div>
//                             <div className="mb-2">
//                                 {demoReview.tags.map((tag, idx) => (
//                                     <span key={idx} className="badge bg-info text-dark me-2 mb-2">{tag.label} ({tag.count})</span>
//                                 ))}
//                             </div>
//                             <div className="bg-light p-3 rounded">
//                                 <span className="fw-bold">{demoReview.user}</span>
//                                 <span className="badge bg-primary ms-2">{demoReview.userScore}/10</span>
//                                 <p className="mb-0 mt-2 text-dark">{demoReview.comment}</p>
//                             </div>
//                         </div>
//                         {/* Card Mô tả */}
//                         <div className="card shadow p-4" style={{ borderRadius: '16px', background: '#fff' }}>
//                             <h5 className="fw-bold mb-2">Mô tả khách sạn</h5>
//                             <p className="mb-0 text-dark">{hotel.description}</p>
//                         </div>
//                     </div>
//                     <div className="col-lg-4">
//                         <div className="card shadow-lg p-4 mb-4" style={{ borderRadius: '18px', background: '#fff' }}>
//                             <h5 className="fw-bold mb-3">Trong khu vực</h5>
//                             <ul className="list-unstyled mb-0">
//                                 {demoNearby.map((item, idx) => (
//                                     <li key={idx} className="mb-2 d-flex align-items-center">
//                                         <i className="bi bi-geo-alt text-primary me-2"></i>
//                                         <span className="fw-semibold">{item.name}</span>
//                                         <span className="ms-auto text-muted">{item.distance}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div ref={roomsSectionRef} className="container mb-5">
//                 <h4 className="fw-bold mb-3 text-dark pt-4">Những phòng còn trống tại {hotel.name}</h4>
//                 <div className="mb-3">
//                     <div style={{ background: "#0070f3", color: "#fff", borderRadius: "8px", padding: "10px 18px", fontWeight: 500, fontSize: "16px" }}>
//                         10. Travel Sale giảm đến 50% độc quyền trên App!
//                     </div>
//                 </div>
//                 <div className="bg-white p-4 mb-3" style={{ borderBottom: '1px solid #e3e6ea' }}>
//                     <h5 className="fw-bold mb-3 text-dark">Tìm kiếm nhanh hơn bằng cách chọn những tiện nghi bạn cần</h5>
//                     <div className="row align-items-start">
//                         <div className="col-lg-4 col-md-6">
//                             <label className="custom-checkbox-wrapper">Miễn phí hủy phòng
//                                 <input type="checkbox" />
//                                 <span className="checkmark"></span>
//                             </label>
//                             <label className="custom-checkbox-wrapper">Thanh toán gần ngày đến ở
//                                 <input type="checkbox" />
//                                 <span className="checkmark"></span>
//                                 <div className="text-muted" style={{ fontSize: '12px', marginLeft: '28px', marginTop: '-8px' }}>Không cần thanh toán ngay hôm nay</div>
//                             </label>
//                             <label className="custom-checkbox-wrapper">Thanh Toán Tại Khách Sạn <i className="bi bi-info-circle ms-1"></i>
//                                 <input type="checkbox" />
//                                 <span className="checkmark"></span>
//                             </label>
//                         </div>
//                         <div className="col-lg-4 col-md-6 text-dark">
//                             <label className="custom-checkbox-wrapper">Giường lớn <i className="bi bi-info-circle ms-1"></i>
//                                 <input type="checkbox" />
//                                 <span className="checkmark"></span>
//                             </label>
//                             <label className="custom-checkbox-wrapper">Miễn phí bữa sáng
//                                 <input type="checkbox" />
//                                 <span className="checkmark"></span>
//                             </label>
//                         </div>
//                         <div className="col-lg-4 col-md-12 mt-3 mt-lg-0">
//                             <div className="fw-semibold text-dark small mb-1">Hiển thị giá</div>
//                             <div className="dropdown">
//                                 <a className="dropdown-toggle text-primary text-decoration-none fw-semibold small" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
//                                     {selectedPriceDisplay}
//                                 </a>
//                                 <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="priceDisplayDropdown">
//                                     {priceDisplayOptions.map((option, index) => (
//                                         <li key={index}>
//                                             <a className={`dropdown-item ${selectedPriceDisplay === option ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setSelectedPriceDisplay(option); }}>
//                                                 {selectedPriceDisplay === option ? <i className="bi bi-check-circle-fill text-primary me-2"></i> : <i className="bi bi-circle me-2" style={{ visibility: 'hidden' }}></i>}
//                                                 {option}
//                                             </a>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 {initialRoomsLoading ? (
//                     <div className="text-center p-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
//                 ) : roomsError ? (
//                     <div className="alert alert-danger text-center" role="alert">{roomsError}</div>
//                 ) : rooms.length === 0 ? (
//                     <div className="alert alert-info text-center" role="alert">Khách sạn này hiện không có phòng nào khả dụng.</div>
//                 ) : (
//                     <div>
//                         {rooms.map((room, index) => {
//                             if (rooms.length === index + 1) {
//                                 return <RoomCard key={room.id} room={room} handleSelectRoom={handleSelectRoom} innerRef={lastRoomElementRef} />
//                             } else {
//                                 return <RoomCard key={room.id} room={room} handleSelectRoom={handleSelectRoom} />
//                             }
//                         })}
//                         {isFetchingMore && (
//                             <div className="text-center p-4">
//                                 <div className="spinner-border text-primary" role="status">
//                                     <span className="visually-hidden">Đang tải thêm...</span>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }







"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { hotelService, HotelResponse, Room, AmenityGroup } from "@/service/hotelService";

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

// << HÀM MỚI: ĐỂ ĐỊNH DẠNG NGÀY THÁNG >>
const formatDateForDisplay = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // JavaScript tháng bắt đầu từ 0
    return `${day} thg ${month}`;
};

const customStyles = `
    /* --- Checkbox --- */
    .custom-checkbox-wrapper { 
        position: relative !important; 
        padding-left: 28px !important; 
        cursor: pointer !important; 
        font-size: 14px !important; 
        color: #333 !important; 
        user-select: none !important; 
        display: block !important; 
        margin-bottom: 12px !important; 
    }
    .custom-checkbox-wrapper input { 
        position: absolute !important; 
        opacity: 0 !important; 
        cursor: pointer !important; 
        height: 0 !important; 
        width: 0 !important; 
    }
    .checkmark { 
        position: absolute !important; 
        top: 0 !important; 
        left: 0 !important; 
        height: 18px !important; 
        width: 18px !important; 
        background-color: #fff !important; 
        border: 1px solid #ced4da !important; 
        border-radius: 4px !important; 
    }
    .custom-checkbox-wrapper:hover input ~ .checkmark { 
        border-color: #007bff !important; 
    }
    .custom-checkbox-wrapper input:checked ~ .checkmark { 
        background-color: #0d6efd !important; 
        border-color: #0d6efd !important; 
    }
    .checkmark:after { 
        content: "" !important; 
        position: absolute !important; 
        display: none !important; 
    }
    .custom-checkbox-wrapper input:checked ~ .checkmark:after { 
        display: block !important; 
    }
    .custom-checkbox-wrapper .checkmark:after { 
        left: 6px !important; 
        top: 2px !important; 
        width: 5px !important; 
        height: 10px !important; 
        border: solid white !important; 
        border-width: 0 2px 2px 0 !important; 
        transform: rotate(45deg) !important; 
    }

    /* --- Sticky Tab --- */
    .sticky-tab-bar {
        position: sticky !important;
        top: 0 !important;
        background: #fff !important;
        z-index: 1000 !important;
        border-bottom: 2px solid #e3e6ea !important;
    }

    .sticky-tab-bar .tab-item {
        cursor: pointer !important;
        font-weight: bold !important;
        padding: 0 18px !important;
        height: 48px !important;
        display: inline-flex !important;
        align-items: center !important;
        color: #6c757d !important;
        border: none !important;
        background: none !important;
        outline: none !important;
        font-size: 16px !important;
        transition: color 0.2s !important;
    }

    .sticky-tab-bar .tab-item.active {
        color: #1565c0 !important;
        border-bottom: 3px solid #1565c0 !important;
        background: none !important;
    }

    .sticky-tab-bar .tab-item:not(.active):hover {
        color: #0070f3 !important;
    }
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

    const [hotel, setHotel] = useState<HotelResponse | null>(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [initialRoomsLoading, setInitialRoomsLoading] = useState(true);
    const [roomsError, setRoomsError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState("overview");
    const isScrollingByClick = useRef(false);
    const overviewRef = useRef<HTMLDivElement>(null);
    const roomsSectionRef = useRef<HTMLDivElement>(null);
    const locationRef = useRef<HTMLDivElement>(null);
    const amenitiesRef = useRef<HTMLDivElement>(null);
    const policyRef = useRef<HTMLDivElement>(null);
    const reviewRef = useRef<HTMLDivElement>(null);
    const tabLabels = [{ key: "overview", label: "Tổng quan" }, { key: "rooms", label: "Phòng" }, { key: "location", label: "Vị trí" }, { key: "amenities", label: "Tiện ích" }, { key: "policy", label: "Chính sách" }, { key: "review", label: "Đánh giá" }];
    const tabRefs = tabLabels.map(() => useRef<HTMLButtonElement>(null));
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
    const priceDisplayOptions = ["Mỗi phòng mỗi đêm (chưa bao gồm thuế và phí)", "Mỗi phòng mỗi đêm (bao gồm thuế và phí)", "Tổng giá (chưa bao gồm thuế và phí)", "Tổng giá (bao gồm thuế và phí)"];
    const [selectedPriceDisplay, setSelectedPriceDisplay] = useState(priceDisplayOptions[0]);

    const loadMoreRooms = useCallback(async () => {
        if (!hotelId) return;
        setIsFetchingMore(true);
        try {
            const nextPage = page + 1;
            const response = await hotelService.getRoomsByHotelId(hotelId as string, nextPage, 5);
            setRooms(prev => [...prev, ...response.content]);
            setPage(response.page);
            setHasMore(!response.last);
        } catch (error) {
            console.error("Lỗi khi tải thêm phòng:", error);
            setRoomsError("Có lỗi xảy ra khi tải thêm phòng.");
        } finally {
            setIsFetchingMore(false);
        }
    }, [page, hasMore, hotelId]);

    const observer = useRef<IntersectionObserver | null>(null);
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
        if (!hotelId) return;
        const hotelIdStr = hotelId as string;
        const fetchInitialData = async () => {
            setIsPageLoading(true);
            setInitialRoomsLoading(true);
            setError(null);
            setRoomsError(null);
            try {
                const [hotelData, initialRoomsData] = await Promise.all([
                    hotelService.getHotelById(hotelIdStr),
                    hotelService.getRoomsByHotelId(hotelIdStr, 0, 5)
                ]);
                setHotel(hotelData);
                setRooms(initialRoomsData.content);
                setPage(initialRoomsData.page);
                setHasMore(!initialRoomsData.last);
            } catch (err: any) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", err);
                setError("Không thể tải thông tin khách sạn. Vui lòng thử lại sau.");
            } finally {
                setIsPageLoading(false);
                setInitialRoomsLoading(false);
            }
        };
        fetchInitialData();
    }, [hotelId]);

    const handleTabClick = (tab: string) => {
        isScrollingByClick.current = true;
        setActiveTab(tab);
        const sectionRef = { overview: overviewRef, rooms: roomsSectionRef, location: locationRef, amenities: amenitiesRef, policy: policyRef, review: reviewRef }[tab] as React.RefObject<HTMLDivElement> | undefined;
        if (sectionRef?.current) {
            window.scrollTo({ top: sectionRef.current.offsetTop - 60, behavior: "smooth" });
            setTimeout(() => { isScrollingByClick.current = false; }, 1000);
        }
    };

    const handleScrollSync = useCallback(() => {
        if (isScrollingByClick.current) return;
        const sections = [{ tab: "overview", ref: overviewRef }, { tab: "rooms", ref: roomsSectionRef }, { tab: "location", ref: locationRef }, { tab: "amenities", ref: amenitiesRef }, { tab: "policy", ref: policyRef }, { tab: "review", ref: reviewRef }];
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
        if (!hotelId) return;
        const checkin = new Date().toISOString().split('T')[0];
        const nights = 1;
        const guests = room.maxAdults;
        const params = new URLSearchParams({ hotelId: hotelId as string, roomId: room.id.toString(), roomName: room.name, price: price.toString(), checkin: checkin, nights: nights.toString(), guests: guests.toString(), breakfast: includesBreakfast.toString() });
        router.push(`/booking?${params.toString()}`);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScrollSync, { passive: true });
        return () => { window.removeEventListener("scroll", handleScrollSync); };
    }, [handleScrollSync]);

    useEffect(() => {
        const idx = tabLabels.findIndex(tab => tab.key === activeTab);
        const btn = tabRefs[idx]?.current;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const parentRect = btn.parentElement?.getBoundingClientRect();
            if (parentRect) {
                setUnderlineStyle({ left: rect.left - parentRect.left, width: rect.width });
            }
        }
    }, [activeTab]);

    if (isPageLoading) return <div className="container py-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>;
    if (error || !hotel) return <div className="container py-5"><div className="alert alert-danger" role="alert">{error || "Không tìm thấy khách sạn"}</div></div>;

    const allPhotoUrls = hotel.photos.flatMap(cat => Array.isArray(cat.photos) ? cat.photos.map(p => p.url) : []);
    const displayPhotos = allPhotoUrls.length > 0 ? allPhotoUrls : Array(5).fill("/placeholder.svg");

    const demoAmenities = [{ icon: "bi bi-wifi", label: "WiFi" }, { icon: "bi bi-snow", label: "Máy lạnh" }, { icon: "bi bi-building", label: "Nhà hàng" }, { icon: "bi bi-clock", label: "Lễ tân 24h" }, { icon: "bi bi-elevator", label: "Thang máy" }, { icon: "bi bi-p-circle", label: "Chỗ đậu xe" }];
    const demoNearby = [{ name: "Biển Mỹ Khê", distance: "868 m" }, { name: "Four Points by Sheraton Danang", distance: "2.65 km" }, { name: "Số 294 Trưng Nữ Vương", distance: "2.96 km" }, { name: "Khách sạn Mường Thanh Đà Nẵng", distance: "92 m" }, { name: "Apple Hotel", distance: "86 m" }];
    const demoReview = { score: hotel.averageScore ?? 8.7, text: "Rất tốt", count: 1071, tags: [{ label: "Khoảng Cách Đến Trung Tâm", count: 46 }, { label: "Khu Vực Xung Quanh", count: 46 }, { label: "Không Gian Phòng", count: 38 }, { label: "Nhân Viên Thân Thiện", count: 35 }], comment: "Nhân viên rất nhiệt tình...", user: "L***e", userScore: 8.4 };

    // << LOGIC MỚI: TẠO CHUỖI NGÀY THÁNG ĐỘNG >>
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dateDisplayString = `${formatDateForDisplay(today)} - ${formatDateForDisplay(tomorrow)}, 1 đêm`;

    return (
        <div style={{ background: '#f7f9fb', minHeight: '100vh' }}>
            <style>{customStyles}</style>
            <div style={{ background: 'linear-gradient(90deg,#1e3c72 0,#2a5298 100%)', color: '#fff', padding: '30px 0 8px 0' }}>
                <div className="container d-flex align-items-center justify-content-between py-2">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
                            <i className="bi bi-geo-alt-fill me-2"></i>
                            <span className="fw-bold">{hotel.name}</span>
                        </div>
                        <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
                            <i className="bi bi-calendar-event me-2"></i>
                            {/* << THAY THẾ CHUỖI TĨNH BẰNG BIẾN ĐỘNG >> */}
                            <span>{dateDisplayString}</span>
                        </div>
                        {/* <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
                            <i className="bi bi-person me-2"></i>
                            <span>2 người lớn, 1 phòng</span>
                        </div> */}
                    </div>
                    <div>
                        <button
                            className="btn btn-light fw-bold px-4"
                            onClick={() => router.push('/hotels')}
                        >
                            <i className="bi bi-search me-2"></i>
                            Tìm khách sạn
                        </button>
                    </div>
                </div>
            </div>
            <div className="sticky-tab-bar">
                <div className="container">
                    <div className="tab-list" style={{ position: "relative" }}>
                        {tabLabels.map((tab, idx) => (
                            <button key={tab.key} ref={tabRefs[idx]} className={`tab-item${activeTab === tab.key ? " active" : ""}`} onClick={() => handleTabClick(tab.key)} type="button">
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
            </div>
            <div className="container" style={{ marginTop: '32px', position: 'relative', zIndex: 2 }}>
                <div className="row gx-4 gy-4">
                    <div className="col-lg-8">
                        <div className="card shadow-lg p-4 mb-4" style={{ borderRadius: '18px', background: '#fff' }}>
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
                                <span className="text-danger fw-bold ms-2">{(hotel.currentPricePerNight ?? 0).toLocaleString("vi-VN")} VND</span>
                                {(hotel.rawPricePerNight > hotel.currentPricePerNight) && (<span className="text-muted text-decoration-line-through ms-2">{(hotel.rawPricePerNight ?? 0).toLocaleString("vi-VN")} VND</span>)}
                                <button className="btn btn-warning btn-lg fw-bold px-4 ms-3 mt-2 mt-lg-0" onClick={() => handleTabClick('rooms')}>Chọn phòng</button>
                            </div>
                            <div className="mb-2" ref={amenitiesRef}>
                                <span className="fw-bold">Tiện ích chính:</span>
                                <div className="d-flex flex-wrap mt-2">
                                    {demoAmenities.map((item, idx) => (
                                        <span key={idx} className="me-3 mb-2 d-flex align-items-center">
                                            <i className={`${item.icon} text-primary me-2`} style={{ fontSize: "1.1rem" }}></i>
                                            <span className="text-dark small fw-semibold">{item.label}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div ref={reviewRef} className="card shadow p-4 mb-4" style={{ borderRadius: '16px', background: '#fff' }}>
                            <div className="d-flex align-items-center mb-2">
                                <span className="fs-2 fw-bold text-primary">{demoReview.score}</span>
                                <span className="ms-2 fw-bold">{demoReview.text}</span>
                                <span className="ms-2 text-muted">{demoReview.count} đánh giá</span>
                            </div>
                            <div className="mb-2">
                                {demoReview.tags.map((tag, idx) => (
                                    <span key={idx} className="badge bg-info text-dark me-2 mb-2">{tag.label} ({tag.count})</span>
                                ))}
                            </div>
                            <div className="bg-light p-3 rounded">
                                <span className="fw-bold">{demoReview.user}</span>
                                <span className="badge bg-primary ms-2">{demoReview.userScore}/10</span>
                                <p className="mb-0 mt-2 text-dark">{demoReview.comment}</p>
                            </div>
                        </div>
                        <div className="card shadow p-4" style={{ borderRadius: '16px', background: '#fff' }}>
                            <h5 className="fw-bold mb-2">Mô tả khách sạn</h5>
                            <p className="mb-0 text-dark">{hotel.description}</p>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card shadow-lg p-4 mb-4" style={{ borderRadius: '18px', background: '#fff' }}>
                            <h5 className="fw-bold mb-3">Trong khu vực</h5>
                            <ul className="list-unstyled mb-0">
                                {demoNearby.map((item, idx) => (
                                    <li key={idx} className="mb-2 d-flex align-items-center">
                                        <i className="bi bi-geo-alt text-primary me-2"></i>
                                        <span className="fw-semibold">{item.name}</span>
                                        <span className="ms-auto text-muted">{item.distance}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div ref={roomsSectionRef} className="container mb-5">
                <h4 className="fw-bold mb-3 text-dark pt-4">Những phòng còn trống tại {hotel.name}</h4>
                <div className="mb-3">
                    <div style={{ background: "#0070f3", color: "#fff", borderRadius: "8px", padding: "10px 18px", fontWeight: 500, fontSize: "16px" }}>
                        10. Travel Sale giảm đến 50% độc quyền trên App!
                    </div>
                </div>
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
                    <div className="text-center p-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
                ) : roomsError ? (
                    <div className="alert alert-danger text-center" role="alert">{roomsError}</div>
                ) : rooms.length === 0 ? (
                    <div className="alert alert-info text-center" role="alert">Khách sạn này hiện không có phòng nào khả dụng.</div>
                ) : (
                    <div>
                        {rooms.map((room, index) => {
                            if (rooms.length === index + 1) {
                                return <RoomCard key={room.id} room={room} handleSelectRoom={handleSelectRoom} innerRef={lastRoomElementRef} />
                            } else {
                                return <RoomCard key={room.id} room={room} handleSelectRoom={handleSelectRoom} />
                            }
                        })}
                        {isFetchingMore && (
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải thêm...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}