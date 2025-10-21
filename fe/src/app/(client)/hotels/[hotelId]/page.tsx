// "use client";
// import { useEffect, useState, useRef } from "react";
// import { useParams } from "next/navigation";
// import Image from "next/image";
// import { hotelService, HotelResponse } from "@/service/hotelService";

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


// export default function HotelDetailPage() {
//     const { hotelId } = useParams();
//     const [hotel, setHotel] = useState<HotelResponse | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [rooms, setRooms] = useState<any[]>([]);
//     const [loadingRooms, setLoadingRooms] = useState(false);

//     // Tab active logic
//     const [activeTab, setActiveTab] = useState("overview");
//     const overviewRef = useRef<HTMLDivElement>(null);
//     const roomsSectionRef = useRef<HTMLDivElement>(null);
//     const locationRef = useRef<HTMLDivElement>(null);
//     const amenitiesRef = useRef<HTMLDivElement>(null);
//     const policyRef = useRef<HTMLDivElement>(null);
//     const reviewRef = useRef<HTMLDivElement>(null);

//     // Dropdown hiển thị giá
//     const priceDisplayOptions = [
//         "Mỗi phòng mỗi đêm (chưa bao gồm thuế và phí)",
//         "Mỗi phòng mỗi đêm (bao gồm thuế và phí)",
//         "Tổng giá (chưa bao gồm thuế và phí)",
//         "Tổng giá (bao gồm thuế và phí)",
//     ];
//     const [selectedPriceDisplay, setSelectedPriceDisplay] = useState(priceDisplayOptions[0]);
//     const tabLabels = [
//         { key: "overview", label: "Tổng quan" },
//         { key: "rooms", label: "Phòng" },
//         { key: "location", label: "Vị trí" },
//         { key: "amenities", label: "Tiện ích" },
//         { key: "policy", label: "Chính sách" },
//         { key: "review", label: "Đánh giá" },
//     ];
//     const tabRefs = tabLabels.map(() => useRef<HTMLButtonElement>(null));
//     const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
//     useEffect(() => {
//         const idx = tabLabels.findIndex(tab => tab.key === activeTab);
//         const btn = tabRefs[idx]?.current;
//         if (btn) {
//             const rect = btn.getBoundingClientRect();
//             const parentRect = btn.parentElement?.getBoundingClientRect();
//             if (parentRect) {
//                 setUnderlineStyle({
//                     left: rect.left - parentRect.left,
//                     width: rect.width
//                 });
//             }
//         }
//     }, [activeTab]);
//     const handleTabClick = (tab: string) => {
//         setActiveTab(tab);
//         let ref = null;
//         if (tab === "overview") ref = overviewRef;
//         if (tab === "rooms") ref = roomsSectionRef;
//         if (tab === "location") ref = locationRef;
//         if (tab === "amenities") ref = amenitiesRef;
//         if (tab === "policy") ref = policyRef;
//         if (tab === "review") ref = reviewRef;
//         if (ref && ref.current) {
//             window.scrollTo({
//                 top: ref.current.offsetTop - 60,
//                 behavior: "smooth"
//             });
//         }
//     };
//     useEffect(() => {
//         const handleScroll = () => {
//             const sections = [
//                 { tab: "overview", ref: overviewRef },
//                 { tab: "rooms", ref: roomsSectionRef },
//                 { tab: "location", ref: locationRef },
//                 { tab: "amenities", ref: amenitiesRef },
//                 { tab: "policy", ref: policyRef },
//                 { tab: "review", ref: reviewRef },
//             ];
//             for (let i = sections.length - 1; i >= 0; i--) {
//                 const section = sections[i];
//                 if (section.ref.current) {
//                     const rect = section.ref.current.getBoundingClientRect();
//                     if (rect.top < 120) {
//                         setActiveTab(section.tab);
//                         break;
//                     }
//                 }
//             }
//         };
//         window.addEventListener("scroll", handleScroll);
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);
//     useEffect(() => {
//         async function fetchHotel() {
//             try {
//                 const data = await hotelService.getHotelById(hotelId as string);
//                 setHotel(data);
//             } catch (err: any) {
//                 setError("Không tìm thấy khách sạn");
//                 setHotel(null);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchHotel();
//     }, [hotelId]);

//     useEffect(() => {
//         if (!hotelId) return;
//         setLoadingRooms(true);
//         fetch(`http://localhost:8080/accommodation/rooms/hotel/${hotelId}`)
//             .then(res => res.json())
//             .then(json => {
//                 if (Array.isArray(json)) {
//                     setRooms(json);
//                 } else if (json.statusCode === 200 && Array.isArray(json.data)) {
//                     setRooms(json.data);
//                 } else {
//                     setRooms([]);
//                 }
//             })
//             .catch(() => setRooms([]))
//             .finally(() => setLoadingRooms(false));
//     }, [hotelId]);

//     // Scroll to section when tab click
//     // const handleTabClick = (tab: string) => {
//     //     setActiveTab(tab);
//     //     let ref = null;
//     //     if (tab === "overview") ref = overviewRef;
//     //     if (tab === "rooms") ref = roomsSectionRef;
//     //     if (tab === "location") ref = locationRef;
//     //     if (tab === "amenities") ref = amenitiesRef;
//     //     if (tab === "policy") ref = policyRef;
//     //     if (tab === "review") ref = reviewRef;
//     //     if (ref && ref.current) {
//     //         window.scrollTo({
//     //             top: ref.current.offsetTop - 60,
//     //             behavior: "smooth"
//     //         });
//     //     }
//     // };

