// 'use client';

// import { useSearchParams, useRouter } from 'next/navigation'; // Thêm useRouter
// import { useEffect, useState } from 'react';
// import { hotelService } from '@/service/hotelService';
// import { amenityService, Amenity } from '@/service/amenityService';
// import Image from 'next/image';
// import styles from './SearchPage.module.css';

// const formatDateRange = (checkin: string, nights: string): string => {
//     if (!checkin || !nights) return 'Chọn ngày';
//     try {
//         const checkinDate = new Date(checkin);
//         const checkoutDate = new Date(checkin);
//         const numNights = parseInt(nights, 10);
//         if (isNaN(numNights)) return 'Số đêm không hợp lệ';
//         checkoutDate.setDate(checkinDate.getDate() + numNights);
//         const formatDate = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
//         return `${formatDate(checkinDate)} - ${formatDate(checkoutDate)}, ${nights} đêm`;
//     } catch (e) {
//         return 'Ngày không hợp lệ';
//     }
// };

// interface FilterSectionProps {
//     title: string;
//     children: React.ReactNode;
// }

// const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => {
//     const [isOpen, setIsOpen] = useState(true);
//     return (
//         <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
//             <div className={styles.filterSectionHeader} onClick={() => setIsOpen(!isOpen)}>
//                 <strong style={{ color: '#000' }}>{title}</strong>
//                 <button className={`${styles.filterToggleButton} ${!isOpen ? styles.collapsed : ''}`}>
//                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" /></svg>
//                 </button>
//             </div>
//             <div className={`${styles.filterContent} ${!isOpen ? styles.collapsed : ''}`}>{children}</div>
//         </div>
//     );
// };

// const StarRating = ({ count }: { count: number }) => (
//     <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
//         <span>{count}</span>
//         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#ffc107' }}><path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" /></svg>
//     </div>
// );

// const amenityNameMap: { [key: string]: string } = {
//     'EARLY_CHECK_IN': 'Nhận phòng sớm',
//     'BLACKOUT_CURTAINS': 'Rèm cản sáng',
// };
// const translateAmenityName = (name: string) => amenityNameMap[name] || name;


// export default function SearchPage() {
//     const router = useRouter(); // Khởi tạo router
//     const searchParams = useSearchParams();
//     const hotelId = searchParams.get('hotelId');
//     const query = searchParams.get('query');
//     const checkin = searchParams.get('checkin');
//     const nights = searchParams.get('nights');
//     const guests = searchParams.get('guests');

//     const [hotels, setHotels] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [amenities, setAmenities] = useState<Amenity[]>([]);
//     const [loadingAmenities, setLoadingAmenities] = useState(true);

//     const displayDate = formatDateRange(checkin || '', nights || '1');
//     const displayGuests = guests || '2 người lớn, 0 trẻ em, 1 phòng';

//     useEffect(() => {
//         setLoading(true);
//         hotelService.getHotelsByCity(query || '').then((data: any[]) => {
//             if (hotelId) {
//                 const hotel = data.find((h: any) => String(h.id) === hotelId);
//                 setHotels(hotel ? [hotel] : []);
//             } else {
//                 setHotels(data);
//             }
//             setLoading(false);
//         }).catch(() => {
//             setHotels([]);
//             setLoading(false);
//         });
//     }, [hotelId, query]);

//     useEffect(() => {
//         setLoadingAmenities(true);
//         amenityService.getAllAmenities()
//             .then(data => setAmenities(data))
//             .catch(error => console.error("Không thể tải tiện nghi:", error))
//             .finally(() => setLoadingAmenities(false));
//     }, []);

//     // Hàm xử lý khi nhấn nút "Chọn phòng"
//     const handleSelectRoom = (selectedHotelId: string) => {
//         // Lấy lại các thông tin tìm kiếm hiện tại
//         const currentCheckin = checkin || new Date().toISOString().split('T')[0];
//         const currentNights = nights || '1';
//         const currentGuests = guests || '2 người lớn, 0 trẻ em, 1 phòng';

//         // Xây dựng query string để truyền qua trang booking
//         const params = new URLSearchParams({
//             hotelId: selectedHotelId,
//             checkin: currentCheckin,
//             nights: currentNights,
//             guests: currentGuests,
//         });

