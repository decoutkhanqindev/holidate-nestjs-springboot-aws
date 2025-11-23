// 'use client';

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useParams, useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import DatePicker, { registerLocale } from 'react-datepicker';
// import { vi } from 'date-fns/locale/vi';
// import 'react-datepicker/dist/react-datepicker.css';

// import { hotelService, HotelResponse, Room, PaginatedData, RoomDetailResponse } from "@/service/hotelService";
// import { getReviews, GetReviewsParams } from "@/service/reviewService";
// import { bookingService, BookingResponse } from "@/service/bookingService";
// import GuestPicker from '@/components/DateSupport/GuestPicker';
// import ReviewsList from '@/components/Review/ReviewsList';
// import CreateReviewForm from '@/components/Review/CreateReviewForm';
// import type { Review } from '@/types';
// import styles from './HotelDetailPage.module.css';

// registerLocale('vi', vi);

// // --- HÀM TIỆN ÍCH (GIỮ NGUYÊN) ---
// const getFullAddress = (hotel: HotelResponse) => {
//     return [
//         hotel.address,
//         hotel.street?.name,
//         hotel.ward?.name,
//         hotel.district?.name,
//         hotel.city?.name
//     ].filter(Boolean).join(', ');
// };

// const formatDateForDisplay = (checkin: Date, nights: number): string => {
//     try {
//         const checkoutDate = new Date(checkin);
//         checkoutDate.setDate(checkin.getDate() + nights);
//         const format = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
//         return `${format(checkin)} - ${format(checkoutDate)}, ${nights} đêm`;
//     } catch (e) {
//         const today = new Date();
//         const tomorrow = new Date(today);
//         tomorrow.setDate(today.getDate() + 1);
//         return `${today.getDate()} thg ${today.getMonth() + 1} - ${tomorrow.getDate()} thg ${tomorrow.getMonth() + 1}, 1 đêm`;
//     }
// };

// const formatDistance = (distanceInMeters: number) => {
//     if (distanceInMeters < 1000) {
//         return `${distanceInMeters} m`;
//     }
//     return `${(distanceInMeters / 1000).toFixed(2)} km`;
// };

// const customStylesForPage = `
//     .sticky-tab-bar { position: sticky !important; top: 0 !important; background: #fff !important; z-index: 1000 !important; border-bottom: 2px solid #e3e6ea !important; }
//     .sticky-tab-bar .tab-item { cursor: pointer !important; font-weight: bold !important; padding: 0 18px !important; height: 48px !important; display: inline-flex !important; align-items: center !important; color: #6c757d !important; border: none !important; background: none !important; outline: none !important; font-size: 16px !important; transition: color 0.2s !important; }
//     .sticky-tab-bar .tab-item.active { color: #1565c0 !important; border-bottom: 3px solid #1565c0 !important; background: none !important; }
//     .sticky-tab-bar .tab-item:not(.active):hover { color: #0070f3 !important; }
// `;

// // --- COMPONENT ROOM DETAIL MODAL ---
// function RoomDetailModal({
//     room,
//     isOpen,
//     onClose,
//     onSelectRoom
// }: {
//     room: RoomDetailResponse | null;
//     isOpen: boolean;
//     onClose: () => void;
//     onSelectRoom: (room: Room, price: number, includesBreakfast: boolean) => void;
// }) {
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);

//     if (!isOpen || !room) return null;

//     const allPhotos = room.photos?.flatMap(cat => cat.photos.map(p => p.url)) || [];
//     const currentPhoto = allPhotos[currentImageIndex] || "/placeholder.svg";
//     const totalPhotos = allPhotos.length;

//     const basePrice = room.basePricePerNight ?? 0;
//     const currentPrice = room.currentPricePerNight ?? basePrice;
//     const hasDiscount = currentPrice < basePrice && basePrice > 0;
//     const discountPercentage = hasDiscount ? Math.round((1 - currentPrice / basePrice) * 100) : 0;

//     // Lấy tất cả amenities của phòng
//     const roomAmenitiesFlat = room.amenities?.flatMap(group => group.amenities) || [];

//     // Tính năng phòng
//     const features: { name: string; icon: string }[] = [];
//     if (room.wifiAvailable) features.push({ name: "WiFi", icon: "wifi" });
//     if (room.smokingAllowed) features.push({ name: "Hút thuốc", icon: "smoking" });

//     // Kiểm tra amenities để tìm các tính năng đặc biệt
//     const featureMap: { [key: string]: { name: string; icon: string } } = {
//         'Máy lạnh': { name: 'Máy lạnh', icon: 'snow' },
//         'Tủ lạnh': { name: 'Tủ lạnh', icon: 'box' },
//         'Nước nóng': { name: 'Nước nóng', icon: 'droplet-fill' },
//         'Vòi tắm đứng': { name: 'Vòi tắm đứng', icon: 'droplet' },
//         'WiFi': { name: 'WiFi', icon: 'wifi' },
//         'TV': { name: 'TV', icon: 'tv' },
//     };

//     roomAmenitiesFlat.forEach(amenity => {
//         const feature = featureMap[amenity.name];
//         if (feature && !features.find(f => f.name === feature.name)) {
//             features.push(feature);
//         }
//     });

//     // Tiện ích phòng (amenities) - loại bỏ những cái đã hiển thị ở tính năng
//     const featureNames = features.map(f => f.name);
//     const roomAmenities = roomAmenitiesFlat.filter(amenity =>
//         !featureNames.includes(amenity.name)
//     );

//     const nextImage = () => {
//         setCurrentImageIndex((prev) => (prev + 1) % totalPhotos);
//     };

//     const prevImage = () => {
//         setCurrentImageIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
//     };

//     const selectImage = (index: number) => {
//         setCurrentImageIndex(index);
//     };

//     return (
//         <div
//             className="modal fade show d-block"
//             style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
//             onClick={onClose}
//         >
//             <div
//                 className="modal-dialog modal-dialog-centered"
//                 style={{ maxWidth: '1100px', width: '90%', maxHeight: '90vh' }}
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 <div className="modal-content" style={{ maxHeight: '90vh', borderRadius: '8px', overflow: 'hidden' }}>
//                     {/* Header */}
//                     <div className="modal-header border-bottom py-3 px-4">
//                         <h5 className="modal-title fw-bold mb-0">{room.name}</h5>
//                         <button
//                             type="button"
//                             className="btn-close"
//                             onClick={onClose}
//                             aria-label="Close"
//                         ></button>
//                     </div>

//                     <div className="modal-body p-0" style={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}>
//                         <div className="row g-0">
//                             {/* Left: Image Gallery */}
//                             <div className="col-lg-7">
//                                 <div className="position-relative" style={{ height: '400px', backgroundColor: '#f5f5f5' }}>
//                                     {totalPhotos > 0 && (
//                                         <>
//                                             <Image
//                                                 src={currentPhoto}
//                                                 alt={room.name}
//                                                 fill
//                                                 style={{ objectFit: 'cover' }}
//                                             />
//                                             {totalPhotos > 1 && (
//                                                 <>
//                                                     <button
//                                                         className="btn btn-light btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle"
//                                                         onClick={prevImage}
//                                                         style={{ zIndex: 10, width: '40px', height: '40px', padding: 0 }}
//                                                     >
//                                                         <i className="bi bi-chevron-left"></i>
//                                                     </button>
//                                                     <button
//                                                         className="btn btn-light btn-sm position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle"
//                                                         onClick={nextImage}
//                                                         style={{ zIndex: 10, width: '40px', height: '40px', padding: 0 }}
//                                                     >
//                                                         <i className="bi bi-chevron-right"></i>
//                                                     </button>
//                                                 </>
//                                             )}
//                                         </>
//                                     )}
//                                 </div>