//     // Auto tab switch when scroll
//     useEffect(() => {
//         const handleScroll = () => {
//             const sections = [
//                 { tab: "overview", ref: overviewRef },
//                 { tab: "rooms", ref: roomsSectionRef },
//                 { tab: "location", ref: locationRef },
//                 { tab: "amenities", ref: amenitiesRef },
//                 { tab: "policy", ref: policyRef },
//                 { tab: "review", ref: reviewRef },
//             ];
//             for (let i = sections.length - 1; i >= 0; i--) {
//                 const section = sections[i];
//                 if (section.ref.current) {
//                     const rect = section.ref.current.getBoundingClientRect();
//                     if (rect.top < 120) {
//                         setActiveTab(section.tab);
//                         break;
//                     }
//                 }
//             }
//         };
//         window.addEventListener("scroll", handleScroll);
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);

//     if (loading) return <div className="container py-5">Đang tải...</div>;
//     if (error || !hotel) return <div className="container py-5 text-danger">{error || "Không tìm thấy khách sạn"}</div>;

//     const allPhotoUrls = hotel.photos
//         ? hotel.photos.flatMap((cat) => Array.isArray(cat.photos) ? cat.photos.map((p) => p.url) : [])
//         : [];

//     const demoHotel = {
//         name: hotel.name || "Davue Hotel Da Nang",
//         address: hotel.address || "57-59 Đường Dương Đình Nghệ, Mỹ An, Ngũ Hành Sơn, Đà Nẵng",
//         status: hotel.status || "active",
//         averageScore: typeof hotel.averageScore === "number" ? hotel.averageScore : 8.7,
//         currentPricePerNight: typeof hotel.currentPricePerNight === "number" ? hotel.currentPricePerNight : 229901,
//         rawPricePerNight: typeof hotel.rawPricePerNight === "number" ? hotel.rawPricePerNight : 299000,
//         availableRooms: typeof hotel.availableRooms === "number" ? hotel.availableRooms : 5,
//         description: hotel.description ||
//             "Khách sạn nằm gần biển Mỹ Khê, phòng đẹp, nhân viên thân thiện, tiện nghi đầy đủ, phù hợp nghỉ dưỡng và công tác.",
//         photos: allPhotoUrls.length > 0
//             ? allPhotoUrls
//             : [
//                 "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-b0698f733b24661b9d24b98b30019ca1.jpeg",
//                 "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg",
//                 "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg",
//                 "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg",
//                 "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-1e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.jpeg",
//                 "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-2e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.jpeg",
//                 "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-3e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.jpeg",
//                 "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-4e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.jpeg",
//             ],
//     };

//     const demoAmenities = [
//         { icon: "bi bi-wifi", label: "WiFi" },
//         { icon: "bi bi-snow", label: "Máy lạnh" },
//         { icon: "bi bi-building", label: "Nhà hàng" },
//         { icon: "bi bi-clock", label: "Lễ tân 24h" },
//         { icon: "bi bi-elevator", label: "Thang máy" },
//         { icon: "bi bi-geo-alt", label: "Gần biển Mỹ Khê" },
//     ];

//     const demoNearby = [
//         { name: "Biển Mỹ Khê", distance: "868 m" },
//         { name: "Four Points by Sheraton Danang", distance: "2.65 km" },
//         { name: "Số 294 Trưng Nữ Vương", distance: "2.96 km" },
//         { name: "Khách sạn Mường Thanh Đà Nẵng", distance: "92 m" },
//         { name: "Apple Hotel", distance: "86 m" },
//     ];

//     const demoReview = {
//         score: 8.7,
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

//     const mainPhoto = demoHotel.photos[0];
//     const sidePhotos = demoHotel.photos.slice(1, 5);

//     return (
//         <div style={{ background: '#f7f9fb', minHeight: '100vh' }}>
//             <style>{customStyles}</style>
//             {/* ---  TAB ĐIỀU HƯỚNG  --- */}
//             <div className="sticky-tab-bar">
//                 <div className="container">
//                     <div className="tab-list" style={{ position: "relative" }}>
//                         {tabLabels.map((tab, idx) => (
//                             <button
//                                 key={tab.key}
//                                 ref={tabRefs[idx]}
//                                 className={`tab-item${activeTab === tab.key ? " active" : ""}`}
//                                 onClick={() => handleTabClick(tab.key)}
//                                 type="button"
//                             >
//                                 {tab.label}
//                             </button>
//                         ))}
//                         <div
//                             className="tab-underline"
//                             style={{
//                                 left: underlineStyle.left,
//                                 width: underlineStyle.width,
//                                 display: underlineStyle.width ? "block" : "none"
//                             }}
//                         />
//                     </div>
//                 </div>
//             </div>
//             <div style={{
//                 background: 'linear-gradient(90deg,#1e3c72 0,#2a5298 100%)',
//                 color: '#fff',
//                 padding: '30px 0 8px 0'
//             }}>
//                 <div className="container d-flex align-items-center justify-content-between py-2">
//                     <div className="d-flex align-items-center gap-3">
//                         <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
//                             <i className="bi bi-geo-alt-fill me-2"></i>
//                             <span className="fw-bold">{demoHotel.name}</span>
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
//             {/*  điều hướng + thanh gạch xanh phía trên */}
//             <div style={{ background: '#fff', borderBottom: '2px solid #e3e6ea', position: 'relative', zIndex: 10 }}>
//                 <div style={{
//                     height: '4px',
//                     background: '#1565c0',
//                     width: '100%',
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     zIndex: 11
//                 }} />