//         // Điều hướng đến trang booking trong group 'client'
//         router.push(`/booking?${params.toString()}`);
//     };

//     return (
//         <div className={styles.pageContainer}>
//             <div className={styles.searchBarWrapper}>
//                 <div className={styles.searchBar}>
//                     <div className={styles.searchBarSection}>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={`bi bi-geo-alt-fill ${styles.searchBarIcon}`} viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg>
//                         <input type="text" defaultValue={query || ''} className={styles.searchBarInput} />
//                     </div>
//                     <div className={styles.searchBarSection}>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={`bi bi-calendar3 ${styles.searchBarIcon}`} viewBox="0 0 16 16"><path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z" /><path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /></svg>
//                         <span className={styles.searchBarText}>{displayDate}</span>
//                     </div>
//                     <div className={styles.searchBarSection}>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={`bi bi-person-fill ${styles.searchBarIcon}`} viewBox="0 0 16 16"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
//                         <span className={styles.searchBarText}>{displayGuests}</span>
//                     </div>
//                     <button className={styles.searchButton}>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" /></svg>
//                         Tìm khách sạn
//                     </button>
//                 </div>
//             </div>

//             <div className={styles.mainContainer}>
//                 <aside className={styles.sidebar}>
//                     <FilterSection title="Khuyến mãi & Giảm giá">
//                         <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Được yêu thích nhất</label>
//                         <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Khuyến mãi dành cho bạn</label>
//                         <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Gần biển</label>
//                         <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Phù hợp cho gia đình</label>
//                         <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Phù hợp cho cặp đôi</label>
//                         <a href="#" className={styles.viewAllLink}>Xem Tất cả</a>                    </FilterSection>
//                     <FilterSection title="Đánh giá sao">
//                         {[5, 4, 3, 2, 1].map(stars => (<label key={stars} className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span><StarRating count={stars} /></label>))}
//                     </FilterSection>

//                     <FilterSection title="Tiện nghi">
//                         {loadingAmenities ? (
//                             <div style={{ color: '#666', fontSize: 14 }}>Đang tải tiện nghi...</div>
//                         ) : amenities.length > 0 ? (
//                             <>
//                                 {amenities.slice(0, 5).map(amenity => (
//                                     <label key={amenity.id} className={styles.customCheckboxLabel}>
//                                         <input type="checkbox" />
//                                         <span className={styles.checkmark}></span>
//                                         {translateAmenityName(amenity.name)}
//                                     </label>
//                                 ))}
//                                 {amenities.length > 5 && (
//                                     <a href="#" className={styles.viewAllLink}>Xem Tất cả</a>
//                                 )}
//                             </>
//                         ) : (
//                             <div style={{ color: '#666', fontSize: 14 }}>Không có tiện nghi nào.</div>
//                         )}
//                     </FilterSection>

//                     <FilterSection title="Linh hoạt hơn">
//                         <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Miễn phí hủy phòng</label>
//                         <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Thanh toán tại khách sạn</label>
//                     </FilterSection>
//                 </aside>

//                 <main className={styles.mainContent}>
//                     <div className={styles.listHeader}>
//                         <div>
//                             <h2 style={{ margin: 0, color: '#000' }}>{query || 'Kết quả tìm kiếm'}</h2>
//                             <p style={{ margin: 0, color: '#666' }}>{hotels.length} nơi lưu trú được tìm thấy</p>
//                         </div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//                             <span style={{ color: '#666' }}>Xếp theo: <a href="#" style={{ color: '#0d6efd', fontWeight: 'bold', textDecoration: 'none' }}>Độ phổ biến</a></span>
//                         </div>
//                     </div>