//                                 {/* Thumbnail Gallery */}
//                                 {totalPhotos > 1 && (
//                                     <div className="p-2 bg-white border-top">
//                                         <div className="d-flex gap-2 overflow-auto pb-1">
//                                             {allPhotos.map((photo, index) => (
//                                                 <div
//                                                     key={index}
//                                                     className={`flex-shrink-0 rounded ${index === currentImageIndex ? 'border border-primary border-2' : 'opacity-50'}`}
//                                                     style={{ cursor: 'pointer', width: '70px', height: '50px', overflow: 'hidden' }}
//                                                     onClick={() => selectImage(index)}
//                                                 >
//                                                     <Image
//                                                         src={photo}
//                                                         alt={`${room.name} ${index + 1}`}
//                                                         width={70}
//                                                         height={50}
//                                                         style={{ objectFit: 'cover', width: '100%', height: '100%' }}
//                                                     />
//                                                 </div>
//                                             ))}
//                                         </div>
//                                         <div className="text-center mt-1 small text-muted">
//                                             {currentImageIndex + 1} / {totalPhotos}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Right: Room Info */}
//                             <div className="col-lg-5 border-start">
//                                 <div className="p-4" style={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}>
//                                     {/* Thông tin phòng */}
//                                     <div className="mb-3">
//                                         <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Thông tin phòng</h6>
//                                         <div className="d-flex gap-3">
//                                             {room.area > 0 && (
//                                                 <div className="d-flex align-items-center gap-2">
//                                                     <i className="bi bi-rulers text-primary" style={{ fontSize: '18px' }}></i>
//                                                     <span style={{ fontSize: '14px' }}>{room.area} m²</span>
//                                                 </div>
//                                             )}
//                                             <div className="d-flex align-items-center gap-2">
//                                                 <i className="bi bi-people-fill text-primary" style={{ fontSize: '18px' }}></i>
//                                                 <span style={{ fontSize: '14px' }}>{room.maxAdults} khách</span>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Tính năng phòng */}
//                                     {features.length > 0 && (
//                                         <div className="mb-3">
//                                             <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Tính năng phòng bạn thích</h6>
//                                             <div className="d-flex flex-wrap gap-3">
//                                                 {features.map((feature, idx) => (
//                                                     <div key={idx} className="d-flex align-items-center gap-2">
//                                                         <i className={`bi bi-${feature.icon} text-primary`} style={{ fontSize: '16px' }}></i>
//                                                         <span style={{ fontSize: '13px' }}>{feature.name}</span>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Tiện ích phòng */}
//                                     {roomAmenities.length > 0 && (
//                                         <div className="mb-3">
//                                             <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Tiện nghi phòng</h6>
//                                             <div className="row g-2">
//                                                 {roomAmenities.slice(0, 6).map((amenity) => (
//                                                     <div key={amenity.id} className="col-6">
//                                                         <div className="d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
//                                                             <i className="bi bi-check-circle text-success" style={{ fontSize: '14px' }}></i>
//                                                             <span className="text-truncate">{amenity.name}</span>
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                             {roomAmenities.length > 6 && (
//                                                 <a href="#" className="text-primary small mt-2 d-inline-block" style={{ fontSize: '12px' }}>
//                                                     Xem thêm
//                                                 </a>
//                                             )}
//                                         </div>
//                                     )}

//                                     {/* Giá phòng */}
//                                     <div className="mt-4 pt-3 border-top">
//                                         <div className="mb-3">
//                                             <span className="text-muted" style={{ fontSize: '13px' }}>Khởi điểm từ:</span>
//                                             {hasDiscount && (
//                                                 <span className="badge bg-success ms-2" style={{ fontSize: '11px' }}>-{discountPercentage}%</span>
//                                             )}
//                                             {hasDiscount && (
//                                                 <div className="text-muted text-decoration-line-through" style={{ fontSize: '12px', marginTop: '4px' }}>
//                                                     {basePrice.toLocaleString("vi-VN")} VND
//                                                 </div>
//                                             )}
//                                             <div className="fw-bold text-primary mt-1" style={{ fontSize: '20px' }}>
//                                                 {currentPrice.toLocaleString("vi-VN")} VND / phòng / đêm
//                                             </div>
//                                         </div>
//                                         <button
//                                             className="btn btn-primary w-100 fw-bold"
//                                             style={{ fontSize: '14px', padding: '10px' }}
//                                             onClick={() => {
//                                                 onSelectRoom(room, currentPrice, false);
//                                                 onClose();
//                                             }}
//                                         >
//                                             Thêm lựa chọn phòng
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // --- COMPONENT ROOMCARD (GIỮ NGUYÊN) ---
// function RoomCard({ room, handleSelectRoom, onViewDetail, innerRef }: {
//     room: Room;
//     handleSelectRoom: (room: Room, price: number, includesBreakfast: boolean) => void;
//     onViewDetail: (room: Room) => void;
//     innerRef?: (node: HTMLDivElement | null) => void;
// }) {
//     const roomPhotos = room.photos?.flatMap(cat => cat.photos.map(p => p.url)) || [];
//     const basePrice = room.basePricePerNight ?? 0;
//     const currentPrice = room.currentPricePerNight ?? basePrice;
//     const originalPrice = basePrice * 1.25;
//     const priceWithBreakfast = basePrice + 100000;

//     // Tính số phòng còn trống
//     const availableRooms = room.availableRooms ?? room.quantity ?? 0;
//     const hasAvailableRooms = availableRooms > 0;
//     const isLowStock = availableRooms > 0 && availableRooms <= 3;

//     // Tính discount
//     const hasDiscount = currentPrice < basePrice && basePrice > 0;
//     const discountPercentage = hasDiscount ? Math.round((1 - currentPrice / basePrice) * 100) : 0;

//     return (
//         <div ref={innerRef} className="bg-white rounded shadow-sm p-2 mb-2 text-dark">
//             <div className="row g-2">
//                 <div className="col-lg-3">
//                     <h5 className="fw-bold d-block d-lg-none mb-1" style={{ fontSize: '16px' }}>{room.name}</h5>
//                     <Image src={roomPhotos[0] || "/placeholder.svg"} width={280} height={180} alt={room.name} style={{ objectFit: "cover", borderRadius: "6px", width: "100%", height: "auto" }} />
//                     <div className="mt-1 small text-muted" style={{ fontSize: '12px' }}>
//                         {room.area > 0 && <div className="mb-0"><i className="bi bi-rulers me-1 text-primary" style={{ fontSize: '14px' }}></i> {room.area} m²</div>}
//                         {room.view && <div className="mb-0"><i className="bi bi-image me-1 text-primary" style={{ fontSize: '14px' }}></i> {room.view}</div>}
//                     </div>
//                     <a
//                         href="#"
//                         className="text-primary small fw-bold mt-1 d-inline-block"
//                         style={{ fontSize: '12px' }}
//                         onClick={(e) => {
//                             e.preventDefault();
//                             onViewDetail(room);
//                         }}
//                     >
//                         Xem chi tiết phòng
//                     </a>
//                 </div>
//                 <div className="col-lg-9">
//                     <h5 className="fw-bold d-none d-lg-block mb-2" style={{ fontSize: '18px' }}>{room.name}</h5>

//                     {/* Table Header */}
//                     <div className="row d-none d-md-flex border-bottom pb-1 mb-1 g-0" style={{ fontSize: '13px' }}>
//                         <div className="col-4 fw-bold text-muted">Lựa chọn phòng</div>
//                         <div className="col-2 text-center fw-bold text-muted">Khách</div>
//                         <div className="col-3 text-end fw-bold text-muted">Giá/phòng/đêm</div>
//                         <div className="col-3 text-center fw-bold text-muted"></div>
//                     </div>

//                     {/* Option 1: Không bao gồm bữa sáng - Card riêng */}
//                     <div className="border rounded p-2 mb-2 bg-white">
//                         <div className="row g-0 align-items-center">
//                             <div className="col-12 col-md-4 mb-2 mb-md-0 d-flex flex-column justify-content-center">
//                                 <div className="fw-bold mb-1" style={{ fontSize: '14px' }}>Không bao gồm bữa sáng</div>
//                                 <div className="d-flex align-items-center gap-1 text-muted mb-1" style={{ fontSize: '13px' }}>
//                                     <i className="bi bi-bed text-primary" style={{ fontSize: '16px' }}></i>
//                                     <span>{room.bedType?.name || 'Giường phù hợp'}</span>
//                                 </div>
//                                 <div className="text-success" style={{ fontSize: '12px' }}>
//                                     <i className="bi bi-check-circle-fill me-1" style={{ fontSize: '11px' }}></i> Không cần thanh toán ngay hôm nay
//                                 </div>
//                             </div>
//                             <div className="col-12 col-md-2 text-center mb-2 mb-md-0 d-flex flex-column justify-content-center">
//                                 <i className="bi bi-people-fill text-primary" style={{ fontSize: '24px' }}></i>
//                                 <div className="fw-bold mt-0" style={{ fontSize: '16px' }}>{room.maxAdults}</div>
//                             </div>
//                             <div className="col-12 col-md-3 text-md-end mb-2 mb-md-0 d-flex flex-column justify-content-center">
//                                 <div className="text-muted mb-0" style={{ color: '#ff9800', fontSize: '12px' }}>Ưu đãi cho khách đặt phòng sớm</div>
//                                 {basePrice > currentPrice && basePrice > 0 && (
//                                     <div className="text-muted text-decoration-line-through mb-0" style={{ fontSize: '12px' }}>
//                                         {basePrice.toLocaleString("vi-VN")} VND
//                                     </div>
//                                 )}
//                                 <div className="fw-bold mb-0" style={{ color: '#ff6b00', fontSize: '18px' }}>
//                                     {currentPrice.toLocaleString("vi-VN")} VND
//                                 </div>
//                                 <div className="text-muted mb-0" style={{ fontSize: '11px' }}>Chưa bao gồm thuế và phí</div>
//                             </div>
//                             <div className="col-12 col-md-3 text-md-center d-flex flex-column justify-content-center align-items-center">
//                                 <button
//                                     className="btn btn-primary fw-bold mb-0"
//                                     onClick={() => handleSelectRoom(room, currentPrice, false)}
//                                     disabled={!hasAvailableRooms}
//                                     style={{ fontSize: '13px', padding: '3px 14px', height: '30px', minWidth: '100px' }}
//                                 >
//                                     Chọn
//                                 </button>
//                                 {!hasAvailableRooms ? (
//                                     <div className="text-danger text-center fw-bold mt-1" style={{ fontSize: '11px' }}>Đã hết phòng</div>
//                                 ) : (
//                                     <div className="text-danger text-center fw-bold mt-1" style={{ fontSize: '11px' }}>
//                                         {isLowStock ? `Chỉ còn ${availableRooms} phòng` : `Còn ${availableRooms} phòng`}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Option 2: Bao gồm bữa sáng - Card riêng */}
//                     {room.breakfastIncluded && (
//                         <div className="border rounded p-2 bg-white">
//                             <div className="row g-0 align-items-center">
//                                 <div className="col-12 col-md-4 mb-2 mb-md-0 d-flex flex-column justify-content-center">
//                                     <div className="fw-bold mb-1" style={{ fontSize: '14px' }}>Bao gồm bữa sáng</div>
//                                     <div className="d-flex align-items-center gap-1 text-muted mb-1" style={{ fontSize: '13px' }}>
//                                         <i className="bi bi-bed text-primary" style={{ fontSize: '16px' }}></i>
//                                         <span>{room.bedType?.name || 'Giường phù hợp'}</span>
//                                     </div>
//                                     <div className="text-success" style={{ fontSize: '12px' }}>
//                                         <i className="bi bi-check-circle-fill me-1" style={{ fontSize: '11px' }}></i> Miễn phí hủy phòng
//                                     </div>
//                                 </div>
//                                 <div className="col-12 col-md-2 text-center mb-2 mb-md-0 d-flex flex-column justify-content-center">
//                                     <i className="bi bi-people-fill text-primary" style={{ fontSize: '24px' }}></i>
//                                     <div className="fw-bold mt-0" style={{ fontSize: '16px' }}>{room.maxAdults}</div>
//                                 </div>
//                                 <div className="col-12 col-md-3 text-md-end mb-2 mb-md-0 d-flex flex-column justify-content-center">
//                                     <span className="badge bg-success mb-1 d-inline-block" style={{ fontSize: '10px', padding: '2px 6px' }}>Giá hời nhất kèm bữa sáng</span>
//                                     <div className="text-muted text-decoration-line-through mb-0" style={{ fontSize: '12px' }}>
//                                         {originalPrice.toLocaleString("vi-VN")} VND
//                                     </div>
//                                     <div className="fw-bold mb-0" style={{ color: '#ff6b00', fontSize: '18px' }}>
//                                         {priceWithBreakfast.toLocaleString("vi-VN")} VND
//                                     </div>
//                                     <div className="text-muted mb-0" style={{ fontSize: '11px' }}>Chưa bao gồm thuế và phí</div>
//                                 </div>
//                                 <div className="col-12 col-md-3 text-md-center d-flex flex-column justify-content-center align-items-center">
//                                     <button
//                                         className="btn btn-primary fw-bold mb-0"
//                                         onClick={() => handleSelectRoom(room, priceWithBreakfast, true)}
//                                         disabled={!hasAvailableRooms}
//                                         style={{ fontSize: '13px', padding: '3px 14px', height: '30px', minWidth: '100px' }}
//                                     >
//                                         Chọn
//                                     </button>
//                                     {!hasAvailableRooms ? (
//                                         <div className="text-danger text-center fw-bold mt-1" style={{ fontSize: '11px' }}>Đã hết phòng</div>
//                                     ) : (
//                                         <div className="text-danger text-center fw-bold mt-1" style={{ fontSize: '11px' }}>
//                                             {isLowStock ? `Chỉ còn ${availableRooms} phòng` : `Còn ${availableRooms} phòng`}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// // Props để nhận initial data từ Server Component
// interface HotelDetailPageClientProps {
//     initialHotel: HotelResponse | null;
//     initialRooms: Room[];
//     initialHasMore: boolean;
//     initialPage: number;
// }

// export default function HotelDetailPageClient({
//     initialHotel,
//     initialRooms = [],
//     initialHasMore = false,
//     initialPage = 0,
// }: HotelDetailPageClientProps) {
//     const { hotelId } = useParams();
//     const router = useRouter();
//     const searchParams = useSearchParams();

//     // Debug: Log initialHotel để kiểm tra
//     if (initialHotel) {
//         console.log('[HotelDetailPage] Initial hotel from server:', {
//             id: initialHotel.id,
//             name: initialHotel.name,
//             currentPricePerNight: initialHotel.currentPricePerNight,
//             rawPricePerNight: initialHotel.rawPricePerNight,
//             hasCurrentPrice: 'currentPricePerNight' in initialHotel,
//             hasRawPrice: 'rawPricePerNight' in initialHotel
//         });
//     }

//     const [hotel, setHotel] = useState<HotelResponse | null>(initialHotel);
//     const [isHotelLoading, setIsHotelLoading] = useState(!initialHotel);
//     const [hotelError, setHotelError] = useState<string | null>(null);
//     const [rooms, setRooms] = useState<Room[]>(initialRooms);
//     const [page, setPage] = useState(initialPage);
//     const [hasMore, setHasMore] = useState(initialHasMore);
//     const [isFetchingMore, setIsFetchingMore] = useState(false);
//     const [initialRoomsLoading, setInitialRoomsLoading] = useState(!initialHotel && initialRooms.length === 0);
//     const [roomsError, setRoomsError] = useState<string | null>(null);

//     // Reviews state
//     const [reviews, setReviews] = useState<Review[]>([]);
//     const [reviewsPage, setReviewsPage] = useState(0);
//     const [reviewsHasMore, setReviewsHasMore] = useState(false);
//     const [isReviewsLoading, setIsReviewsLoading] = useState(false);
//     const [reviewsError, setReviewsError] = useState<string | null>(null);

//     const [currentCheckin, setCurrentCheckin] = useState(new Date());
//     const [currentNights, setCurrentNights] = useState(1);
//     const [adults, setAdults] = useState(2);
//     const [children, setChildren] = useState(0);
//     const [roomsCount, setRoomsCount] = useState(1);

//     const [showDatePicker, setShowDatePicker] = useState(false);
//     const [showGuestPicker, setShowGuestPicker] = useState(false);
//     const datePickerRef = useRef<HTMLDivElement>(null);
//     const guestPickerRef = useRef<HTMLDivElement>(null);

//     // Room detail modal state
//     const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);
//     const [roomDetail, setRoomDetail] = useState<RoomDetailResponse | null>(null);
//     const [isLoadingRoomDetail, setIsLoadingRoomDetail] = useState(false);
//     const [isRoomDetailModalOpen, setIsRoomDetailModalOpen] = useState(false);

//     // State cho review form từ booking
//     const [bookingForReview, setBookingForReview] = useState<BookingResponse | null>(null);
//     const [isLoadingBooking, setIsLoadingBooking] = useState(false);
//     const [showReviewForm, setShowReviewForm] = useState(false);

//     const [activeTab, setActiveTab] = useState("overview");
//     const isScrollingByClick = useRef(false);
//     const overviewRef = useRef<HTMLDivElement>(null);
//     const roomsSectionRef = useRef<HTMLDivElement>(null);
//     const amenitiesRef = useRef<HTMLDivElement>(null);
//     const policyRef = useRef<HTMLDivElement>(null);
//     const reviewRef = useRef<HTMLDivElement>(null);
//     const reviewFormRef = useRef<HTMLDivElement>(null);
//     const tabLabels = [{ key: "overview", label: "Tổng quan" }, { key: "rooms", label: "Phòng" }, { key: "location", label: "Vị trí" }, { key: "amenities", label: "Tiện ích" }, { key: "policy", label: "Chính sách" }, { key: "review", label: "Đánh giá" }];

//     const priceDisplayOptions = ["Mỗi phòng mỗi đêm (chưa bao gồm thuế và phí)", "Mỗi phòng mỗi đêm (bao gồm thuế và phí)", "Tổng giá (chưa bao gồm thuế và phí)", "Tổng giá (bao gồm thuế và phí)"];
//     const [selectedPriceDisplay, setSelectedPriceDisplay] = useState(priceDisplayOptions[0]);

//     const observer = useRef<IntersectionObserver | null>(null);

//     const loadMoreRooms = useCallback(async () => {
//         if (!hotelId || isFetchingMore) return;
//         setIsFetchingMore(true);
//         try {
//             const nextPage = page + 1;
//             const response = await hotelService.getRoomsByHotelId(hotelId as string, nextPage, 10);
//             setRooms(prev => [...prev, ...response.content]);
//             setPage(response.page);
//             setHasMore(!response.last);
//         } catch (error) {
//             console.error("Lỗi khi tải thêm phòng:", error);
//         } finally {
//             setIsFetchingMore(false);
//         }
//     }, [hotelId, isFetchingMore, page]);

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
//         const checkinParam = searchParams.get('checkin');
//         const nightsParam = searchParams.get('nights');
//         const adultsParam = searchParams.get('adults');
//         const childrenParam = searchParams.get('children');
//         const roomsParam = searchParams.get('rooms');
//         const bookingIdParam = searchParams.get('bookingId');
//         const reviewParam = searchParams.get('review');

//         setCurrentCheckin(checkinParam ? new Date(checkinParam) : new Date());
//         setCurrentNights(nightsParam ? parseInt(nightsParam, 10) : 1);
//         setAdults(adultsParam ? parseInt(adultsParam, 10) : 2);
//         setChildren(childrenParam ? parseInt(childrenParam, 10) : 0);
//         setRoomsCount(roomsParam ? parseInt(roomsParam, 10) : 1);

//         // Nếu có bookingId và review=true, fetch booking và hiển thị form đánh giá
//         if (bookingIdParam && reviewParam === 'true') {
//             setIsLoadingBooking(true);
//             bookingService.getBookingById(bookingIdParam)
//                 .then((booking: BookingResponse) => {
//                     setBookingForReview(booking);
//                     setShowReviewForm(true);
//                     // Auto scroll đến phần review và mở tab review
//                     setActiveTab("review");
//                     setTimeout(() => {
//                         reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//                     }, 500);
//                 })
//                 .catch((err) => {
//                     console.error('[HotelDetailPage] Error fetching booking:', err);
//                     alert('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
//                 })
//                 .finally(() => {
//                     setIsLoadingBooking(false);
//                 });
//         }
//     }, [searchParams]);

//     // ============================================
//     // FETCH TUẦN TỰ: HOTEL → ROOMS → REVIEWS
//     // ============================================

//     // Bước 1: Fetch hotel details trước (nếu chưa có)
//     useEffect(() => {
//         if (!hotelId) return;

//         // Nếu đã có initialHotel, không cần fetch lại
//         if (initialHotel) {
//             setHotel(initialHotel);
//             setIsHotelLoading(false);
//             return;
//         }

//         const hotelIdStr = hotelId as string;
//         const fetchHotelData = async () => {
//             setIsHotelLoading(true);
//             setHotelError(null);
//             try {
//                 console.log('[HotelDetailPage] 🏨 Bước 1: Fetching hotel details...');
//                 const hotelData = await hotelService.getHotelById(hotelIdStr);
//                 setHotel(hotelData);
//                 console.log('[HotelDetailPage] ✅ Bước 1: Hotel details loaded');
//             } catch (err) {
//                 console.error("LỖI: Không thể tải thông tin khách sạn.", err);
//                 setHotelError("Không thể tải thông tin chi tiết khách sạn.");
//             } finally {
//                 setIsHotelLoading(false);
//             }
//         };
//         fetchHotelData();
//     }, [hotelId, initialHotel]);

//     // Bước 2: Fetch rooms SAU KHI hotel đã load xong
//     useEffect(() => {
//         if (!hotelId || !hotel || isHotelLoading) return; // Chờ hotel load xong
//         if (initialRooms.length > 0) {
//             // Nếu đã có initial rooms, không fetch lại
//             setRooms(initialRooms);
//             setPage(initialPage);
//             setHasMore(initialHasMore);
//             setInitialRoomsLoading(false);
//             return;
//         }

//         const hotelIdStr = hotelId as string;
//         const fetchInitialRooms = async () => {
//             setInitialRoomsLoading(true);
//             setRoomsError(null);
//             try {
//                 console.log('[HotelDetailPage] 🛏️ Bước 2: Fetching rooms...');
//                 const initialRoomsData = await hotelService.getRoomsByHotelId(hotelIdStr, 0, 10);
//                 setRooms(initialRoomsData.content);
//                 setPage(initialRoomsData.page);
//                 setHasMore(!initialRoomsData.last);
//                 console.log('[HotelDetailPage] ✅ Bước 2: Rooms loaded');
//             } catch (err) {
//                 console.error("Lỗi khi tải danh sách phòng:", err);
//                 setRoomsError("Có lỗi xảy ra khi tải danh sách phòng.");
//             } finally {
//                 setInitialRoomsLoading(false);
//             }
//         };
//         fetchInitialRooms();
//     }, [hotelId, hotel, isHotelLoading, initialRooms.length, initialPage, initialHasMore]);

//     // Bước 3: Fetch reviews SAU KHI rooms đã load xong (hoặc song song với rooms)
//     useEffect(() => {
//         if (!hotelId || !hotel || isHotelLoading) return; // Chờ hotel load xong

//         const hotelIdStr = hotelId as string;
//         const fetchReviews = async () => {
//             setIsReviewsLoading(true);
//             setReviewsError(null);
//             try {
//                 console.log('[HotelDetailPage] ⭐ Bước 3: Fetching reviews...');
//                 const params: GetReviewsParams = {
//                     hotelId: hotelIdStr,
//                     page: 0,
//                     size: 10,
//                     sortBy: 'createdAt',
//                     sortDir: 'DESC',
//                 };
//                 const result = await getReviews(params);
//                 setReviews(result.data);
//                 setReviewsPage(result.currentPage);
//                 setReviewsHasMore(result.hasNext);
//                 console.log('[HotelDetailPage] ✅ Bước 3: Reviews loaded');
//             } catch (err: any) {
//                 console.error("Lỗi khi tải đánh giá:", err);
//                 setReviewsError(err.message || "Có lỗi xảy ra khi tải đánh giá.");
//             } finally {
//                 setIsReviewsLoading(false);
//             }
//         };
//         fetchReviews();
//     }, [hotelId, hotel, isHotelLoading]);

//     // Load more reviews
//     const loadMoreReviews = useCallback(async () => {
//         if (!hotelId || isReviewsLoading || !reviewsHasMore) return;
//         setIsReviewsLoading(true);
//         try {
//             const nextPage = reviewsPage + 1;
//             const params: GetReviewsParams = {
//                 hotelId: hotelId as string,
//                 page: nextPage,
//                 size: 10,
//                 sortBy: 'createdAt',
//                 sortDir: 'DESC',
//             };
//             const result = await getReviews(params);
//             setReviews(prev => [...prev, ...result.data]);
//             setReviewsPage(result.currentPage);
//             setReviewsHasMore(result.hasNext);
//         } catch (err: any) {
//             console.error("Lỗi khi tải thêm đánh giá:", err);
//             setReviewsError(err.message || "Có lỗi xảy ra khi tải thêm đánh giá.");
//         } finally {
//             setIsReviewsLoading(false);
//         }
//     }, [hotelId, isReviewsLoading, reviewsHasMore, reviewsPage]);

//     const handleRefetchAvailability = () => {
//         setShowDatePicker(false);
//         setShowGuestPicker(false);
//         const params = new URLSearchParams();
//         params.set('checkin', currentCheckin.toISOString().split('T')[0]);
//         params.set('nights', currentNights.toString());
//         params.set('adults', adults.toString());
//         params.set('children', children.toString());
//         params.set('rooms', roomsCount.toString());
//         router.push(`/hotels/${hotelId}?${params.toString()}`);
//     };

//     const handleTabClick = (tab: string) => {
//         isScrollingByClick.current = true;
//         setActiveTab(tab);
//         // Nếu click tab review và có form đánh giá, scroll đến form
//         if (tab === 'review' && showReviewForm && reviewFormRef.current) {
//             window.scrollTo({ top: reviewFormRef.current.offsetTop - 60, behavior: "smooth" });
//             setTimeout(() => { isScrollingByClick.current = false; }, 1000);
//             return;
//         }
//         const refMap = { overview: overviewRef, rooms: roomsSectionRef, amenities: amenitiesRef, policy: policyRef, review: reviewRef };
//         const sectionRef = refMap[tab as keyof typeof refMap];
//         if (sectionRef?.current) {
//             window.scrollTo({ top: sectionRef.current.offsetTop - 60, behavior: "smooth" });
//             setTimeout(() => { isScrollingByClick.current = false; }, 1000);
//         }
//     };

//     const handleScrollSync = useCallback(() => {
//         if (isScrollingByClick.current) return;
//         const sections = [
//             { tab: "overview", ref: overviewRef },
//             { tab: "rooms", ref: roomsSectionRef },
//             { tab: "amenities", ref: amenitiesRef },
//             { tab: "policy", ref: policyRef },
//             { tab: "review", ref: reviewRef }
//         ];
//         const scrollPosition = window.scrollY + 120;
//         let currentActiveTab = "";
//         for (const section of sections) {
//             if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
//                 currentActiveTab = section.tab;
//             }
//         }
//         if (currentActiveTab) {
//             setActiveTab(currentActiveTab);
//         }
//     }, []);

//     const handleSelectRoom = (room: Room, price: number, includesBreakfast: boolean) => {
//         if (!hotel) return;
//         const params = new URLSearchParams({
//             roomId: room.id.toString(),
//             price: price.toString(),
//             checkin: currentCheckin.toISOString().split('T')[0],
//             nights: currentNights.toString(),
//             adults: adults.toString(),
//             children: children.toString(),
//             rooms: roomsCount.toString(),
//             hotelName: hotel.name,
//             hotelImageUrl: hotel.photos?.[0]?.photos?.[0]?.url || '',
//             breakfast: includesBreakfast.toString(),
//             roomView: room.view || '',
//         });
//         router.push(`/booking?${params.toString()}`);
//     };

//     const handleViewRoomDetail = async (room: Room) => {
//         setSelectedRoomForDetail(room);
//         setIsRoomDetailModalOpen(true);
//         setIsLoadingRoomDetail(true);
//         try {
//             const roomDetailData = await hotelService.getRoomById(room.id.toString());
//             setRoomDetail(roomDetailData);
//         } catch (error) {
//             console.error('Error fetching room detail:', error);
//             // Fallback: sử dụng room data hiện có
//             setRoomDetail(room as RoomDetailResponse);
//         } finally {
//             setIsLoadingRoomDetail(false);
//         }
//     };

//     const handleCloseRoomDetailModal = () => {
//         setIsRoomDetailModalOpen(false);
//         setSelectedRoomForDetail(null);
//         setRoomDetail(null);
//     };

//     const handleDateChange = (date: Date | null) => { if (date) setCurrentCheckin(date); };

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

//     useEffect(() => { window.addEventListener("scroll", handleScrollSync, { passive: true }); return () => window.removeEventListener("scroll", handleScrollSync); }, [handleScrollSync]);

//     if (isHotelLoading || initialRoomsLoading) return <div className="container py-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>;
//     if (hotelError || !hotel) return <div className="container py-5"><div className="alert alert-danger">{hotelError || "Không tìm thấy khách sạn"}</div></div>;

//     const displayGuests = `${adults} người lớn, ${children} Trẻ em, ${roomsCount} phòng`;
//     const dateDisplayString = formatDateForDisplay(currentCheckin, currentNights);
//     const allPhotoUrls = hotel.photos.flatMap(cat => Array.isArray(cat.photos) ? cat.photos.map(p => p.url) : []) || [];
//     const displayPhotos = allPhotoUrls.length > 0 ? allPhotoUrls : Array(5).fill("/placeholder.svg");
//     const mainAmenities = hotel.amenities?.flatMap(group => group.amenities).slice(0, 6) || [];
//     const nearbyVenues = hotel.entertainmentVenues?.flatMap(group => group.entertainmentVenues).slice(0, 5) || [];

//     // Tính giá: ưu tiên giá đã giảm từ hotel (currentPricePerNight), nếu không có thì lấy từ rooms
//     // Xử lý trường hợp currentPricePerNight và rawPricePerNight có thể là undefined
//     const hotelCurrentPrice = hotel.currentPricePerNight ?? 0;
//     const hotelRawPrice = hotel.rawPricePerNight ?? 0;

//     // Luôn sử dụng currentPricePerNight nếu có giá trị > 0, nếu không thì lấy từ rooms
//     const displayPrice = hotelCurrentPrice > 0
//         ? hotelCurrentPrice
//         : (rooms.length > 0 ? Math.min(...rooms.map(room => room.basePricePerNight)) : 0);

//     // originalPrice luôn là rawPricePerNight nếu có, nếu không thì dùng displayPrice
//     const originalPrice = hotelRawPrice > 0 ? hotelRawPrice : displayPrice;

//     // Có discount khi originalPrice > displayPrice và cả hai đều > 0
//     const hasDiscount = originalPrice > displayPrice && originalPrice > 0 && displayPrice > 0;
//     const discountPercentage = hasDiscount ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;

//     // Debug: Log giá để kiểm tra
//     console.log('[HotelDetailPage] Price Debug:', {
//         hotelCurrentPrice,
//         hotelRawPrice,
//         hotelCurrentPricePerNight: hotel.currentPricePerNight,
//         hotelRawPricePerNight: hotel.rawPricePerNight,
//         displayPrice,
//         originalPrice,
//         hasDiscount,
//         discountPercentage,
//         roomsCount: rooms.length,
//         roomsPrices: rooms.map(r => r.basePricePerNight)
//     });

//     return (
//         <div className={styles['hotel-detail-page']}>
//             <style>{customStylesForPage}</style>

//             <div className={styles.searchHeader}>
//                 <div className="container">
//                     <div className={styles.searchBar}>
//                         <div className={`${styles.searchSection} ${styles.locationSection}`}>
//                             <i className={`bi bi-geo-alt ${styles.searchIcon}`}></i>
//                             <div className={styles.searchInput}>
//                                 <label>Khách sạn</label>
//                                 <span>{hotel.name}</span>
//                             </div>
//                         </div>
//                         <div className={styles.divider}></div>
//                         <div className={`${styles.searchSection} ${styles.dateSection}`} ref={datePickerRef}>
//                             <i className={`bi bi-calendar3 ${styles.searchIcon}`}></i>
//                             <div className={styles.searchInput} onClick={() => setShowDatePicker(!showDatePicker)}>
//                                 <label>Ngày nhận phòng & Số đêm</label>
//                                 <span>{dateDisplayString}</span>
//                             </div>
//                             {showDatePicker && (
//                                 <div className={styles.datePickerWrapper}>
//                                     <DatePicker selected={currentCheckin} onChange={handleDateChange} inline locale="vi" minDate={new Date()} />
//                                     <div className={styles.nightsSelector}>
//                                         <label>Số đêm</label>
//                                         <div className={styles.counter}>
//                                             <button onClick={() => setCurrentNights(n => Math.max(1, n - 1))} disabled={currentNights <= 1}>-</button>
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
//                                 <div className={styles.guestPickerWrapper}>
//                                     <GuestPicker
//                                         adults={adults}
//                                         children={children}
//                                         rooms={roomsCount}
//                                         setAdults={setAdults}
//                                         setChildren={setChildren}
//                                         setRooms={setRoomsCount}
//                                         onClose={() => setShowGuestPicker(false)}
//                                     />
//                                 </div>
//                             )}
//                         </div>
//                         <div className={styles.divider}></div>
//                         <button className={styles.searchButton} onClick={handleRefetchAvailability}>
//                             <i className="bi bi-search"></i>
//                             <span>Tìm lại</span>
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="sticky-tab-bar">
//                 <div className="container">
//                     <div className="tab-list" style={{ position: "relative" }}>
//                         {tabLabels.map((tab) => (
//                             <button key={tab.key} className={`tab-item${activeTab === tab.key ? " active" : ""}`} onClick={() => handleTabClick(tab.key)} type="button">
//                                 {tab.label}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             <div ref={overviewRef} className="container py-4">
//                 <div className="row g-2 mb-4">
//                     <div className="col-lg-7">
//                         <div style={{ borderRadius: '16px', overflow: 'hidden', width: '100%', height: '410px', position: 'relative' }}>
//                             <Image src={displayPhotos[0]} fill style={{ objectFit: 'cover' }} alt="Hotel main photo" priority />
//                         </div>
//                     </div>
//                     <div className="col-lg-5">
//                         <div className="row g-2" style={{ height: '410px' }}>
//                             {displayPhotos.slice(1, 5).map((url, idx) => (
//                                 <div key={idx} className="col-6">
//                                     <div style={{ borderRadius: '10px', overflow: 'hidden', width: '100%', height: '201px', position: 'relative' }}>
//                                         <Image src={url} fill style={{ objectFit: 'cover' }} alt={`Hotel side photo ${idx + 1}`} />
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="row gx-lg-4 gy-4">
//                     <div className="col-lg-8">
//                         <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
//                             <div className="d-flex align-items-center mb-3 flex-wrap">
//                                 <span className="badge bg-primary me-2 fs-6 py-2">Khách Sạn</span>
//                                 {hotel.starRating > 0 && <span className="text-warning fw-bold fs-5 ms-2">{'★'.repeat(hotel.starRating)}</span>}
//                             </div>
//                             <h1 className="fw-bold fs-2 text-dark mb-3">{hotel.name}</h1>
//                             <div className="mb-4 d-flex align-items-start">
//                                 <i className="bi bi-geo-alt-fill text-danger fs-5 me-2 mt-1"></i>
//                                 <span className="text-muted">{getFullAddress(hotel)}</span>
//                             </div>
//                             <div className="d-flex align-items-center flex-wrap bg-light p-3 rounded-3">
//                                 <div className="ms-auto">
//                                     <button className="btn btn-warning btn-lg fw-bold px-4" onClick={() => handleTabClick('rooms')}>
//                                         Chọn phòng ngay
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         <div ref={amenitiesRef} className="bg-white rounded-4 shadow-sm p-4 mb-4">
//                             <h5 className="fw-bold mb-3">Tiện ích chính</h5>
//                             <div className="row">
//                                 {mainAmenities.map((item) => (
//                                     <div key={item.id} className="col-md-6 mb-3">
//                                         <div className="d-flex align-items-center">
//                                             <i className="bi bi-check-circle text-primary me-2 fs-5"></i>
//                                             <span className="text-dark">{item.name}</span>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="bg-white rounded-4 shadow-sm p-4">
//                             <h5 className="fw-bold mb-3">Mô tả khách sạn</h5>
//                             <p className="mb-0 text-dark" style={{ lineHeight: 1.7 }}>{hotel.description}</p>
//                         </div>
//                     </div>

//                     <div className="col-lg-4">
//                         <div className="bg-white rounded-4 shadow-sm p-4">
//                             <h5 className="fw-bold mb-3">Trong khu vực</h5>
//                             <ul className="list-unstyled mb-0">
//                                 {nearbyVenues.map((item) => (
//                                     <li key={item.id} className="mb-3 d-flex align-items-center">
//                                         <i className="bi bi-geo-alt text-primary me-3 fs-5"></i>
//                                         <div>
//                                             <div className="fw-semibold">{item.name}</div>
//                                             <div className="small text-muted">{formatDistance(item.distance)}</div>
//                                         </div>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Chính sách khách sạn */}
//             {hotel.policy && (
//                 <div ref={policyRef} className="container mb-5">
//                     <h4 className="fw-bold mb-3 text-dark pt-4">Chính sách khách sạn</h4>
//                     <div className="bg-white rounded-4 shadow-sm">
//                         {/* Thời gian nhận phòng/trả phòng */}
//                         <div className="p-3 border-bottom d-flex align-items-center gap-3">
//                             <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}>
//                                 <i className="bi bi-clock text-primary"></i>
//                                 Thời gian nhận phòng/trả phòng
//                             </h6>
//                             <div className="text-dark">
//                                 <strong>Giờ nhận phòng:</strong> Từ {hotel.policy.checkInTime ? hotel.policy.checkInTime.substring(0, 5) : 'N/A'} |
//                                 <strong> Giờ trả phòng:</strong> Trước {hotel.policy.checkOutTime ? hotel.policy.checkOutTime.substring(0, 5) : 'N/A'}
//                             </div>
//                         </div>

//                         {/* Hướng dẫn nhận phòng chung */}
//                         {hotel.policy.requiredIdentificationDocuments && hotel.policy.requiredIdentificationDocuments.length > 0 && (
//                             <div className="p-3 border-bottom d-flex align-items-center gap-3">
//                                 <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}>
//                                     <i className="bi bi-file-earmark-text text-primary"></i>
//                                     Hướng Dẫn Nhận Phòng Chung
//                                 </h6>
//                                 <div className="text-dark">
//                                     <strong>Giấy tờ yêu cầu:</strong> {hotel.policy.requiredIdentificationDocuments.map((doc: { id: string; name: string }, index: number) => (
//                                         <span key={doc.id}>
//                                             {doc.name}{index < (hotel.policy?.requiredIdentificationDocuments?.length ?? 0) - 1 ? ', ' : ''}
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Thanh toán tại khách sạn */}
//                         <div className="p-3 border-bottom d-flex align-items-center gap-3">
//                             <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}>
//                                 <i className="bi bi-credit-card text-primary"></i>
//                                 Thanh toán
//                             </h6>
//                             <div className="text-dark">
//                                 <strong>Thanh toán tại khách sạn:</strong> {hotel.policy.allowsPayAtHotel ? 'Có' : 'Không'}
//                             </div>
//                         </div>

//                         {/* Chính sách hủy phòng */}
//                         {hotel.policy.cancellationPolicy && (
//                             <div className="p-3 border-bottom d-flex align-items-center gap-3">
//                                 <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}>
//                                     <i className="bi bi-x-circle text-danger"></i>
//                                     Chính sách hủy phòng
//                                 </h6>
//                                 <div className="text-dark">
//                                     <strong>{hotel.policy.cancellationPolicy.name}:</strong> {hotel.policy.cancellationPolicy.description}
//                                     {hotel.policy.cancellationPolicy.rules && hotel.policy.cancellationPolicy.rules.length > 0 && (
//                                         <span className="ms-2">
//                                             ({hotel.policy.cancellationPolicy.rules.map((rule: { id: string; daysBeforeCheckIn?: number; penaltyPercentage?: number }, index: number) => (
//                                                 <span key={rule.id}>
//                                                     {rule.daysBeforeCheckIn === 0
//                                                         ? 'Hủy ngay trước ngày nhận phòng'
//                                                         : `Hủy trước ${rule.daysBeforeCheckIn} ngày`}
//                                                     : {rule.penaltyPercentage === 0 ? ' Miễn phí' : ` Phí ${rule.penaltyPercentage}%`}
//                                                     {index < (hotel.policy?.cancellationPolicy?.rules?.length ?? 0) - 1 ? '; ' : ''}
//                                                 </span>
//                                             ))})
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Chính sách đổi lịch */}
//                         {hotel.policy.reschedulePolicy && (
//                             <div className="p-3 d-flex align-items-center gap-3">
//                                 <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}>
//                                     <i className="bi bi-arrow-repeat text-warning"></i>
//                                     Chính sách đổi lịch
//                                 </h6>
//                                 <div className="text-dark">
//                                     <strong>{hotel.policy.reschedulePolicy.name}:</strong> {hotel.policy.reschedulePolicy.description}
//                                     {hotel.policy.reschedulePolicy.rules && hotel.policy.reschedulePolicy.rules.length > 0 && (
//                                         <span className="ms-2">
//                                             ({hotel.policy.reschedulePolicy.rules.map((rule: { id: string; daysBeforeCheckin?: number; feePercentage?: number }, index: number) => (
//                                                 <span key={rule.id}>
//                                                     {rule.daysBeforeCheckin === 0
//                                                         ? 'Đổi ngay trước ngày nhận phòng'
//                                                         : `Đổi trước ${rule.daysBeforeCheckin} ngày`}
//                                                     : {rule.feePercentage === 0 ? ' Miễn phí' : ` Phí ${rule.feePercentage}%`}
//                                                     {index < (hotel.policy?.reschedulePolicy?.rules?.length ?? 0) - 1 ? '; ' : ''}
//                                                 </span>
//                                             ))})
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             <div ref={roomsSectionRef} className="container mb-5">
//                 <h4 className="fw-bold mb-3 text-dark pt-4">Những phòng còn trống tại {hotel.name}</h4>
//                 <div className="bg-white p-4 mb-3" style={{ borderBottom: '1px solid #e3e6ea' }}>
//                     <h5 className="fw-bold mb-3 text-dark">Tìm kiếm nhanh hơn bằng cách chọn những tiện nghi bạn cần</h5>
//                     <div className="row align-items-start">
//                         <div className="col-lg-4 col-md-6">
//                             <label className={styles['custom-checkbox-wrapper']}>Miễn phí hủy phòng
//                                 <input type="checkbox" />
//                                 <span className={styles.checkmark}></span>
//                             </label>
//                             <label className={styles['custom-checkbox-wrapper']}>Thanh toán gần ngày đến ở
//                                 <input type="checkbox" />
//                                 <span className={styles.checkmark}></span>
//                                 <div className="text-muted" style={{ fontSize: '12px', marginLeft: '28px', marginTop: '-8px' }}>Không cần thanh toán ngay hôm nay</div>
//                             </label>
//                             <label className={styles['custom-checkbox-wrapper']}>Thanh Toán Tại Khách Sạn <i className="bi bi-info-circle ms-1"></i>
//                                 <input type="checkbox" />
//                                 <span className={styles.checkmark}></span>
//                             </label>
//                         </div>
//                         <div className="col-lg-4 col-md-6 text-dark">
//                             <label className={styles['custom-checkbox-wrapper']}>Giường lớn <i className="bi bi-info-circle ms-1"></i>
//                                 <input type="checkbox" />
//                                 <span className={styles.checkmark}></span>
//                             </label>
//                             <label className={styles['custom-checkbox-wrapper']}>Miễn phí bữa sáng
//                                 <input type="checkbox" />
//                                 <span className={styles.checkmark}></span>
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
//                     <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div></div>
//                 ) : roomsError ? (
//                     <div className="alert alert-danger">{roomsError}</div>
//                 ) : rooms.length === 0 ? (
//                     <div className="alert alert-info text-center" role="alert">Không có phòng nào khả dụng.</div>
//                 ) : (
//                     <div>
//                         {rooms.map((room, index) => (
//                             <RoomCard
//                                 key={room.id}
//                                 room={room}
//                                 handleSelectRoom={handleSelectRoom}
//                                 onViewDetail={handleViewRoomDetail}
//                                 innerRef={rooms.length === index + 1 ? lastRoomElementRef : undefined}
//                             />
//                         ))}
//                         {isFetchingMore && <div className="text-center p-4"><div className="spinner-border text-primary" role="status"></div></div>}
//                     </div>
//                 )}
//             </div>