//             </div>


//             <div className="sticky-tab-bar">
//                 <div className="container d-flex align-items-center gap-4" style={{ height: '48px', position: 'relative', zIndex: 12 }}>
//                     <button
//                         className={`tab-item${activeTab === "overview" ? " active" : ""}`}
//                         onClick={() => handleTabClick("overview")}
//                         type="button"
//                     >
//                         Tổng quan
//                     </button>
//                     <button
//                         className={`tab-item${activeTab === "rooms" ? " active" : ""}`}
//                         onClick={() => handleTabClick("rooms")}
//                         type="button"
//                     >
//                         Phòng
//                     </button>
//                     <button
//                         className={`tab-item${activeTab === "location" ? " active" : ""}`}
//                         onClick={() => handleTabClick("location")}
//                         type="button"
//                     >
//                         Vị trí
//                     </button>
//                     <button
//                         className={`tab-item${activeTab === "amenities" ? " active" : ""}`}
//                         onClick={() => handleTabClick("amenities")}
//                         type="button"
//                     >
//                         Tiện ích
//                     </button>
//                     <button
//                         className={`tab-item${activeTab === "policy" ? " active" : ""}`}
//                         onClick={() => handleTabClick("policy")}
//                         type="button"
//                     >
//                         Chính sách
//                     </button>
//                     <button
//                         className={`tab-item${activeTab === "review" ? " active" : ""}`}
//                         onClick={() => handleTabClick("review")}
//                         type="button"
//                     >
//                         Đánh giá
//                     </button>
//                 </div>
//             </div>
//             {/* ---  NAV XANH ĐẬM   --- */}