//                     {loading ? (<div style={{ textAlign: 'center', padding: 50, color: '#000' }}>Đang tải...</div>)
//                         : hotels.length === 0 ? (<div style={{ textAlign: 'center', padding: 50, color: '#000' }}>Không tìm thấy khách sạn phù hợp.</div>)
//                             : (
//                                 <div className={styles.hotelList}>
//                                     {hotels.map(hotel => {
//                                         const mainImage = hotel.photos?.[0]?.photos?.[0]?.url || '/image/hotel-default.jpg';
//                                         const thumbnailImages = hotel.photos?.[0]?.photos?.slice(1, 4) || [];
//                                         return (
//                                             <div key={hotel.id} className={styles.hotelCard}>
//                                                 <div className={styles.imageColumn}>
//                                                     <div className={styles.mainImageWrapper}>
//                                                         <Image src={mainImage} alt={hotel.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
//                                                     </div>
//                                                     <div className={styles.thumbnailGrid} style={{ gridTemplateColumns: `repeat(${thumbnailImages.length}, 1fr)` }}>
//                                                         {thumbnailImages.map((img: any, index: number) => (
//                                                             <div key={index} className={styles.thumbnailWrapper}>
//                                                                 <Image src={img.url || '/image/hotel-default.jpg'} alt={`${hotel.name} thumbnail ${index + 1}`} fill sizes="10vw" style={{ objectFit: 'cover' }} />
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </div>

//                                                 <div className={styles.infoColumn}>
//                                                     <h3 style={{ margin: 0, color: '#0d6efd', fontSize: 18, fontWeight: 'bold' }}>{hotel.name}</h3>
//                                                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                                                         <StarRating count={hotel.starRating || 4} />
//                                                     </div>
//                                                     <div style={{ fontSize: 14, color: '#666' }}>
//                                                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ verticalAlign: 'middle', marginRight: '4px' }}><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg>
//                                                         {hotel.ward?.name}, {hotel.district?.name}, {hotel.city?.name}
//                                                     </div>
//                                                     <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
//                                                         <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 'bold' }}>{/* Points */}</span>
//                                                         <span style={{ color: '#0d6efd', fontSize: 13, fontWeight: 'bold' }}>{/* Coupon */}</span>
//                                                     </div>
//                                                 </div>

//                                                 <div className={styles.priceColumn}>
//                                                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#e7f1ff', color: '#0d6efd', padding: '4px 8px', borderRadius: 4, fontWeight: 'bold', fontSize: 13, marginBottom: 'auto' }}>
//                                                         Đặc biệt dành cho bạn!
//                                                     </div>
//                                                     <div style={{ fontSize: 14, color: '#666', textDecoration: 'line-through', marginTop: 8 }}>{hotel.rawPricePerNight > 0 ? `${hotel.rawPricePerNight?.toLocaleString('vi-VN')} VND` : ''}</div>
//                                                     <div style={{ fontSize: 22, color: '#ef5350', fontWeight: 'bold' }}>{hotel.currentPricePerNight?.toLocaleString('vi-VN')} VND</div>
//                                                     <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>Chưa bao gồm thuế và phí</div>
//                                                     <button
//                                                         style={{ background: '#ef5350', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 16, width: '100%' }}
//                                                         onClick={() => handleSelectRoom(hotel.id)}
//                                                     >
//                                                         Chọn phòng
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         )
//                                     })}
//                                 </div>
//                             )}
//                 </main>
//             </div>
//         </div>
//     );
// }





'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hotelService, HotelResponse, Room } from '@/service/hotelService'; // THÊM Room
import { amenityService, Amenity } from '@/service/amenityService';
import Image from 'next/image';
import styles from './SearchPage.module.css';