//             {/* Chỉ hiển thị section đánh giá nếu có reviews, đang loading, hoặc có lỗi */}
//             {/* Hiển thị thông tin booking và form đánh giá nếu có bookingId */}
//             {showReviewForm && bookingForReview && (
//                 <div ref={reviewFormRef} className="container mb-5">
//                     <h4 className="fw-bold mb-3 text-dark pt-4">Đánh giá đơn hàng của bạn</h4>
//                     {isLoadingBooking ? (
//                         <div className="text-center p-4">
//                             <div className="spinner-border text-primary" role="status">
//                                 <span className="visually-hidden">Đang tải...</span>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="bg-light rounded p-4 mb-4">
//                             <h5 className="fw-bold mb-3">Thông tin đơn hàng</h5>
//                             <div className="row">
//                                 <div className="col-md-6 mb-3">
//                                     <p className="mb-1"><strong>Mã đơn hàng:</strong> {bookingForReview.id.substring(0, 8)}...</p>
//                                     <p className="mb-1"><strong>Phòng:</strong> {bookingForReview.room.name}</p>
//                                     <p className="mb-1"><strong>Nhận phòng:</strong> {new Date(bookingForReview.checkInDate).toLocaleDateString('vi-VN')}</p>
//                                     <p className="mb-1"><strong>Trả phòng:</strong> {new Date(bookingForReview.checkOutDate).toLocaleDateString('vi-VN')}</p>
//                                 </div>
//                                 <div className="col-md-6 mb-3">
//                                     <p className="mb-1"><strong>Số khách:</strong> {bookingForReview.numberOfAdults} người lớn{bookingForReview.numberOfChildren > 0 ? `, ${bookingForReview.numberOfChildren} trẻ em` : ''}</p>
//                                     <p className="mb-1"><strong>Tổng tiền:</strong> <span className="text-danger fw-bold">{bookingForReview.priceDetails.finalPrice.toLocaleString('vi-VN')} VND</span></p>
//                                     {bookingForReview.room.photos && bookingForReview.room.photos.length > 0 && (
//                                         <div className="mt-2">
//                                             <Image
//                                                 src={bookingForReview.room.photos[0].photos[0].url}
//                                                 alt={bookingForReview.room.name}
//                                                 width={200}
//                                                 height={120}
//                                                 style={{ objectFit: 'cover', borderRadius: '8px' }}
//                                             />
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                             {bookingForReview.room.amenities && bookingForReview.room.amenities.length > 0 && (
//                                 <div className="mt-3">
//                                     <strong>Tiện nghi:</strong>
//                                     <div className="d-flex flex-wrap gap-2 mt-2">
//                                         {bookingForReview.room.amenities.flatMap(group => group.amenities).slice(0, 8).map((amenity, index) => (
//                                             <span key={index} className="badge bg-secondary">{amenity.name}</span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                     {!isLoadingBooking && bookingForReview && (
//                         <div className="bg-white rounded p-4 border">
//                             <CreateReviewForm
//                                 bookingId={bookingForReview.id}
//                                 hotelName={hotel?.name || 'Khách sạn'}
//                                 onSuccess={() => {
//                                     alert('Cảm ơn bạn đã đánh giá!');
//                                     // Refresh reviews và ẩn form
//                                     setShowReviewForm(false);
//                                     setBookingForReview(null);
//                                     // Remove query params
//                                     const newSearchParams = new URLSearchParams(searchParams.toString());
//                                     newSearchParams.delete('bookingId');
//                                     newSearchParams.delete('review');
//                                     router.replace(`/hotels/${hotelId}?${newSearchParams.toString()}`);
//                                     // Reload reviews từ đầu
//                                     setIsReviewsLoading(true);
//                                     setReviewsPage(0);
//                                     const params: GetReviewsParams = {
//                                         hotelId: hotelId as string,
//                                         page: 0,
//                                         size: 10,
//                                         sortBy: 'createdAt',
//                                         sortDir: 'DESC',
//                                     };
//                                     getReviews(params)
//                                         .then((result) => {
//                                             setReviews(result.data);
//                                             setReviewsPage(result.currentPage);
//                                             setReviewsHasMore(result.hasNext);
//                                         })
//                                         .catch((err) => {
//                                             console.error('[HotelDetailPage] Error reloading reviews:', err);
//                                             setReviewsError('Không thể tải lại đánh giá.');
//                                         })
//                                         .finally(() => {
//                                             setIsReviewsLoading(false);
//                                         });
//                                 }}
//                                 onCancel={() => {
//                                     setShowReviewForm(false);
//                                     setBookingForReview(null);
//                                     // Remove query params
//                                     const newSearchParams = new URLSearchParams(searchParams.toString());
//                                     newSearchParams.delete('bookingId');
//                                     newSearchParams.delete('review');
//                                     router.replace(`/hotels/${hotelId}?${newSearchParams.toString()}`);
//                                 }}
//                             />
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Ẩn hoàn toàn nếu đã load xong và không có reviews */}
//             {(isReviewsLoading || reviews.length > 0 || reviewsError) && (
//                 <div ref={reviewRef} className="container mb-5">
//                     <h4 className="fw-bold mb-3 text-dark pt-4">Đánh giá từ khách hàng</h4>
//                     {reviewsError ? (
//                         <div className="alert alert-danger">{reviewsError}</div>
//                     ) : (
//                         <ReviewsList
//                             reviews={reviews}
//                             isLoading={isReviewsLoading}
//                             onLoadMore={loadMoreReviews}
//                             hasMore={reviewsHasMore}
//                         />
//                     )}
//                 </div>
//             )}

//             {/* Room Detail Modal */}
//             {isLoadingRoomDetail ? (
//                 <div
//                     className="modal fade show d-block"
//                     style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
//                     onClick={handleCloseRoomDetailModal}
//                 >
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-body text-center p-5">
//                                 <div className="spinner-border text-primary" role="status">
//                                     <span className="visually-hidden">Đang tải...</span>
//                                 </div>
//                                 <p className="mt-3">Đang tải thông tin phòng...</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             ) : (
//                 <RoomDetailModal
//                     room={roomDetail}
//                     isOpen={isRoomDetailModalOpen}
//                     onClose={handleCloseRoomDetailModal}
//                     onSelectRoom={handleSelectRoom}
//                 />
//             )}
//         </div>
//     );
// }


////////new 
'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

import { hotelService, HotelResponse, Room, PaginatedData, RoomDetailResponse } from "@/service/hotelService";
import { getReviews, GetReviewsParams } from "@/service/reviewService";
import { bookingService, BookingResponse } from "@/service/bookingService";
import GuestPicker from '@/components/DateSupport/GuestPicker';
import ReviewsList from '@/components/Review/ReviewsList';
import CreateReviewForm from '@/components/Review/CreateReviewForm';
import type { Review } from '@/types';
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
    // Backend lưu distance theo meters (comment: // in meters)
    // Form update nhập theo km → convert km → meters trước khi gửi (nhân 1000)
    // Khi hiển thị, distance đã là meters từ backend
    if (distanceInMeters < 1000) {
        return `${Math.round(distanceInMeters)} m`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
};

const customStylesForPage = `
    .sticky-tab-bar { position: sticky !important; top: 0 !important; background: #fff !important; z-index: 1000 !important; border-bottom: 2px solid #e3e6ea !important; }
    .sticky-tab-bar .tab-item { cursor: pointer !important; font-weight: bold !important; padding: 0 18px !important; height: 48px !important; display: inline-flex !important; align-items: center !important; color: #6c757d !important; border: none !important; background: none !important; outline: none !important; font-size: 16px !important; transition: color 0.2s !important; }
    .sticky-tab-bar .tab-item.active { color: #1565c0 !important; border-bottom: 3px solid #1565c0 !important; background: none !important; }
    .sticky-tab-bar .tab-item:not(.active):hover { color: #0070f3 !important; }
`;

// --- COMPONENT ROOM DETAIL MODAL ---
function RoomDetailModal({
    room,
    isOpen,
    onClose,
    onSelectRoom
}: {
    room: RoomDetailResponse | null;
    isOpen: boolean;
    onClose: () => void;
    onSelectRoom: (room: Room, price: number, includesBreakfast: boolean) => void;
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen || !room) return null;

    const allPhotos = room.photos?.flatMap(cat => cat.photos.map(p => p.url)) || [];
    const currentPhoto = allPhotos[currentImageIndex] || "/placeholder.svg";
    const totalPhotos = allPhotos.length;

    const basePrice = room.basePricePerNight ?? 0;
    const currentPrice = room.currentPricePerNight ?? basePrice;
    const hasDiscount = currentPrice < basePrice && basePrice > 0;
    const discountPercentage = hasDiscount ? Math.round((1 - currentPrice / basePrice) * 100) : 0;

    const roomAmenitiesFlat = room.amenities?.flatMap(group => group.amenities) || [];

    const features: { name: string; icon: string }[] = [];
    if (room.wifiAvailable) features.push({ name: "WiFi", icon: "wifi" });
    if (room.smokingAllowed) features.push({ name: "Hút thuốc", icon: "smoking" });

    const featureMap: { [key: string]: { name: string; icon: string } } = {
        'Máy lạnh': { name: 'Máy lạnh', icon: 'snow' },
        'Tủ lạnh': { name: 'Tủ lạnh', icon: 'box' },
        'Nước nóng': { name: 'Nước nóng', icon: 'droplet-fill' },
        'Vòi tắm đứng': { name: 'Vòi tắm đứng', icon: 'droplet' },
        'WiFi': { name: 'WiFi', icon: 'wifi' },
        'TV': { name: 'TV', icon: 'tv' },
    };

    roomAmenitiesFlat.forEach(amenity => {
        const feature = featureMap[amenity.name];
        if (feature && !features.find(f => f.name === feature.name)) {
            features.push(feature);
        }
    });

    const featureNames = features.map(f => f.name);
    const roomAmenities = roomAmenitiesFlat.filter(amenity =>
        !featureNames.includes(amenity.name)
    );

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % totalPhotos);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
    const selectImage = (index: number) => setCurrentImageIndex(index);

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '1100px', width: '90%', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-content" style={{ maxHeight: '90vh', borderRadius: '8px', overflow: 'hidden' }}>
                    <div className="modal-header border-bottom py-3 px-4">
                        <h5 className="modal-title fw-bold mb-0">{room.name}</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-0" style={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}>
                        <div className="row g-0">
                            <div className="col-lg-7">
                                <div className="position-relative" style={{ height: '400px', backgroundColor: '#f5f5f5' }}>
                                    {totalPhotos > 0 && (
                                        <>
                                            <Image src={currentPhoto} alt={room.name} fill style={{ objectFit: 'cover' }} />
                                            {totalPhotos > 1 && (
                                                <>
                                                    <button className="btn btn-light btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle" onClick={prevImage} style={{ zIndex: 10, width: '40px', height: '40px', padding: 0 }}><i className="bi bi-chevron-left"></i></button>
                                                    <button className="btn btn-light btn-sm position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle" onClick={nextImage} style={{ zIndex: 10, width: '40px', height: '40px', padding: 0 }}><i className="bi bi-chevron-right"></i></button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                                {totalPhotos > 1 && (
                                    <div className="p-2 bg-white border-top">
                                        <div className="d-flex gap-2 overflow-auto pb-1">
                                            {allPhotos.map((photo, index) => (
                                                <div key={index} className={`flex-shrink-0 rounded ${index === currentImageIndex ? 'border border-primary border-2' : 'opacity-50'}`} style={{ cursor: 'pointer', width: '70px', height: '50px', overflow: 'hidden' }} onClick={() => selectImage(index)}>
                                                    <Image src={photo} alt={`${room.name} ${index + 1}`} width={70} height={50} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-center mt-1 small text-muted">{currentImageIndex + 1} / {totalPhotos}</div>
                                    </div>
                                )}
                            </div>
                            <div className="col-lg-5 border-start">
                                <div className="p-4" style={{ maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}>
                                    <div className="mb-3">
                                        <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Thông tin phòng</h6>
                                        <div className="d-flex gap-3">
                                            {room.area > 0 && (<div className="d-flex align-items-center gap-2"><i className="bi bi-rulers text-primary" style={{ fontSize: '18px' }}></i><span style={{ fontSize: '14px' }}>{room.area} m²</span></div>)}
                                            <div className="d-flex align-items-center gap-2"><i className="bi bi-people-fill text-primary" style={{ fontSize: '18px' }}></i><span style={{ fontSize: '14px' }}>{room.maxAdults} khách</span></div>
                                        </div>
                                    </div>
                                    {features.length > 0 && (
                                        <div className="mb-3">
                                            <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Tính năng phòng bạn thích</h6>
                                            <div className="d-flex flex-wrap gap-3">
                                                {features.map((feature, idx) => (<div key={idx} className="d-flex align-items-center gap-2"><i className={`bi bi-${feature.icon} text-primary`} style={{ fontSize: '16px' }}></i><span style={{ fontSize: '13px' }}>{feature.name}</span></div>))}
                                            </div>
                                        </div>
                                    )}
                                    {roomAmenities.length > 0 && (
                                        <div className="mb-3">
                                            <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Tiện nghi phòng</h6>
                                            <div className="row g-2">
                                                {roomAmenities.slice(0, 6).map((amenity) => (<div key={amenity.id} className="col-6"><div className="d-flex align-items-center gap-2" style={{ fontSize: '13px' }}><i className="bi bi-check-circle text-success" style={{ fontSize: '14px' }}></i><span className="text-truncate">{amenity.name}</span></div></div>))}
                                            </div>
                                            {roomAmenities.length > 6 && (<a href="#" className="text-primary small mt-2 d-inline-block" style={{ fontSize: '12px' }}>Xem thêm</a>)}
                                        </div>
                                    )}
                                    <div className="mt-4 pt-3 border-top">
                                        <div className="mb-3">
                                            <span className="text-muted" style={{ fontSize: '13px' }}>Khởi điểm từ:</span>
                                            {hasDiscount && (<span className="badge bg-success ms-2" style={{ fontSize: '11px' }}>-{discountPercentage}%</span>)}
                                            {hasDiscount && (<div className="text-muted text-decoration-line-through" style={{ fontSize: '12px', marginTop: '4px' }}>{basePrice.toLocaleString("vi-VN")} VND</div>)}
                                            <div className="fw-bold text-primary mt-1" style={{ fontSize: '20px' }}>{currentPrice.toLocaleString("vi-VN")} VND / phòng / đêm</div>
                                        </div>
                                        <button className="btn btn-primary w-100 fw-bold" style={{ fontSize: '14px', padding: '10px' }} onClick={() => { onSelectRoom(room, currentPrice, false); onClose(); }}>Thêm lựa chọn phòng</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENT ROOMCARD ---
function RoomCard({ room, handleSelectRoom, onViewDetail, innerRef }: {
    room: Room;
    handleSelectRoom: (room: Room, price: number, includesBreakfast: boolean) => void;
    onViewDetail: (room: Room) => void;
    innerRef?: (node: HTMLDivElement | null) => void;
}) {
    const roomPhotos = room.photos?.flatMap(cat => cat.photos.map(p => p.url)) || [];
    const basePrice = room.basePricePerNight ?? 0;
    const currentPrice = room.currentPricePerNight ?? basePrice;
    const originalPrice = basePrice * 1.25;
    const priceWithBreakfast = basePrice + 100000;
    const availableRooms = room.availableRooms ?? room.quantity ?? 0;
    const hasAvailableRooms = availableRooms > 0;
    const isLowStock = availableRooms > 0 && availableRooms <= 3;

    return (
        <div ref={innerRef} className="bg-white rounded shadow-sm p-2 mb-2 text-dark">
            <div className="row g-2">
                <div className="col-lg-3">
                    <h5 className="fw-bold d-block d-lg-none mb-1" style={{ fontSize: '16px' }}>{room.name}</h5>
                    <Image src={roomPhotos[0] || "/placeholder.svg"} width={280} height={180} alt={room.name} style={{ objectFit: "cover", borderRadius: "6px", width: "100%", height: "auto" }} />
                    <div className="mt-1 small text-muted" style={{ fontSize: '12px' }}>
                        {room.area > 0 && <div className="mb-0"><i className="bi bi-rulers me-1 text-primary" style={{ fontSize: '14px' }}></i> {room.area} m²</div>}
                        {room.view && <div className="mb-0"><i className="bi bi-image me-1 text-primary" style={{ fontSize: '14px' }}></i> {room.view}</div>}
                    </div>
                    <a href="#" className="text-primary small fw-bold mt-1 d-inline-block" style={{ fontSize: '12px' }} onClick={(e) => { e.preventDefault(); onViewDetail(room); }}>Xem chi tiết phòng</a>
                </div>
                <div className="col-lg-9">
                    <h5 className="fw-bold d-none d-lg-block mb-2" style={{ fontSize: '18px' }}>{room.name}</h5>
                    <div className="row d-none d-md-flex border-bottom pb-1 mb-1 g-0" style={{ fontSize: '13px' }}>
                        <div className="col-4 fw-bold text-muted">Lựa chọn phòng</div>
                        <div className="col-2 text-center fw-bold text-muted">Khách</div>
                        <div className="col-3 text-end fw-bold text-muted">Giá/phòng/đêm</div>
                        <div className="col-3 text-center fw-bold text-muted"></div>
                    </div>
                    <div className="border rounded p-2 mb-2 bg-white">
                        <div className="row g-0 align-items-center">
                            <div className="col-12 col-md-4 mb-2 mb-md-0 d-flex flex-column justify-content-center">
                                <div className="fw-bold mb-1" style={{ fontSize: '14px' }}>Không bao gồm bữa sáng</div>
                                <div className="d-flex align-items-center gap-1 text-muted mb-1" style={{ fontSize: '13px' }}><i className="bi bi-bed text-primary" style={{ fontSize: '16px' }}></i><span>{room.bedType?.name || 'Giường phù hợp'}</span></div>
                                <div className="text-success" style={{ fontSize: '12px' }}><i className="bi bi-check-circle-fill me-1" style={{ fontSize: '11px' }}></i> Không cần thanh toán ngay hôm nay</div>
                            </div>
                            <div className="col-12 col-md-2 text-center mb-2 mb-md-0 d-flex flex-column justify-content-center">
                                <i className="bi bi-people-fill text-primary" style={{ fontSize: '24px' }}></i>
                                <div className="fw-bold mt-0" style={{ fontSize: '16px' }}>{room.maxAdults}</div>
                            </div>
                            <div className="col-12 col-md-3 text-md-end mb-2 mb-md-0 d-flex flex-column justify-content-center">
                                <div className="text-muted mb-0" style={{ color: '#ff9800', fontSize: '12px' }}>Ưu đãi cho khách đặt phòng sớm</div>
                                {basePrice > currentPrice && basePrice > 0 && (<div className="text-muted text-decoration-line-through mb-0" style={{ fontSize: '12px' }}>{basePrice.toLocaleString("vi-VN")} VND</div>)}
                                <div className="fw-bold mb-0" style={{ color: '#ff6b00', fontSize: '18px' }}>{currentPrice.toLocaleString("vi-VN")} VND</div>
                                <div className="text-muted mb-0" style={{ fontSize: '11px' }}>Chưa bao gồm thuế và phí</div>
                            </div>
                            <div className="col-12 col-md-3 text-md-center d-flex flex-column justify-content-center align-items-center">
                                <button className="btn btn-primary fw-bold mb-0" onClick={() => handleSelectRoom(room, currentPrice, false)} disabled={!hasAvailableRooms} style={{ fontSize: '13px', padding: '3px 14px', height: '30px', minWidth: '100px' }}>Chọn</button>
                                {!hasAvailableRooms ? (<div className="text-danger text-center fw-bold mt-1" style={{ fontSize: '11px' }}>Đã hết phòng</div>) : (<div className="text-danger text-center fw-bold mt-1" style={{ fontSize: '11px' }}>{isLowStock ? `Chỉ còn ${availableRooms} phòng` : `Còn ${availableRooms} phòng`}</div>)}
                            </div>
                        </div>
                    </div>
                    {room.breakfastIncluded && (
                        <div className="border rounded p-2 bg-white">
                            <div className="row g-0 align-items-center">
                                <div className="col-12 col-md-4 mb-2 mb-md-0 d-flex flex-column justify-content-center">
                                    <div className="fw-bold mb-1" style={{ fontSize: '14px' }}>Bao gồm bữa sáng</div>
                                    <div className="d-flex align-items-center gap-1 text-muted mb-1" style={{ fontSize: '13px' }}><i className="bi bi-bed text-primary" style={{ fontSize: '16px' }}></i><span>{room.bedType?.name || 'Giường phù hợp'}</span></div>
                                    <div className="text-success" style={{ fontSize: '12px' }}><i className="bi bi-check-circle-fill me-1" style={{ fontSize: '11px' }}></i> Miễn phí hủy phòng</div>
                                </div>
                                <div className="col-12 col-md-2 text-center mb-2 mb-md-0 d-flex flex-column justify-content-center">
                                    <i className="bi bi-people-fill text-primary" style={{ fontSize: '24px' }}></i>
                                    <div className="fw-bold mt-0" style={{ fontSize: '16px' }}>{room.maxAdults}</div>
                                </div>
                                <div className="col-12 col-md-3 text-md-end mb-2 mb-md-0 d-flex flex-column justify-content-center">
                                    <span className="badge bg-success mb-1 d-inline-block" style={{ fontSize: '10px', padding: '2px 6px' }}>Giá hời nhất kèm bữa sáng</span>
                                    <div className="text-muted text-decoration-line-through mb-0" style={{ fontSize: '12px' }}>{originalPrice.toLocaleString("vi-VN")} VND</div>
                                    <div className="fw-bold mb-0" style={{ color: '#ff6b00', fontSize: '18px' }}>{priceWithBreakfast.toLocaleString("vi-VN")} VND</div>
                                    <div className="text-muted mb-0" style={{ fontSize: '11px' }}>Chưa bao gồm thuế và phí</div>
                                </div>
                                <div className="col-12 col-md-3 text-md-center d-flex flex-column justify-content-center align-items-center">
                                    <button className="btn btn-primary fw-bold mb-0" onClick={() => handleSelectRoom(room, priceWithBreakfast, true)} disabled={!hasAvailableRooms} style={{ fontSize: '13px', padding: '3px 14px', height: '30px', minWidth: '100px' }}>Chọn</button>
                                    {!hasAvailableRooms ? (<div className="text-danger text-center fw-bold mt-1" style={{ fontSize: '11px' }}>Đã hết phòng</div>) : (<div className="text-danger text-center fw-bold mt-1" style={{ fontSize: '11px' }}>{isLowStock ? `Chỉ còn ${availableRooms} phòng` : `Còn ${availableRooms} phòng`}</div>)}
                                </div>
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
}: HotelDetailPageClientProps) {
    const { hotelId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // STATE
    const [hotel, setHotel] = useState<HotelResponse | null>(null);
    const [isHotelLoading, setIsHotelLoading] = useState(true);
    const [hotelError, setHotelError] = useState<string | null>(null);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isRoomsLoading, setIsRoomsLoading] = useState(false);
    const [roomsError, setRoomsError] = useState<string | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsPage, setReviewsPage] = useState(0);
    const [reviewsHasMore, setReviewsHasMore] = useState(false);
    const [isReviewsLoading, setIsReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState<string | null>(null);

    const [currentCheckin, setCurrentCheckin] = useState(new Date());
    const [currentNights, setCurrentNights] = useState(1);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [roomsCount, setRoomsCount] = useState(1);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const guestPickerRef = useRef<HTMLDivElement>(null);

    const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);
    const [roomDetail, setRoomDetail] = useState<RoomDetailResponse | null>(null);
    const [isLoadingRoomDetail, setIsLoadingRoomDetail] = useState(false);
    const [isRoomDetailModalOpen, setIsRoomDetailModalOpen] = useState(false);

    const [bookingForReview, setBookingForReview] = useState<BookingResponse | null>(null);
    const [isLoadingBooking, setIsLoadingBooking] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    const [activeTab, setActiveTab] = useState("overview");
    const isScrollingByClick = useRef(false);
    const overviewRef = useRef<HTMLDivElement>(null);
    const roomsSectionRef = useRef<HTMLDivElement>(null);
    const amenitiesRef = useRef<HTMLDivElement>(null);
    const policyRef = useRef<HTMLDivElement>(null);
    const reviewRef = useRef<HTMLDivElement>(null);
    const reviewFormRef = useRef<HTMLDivElement>(null);
    const tabLabels = [{ key: "overview", label: "Tổng quan" }, { key: "rooms", label: "Phòng" }, { key: "location", label: "Vị trí" }, { key: "amenities", label: "Tiện ích" }, { key: "policy", label: "Chính sách" }, { key: "review", label: "Đánh giá" }];

    const priceDisplayOptions = ["Mỗi phòng mỗi đêm (chưa bao gồm thuế và phí)", "Mỗi phòng mỗi đêm (bao gồm thuế và phí)", "Tổng giá (chưa bao gồm thuế và phí)", "Tổng giá (bao gồm thuế và phí)"];
    const [selectedPriceDisplay, setSelectedPriceDisplay] = useState(priceDisplayOptions[0]);

    const observer = useRef<IntersectionObserver | null>(null);
    const roomsFetchedForHotelId = useRef<string | null>(null); // Track hotel ID mà rooms đã được fetch
    const reviewsFetchedForHotelId = useRef<string | null>(null); // Track hotel ID mà reviews đã được fetch

    // --- LOGIC FETCH DỮ LIỆU ---
    // Bước 1: Fetch hotel trước để hiển thị UI ngay
    useEffect(() => {
        if (!hotelId) return;
        const hotelIdStr = hotelId as string;

        const fetchHotelData = async () => {
            setIsHotelLoading(true);
            setHotelError(null);
            // Reset rooms và reviews khi chuyển sang hotel khác
            setRooms([]);
            setReviews([]);
            roomsFetchedForHotelId.current = null;
            reviewsFetchedForHotelId.current = null;
            try {
                const hotelData = await hotelService.getHotelById(hotelIdStr);
                setHotel(hotelData);
            } catch (err) {
                console.error("Lỗi khi tải thông tin khách sạn:", err);
                setHotelError("Không thể tải thông tin chi tiết khách sạn. Vui lòng thử lại sau.");
            } finally {
                setIsHotelLoading(false); // Cho phép hiển thị UI ngay khi hotel load xong
            }
        };

        fetchHotelData();
    }, [hotelId]);

    // Bước 2: Fetch rooms SAU KHI hotel đã load xong
    useEffect(() => {
        if (!hotelId || !hotel || isHotelLoading) return; // Chờ hotel load xong

        // Kiểm tra nếu đã fetch rooms cho hotel này rồi thì không fetch lại
        const hotelIdStr = hotelId as string;
        if (roomsFetchedForHotelId.current === hotelIdStr) {
            return;
        }

        const fetchRoomsData = async () => {
            setIsRoomsLoading(true);
            setRoomsError(null);
            try {
                const roomsData = await hotelService.getRoomsByHotelId(hotelIdStr, 0, 10);
                setRooms(roomsData.content);
                setPage(roomsData.page);
                setHasMore(!roomsData.last);
                roomsFetchedForHotelId.current = hotelIdStr; // Đánh dấu đã fetch cho hotel này
            } catch (err) {
                console.error("Lỗi khi tải danh sách phòng:", err);
                setRoomsError("Có lỗi xảy ra khi tải danh sách phòng.");
            } finally {
                setIsRoomsLoading(false);
            }
        };

        fetchRoomsData();
    }, [hotelId, hotel?.id, isHotelLoading]); // Chỉ fetch khi hotel đã có (dùng hotel?.id để tránh re-fetch)

    // Bước 3: Fetch reviews SAU KHI hotel đã load xong (có thể song song với rooms)
    useEffect(() => {
        if (!hotelId || !hotel || isHotelLoading) return; // Chờ hotel load xong

        // Kiểm tra nếu đã fetch reviews cho hotel này rồi thì không fetch lại
        const hotelIdStr = hotelId as string;
        const currentHotelId = hotel.id; // Lấy hotelId từ hotel object để đảm bảo đúng
        
        // Nếu hotelId không khớp với hotel.id, không fetch
        if (hotelIdStr !== currentHotelId) {
            console.warn("[HotelDetailPage] hotelId mismatch:", { hotelIdStr, currentHotelId });
            return;
        }

        // Kiểm tra nếu đã fetch reviews cho hotel này rồi thì không fetch lại
        if (reviewsFetchedForHotelId.current === hotelIdStr) {
            console.log('[HotelDetailPage] Reviews already fetched for hotel:', hotelIdStr);
            return;
        }

        const fetchReviewsData = async () => {
            setIsReviewsLoading(true);
            setReviewsError(null);
            
            // Đảm bảo reset reviews trước khi fetch (phòng trường hợp có reviews cũ)
            setReviews([]);
            
            // Validate hotelId trước khi fetch
            if (!hotelIdStr || hotelIdStr.trim() === '') {
                console.error('[HotelDetailPage] Invalid hotelId, cannot fetch reviews:', hotelIdStr);
                setReviewsError('Không thể tải đánh giá: ID khách sạn không hợp lệ.');
                setIsReviewsLoading(false);
                return;
            }
            
            try {
                console.log('[HotelDetailPage] Fetching reviews for hotel:', hotelIdStr, 'currentHotelId:', currentHotelId);
                
                // Đảm bảo luôn truyền hotelId khi fetch reviews (phải là string hợp lệ, không rỗng)
                const reviewsResult = await getReviews({
                    hotelId: hotelIdStr.trim(), // Sử dụng hotelId từ URL params, trim để loại bỏ spaces
                    page: 0,
                    size: 10,
                    sortBy: 'createdAt',
                    sortDir: 'DESC'
                });
                
                console.log('[HotelDetailPage] Reviews fetched from API:', {
                    total: reviewsResult.data.length,
                    hotelId: hotelIdStr,
                    reviews: reviewsResult.data.map(r => ({ 
                        id: r.id, 
                        hotelId: r.hotelId || 'N/A', 
                        score: r.score 
                    }))
                });
                
                // VẤN ĐỀ: Backend ReviewResponse không có hotelId, nên không thể verify trực tiếp
                // Backend đã filter trong query: (:hotelId IS NULL OR r.hotel.id = :hotelId)
                // Nếu backend không nhận được hotelId (NULL), sẽ trả về TẤT CẢ reviews
                
                // Strategy: Verify một vài reviews đầu tiên bằng cách fetch detail
                // Nếu tất cả đều đúng → trust backend cho các reviews còn lại
                // Nếu có review sai → chỉ lấy reviews đã verify đúng (có thể backend filter không đúng)
                
                let verifiedReviews: Review[] = [];
                const shouldVerify = reviewsResult.data.length > 0; // Chỉ verify nếu có reviews
                
                if (shouldVerify) {
                    // Chỉ verify 1-2 reviews đầu tiên để tránh performance issue
                    const reviewsToVerify = reviewsResult.data.slice(0, Math.min(2, reviewsResult.data.length));
                    
                    console.log('[HotelDetailPage] Verifying reviews hotelId...', {
                        total: reviewsResult.data.length,
                        toVerify: reviewsToVerify.length,
                        hotelId: hotelIdStr
                    });
                    
                    try {
                        const { getReviewById } = await import('@/service/reviewService');
                        
                        const verificationResults = await Promise.all(
                            reviewsToVerify.map(async (review) => {
                                try {
                                    const detail = await getReviewById(review.id);
                                    const reviewHotelId = detail.hotelId;
                                    
                                    if (reviewHotelId && reviewHotelId !== '' && reviewHotelId !== 'N/A') {
                                        const matches = reviewHotelId === hotelIdStr || reviewHotelId === currentHotelId;
                                        if (!matches) {
                                            console.error('[HotelDetailPage] ❌ Review belongs to DIFFERENT hotel!', {
                                                reviewId: review.id,
                                                reviewHotelId,
                                                expectedHotelId: hotelIdStr,
                                                currentHotelId
                                            });
                                        }
                                        return { review, verified: matches, hotelId: reviewHotelId };
                                    }
                                    // Nếu không có hotelId trong detail, trust backend
                                    return { review, verified: true, hotelId: null };
                                } catch (err) {
                                    console.error('[HotelDetailPage] Error verifying review:', review.id, err);
                                    // Nếu lỗi khi verify, trust backend
                                    return { review, verified: true, hotelId: null };
                                }
                            })
                        );
                        
                        // Kiểm tra xem có review nào không thuộc hotel này không
                        const invalidReviews = verificationResults.filter(r => !r.verified);
                        if (invalidReviews.length > 0) {
                            console.error('[HotelDetailPage] ❌ Backend filter is WRONG! Found reviews from different hotels!', {
                                invalidCount: invalidReviews.length,
                                hotelId: hotelIdStr,
                                invalidReviews: invalidReviews.map(r => ({
                                    id: r.review.id,
                                    hotelId: r.hotelId
                                }))
                            });
                            
                            // Nếu có review sai, chỉ lấy những reviews đã verify đúng
                            // Nếu không có review nào đúng → verifiedReviews = [] (sẽ hiển thị "Chưa có đánh giá")
                            const validReviewIds = new Set(
                                verificationResults
                                    .filter(r => r.verified)
                                    .map(r => r.review.id)
                            );
                            
                            // Chỉ lấy reviews đã verify đúng
                            verifiedReviews = reviewsResult.data.filter(r => validReviewIds.has(r.id));
                            
                            // Nếu tất cả reviews đều sai → verifiedReviews = [] → sẽ hiển thị "Chưa có đánh giá"
                            // Điều này đúng vì backend filter sai, không thể trust được
                            console.warn('[HotelDetailPage] Backend filter issue detected. Only showing verified reviews:', verifiedReviews.length);
                        } else {
                            // Tất cả reviews đã verify đều đúng, trust backend cho các reviews còn lại
                            console.log('[HotelDetailPage] ✅ Verified reviews are correct, trusting backend for all reviews');
                            verifiedReviews = reviewsResult.data;
                        }
                    } catch (err) {
                        console.error('[HotelDetailPage] Error during verification, trusting backend:', err);
                        // Nếu lỗi khi verify, trust backend
                        verifiedReviews = reviewsResult.data;
                    }
                } else {
                    // Không có reviews, không cần verify
                    verifiedReviews = reviewsResult.data;
                }
                
                console.log('[HotelDetailPage] Reviews after verification:', {
                    total: reviewsResult.data.length,
                    verified: verifiedReviews.length,
                    hotelId: hotelIdStr
                });
                
                // Chỉ set reviews nếu hotelId vẫn khớp (phòng trường hợp user chuyển trang trong lúc fetch)
                if (hotelIdStr === (hotelId as string) && hotelIdStr === hotel.id) {
                    setReviews(verifiedReviews);
                    setReviewsPage(reviewsResult.currentPage);
                    setReviewsHasMore(reviewsResult.hasNext);
                    reviewsFetchedForHotelId.current = hotelIdStr; // Đánh dấu đã fetch cho hotel này
                } else {
                    console.warn('[HotelDetailPage] Hotel changed during fetch, discarding results');
                }
            } catch (err: any) {
                console.error("Lỗi khi tải đánh giá:", err);
                setReviewsError(err.message || "Có lỗi xảy ra khi tải đánh giá.");
                // Đảm bảo set empty array khi có lỗi
                setReviews([]);
            } finally {
                setIsReviewsLoading(false);
            }
        };

        fetchReviewsData();
    }, [hotelId, hotel?.id, isHotelLoading]); // Chỉ fetch khi hotel đã có (dùng hotel?.id để tránh re-fetch)

    // Xử lý query params
    useEffect(() => {
        const checkinParam = searchParams.get('checkin');
        const nightsParam = searchParams.get('nights');
        const adultsParam = searchParams.get('adults');
        const childrenParam = searchParams.get('children');
        const roomsParam = searchParams.get('rooms');
        const bookingIdParam = searchParams.get('bookingId');
        const reviewParam = searchParams.get('review');

        setCurrentCheckin(checkinParam ? new Date(checkinParam) : new Date());
        setCurrentNights(nightsParam ? parseInt(nightsParam, 10) : 1);
        setAdults(adultsParam ? parseInt(adultsParam, 10) : 2);
        setChildren(childrenParam ? parseInt(childrenParam, 10) : 0);
        setRoomsCount(roomsParam ? parseInt(roomsParam, 10) : 1);

        if (bookingIdParam && reviewParam === 'true') {
            setIsLoadingBooking(true);
            bookingService.getBookingById(bookingIdParam)
                .then((booking: BookingResponse) => {
                    setBookingForReview(booking);
                    setShowReviewForm(true);
                    setActiveTab("review");
                    setTimeout(() => {
                        reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 500);
                })
                .catch((err) => {
                    console.error('[HotelDetailPage] Error fetching booking:', err);
                    alert('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
                })
                .finally(() => setIsLoadingBooking(false));
        }
    }, [searchParams]);

    const loadMoreRooms = useCallback(async () => {
        if (!hotelId || isFetchingMore || !hasMore) return;
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
                if (entries[0].isIntersecting && hasMore) loadMoreRooms();
            });
            if (node) observer.current.observe(node);
        }
    }, [isFetchingMore, hasMore, loadMoreRooms]);

    const loadMoreReviews = useCallback(async () => {
        if (!hotelId || !hotel || isReviewsLoading || !reviewsHasMore) return;
        
        const hotelIdStr = (hotelId as string)?.trim();
        const currentHotelId = hotel.id;
        
        // Validate hotelId
        if (!hotelIdStr || hotelIdStr === '') {
            console.error('[HotelDetailPage] Invalid hotelId for loadMore:', hotelIdStr);
            return;
        }
        
        // Đảm bảo hotelId vẫn khớp trước khi load more
        if (hotelIdStr !== currentHotelId) {
            console.warn('[HotelDetailPage] Cannot load more reviews: hotelId mismatch', {
                hotelIdStr,
                currentHotelId
            });
            return;
        }
        
        setIsReviewsLoading(true);
        try {
            const nextPage = reviewsPage + 1;
            
            console.log('[HotelDetailPage] Loading more reviews for hotel:', hotelIdStr, 'page:', nextPage);
            
            // Đảm bảo luôn truyền hotelId khi fetch reviews (trim để đảm bảo không có spaces)
            const result = await getReviews({ 
                hotelId: hotelIdStr.trim(), 
                page: nextPage, 
                size: 10, 
                sortBy: 'createdAt', 
                sortDir: 'DESC' 
            });
            
            // Backend đã filter theo hotelId rồi, nhưng vẫn filter lại để chắc chắn
            const filteredReviews = result.data.filter(review => {
                // Nếu review không có hotelId (backend không trả về), thì trust backend
                if (!review.hotelId || review.hotelId === '') {
                    return true; // Backend đã filter đúng rồi
                }
                // Nếu có hotelId, kiểm tra khớp
                const matches = review.hotelId === hotelIdStr || review.hotelId === currentHotelId;
                if (!matches) {
                    console.warn('[HotelDetailPage] Review hotelId mismatch in loadMore:', {
                        reviewId: review.id,
                        reviewHotelId: review.hotelId,
                        currentHotelId: hotelIdStr
                    });
                }
                return matches;
            });
            
            // Chỉ thêm reviews nếu hotelId vẫn khớp
            if (hotelIdStr === (hotelId as string) && hotelIdStr === hotel.id) {
                setReviews(prev => [...prev, ...filteredReviews]);
                setReviewsPage(result.currentPage);
                setReviewsHasMore(result.hasNext);
            } else {
                console.warn('[HotelDetailPage] Hotel changed during loadMore, discarding results');
            }
        } catch (err: any) {
            console.error("Lỗi khi tải thêm đánh giá:", err);
            setReviewsError(err.message || "Có lỗi xảy ra khi tải thêm đánh giá.");
        } finally {
            setIsReviewsLoading(false);
        }
    }, [hotelId, hotel?.id, isReviewsLoading, reviewsHasMore, reviewsPage]);

    const handleRefetchAvailability = () => {
        setShowDatePicker(false);
        setShowGuestPicker(false);
        const params = new URLSearchParams({
            checkin: currentCheckin.toISOString().split('T')[0],
            nights: currentNights.toString(),
            adults: adults.toString(),
            children: children.toString(),
            rooms: roomsCount.toString(),
        });
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
        const sections = [{ tab: "overview", ref: overviewRef }, { tab: "rooms", ref: roomsSectionRef }, { tab: "amenities", ref: amenitiesRef }, { tab: "policy", ref: policyRef }, { tab: "review", ref: reviewRef }];
        const scrollPosition = window.scrollY + 120;
        let currentActiveTab = "";
        for (const section of sections) {
            if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) currentActiveTab = section.tab;
        }
        if (currentActiveTab) setActiveTab(currentActiveTab);
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

    const handleViewRoomDetail = async (room: Room) => {
        setSelectedRoomForDetail(room);
        setIsRoomDetailModalOpen(true);
        setIsLoadingRoomDetail(true);
        try {
            const roomDetailData = await hotelService.getRoomById(room.id.toString());
            setRoomDetail(roomDetailData);
        } catch (error) {
            console.error('Error fetching room detail:', error);
            setRoomDetail(room as RoomDetailResponse);
        } finally {
            setIsLoadingRoomDetail(false);
        }
    };

    const handleCloseRoomDetailModal = () => {
        setIsRoomDetailModalOpen(false);
        setSelectedRoomForDetail(null);
        setRoomDetail(null);
    };

    const handleDateChange = (date: Date | null) => { if (date) setCurrentCheckin(date); };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setShowDatePicker(false);
            if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) setShowGuestPicker(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScrollSync, { passive: true });
        return () => window.removeEventListener("scroll", handleScrollSync);
    }, [handleScrollSync]);

    if (isHotelLoading) {
        return (
            <div className="container py-5 text-center" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                        <span className="visually-hidden">Đang tải chi tiết khách sạn...</span>
                    </div>
                    <p className="mt-3 text-muted">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    if (hotelError || !hotel) {
        return <div className="container py-5"><div className="alert alert-danger">{hotelError || "Không tìm thấy khách sạn"}</div></div>;
    }

    const displayGuests = `${adults} người lớn, ${children} Trẻ em, ${roomsCount} phòng`;
    const dateDisplayString = formatDateForDisplay(currentCheckin, currentNights);
    const allPhotoUrls = hotel.photos.flatMap(cat => Array.isArray(cat.photos) ? cat.photos.map(p => p.url) : []) || [];
    const displayPhotos = allPhotoUrls.length > 0 ? allPhotoUrls : Array(5).fill("/placeholder.svg");
    const mainAmenities = hotel.amenities?.flatMap(group => group.amenities).slice(0, 6) || [];
    const nearbyVenues = hotel.entertainmentVenues?.flatMap(group => group.entertainmentVenues).slice(0, 5) || [];
    const hotelCurrentPrice = hotel.currentPricePerNight ?? 0;
    const hotelRawPrice = hotel.rawPricePerNight ?? 0;
    const displayPrice = hotelCurrentPrice > 0 ? hotelCurrentPrice : (rooms.length > 0 ? Math.min(...rooms.map(room => room.basePricePerNight)) : 0);
    const originalPrice = hotelRawPrice > 0 ? hotelRawPrice : displayPrice;
    const hasDiscount = originalPrice > displayPrice && originalPrice > 0 && displayPrice > 0;
    const discountPercentage = hasDiscount ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;

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
                                    <GuestPicker adults={adults} children={children} rooms={roomsCount} setAdults={setAdults} setChildren={setChildren} setRooms={setRoomsCount} onClose={() => setShowGuestPicker(false)} />
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
                                <div className="ms-auto">
                                    <button className="btn btn-warning btn-lg fw-bold px-4" onClick={() => handleTabClick('rooms')}>Chọn phòng ngay</button>
                                </div>
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
            {hotel.policy && (
                <div ref={policyRef} className="container mb-5">
                    <h4 className="fw-bold mb-3 text-dark pt-4">Chính sách khách sạn</h4>
                    <div className="bg-white rounded-4 shadow-sm">
                        <div className="p-3 border-bottom d-flex align-items-center gap-3">
                            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}><i className="bi bi-clock text-primary"></i>Thời gian nhận phòng/trả phòng</h6>
                            <div className="text-dark"><strong>Giờ nhận phòng:</strong> Từ {hotel.policy.checkInTime ? hotel.policy.checkInTime.substring(0, 5) : 'N/A'} |<strong> Giờ trả phòng:</strong> Trước {hotel.policy.checkOutTime ? hotel.policy.checkOutTime.substring(0, 5) : 'N/A'}</div>
                        </div>
                        {hotel.policy.requiredIdentificationDocuments && hotel.policy.requiredIdentificationDocuments.length > 0 && (
                            <div className="p-3 border-bottom d-flex align-items-center gap-3">
                                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}><i className="bi bi-file-earmark-text text-primary"></i>Hướng Dẫn Nhận Phòng Chung</h6>
                                <div className="text-dark"><strong>Giấy tờ yêu cầu:</strong> {hotel.policy.requiredIdentificationDocuments.map((doc: { id: string; name: string }, index: number) => (<span key={doc.id}>{doc.name}{index < (hotel.policy?.requiredIdentificationDocuments?.length ?? 0) - 1 ? ', ' : ''}</span>))}</div>
                            </div>
                        )}
                        <div className="p-3 border-bottom d-flex align-items-center gap-3">
                            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}><i className="bi bi-credit-card text-primary"></i>Thanh toán</h6>
                            <div className="text-dark"><strong>Thanh toán tại khách sạn:</strong> {hotel.policy.allowsPayAtHotel ? 'Có' : 'Không'}</div>
                        </div>
                        {hotel.policy.cancellationPolicy && (
                            <div className="p-3 border-bottom d-flex align-items-center gap-3">
                                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}><i className="bi bi-x-circle text-danger"></i>Chính sách hủy phòng</h6>
                                <div className="text-dark"><strong>{hotel.policy.cancellationPolicy.name}:</strong> {hotel.policy.cancellationPolicy.description}
                                    {hotel.policy.cancellationPolicy.rules && hotel.policy.cancellationPolicy.rules.length > 0 && (<span className="ms-2">({hotel.policy.cancellationPolicy.rules.map((rule: { id: string; daysBeforeCheckIn?: number; penaltyPercentage?: number }, index: number) => (<span key={rule.id}>{rule.daysBeforeCheckIn === 0 ? 'Hủy ngay trước ngày nhận phòng' : `Hủy trước ${rule.daysBeforeCheckIn} ngày`}: {rule.penaltyPercentage === 0 ? ' Miễn phí' : ` Phí ${rule.penaltyPercentage}%`}{index < (hotel.policy?.cancellationPolicy?.rules?.length ?? 0) - 1 ? '; ' : ''}</span>))})</span>)}
                                </div>
                            </div>
                        )}
                        {hotel.policy.reschedulePolicy && (
                            <div className="p-3 d-flex align-items-center gap-3">
                                <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ minWidth: '200px' }}><i className="bi bi-arrow-repeat text-warning"></i>Chính sách đổi lịch</h6>
                                <div className="text-dark"><strong>{hotel.policy.reschedulePolicy.name}:</strong> {hotel.policy.reschedulePolicy.description}
                                    {hotel.policy.reschedulePolicy.rules && hotel.policy.reschedulePolicy.rules.length > 0 && (<span className="ms-2">({hotel.policy.reschedulePolicy.rules.map((rule: { id: string; daysBeforeCheckin?: number; feePercentage?: number }, index: number) => (<span key={rule.id}>{rule.daysBeforeCheckin === 0 ? 'Đổi ngay trước ngày nhận phòng' : `Đổi trước ${rule.daysBeforeCheckin} ngày`}: {rule.feePercentage === 0 ? ' Miễn phí' : ` Phí ${rule.feePercentage}%`}{index < (hotel.policy?.reschedulePolicy?.rules?.length ?? 0) - 1 ? '; ' : ''}</span>))})</span>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div ref={roomsSectionRef} className="container mb-5">
                <h4 className="fw-bold mb-3 text-dark pt-4">Những phòng còn trống tại {hotel.name}</h4>
                <div className="bg-white p-4 mb-3" style={{ borderBottom: '1px solid #e3e6ea' }}>
                    <h5 className="fw-bold mb-3 text-dark">Tìm kiếm nhanh hơn bằng cách chọn những tiện nghi bạn cần</h5>
                    <div className="row align-items-start">
                        <div className="col-lg-4 col-md-6">
                            <label className={styles['custom-checkbox-wrapper']}>Miễn phí hủy phòng<input type="checkbox" /><span className={styles.checkmark}></span></label>
                            <label className={styles['custom-checkbox-wrapper']}>Thanh toán gần ngày đến ở<input type="checkbox" /><span className={styles.checkmark}></span><div className="text-muted" style={{ fontSize: '12px', marginLeft: '28px', marginTop: '-8px' }}>Không cần thanh toán ngay hôm nay</div></label>
                            <label className={styles['custom-checkbox-wrapper']}>Thanh Toán Tại Khách Sạn <i className="bi bi-info-circle ms-1"></i><input type="checkbox" /><span className={styles.checkmark}></span></label>
                        </div>
                        <div className="col-lg-4 col-md-6 text-dark">
                            <label className={styles['custom-checkbox-wrapper']}>Giường lớn <i className="bi bi-info-circle ms-1"></i><input type="checkbox" /><span className={styles.checkmark}></span></label>
                            <label className={styles['custom-checkbox-wrapper']}>Miễn phí bữa sáng<input type="checkbox" /><span className={styles.checkmark}></span></label>
                        </div>
                        <div className="col-lg-4 col-md-12 mt-3 mt-lg-0">
                            <div className="fw-semibold text-dark small mb-1">Hiển thị giá</div>
                            <div className="dropdown">
                                <a className="dropdown-toggle text-primary text-decoration-none fw-semibold small" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">{selectedPriceDisplay}</a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="priceDisplayDropdown">
                                    {priceDisplayOptions.map((option, index) => (
                                        <li key={index}><a className={`dropdown-item ${selectedPriceDisplay === option ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setSelectedPriceDisplay(option); }}>{selectedPriceDisplay === option ? <i className="bi bi-check-circle-fill text-primary me-2"></i> : <i className="bi bi-circle me-2" style={{ visibility: 'hidden' }}></i>}{option}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                {isRoomsLoading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div></div>
                ) : roomsError ? (
                    <div className="alert alert-danger">{roomsError}</div>
                ) : rooms.length === 0 ? (
                    <div className="alert alert-info text-center" role="alert">Không có phòng nào khả dụng.</div>
                ) : (
                    <div>
                        {rooms.map((room, index) => (
                            <RoomCard key={room.id} room={room} handleSelectRoom={handleSelectRoom} onViewDetail={handleViewRoomDetail} innerRef={rooms.length === index + 1 ? lastRoomElementRef : undefined} />
                        ))}
                        {isFetchingMore && <div className="text-center p-4"><div className="spinner-border text-primary" role="status"></div></div>}
                    </div>
                )}
            </div>
            {/* Luôn hiển thị section reviews để user biết */}
            <div ref={reviewRef} className="container mb-5">
                <h4 className="fw-bold mb-3 text-dark pt-4">Đánh giá từ khách hàng</h4>
                {reviewsError ? (
                    <div className="alert alert-danger">{reviewsError}</div>
                ) : (
                    <ReviewsList reviews={reviews} isLoading={isReviewsLoading} onLoadMore={loadMoreReviews} hasMore={reviewsHasMore} />
                )}
            </div>
            {showReviewForm && bookingForReview && (
                <div ref={reviewFormRef} className="container mb-5">
                    <h4 className="fw-bold mb-3 text-dark pt-4">Đánh giá đơn hàng của bạn</h4>
                    {isLoadingBooking ? (
                        <div className="text-center p-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div></div>
                    ) : (
                        <div className="bg-light rounded p-4 mb-4">
                            <h5 className="fw-bold mb-3">Thông tin đơn hàng</h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <p className="mb-1"><strong>Mã đơn hàng:</strong> {bookingForReview.id.substring(0, 8)}...</p>
                                    <p className="mb-1"><strong>Phòng:</strong> {bookingForReview.room.name}</p>
                                    <p className="mb-1"><strong>Nhận phòng:</strong> {new Date(bookingForReview.checkInDate).toLocaleDateString('vi-VN')}</p>
                                    <p className="mb-1"><strong>Trả phòng:</strong> {new Date(bookingForReview.checkOutDate).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <p className="mb-1"><strong>Số khách:</strong> {bookingForReview.numberOfAdults} người lớn{bookingForReview.numberOfChildren > 0 ? `, ${bookingForReview.numberOfChildren} trẻ em` : ''}</p>
                                    <p className="mb-1"><strong>Tổng tiền:</strong> <span className="text-danger fw-bold">{bookingForReview.priceDetails.finalPrice.toLocaleString('vi-VN')} VND</span></p>
                                    {bookingForReview.room.photos && bookingForReview.room.photos.length > 0 && (
                                        <div className="mt-2"><Image src={bookingForReview.room.photos[0].photos[0].url} alt={bookingForReview.room.name} width={200} height={120} style={{ objectFit: 'cover', borderRadius: '8px' }} /></div>
                                    )}
                                </div>
                            </div>
                            {bookingForReview.room.amenities && bookingForReview.room.amenities.length > 0 && (
                                <div className="mt-3"><strong>Tiện nghi:</strong><div className="d-flex flex-wrap gap-2 mt-2">{bookingForReview.room.amenities.flatMap(group => group.amenities).slice(0, 8).map((amenity, index) => (<span key={index} className="badge bg-secondary">{amenity.name}</span>))}</div></div>
                            )}
                        </div>
                    )}
                    {!isLoadingBooking && bookingForReview && (
                        <div className="bg-white rounded p-4 border">
                            <CreateReviewForm
                                bookingId={bookingForReview.id}
                                hotelName={hotel?.name || 'Khách sạn'}
                                onSuccess={() => {
                                    alert('Cảm ơn bạn đã đánh giá!');
                                    setShowReviewForm(false);
                                    setBookingForReview(null);
                                    const newSearchParams = new URLSearchParams(searchParams.toString());
                                    newSearchParams.delete('bookingId');
                                    newSearchParams.delete('review');
                                    router.replace(`/hotels/${hotelId}?${newSearchParams.toString()}`);
                                    setIsReviewsLoading(true);
                                    setReviewsPage(0);
                                    const hotelIdStr = (hotelId as string)?.trim();
                                    const currentHotelId = hotel?.id;
                                    
                                    // Validate hotelId
                                    if (!hotelIdStr || hotelIdStr === '') {
                                        console.error('[HotelDetailPage] Invalid hotelId for reload:', hotelIdStr);
                                        setIsReviewsLoading(false);
                                        return;
                                    }
                                    
                                    // Đảm bảo hotelId khớp trước khi reload
                                    if (hotelIdStr !== currentHotelId) {
                                        console.warn('[HotelDetailPage] Cannot reload reviews: hotelId mismatch', {
                                            hotelIdStr,
                                            currentHotelId
                                        });
                                        setIsReviewsLoading(false);
                                        return;
                                    }
                                    
                                    console.log('[HotelDetailPage] Reloading reviews for hotel:', hotelIdStr);
                                    
                                    getReviews({ 
                                        hotelId: hotelIdStr.trim(), 
                                        page: 0, 
                                        size: 10, 
                                        sortBy: 'createdAt', 
                                        sortDir: 'DESC' 
                                    })
                                        .then((result) => {
                                            // Backend đã filter theo hotelId rồi, nhưng vẫn filter lại để chắc chắn
                                            const filteredReviews = result.data.filter(review => {
                                                // Nếu review không có hotelId (backend không trả về), thì trust backend
                                                if (!review.hotelId || review.hotelId === '') {
                                                    return true; // Backend đã filter đúng rồi
                                                }
                                                // Nếu có hotelId, kiểm tra khớp
                                                const matches = review.hotelId === hotelIdStr || review.hotelId === currentHotelId;
                                                if (!matches) {
                                                    console.warn('[HotelDetailPage] Review hotelId mismatch in reload:', {
                                                        reviewId: review.id,
                                                        reviewHotelId: review.hotelId,
                                                        currentHotelId: hotelIdStr
                                                    });
                                                }
                                                return matches;
                                            });
                                            
                                            // Chỉ set reviews nếu hotelId vẫn khớp
                                            if (hotelIdStr === (hotelId as string) && hotelIdStr === hotel?.id) {
                                                setReviews(filteredReviews);
                                                setReviewsPage(result.currentPage);
                                                setReviewsHasMore(result.hasNext);
                                                reviewsFetchedForHotelId.current = hotelIdStr; // Cập nhật lại
                                            } else {
                                                console.warn('[HotelDetailPage] Hotel changed during reload, discarding results');
                                            }
                                        })
                                        .catch((err) => {
                                            console.error('[HotelDetailPage] Error reloading reviews:', err);
                                            setReviewsError('Không thể tải lại đánh giá.');
                                            setReviews([]); // Reset reviews khi có lỗi
                                        })
                                        .finally(() => setIsReviewsLoading(false));
                                }}
                                onCancel={() => {
                                    setShowReviewForm(false);
                                    setBookingForReview(null);
                                    const newSearchParams = new URLSearchParams(searchParams.toString());
                                    newSearchParams.delete('bookingId');
                                    newSearchParams.delete('review');
                                    router.replace(`/hotels/${hotelId}?${newSearchParams.toString()}`);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
            {isLoadingRoomDetail ? (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={handleCloseRoomDetailModal}>
                    <div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-body text-center p-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Đang tải...</span></div><p className="mt-3">Đang tải thông tin phòng...</p></div></div></div>
                </div>
            ) : (
                <RoomDetailModal room={roomDetail} isOpen={isRoomDetailModalOpen} onClose={handleCloseRoomDetailModal} onSelectRoom={handleSelectRoom} />
            )}
        </div>
    );
}