//             {/* Grid ảnh 1 lớn 4 nhỏ đều nhau */}
//             <div className="container mt-4">
//                 <div className="row g-2">
//                     <div className="col-md-7">
//                         <div style={{ borderRadius: '16px', overflow: 'hidden', width: '100%', height: '320px' }}>
//                             <Image src={mainPhoto} width={700} height={320} alt="Hotel main photo" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
//                         </div>
//                     </div>
//                     <div className="col-md-5">
//                         <div className="row g-2" style={{ minHeight: '320px' }}>
//                             {sidePhotos.map((url, idx) => (
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
//             {/* Card info nổi bo góc, đổ bóng */}
//             <div className="container" style={{ marginTop: '32px', position: 'relative', zIndex: 2 }}>
//                 <div className="row gx-4 gy-4">
//                     <div className="col-lg-8">
//                         <div className="card shadow-lg p-4 mb-4" style={{ borderRadius: '18px', background: '#fff' }}>
//                             <div className="d-flex align-items-center mb-2">
//                                 <span className="badge bg-primary me-2">Khách Sạn</span>
//                                 <span className="text-warning fw-bold">★★★★★</span>
//                                 <span className="ms-3 fw-bold fs-4 text-dark">{demoHotel.name}</span>
//                             </div>
//                             <div className="mb-2">
//                                 <span className="fw-bold">Địa chỉ:</span> {demoHotel.address}
//                             </div>
//                             <div className="mb-2 d-flex align-items-center flex-wrap">
//                                 <span className="fw-bold">Giá phòng/đêm từ:</span>
//                                 <span className="text-danger fw-bold ms-2">
//                                     {typeof demoHotel.currentPricePerNight === "number" ? demoHotel.currentPricePerNight.toLocaleString("vi-VN") : "Liên hệ"} VND
//                                 </span>
//                                 {typeof demoHotel.rawPricePerNight === "number" && typeof demoHotel.currentPricePerNight === "number" && demoHotel.rawPricePerNight > demoHotel.currentPricePerNight && (
//                                     <span className="text-muted text-decoration-line-through ms-2">{demoHotel.rawPricePerNight.toLocaleString("vi-VN")} VND</span>
//                                 )}
//                                 <button className="btn btn-warning btn-lg fw-bold px-4 ms-3 mt-2 mt-lg-0">Chọn phòng</button>
//                             </div>
//                             <div className="mb-2">
//                                 <span className="fw-bold">Tiện ích chính:</span>
//                                 <div className="d-flex flex-wrap mt-2">
//                                     {demoAmenities.map((item, idx) => (
//                                         <span key={idx} className="me-3 mb-2 d-flex align-items-center">
//                                             <i className={item.icon + " text-primary me-1"} style={{ fontSize: "1.2rem" }}></i>
//                                             <span className="text-dark small fw-semibold">{item.label}</span>
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>
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
//             {/* Card review bo góc, spacing */}
//             <div className="container mb-4">
//                 <div className="row">
//                     <div className="col-lg-8">
//                         <div className="card shadow p-4" style={{ borderRadius: '16px', background: '#fff' }}>
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
//                     </div>
//                 </div>
//             </div>
//             {/* Card mô tả bo góc */}
//             <div className="container mb-4">
//                 <div className="row">
//                     <div className="col-lg-8">
//                         <div className="card shadow p-4" style={{ borderRadius: '16px', background: '#fff' }}>
//                             <h5 className="fw-bold mb-2">Mô tả khách sạn</h5>
//                             <p className="mb-0 text-dark">{demoHotel.description}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* --- PHẦN HIỂN THỊ PHÒNG --- */}
//             <div ref={roomsSectionRef} className="container mb-5">
//                 <h4 className="fw-bold mb-3 text-dark">Những phòng còn trống tại {demoHotel.name}</h4>
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
//                                 <a
//                                     className="dropdown-toggle text-primary text-decoration-none fw-semibold small"
//                                     href="#"
//                                     role="button"
//                                     id="priceDisplayDropdown"
//                                     data-bs-toggle="dropdown"
//                                     aria-expanded="false"
//                                 >
//                                     {selectedPriceDisplay}
//                                 </a>
//                                 <ul className="dropdown-menu dropdown-menu-end price-dropdown-menu" aria-labelledby="priceDisplayDropdown">
//                                     {priceDisplayOptions.map((option, index) => (
//                                         <li key={index}>
//                                             <a
//                                                 className={`dropdown-item ${selectedPriceDisplay === option ? 'active' : ''}`}
//                                                 href="#"
//                                                 onClick={(e) => {
//                                                     e.preventDefault();
//                                                     setSelectedPriceDisplay(option);
//                                                 }}
//                                             >
//                                                 {selectedPriceDisplay === option
//                                                     ? <i className="bi bi-check-circle-fill text-primary me-2"></i>
//                                                     : <i className="bi bi-circle me-2" style={{ visibility: 'hidden' }}></i>}
//                                                 {option}
//                                             </a>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 {loadingRooms ? (
//                     <div className="text-center p-5">
//                         <div className="spinner-border text-primary" role="status">
//                             <span className="visually-hidden">Đang tải phòng...</span>
//                         </div>
//                     </div>
//                 ) : rooms.length === 0 ? (
//                     <div className="alert alert-secondary text-center">Không có phòng nào khả dụng.</div>
//                 ) : (
//                     <div>
//                         {rooms.map(room => {
//                             const roomPhotos = room.photos?.flatMap((cat: any) =>
//                                 Array.isArray(cat.photos) ? cat.photos.map((p: any) => p.url) : []
//                             ) || [];
//                             const originalPrice = room.basePricePerNight * 1.25;
//                             return (
//                                 <div key={room.id} className="bg-white rounded shadow-sm p-3 mb-3 text-dark">
//                                     <div className="row g-3">
//                                         <div className="col-lg-4">
//                                             <h5 className="fw-bold d-block d-lg-none mb-2">{room.name}</h5>
//                                             <Image
//                                                 src={roomPhotos[0] || "/placeholder.svg"}
//                                                 width={400}
//                                                 height={250}
//                                                 alt={room.name}
//                                                 style={{ objectFit: "cover", borderRadius: "8px", width: "100%", height: "auto" }}
//                                             />
//                                             <div className="mt-2 small text-muted">
//                                                 <div className="mb-1"><i className="bi bi-rulers me-2 text-primary"></i> {room.area} m²</div>
//                                                 <div className="mb-1"><i className="bi bi-water me-2 text-primary"></i> Vòi tắm đứng</div>
//                                                 <div className="mb-1"><i className="bi bi-snow me-2 text-primary"></i> Máy lạnh</div>
//                                             </div>
//                                             <a href="#" className="text-primary small fw-bold mt-2 d-inline-block">Xem chi tiết phòng</a>
//                                         </div>
//                                         <div className="col-lg-8">
//                                             <h5 className="fw-bold d-none d-lg-block">{room.name}</h5>
//                                             <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center border rounded p-3 mt-2">
//                                                 <div className="flex-grow-1">
//                                                     <div className="fw-bold mb-2">Không bao gồm bữa sáng</div>
//                                                     <div className="text-muted small mb-1">{room.bedType?.name || '1 giường đôi'}</div>
//                                                     <div className="text-success small mb-1">
//                                                         <i className="bi bi-check-circle-fill me-1"></i>
//                                                         Không cần thanh toán ngay hôm nay
//                                                     </div>
//                                                     <div className="text-success small mb-1">
//                                                         <i className="bi bi-check-circle-fill me-1"></i>
//                                                         Miễn phí hủy phòng trước 19 thg 10 12:59
//                                                         <i className="bi bi-info-circle ms-1"></i>
//                                                     </div>
//                                                 </div>
//                                                 <div className="mx-md-3 my-3 my-md-0 text-center">
//                                                     <i className="bi bi-people-fill fs-4 text-primary"></i>
//                                                     <div className="fw-bold">{room.maxAdults}</div>
//                                                 </div>
//                                                 <div className="text-md-end ms-md-auto" style={{ minWidth: '180px' }}>
//                                                     <span className="badge bg-danger mb-1">SALE 10.10</span>
//                                                     <div className="text-muted text-decoration-line-through small">
//                                                         {originalPrice.toLocaleString("vi-VN")} VND
//                                                     </div>
//                                                     <div className="fw-bold text-warning fs-5">
//                                                         {room.basePricePerNight?.toLocaleString("vi-VN")} VND
//                                                     </div>
//                                                     <div className="text-muted small mb-2">Chưa bao gồm thuế và phí</div>
//                                                     <button className="btn btn-primary fw-bold w-100">Chọn</button>
//                                                     <div className="text-success small mt-1">
//                                                         <i className="bi bi-gem me-1"></i> Earn 1.088 Points
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center border rounded p-3 mt-2">
//                                                 <div className="flex-grow-1">
//                                                     <div className="fw-bold mb-2">Bao gồm bữa sáng</div>
//                                                     <div className="text-muted small mb-1">{room.bedType?.name || '1 giường đôi'}</div>
//                                                 </div>
//                                                 <div className="mx-md-3 my-3 my-md-0 text-center">
//                                                     <i className="bi bi-people-fill fs-4 text-primary"></i>
//                                                     <div className="fw-bold">{room.maxAdults}</div>
//                                                 </div>
//                                                 <div className="text-md-end ms-md-auto" style={{ minWidth: '180px' }}>
//                                                     <div className="fw-bold text-warning fs-5">
//                                                         {(room.basePricePerNight + 100000).toLocaleString("vi-VN")} VND
//                                                     </div>
//                                                     <div className="text-muted small mb-2">Chưa bao gồm thuế và phí</div>
//                                                     <button className="btn btn-primary fw-bold w-100">Chọn</button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }



"use client";
// THAY ĐỔI 1: Import thêm 'useRouter'
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { hotelService, HotelResponse, Room } from "@/service/hotelService";

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


export default function HotelDetailPage() {
    const { hotelId } = useParams();
    // THAY ĐỔI 2: Khởi tạo router
    const router = useRouter();
    const [hotel, setHotel] = useState<HotelResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [roomsError, setRoomsError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState("overview");
    const overviewRef = useRef<HTMLDivElement>(null);
    const roomsSectionRef = useRef<HTMLDivElement>(null);
    const locationRef = useRef<HTMLDivElement>(null);
    const amenitiesRef = useRef<HTMLDivElement>(null);
    const policyRef = useRef<HTMLDivElement>(null);
    const reviewRef = useRef<HTMLDivElement>(null);

    const priceDisplayOptions = [
        "Mỗi phòng mỗi đêm (chưa bao gồm thuế và phí)",
        "Mỗi phòng mỗi đêm (bao gồm thuế và phí)",
        "Tổng giá (chưa bao gồm thuế và phí)",
        "Tổng giá (bao gồm thuế và phí)",
    ];
    const [selectedPriceDisplay, setSelectedPriceDisplay] = useState(priceDisplayOptions[0]);
    const tabLabels = [
        { key: "overview", label: "Tổng quan" },
        { key: "rooms", label: "Phòng" },
        { key: "location", label: "Vị trí" },
        { key: "amenities", label: "Tiện ích" },
        { key: "policy", label: "Chính sách" },
        { key: "review", label: "Đánh giá" },
    ];
    const tabRefs = tabLabels.map(() => useRef<HTMLButtonElement>(null));
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    // ... (Toàn bộ các useEffect và hàm khác giữ nguyên) ...

    useEffect(() => {
        const idx = tabLabels.findIndex(tab => tab.key === activeTab);
        const btn = tabRefs[idx]?.current;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            const parentRect = btn.parentElement?.getBoundingClientRect();
            if (parentRect) {
                setUnderlineStyle({
                    left: rect.left - parentRect.left,
                    width: rect.width
                });
            }
        }
    }, [activeTab]);
    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        let ref = null;
        if (tab === "overview") ref = overviewRef;
        if (tab === "rooms") ref = roomsSectionRef;
        if (tab === "location") ref = locationRef;
        if (tab === "amenities") ref = amenitiesRef;
        if (tab === "policy") ref = policyRef;
        if (tab === "review") ref = reviewRef;
        if (ref && ref.current) {
            window.scrollTo({
                top: ref.current.offsetTop - 60,
                behavior: "smooth"
            });
        }
    };
    useEffect(() => {
        const handleScroll = () => {
            const sections = [
                { tab: "overview", ref: overviewRef },
                { tab: "rooms", ref: roomsSectionRef },
                { tab: "location", ref: locationRef },
                { tab: "amenities", ref: amenitiesRef },
                { tab: "policy", ref: policyRef },
                { tab: "review", ref: reviewRef },
            ];
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.ref.current) {
                    const rect = section.ref.current.getBoundingClientRect();
                    if (rect.top < 120) {
                        setActiveTab(section.tab);
                        break;
                    }
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    useEffect(() => {
        async function fetchHotel() {
            try {
                const data = await hotelService.getHotelById(hotelId as string);
                setHotel(data);
            } catch (err: any) {
                setError("Không tìm thấy khách sạn");
                setHotel(null);
            } finally {
                setLoading(false);
            }
        }
        if (hotelId) {
            fetchHotel();
        }
    }, [hotelId]);

    useEffect(() => {
        if (!hotelId) return;

        const fetchRooms = async () => {
            setLoadingRooms(true);
            setRoomsError(null);
            try {
                const fetchedRooms = await hotelService.getRoomsByHotelId(hotelId as string);
                setRooms(fetchedRooms);
            } catch (error) {
                console.error("Failed to fetch rooms:", error);
                setRoomsError("Không thể tải danh sách phòng. Vui lòng thử lại sau.");
                setRooms([]);
            } finally {
                setLoadingRooms(false);
            }
        };

        fetchRooms();
    }, [hotelId]);


    // Auto tab switch when scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = [
                { tab: "overview", ref: overviewRef },
                { tab: "rooms", ref: roomsSectionRef },
                { tab: "location", ref: locationRef },
                { tab: "amenities", ref: amenitiesRef },
                { tab: "policy", ref: policyRef },
                { tab: "review", ref: reviewRef },
            ];
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.ref.current) {
                    const rect = section.ref.current.getBoundingClientRect();
                    if (rect.top < 120) {
                        setActiveTab(section.tab);
                        break;
                    }
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // THAY ĐỔI 3: Hàm xử lý điều hướng đến trang booking
    const handleSelectRoom = (room: Room, price: number, includesBreakfast: boolean) => {
        if (!hotelId) return;

        // Giả sử các thông tin này sẽ được lấy từ form tìm kiếm
        // Ở đây ta dùng giá trị mặc định để demo
        const checkin = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay dạng YYYY-MM-DD
        const nights = 1;
        const guests = room.maxAdults;

        const params = new URLSearchParams({
            hotelId: hotelId as string,
            roomId: room.id.toString(),
            roomName: room.name,
            price: price.toString(),
            checkin: checkin,
            nights: nights.toString(),
            guests: guests.toString(),
            breakfast: includesBreakfast.toString(),
        });

        router.push(`/booking?${params.toString()}`);
    };

    if (loading) return <div className="container py-5">Đang tải...</div>;
    if (error || !hotel) return <div className="container py-5 text-danger">{error || "Không tìm thấy khách sạn"}</div>;

    // ... (Toàn bộ phần demoHotel, demoAmenities... giữ nguyên) ...
    const allPhotoUrls = hotel.photos
        ? hotel.photos.flatMap((cat) => Array.isArray(cat.photos) ? cat.photos.map((p) => p.url) : [])
        : [];

    const demoHotel = {
        name: hotel.name || "Davue Hotel Da Nang",
        address: hotel.address || "57-59 Đường Dương Đình Nghệ, Mỹ An, Ngũ Hành Sơn, Đà Nẵng",
        status: hotel.status || "active",
        averageScore: typeof hotel.averageScore === "number" ? hotel.averageScore : 8.7,
        currentPricePerNight: typeof hotel.currentPricePerNight === "number" ? hotel.currentPricePerNight : 229901,
        rawPricePerNight: typeof hotel.rawPricePerNight === "number" ? hotel.rawPricePerNight : 299000,
        availableRooms: typeof hotel.availableRooms === "number" ? hotel.availableRooms : 5,
        description: hotel.description ||
            "Khách sạn nằm gần biển Mỹ Khê, phòng đẹp, nhân viên thân thiện, tiện nghi đầy đủ, phù hợp nghỉ dưỡng và công tác.",
        photos: allPhotoUrls.length > 0
            ? allPhotoUrls
            : [
                "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-b0698f733b24661b9d24b98b30019ca1.jpeg",
                "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-8ca9569de0ab3f614019d698d56cc793.jpeg",
                "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-c5671fb5232227e8d841abcbab94f24c.jpeg",
                "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-aec1028c4f98d763a9ed14d005add27a.jpeg",
                "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-1e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.jpeg",
                "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-2e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.jpeg",
                "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-3e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.jpeg",
                "https://holidate-storage.s3.ap-southeast-1.amazonaws.com/20033631-4e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e.jpeg",
            ],
    };

    const demoAmenities = [
        { icon: "bi bi-wifi", label: "WiFi" },
        { icon: "bi bi-snow", label: "Máy lạnh" },
        { icon: "bi bi-building", label: "Nhà hàng" },
        { icon: "bi bi-clock", label: "Lễ tân 24h" },
        { icon: "bi bi-elevator", label: "Thang máy" },
        { icon: "bi bi-geo-alt", label: "Gần biển Mỹ Khê" },
    ];

    const demoNearby = [
        { name: "Biển Mỹ Khê", distance: "868 m" },
        { name: "Four Points by Sheraton Danang", distance: "2.65 km" },
        { name: "Số 294 Trưng Nữ Vương", distance: "2.96 km" },
        { name: "Khách sạn Mường Thanh Đà Nẵng", distance: "92 m" },
        { name: "Apple Hotel", distance: "86 m" },
    ];

    const demoReview = {
        score: 8.7,
        text: "Rất tốt",
        count: 1071,
        tags: [
            { label: "Khoảng Cách Đến Trung Tâm", count: 46 },
            { label: "Khu Vực Xung Quanh", count: 46 },
            { label: "Không Gian Phòng", count: 38 },
            { label: "Nhân Viên Thân Thiện", count: 35 },
        ],
        comment: "Nhân viên rất nhiệt tình, từ nhân viên buồng giúp hành lý, nhân viên lễ tân. Giải thích dễ hiểu, thân thiện. Phòng cảm ơn tốt, dọn dẹp sạch sẽ. Phòng rộng rãi, thoáng mát, tiện nghi.",
        user: "L***e",
        userScore: 8.4,
    };

    return (
        // ... (Toàn bộ JSX từ <div> đến phần hiển thị phòng giữ nguyên) ...
        <div style={{ background: '#f7f9fb', minHeight: '100vh' }}>
            <style>{customStyles}</style>
            {/* ---  TAB ĐIỀU HƯỚNG  --- */}
            <div className="sticky-tab-bar">
                <div className="container">
                    <div className="tab-list" style={{ position: "relative" }}>
                        {tabLabels.map((tab, idx) => (
                            <button
                                key={tab.key}
                                ref={tabRefs[idx]}
                                className={`tab-item${activeTab === tab.key ? " active" : ""}`}
                                onClick={() => handleTabClick(tab.key)}
                                type="button"
                            >
                                {tab.label}
                            </button>
                        ))}
                        <div
                            className="tab-underline"
                            style={{
                                left: underlineStyle.left,
                                width: underlineStyle.width,
                                display: underlineStyle.width ? "block" : "none"
                            }}
                        />
                    </div>
                </div>
            </div>
            <div style={{
                background: 'linear-gradient(90deg,#1e3c72 0,#2a5298 100%)',
                color: '#fff',
                padding: '30px 0 8px 0'
            }}>
                <div className="container d-flex align-items-center justify-content-between py-2">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
                            <i className="bi bi-geo-alt-fill me-2"></i>
                            <span className="fw-bold">{demoHotel.name}</span>
                        </div>
                        <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
                            <i className="bi bi-calendar-event me-2"></i>
                            <span>20 thg 10 - 21 thg 10, 1 đêm</span>
                        </div>
                        <div className="bg-primary bg-opacity-25 rounded-3 px-3 py-2 d-flex align-items-center">
                            <i className="bi bi-person me-2"></i>
                            <span>2 người lớn, 1 phòng</span>
                        </div>
                    </div>
                    <div>
                        <button className="btn btn-light fw-bold px-4">
                            <i className="bi bi-search me-2"></i>
                            Tìm khách sạn
                        </button>
                    </div>
                </div>
            </div>
            {/*  điều hướng + thanh gạch xanh phía trên */}
            <div style={{ background: '#fff', borderBottom: '2px solid #e3e6ea', position: 'relative', zIndex: 10 }}>
                <div style={{
                    height: '4px',
                    background: '#1565c0',
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 11
                }} />

            </div>


            <div className="sticky-tab-bar">
                <div className="container d-flex align-items-center gap-4" style={{ height: '48px', position: 'relative', zIndex: 12 }}>
                    <button
                        className={`tab-item${activeTab === "overview" ? " active" : ""}`}
                        onClick={() => handleTabClick("overview")}
                        type="button"
                    >
                        Tổng quan
                    </button>
                    <button
                        className={`tab-item${activeTab === "rooms" ? " active" : ""}`}
                        onClick={() => handleTabClick("rooms")}
                        type="button"
                    >
                        Phòng
                    </button>
                    <button
                        className={`tab-item${activeTab === "location" ? " active" : ""}`}
                        onClick={() => handleTabClick("location")}
                        type="button"
                    >
                        Vị trí
                    </button>
                    <button
                        className={`tab-item${activeTab === "amenities" ? " active" : ""}`}
                        onClick={() => handleTabClick("amenities")}
                        type="button"
                    >
                        Tiện ích
                    </button>
                    <button
                        className={`tab-item${activeTab === "policy" ? " active" : ""}`}
                        onClick={() => handleTabClick("policy")}
                        type="button"
                    >
                        Chính sách
                    </button>
                    <button
                        className={`tab-item${activeTab === "review" ? " active" : ""}`}
                        onClick={() => handleTabClick("review")}
                        type="button"
                    >
                        Đánh giá
                    </button>
                </div>
            </div>
            {/* ---  NAV XANH ĐẬM   --- */}

            {/* Grid ảnh 1 lớn 4 nhỏ đều nhau */}
            <div className="container mt-4">
                <div className="row g-2">
                    <div className="col-md-7">
                        <div style={{ borderRadius: '16px', overflow: 'hidden', width: '100%', height: '320px' }}>
                            <Image src={demoHotel.photos[0]} width={700} height={320} alt="Hotel main photo" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="row g-2" style={{ minHeight: '320px' }}>
                            {demoHotel.photos.slice(1, 5).map((url, idx) => (
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
            {/* Card info nổi bo góc, đổ bóng */}
            <div className="container" style={{ marginTop: '32px', position: 'relative', zIndex: 2 }}>
                <div className="row gx-4 gy-4">
                    <div className="col-lg-8">
                        <div className="card shadow-lg p-4 mb-4" style={{ borderRadius: '18px', background: '#fff' }}>
                            <div className="d-flex align-items-center mb-2">
                                <span className="badge bg-primary me-2">Khách Sạn</span>
                                <span className="text-warning fw-bold">★★★★★</span>
                                <span className="ms-3 fw-bold fs-4 text-dark">{demoHotel.name}</span>
                            </div>
                            <div className="mb-2">
                                <span className="fw-bold">Địa chỉ:</span> {demoHotel.address}
                            </div>
                            <div className="mb-2 d-flex align-items-center flex-wrap">
                                <span className="fw-bold">Giá phòng/đêm từ:</span>
                                <span className="text-danger fw-bold ms-2">
                                    {typeof demoHotel.currentPricePerNight === "number" ? demoHotel.currentPricePerNight.toLocaleString("vi-VN") : "Liên hệ"} VND
                                </span>
                                {typeof demoHotel.rawPricePerNight === "number" && typeof demoHotel.currentPricePerNight === "number" && demoHotel.rawPricePerNight > demoHotel.currentPricePerNight && (
                                    <span className="text-muted text-decoration-line-through ms-2">{demoHotel.rawPricePerNight.toLocaleString("vi-VN")} VND</span>
                                )}
                                <button className="btn btn-warning btn-lg fw-bold px-4 ms-3 mt-2 mt-lg-0" onClick={() => handleTabClick('rooms')}>Chọn phòng</button>
                            </div>
                            <div className="mb-2">
                                <span className="fw-bold">Tiện ích chính:</span>
                                <div className="d-flex flex-wrap mt-2">
                                    {demoAmenities.map((item, idx) => (
                                        <span key={idx} className="me-3 mb-2 d-flex align-items-center">
                                            <i className={item.icon + " text-primary me-1"} style={{ fontSize: "1.2rem" }}></i>
                                            <span className="text-dark small fw-semibold">{item.label}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
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
            {/* Card review bo góc, spacing */}
            <div className="container mb-4">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card shadow p-4" style={{ borderRadius: '16px', background: '#fff' }}>
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
                    </div>
                </div>
            </div>
            {/* Card mô tả bo góc */}
            <div className="container mb-4">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card shadow p-4" style={{ borderRadius: '16px', background: '#fff' }}>
                            <h5 className="fw-bold mb-2">Mô tả khách sạn</h5>
                            <p className="mb-0 text-dark">{demoHotel.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PHẦN HIỂN THỊ PHÒNG --- */}
            <div ref={roomsSectionRef} className="container mb-5">
                {/* ... (Phần JSX của bộ lọc phòng giữ nguyên) ... */}

                <h4 className="fw-bold mb-3 text-dark">Những phòng còn trống tại {demoHotel.name}</h4>
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
                                <a
                                    className="dropdown-toggle text-primary text-decoration-none fw-semibold small"
                                    href="#"
                                    role="button"
                                    id="priceDisplayDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {selectedPriceDisplay}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end price-dropdown-menu" aria-labelledby="priceDisplayDropdown">
                                    {priceDisplayOptions.map((option, index) => (
                                        <li key={index}>
                                            <a
                                                className={`dropdown-item ${selectedPriceDisplay === option ? 'active' : ''}`}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedPriceDisplay(option);
                                                }}
                                            >
                                                {selectedPriceDisplay === option
                                                    ? <i className="bi bi-check-circle-fill text-primary me-2"></i>
                                                    : <i className="bi bi-circle me-2" style={{ visibility: 'hidden' }}></i>}
                                                {option}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {loadingRooms && (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải phòng...</span>
                        </div>
                    </div>
                )}

                {roomsError && !loadingRooms && (
                    <div className="alert alert-danger text-center">{roomsError}</div>
                )}

                {!loadingRooms && !roomsError && rooms.length === 0 && (
                    <div className="alert alert-secondary text-center">Không có phòng nào khả dụng.</div>
                )}

                {!loadingRooms && !roomsError && rooms.length > 0 && (
                    <div>
                        {rooms.map(room => {
                            const roomPhotos = room.photos?.flatMap((cat: any) =>
                                Array.isArray(cat.photos) ? cat.photos.map((p: any) => p.url) : []
                            ) || [];
                            const originalPrice = room.basePricePerNight * 1.25;
                            const priceWithBreakfast = room.basePricePerNight + 100000;
                            return (
                                <div key={room.id} className="bg-white rounded shadow-sm p-3 mb-3 text-dark">
                                    <div className="row g-3">
                                        <div className="col-lg-4">
                                            {/* ... */}
                                            <h5 className="fw-bold d-block d-lg-none mb-2">{room.name}</h5>
                                            <Image
                                                src={roomPhotos[0] || "/placeholder.svg"}
                                                width={400}
                                                height={250}
                                                alt={room.name}
                                                style={{ objectFit: "cover", borderRadius: "8px", width: "100%", height: "auto" }}
                                            />
                                            <div className="mt-2 small text-muted">
                                                <div className="mb-1"><i className="bi bi-rulers me-2 text-primary"></i> {room.area} m²</div>
                                                <div className="mb-1"><i className="bi bi-water me-2 text-primary"></i> Vòi tắm đứng</div>
                                                <div className="mb-1"><i className="bi bi-snow me-2 text-primary"></i> Máy lạnh</div>
                                            </div>
                                            <a href="#" className="text-primary small fw-bold mt-2 d-inline-block">Xem chi tiết phòng</a>
                                        </div>
                                        <div className="col-lg-8">
                                            <h5 className="fw-bold d-none d-lg-block">{room.name}</h5>
                                            {/* THAY ĐỔI 4: Cập nhật onClick cho các nút "Chọn" */}
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
                                                        Miễn phí hủy phòng trước 19 thg 10 12:59
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
                                                        onClick={() => handleSelectRoom(room, room.basePricePerNight, false)}
                                                    >
                                                        Chọn
                                                    </button>
                                                    <div className="text-success small mt-1">
                                                        <i className="bi bi-gem me-1"></i> Earn 1.088 Points
                                                    </div>
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
                                                        onClick={() => handleSelectRoom(room, priceWithBreakfast, true)}
                                                    >
                                                        Chọn
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}