// Component này sẽ render một card phòng
const RoomCard: React.FC<{ room: Room; onSelect: (room: Room, price: number, includesBreakfast: boolean) => void }> = ({ room, onSelect }) => {
    const roomPhotos = room.photos?.flatMap((cat: any) =>
        Array.isArray(cat.photos) ? cat.photos.map((p: any) => p.url) : []
    ) || [];
    const originalPrice = room.basePricePerNight * 1.25;
    const priceWithBreakfast = room.basePricePerNight + 100000;

    return (
        <div className="bg-white rounded shadow-sm p-3 mb-3 text-dark">
            <div className="row g-3">
                <div className="col-lg-4">
                    <h5 className="fw-bold d-block d-lg-none mb-2">{room.name}</h5>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '65%' }}>
                        <Image
                            src={roomPhotos[0] || "/placeholder.svg"}
                            fill
                            alt={room.name}
                            style={{ objectFit: "cover", borderRadius: "8px" }}
                            sizes="(max-width: 992px) 100vw, 33vw"
                        />
                    </div>
                    <div className="mt-2 small text-muted">
                        <div className="mb-1"><i className="bi bi-rulers me-2 text-primary"></i> {room.area} m²</div>
                        <div className="mb-1"><i className="bi bi-water me-2 text-primary"></i> Vòi tắm đứng</div>
                        <div className="mb-1"><i className="bi bi-snow me-2 text-primary"></i> Máy lạnh</div>
                    </div>
                    <a href="#" className="text-primary small fw-bold mt-2 d-inline-block">Xem chi tiết phòng</a>
                </div>
                <div className="col-lg-8">
                    <h5 className="fw-bold d-none d-lg-block">{room.name}</h5>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center border rounded p-3 mt-2">
                        <div className="flex-grow-1">
                            <div className="fw-bold mb-2">Không bao gồm bữa sáng</div>
                            <div className="text-muted small mb-1">{room.bedType?.name || '1 giường đôi'}</div>
                            <div className="text-success small mb-1">
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Không cần thanh toán ngay hôm nay
                            </div>
                            <div className="text-success small mb-1">
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Miễn phí hủy phòng
                                <i className="bi bi-info-circle ms-1"></i>
                            </div>
                        </div>
                        <div className="mx-md-3 my-3 my-md-0 text-center">
                            <i className="bi bi-people-fill fs-4 text-primary"></i>
                            <div className="fw-bold">{room.maxAdults}</div>
                        </div>
                        <div className="text-md-end ms-md-auto" style={{ minWidth: '180px' }}>
                            <span className="badge bg-danger mb-1">SALE 10.10</span>
                            <div className="text-muted text-decoration-line-through small">
                                {originalPrice.toLocaleString("vi-VN")} VND
                            </div>
                            <div className="fw-bold text-warning fs-5">
                                {room.basePricePerNight?.toLocaleString("vi-VN")} VND
                            </div>
                            <div className="text-muted small mb-2">Chưa bao gồm thuế và phí</div>
                            <button
                                className="btn btn-primary fw-bold w-100"
                                onClick={() => onSelect(room, room.basePricePerNight, false)}
                            >
                                Chọn
                            </button>
                        </div>
                    </div>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center border rounded p-3 mt-2">
                        <div className="flex-grow-1">
                            <div className="fw-bold mb-2">Bao gồm bữa sáng</div>
                            <div className="text-muted small mb-1">{room.bedType?.name || '1 giường đôi'}</div>
                        </div>
                        <div className="mx-md-3 my-3 my-md-0 text-center">
                            <i className="bi bi-people-fill fs-4 text-primary"></i>
                            <div className="fw-bold">{room.maxAdults}</div>
                        </div>
                        <div className="text-md-end ms-md-auto" style={{ minWidth: '180px' }}>
                            <div className="fw-bold text-warning fs-5">
                                {priceWithBreakfast.toLocaleString("vi-VN")} VND
                            </div>
                            <div className="text-muted small mb-2">Chưa bao gồm thuế và phí</div>
                            <button
                                className="btn btn-primary fw-bold w-100"
                                onClick={() => onSelect(room, priceWithBreakfast, true)}
                            >
                                Chọn
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- KẾT THÚC: SAO CHÉP COMPONENT PHÒNG ---


const formatDateRange = (checkin: string, nights: string): string => {
    if (!checkin || !nights) return 'Chọn ngày';
    try {
        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkin);
        const numNights = parseInt(nights, 10);
        if (isNaN(numNights)) return 'Số đêm không hợp lệ';
        checkoutDate.setDate(checkinDate.getDate() + numNights);
        const formatDate = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
        return `${formatDate(checkinDate)} - ${formatDate(checkoutDate)}, ${nights} đêm`;
    } catch (e) {
        return 'Ngày không hợp lệ';
    }
};

interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className={styles.filterSectionHeader} onClick={() => setIsOpen(!isOpen)}>
                <strong style={{ color: '#000' }}>{title}</strong>
                <button className={`${styles.filterToggleButton} ${!isOpen ? styles.collapsed : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" /></svg>
                </button>
            </div>
            <div className={`${styles.filterContent} ${!isOpen ? styles.collapsed : ''}`}>{children}</div>
        </div>
    );
};

const StarRating = ({ count }: { count: number }) => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span>{count}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: '#ffc107' }}><path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" /></svg>
    </div>
);

const amenityNameMap: { [key: string]: string } = {
    'EARLY_CHECK_IN': 'Nhận phòng sớm',
    'BLACKOUT_CURTAINS': 'Rèm cản sáng',
};
const translateAmenityName = (name: string) => amenityNameMap[name] || name;


export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hotelId = searchParams.get('hotelId');
    const query = searchParams.get('query');
    const checkin = searchParams.get('checkin');
    const nights = searchParams.get('nights');
    const guests = searchParams.get('guests');

    // State cho danh sách khách sạn (khi tìm kiếm chung)
    const [hotels, setHotels] = useState<any[]>([]);

    // THÊM STATE MỚI: State cho thông tin khách sạn và phòng (khi tìm theo hotelId)
    const [hotelInfo, setHotelInfo] = useState<HotelResponse | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);

    const [loading, setLoading] = useState(false);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [loadingAmenities, setLoadingAmenities] = useState(true);

    const displayDate = formatDateRange(checkin || '', nights || '1');
    const displayGuests = guests || '2 người lớn, 0 trẻ em, 1 phòng';

    useEffect(() => {
        setLoading(true);

        // --- LOGIC MỚI: Phân luồng xử lý ---
        if (hotelId) {
            // Luồng 1: Tìm kiếm theo hotelId cụ thể
            // Lấy thông tin chi tiết khách sạn
            hotelService.getHotelById(hotelId).then(data => {
                setHotelInfo(data);
                setHotels([data]); // Vẫn set hotels để hiển thị tiêu đề đúng
            }).catch(() => {
                setHotelInfo(null);
                setHotels([]);
            }).finally(() => {
                setLoading(false);
            });

            // Lấy danh sách phòng của khách sạn đó
            setLoadingRooms(true);
            hotelService.getRoomsByHotelId(hotelId).then(roomData => {
                setRooms(roomData);
            }).catch(() => {
                setRooms([]);
            }).finally(() => {
                setLoadingRooms(false);
            });

        } else {
            // Luồng 2: Tìm kiếm chung theo query (giữ nguyên)
            hotelService.getHotelsByCity(query || '').then((data: any[]) => {
                setHotels(data);
            }).catch(() => {
                setHotels([]);
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [hotelId, query]);


    useEffect(() => {
        setLoadingAmenities(true);
        amenityService.getAllAmenities()
            .then(data => setAmenities(data))
            .catch(error => console.error("Không thể tải tiện nghi:", error))
            .finally(() => setLoadingAmenities(false));
    }, []);


    const handleSelectRoom = (room: Room, price: number, includesBreakfast: boolean) => {
        if (!hotelId) return;

        const currentCheckin = checkin || new Date().toISOString().split('T')[0];
        const currentNights = nights || '1';

        const params = new URLSearchParams({
            hotelId: hotelId,
            roomId: room.id.toString(),
            roomName: room.name,
            price: price.toString(),
            checkin: currentCheckin,
            nights: currentNights.toString(),
            guests: room.maxAdults.toString(),
            breakfast: includesBreakfast.toString(),
        });

        router.push(`/booking?${params.toString()}`);
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.searchBarWrapper}>
                {/* ... (Phần search bar giữ nguyên) ... */}
                <div className={styles.searchBar}>
                    <div className={styles.searchBarSection}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={`bi bi-geo-alt-fill ${styles.searchBarIcon}`} viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg>
                        <input type="text" defaultValue={query || ''} className={styles.searchBarInput} />
                    </div>
                    <div className={styles.searchBarSection}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={`bi bi-calendar3 ${styles.searchBarIcon}`} viewBox="0 0 16 16"><path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z" /><path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /></svg>
                        <span className={styles.searchBarText}>{displayDate}</span>
                    </div>
                    <div className={styles.searchBarSection}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className={`bi bi-person-fill ${styles.searchBarIcon}`} viewBox="0 0 16 16"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
                        <span className={styles.searchBarText}>{displayGuests}</span>
                    </div>
                    <button className={styles.searchButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" /></svg>
                        Tìm khách sạn
                    </button>
                </div>
            </div>

            <div className={styles.mainContainer}>
                <aside className={styles.sidebar}>
                    {/* ... (Phần filter giữ nguyên) ... */}
                    <FilterSection title="Khuyến mãi & Giảm giá">
                        <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Được yêu thích nhất</label>
                        <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Khuyến mãi dành cho bạn</label>
                        <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Gần biển</label>
                        <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Phù hợp cho gia đình</label>
                        <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Phù hợp cho cặp đôi</label>
                        <a href="#" className={styles.viewAllLink}>Xem Tất cả</a>                    </FilterSection>
                    <FilterSection title="Đánh giá sao">
                        {[5, 4, 3, 2, 1].map(stars => (<label key={stars} className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span><StarRating count={stars} /></label>))}
                    </FilterSection>

                    <FilterSection title="Tiện nghi">
                        {loadingAmenities ? (
                            <div style={{ color: '#666', fontSize: 14 }}>Đang tải tiện nghi...</div>
                        ) : amenities.length > 0 ? (
                            <>
                                {amenities.slice(0, 5).map(amenity => (
                                    <label key={amenity.id} className={styles.customCheckboxLabel}>
                                        <input type="checkbox" />
                                        <span className={styles.checkmark}></span>
                                        {translateAmenityName(amenity.name)}
                                    </label>
                                ))}
                                {amenities.length > 5 && (
                                    <a href="#" className={styles.viewAllLink}>Xem Tất cả</a>
                                )}
                            </>
                        ) : (
                            <div style={{ color: '#666', fontSize: 14 }}>Không có tiện nghi nào.</div>
                        )}
                    </FilterSection>

                    <FilterSection title="Linh hoạt hơn">
                        <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Miễn phí hủy phòng</label>
                        <label className={styles.customCheckboxLabel}><input type="checkbox" /><span className={styles.checkmark}></span>Thanh toán tại khách sạn</label>
                    </FilterSection>
                </aside>

                <main className={styles.mainContent}>
                    <div className={styles.listHeader}>
                        <div>
                            <h2 style={{ margin: 0, color: '#000' }}>{query || 'Kết quả tìm kiếm'}</h2>
                            {/* Hiển thị số lượng dựa trên luồng */}
                            <p style={{ margin: 0, color: '#666' }}>
                                {hotelId ? `${rooms.length} loại phòng được tìm thấy` : `${hotels.length} nơi lưu trú được tìm thấy`}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ color: '#666' }}>Xếp theo: <a href="#" style={{ color: '#0d6efd', fontWeight: 'bold', textDecoration: 'none' }}>Độ phổ biến</a></span>
                        </div>
                    </div>

                    {/* --- THAY ĐỔI LỚN: LOGIC RENDER --- */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 50, color: '#000' }}>Đang tải...</div>
                    ) : hotelId ? (
                        // LUỒNG 1: HIỂN THỊ DANH SÁCH PHÒNG
                        <div>
                            {loadingRooms ? (
                                <div style={{ textAlign: 'center', padding: 50, color: '#000' }}>Đang tải danh sách phòng...</div>
                            ) : rooms.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 50, color: '#000' }}>Khách sạn này hiện không có phòng trống.</div>
                            ) : (
                                rooms.map(room => (
                                    <RoomCard key={room.id} room={room} onSelect={handleSelectRoom} />
                                ))
                            )}
                        </div>
                    ) : (
                        // LUỒNG 2: HIỂN THỊ DANH SÁCH KHÁCH SẠN 
                        hotels.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 50, color: '#000' }}>Không tìm thấy khách sạn phù hợp.</div>
                        ) : (
                            // BẮT ĐẦU ĐOẠN CODE THAY THẾ
                            <div className={styles.hotelList}>
                                {hotels.map(hotel => {
                                    const mainImage = hotel.photos?.[0]?.photos?.[0]?.url || '/image/hotel-default.jpg';
                                    // Lấy 4 ảnh thumbnail, nếu không có thì lấy mảng rỗng
                                    const thumbnailImages = hotel.photos?.[0]?.photos?.slice(1, 5) || [];

                                    // Dữ liệu giả lập vì không có trong object 'hotel' của bạn
                                    const ratingScore = 9.1;
                                    const reviewCount = 78;
                                    const ratingText = "Xuất sắc";

                                    // Logic để điều hướng đến trang chi tiết khi click
                                    const handleCardClick = () => {
                                        router.push(`/hotels/${hotel.id}?checkin=${checkin}&nights=${nights}&guests=${guests}`);
                                    };

                                    return (
                                        <div key={hotel.id} className={styles.hotelCard} style={{ cursor: 'pointer' }}>
                                            {/* Cột hình ảnh */}
                                            <div className={styles.imageColumn} onClick={handleCardClick}>
                                                <div className={styles.mainImageWrapper}>
                                                    <Image src={mainImage} alt={hotel.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                                                </div>
                                                <div className={styles.thumbnailGrid} style={{ gridTemplateColumns: `repeat(${thumbnailImages.length}, 1fr)` }}>
                                                    {thumbnailImages.map((img: any, index: number) => (
                                                        <div key={index} className={styles.thumbnailWrapper}>
                                                            <Image src={img.url || '/image/hotel-default.jpg'} alt={`${hotel.name} thumbnail ${index + 1}`} fill sizes="10vw" style={{ objectFit: 'cover' }} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Cột thông tin ở giữa */}
                                            <div className={styles.infoColumn} onClick={handleCardClick}>
                                                <h3 className="fw-bold text-dark mb-1 fs-5">{hotel.name}</h3>
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <span className="badge bg-primary fw-bold" style={{ fontSize: '14px' }}>{ratingScore}</span>
                                                    <span className="fw-bold text-dark">{ratingText}</span>
                                                    <span className="text-muted small">({reviewCount} đánh giá)</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <span className="badge bg-light text-dark border">Khách sạn</span>
                                                    <StarRating count={hotel.starRating || 4} />
                                                </div>
                                                <div className="text-muted small mb-3">
                                                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                                                    {hotel.ward?.name}, {hotel.district?.name}, {hotel.city?.name}
                                                </div>
                                                <div className="text-muted small">Dịch vụ trả phòng cấp tốc</div>

                                                {/* Phần khuyến mãi */}
                                                <div className="mt-auto pt-2">
                                                    <div className="d-flex align-items-center gap-2 border-top pt-2">
                                                        <span className="badge bg-info-soft text-info fw-bold">
                                                            <i className="bi bi-wallet2 me-1"></i>
                                                            Mã giảm đến 200K có sẵn trong ví của bạn!
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cột giá và nút bấm */}
                                            <div className={styles.priceColumn}>
                                                <div className="text-end">
                                                    <span className="badge bg-primary-soft text-primary mb-2">
                                                        <i className="bi bi-tsunami me-1"></i> Gần biển
                                                    </span>
                                                </div>
                                                <div className="text-end text-muted text-decoration-line-through small">
                                                    {/* Giá gốc có thể không có, hiển thị nếu lớn hơn giá hiện tại */}
                                                    {hotel.rawPricePerNight > hotel.currentPricePerNight
                                                        ? `${hotel.rawPricePerNight?.toLocaleString('vi-VN')} VND`
                                                        : ''}
                                                </div>
                                                <div className="text-end fs-4 text-danger fw-bolder mb-1">
                                                    {hotel.currentPricePerNight?.toLocaleString('vi-VN')} VND
                                                </div>
                                                <div className="text-end text-muted small mb-2">
                                                    Chỉ còn 2 phòng có giá này!
                                                </div>
                                                <button
                                                    className="btn btn-warning fw-bold w-100 py-2"
                                                    onClick={handleCardClick}
                                                >
                                                    Chọn phòng
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            // KẾT THÚC ĐOẠN CODE THAY THẾ
                        )
                    )}
                </main>
            </div>
        </div>
    );
}