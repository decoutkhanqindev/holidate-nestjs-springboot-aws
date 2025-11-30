'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

// BƯỚC 1: IMPORT CÁC ICON CẦN THIẾT
import { CiLocationOn, CiCalendarDate, CiUser, CiSearch } from 'react-icons/ci';

import { LocationSuggestion } from '@/service/locationService';
import DealsSection from '@/components/Deal/DealsSection';
import HotelSelection from '@/components/HotelSection/HotelSelection';
import TravelInspiration from '@/components/TravelInspiration/TravelInspiration';
import WhyBookSection from '@/components/WhyBook/WhyBookSection';
import ChatBubble from "@/components/ChatBot/ChatBubble";
import LocationSearchInput from '@/components/Location/LocationSearchInput';
import GuestPicker from '@/components/DateSupport/GuestPicker';

registerLocale('vi', vi);

// Định dạng ngày tháng để hiển thị trên thanh tìm kiếm (có thể tùy chỉnh lại cho phù hợp UI mới)
const formatDateForDisplay = (checkin: Date, nights: number): string => {
  try {
    const checkoutDate = new Date(checkin);
    checkoutDate.setDate(checkin.getDate() + nights);
    // Định dạng mới: 26 thg 10 2025 - 27 thg 10 2025
    const format = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1} ${date.getFullYear()}`;
    return `${format(checkin)} - ${format(checkoutDate)}`;
  } catch { return 'Chọn ngày'; }
};

// Props để nhận initial data từ Server Component (tùy chọn)
interface HomePageClientProps {
  initialCities?: any[]; // Có thể truyền cities từ server
}

export default function HomePageClient({ initialCities }: HomePageClientProps) {
  const router = useRouter();

  // === CÁC STATE VÀ LOGIC GIỮ NGUYÊN 100% ===
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentCheckin, setCurrentCheckin] = useState(new Date());
  const [currentNights, setCurrentNights] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const [activePopup, setActivePopup] = useState<'location' | 'date' | 'guest' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const searchBarRef = useRef<HTMLDivElement>(null);

  const handleLocationSelect = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setCurrentQuery(location.name);
    setActivePopup(null);
    setLocationError(''); // Xóa lỗi khi chọn địa điểm
  };

  const handleDateChange = (date: Date | null) => {
    if (date) setCurrentCheckin(date);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra địa điểm trước khi tìm kiếm
    if (!selectedLocation && !currentQuery.trim()) {
      setLocationError('Vui lòng chọn địa điểm để tìm kiếm');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLocationError(''); // Xóa lỗi nếu có

    const params = new URLSearchParams();

    if (selectedLocation) {
      // ... (logic tìm kiếm giữ nguyên)
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
          router.push(`/hotels/${selectedLocation.id.replace(/^hotel-/, '')}`);
          return;
      }
      params.set('query', selectedLocation.name);
    } else if (currentQuery.trim()) {
      params.set('query', currentQuery);
    }

    params.set('checkin', currentCheckin.toISOString().split('T')[0]);
    params.set('nights', currentNights.toString());
    params.set('adults', adults.toString());
    params.set('children', children.toString());
    params.set('rooms', rooms.toString());

    router.push(`/search?${params.toString()}`);
    // Loading sẽ tự reset sau một khoảng thời gian hoặc khi trang mới load
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset loading state sau một khoảng thời gian để tránh loading vô hạn
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 5000); // Reset sau 5 giây nếu vẫn còn loading
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const displayGuests = `${adults} người lớn, ${children} Trẻ em, ${rooms} phòng`;
  // === KẾT THÚC PHẦN LOGIC GIỮ NGUYÊN ===


  return (
    <>
      {/* CSS cục bộ chỉ cho LocationSearchInput ở homepage */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* CSS cục bộ chỉ áp dụng cho LocationSearchInput trong homepage */
          .homepage-location-popup {
            padding: 3px !important;
           
          }
          
          /* Loại bỏ wrapper div không cần thiết */
          .homepage-location-popup > div {
            display: flex !important;
            flex-direction: column !important;
            gap: 0 !important;
             left:15px !important;
          }
          
          /* Style cho input field - loại bỏ box riêng biệt */
          .homepage-location-popup input[type="text"] {
            border: none !important;
            border-bottom: 1px solid #e5e7eb !important;
            border-radius: 0 !important;
            padding: 10px 8px !important;
            margin: 0 !important;
            margin-bottom: 8px !important;
            background: transparent !important;
            font-size: 15px !important;
            font-weight: 500 !important;
            color: #111827 !important;
            width: 100% !important;
            outline: none !important;
                left:35px !important;
            box-shadow: none !important;
          }
          
          .homepage-location-popup input[type="text"]:focus {
            border-bottom-color: #3b82f6 !important;
          }
          
          /* Style cho suggestions list - gọn gàng, không có box riêng */
          .homepage-location-popup ul {
            list-style: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-height: 380px !important;
            overflow-y: auto !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          
          .homepage-location-popup ul li {
            padding: 10px 8px !important;
            cursor: pointer !important;
            border-radius: 6px !important;
            margin-bottom: 2px !important;
            transition: background-color 0.15s ease !important;
            border: none !important;
          }
          
          .homepage-location-popup ul li:hover {
            background-color: #f3f4f6 !important;
          }
          
          .homepage-location-popup ul li:last-child {
            margin-bottom: 0 !important;
          }
          
          /* Ẩn border-bottom của suggestionItem nếu có */
          .homepage-location-popup ul li:not(:last-child) {
            border-bottom: none !important;
          }
          
          /* CSS cục bộ cho phần Khách và Phòng - dịch sang phải 30px */
          .homepage-guest-section {
            margin-left: 30px !important;
          }
          
          /* Lùi icon người vào trái một chút */
          .homepage-guest-section .flex.items-center > svg {
            margin-left: -35px !important;
          }
          
          /* Popup của GuestPicker - override CSS từ module để dịch sang phải 30px */
          .homepage-guest-popup > div[class*="pickerContainer"],
          .homepage-guest-popup > div {
            position: absolute !important;
            right: 10px !important; /* 100px (mặc định từ module) + 30px */
            left: auto !important;
            top: calc(100% + 3px) !important;
            transform: none !important;
            width:280px !important;
          }
          
          @media (max-width: 768px) {
            /* Trên mobile, không dịch sang phải */
            .homepage-guest-section {
              margin-left: 0 !important;
              
            }
                .homepage-guest-section .flex.items-center > svg {
            margin-left: 0!important;
          }
          
            .homepage-guest-popup {
              right: 25px !important;

            }
            .homepage-guest-popup > div {
              right: 50% !important;
              left: unset !important;
              transform: translateX(50%) !important;
            }
          }
          
          /* CSS cho loading spinner */
          .loading-spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `
      }} />
      <div className="relative h-screen bg-gray-800">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/banner.webp)' }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-4 text-white">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold md:text-5xl drop-shadow-lg">Kỳ nghỉ tuyệt vời, bắt đầu từ đây.</h1>
            <p className="text-lg mt-2 text-gray-200 drop-shadow-md">Đặt phòng khách sạn giá tốt nhất cùng Holidate</p>
          </div>

          {/* ==================================================================== */}
          {/* BẮT ĐẦU PHẦN CODE GIAO DIỆN THANH TÌM KIẾM MỚI                 */}
          {/* ==================================================================== */}
          <div ref={searchBarRef} className="w-full max-w-6xl text-black">
            {/* Các label phía trên thanh tìm kiếm */}
            <div className="hidden md:flex mb-2 px-4">
              <label className="w-5/12 text-sm font-semibold text-white">Thành phố, địa điểm hoặc tên khách sạn:</label>
              <label className="w-4/12 text-sm font-semibold text-white">Ngày nhận phòng và trả phòng</label>
              <label className="w-3/12 text-sm font-semibold text-white">Khách và Phòng</label>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center bg-white rounded-lg md:rounded-full shadow-2xl p-2 gap-2 md:gap-0">

              {/* --- Ô TÌM KIẾM ĐỊA ĐIỂM --- */}
              <div className="relative w-full md:w-5/12">
                <div
                  className="flex items-center gap-x-3 w-full h-14 px-4 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePopup(activePopup === 'location' ? null : 'location');
                    setLocationError(''); // Xóa lỗi khi click vào ô địa điểm
                  }}
                >
                  <CiLocationOn className="text-2xl text-blue-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 truncate">
                    {currentQuery || 'Thành phố, khách sạn, điểm đến'}
                  </span>
                </div>
                {activePopup === 'location' && (
                  <div
                    className="homepage-location-popup absolute top-full mt-1 w-full rounded-lg border bg-white shadow-lg z-20 md:w-[500px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LocationSearchInput
                      initialValue={currentQuery}
                      onQueryChange={(value) => {
                        setCurrentQuery(value);
                        setLocationError(''); // Xóa lỗi khi bắt đầu nhập
                      }}
                      onLocationSelect={handleLocationSelect}
                      mode="embedded"
                    />
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-gray-200 md:h-8 md:w-px" />

              {/* --- Ô CHỌN NGÀY --- */}
              <div className="relative w-full md:w-4/12">
                <div
                  className="flex items-center gap-x-3 w-full h-14 px-4 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePopup(activePopup === 'date' ? null : 'date');
                  }}
                >
                  <CiCalendarDate className="text-2xl text-blue-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 truncate">
                    {formatDateForDisplay(currentCheckin, currentNights)}
                  </span>
                </div>
                {activePopup === 'date' && (
                  <div
                    className="absolute left-0 top-full mt-2 z-20 rounded-lg border bg-white p-4 shadow-lg md:left-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DatePicker
                      selected={currentCheckin}
                      onChange={handleDateChange}
                      inline locale="vi" minDate={new Date()}
                    />
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <label className="font-medium">Số đêm</label>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setCurrentNights(n => Math.max(1, n - 1))} className="w-8 h-8 border rounded-full">-</button>
                        <span>{currentNights}</span>
                        <button type="button" onClick={() => setCurrentNights(n => n + 1)} className="w-8 h-8 border rounded-full">+</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-gray-200 md:h-8 md:w-px" />

              {/* --- Ô CHỌN KHÁCH --- */}
              <div className="homepage-guest-section relative w-full md:w-3/12">
                <div
                  className="flex items-center gap-x-3 w-full h-14 px-4 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePopup(activePopup === 'guest' ? null : 'guest');
                  }}
                >
                  <CiUser className="text-2xl text-blue-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 truncate">{displayGuests}</span>
                </div>
                {activePopup === 'guest' && (
                  <div
                    className="homepage-guest-popup absolute top-full right-0 mt-2 z-20 w-full max-w-sm md:w-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GuestPicker
                      adults={adults} children={children} rooms={rooms}
                      setAdults={setAdults} setChildren={setChildren} setRooms={setRooms}
                      onClose={() => setActivePopup(null)}
                    />
                  </div>
                )}
              </div>

              {/* --- NÚT TÌM KIẾM --- */}
              <div className="w-auto p-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-12 h-12 items-center justify-center rounded-full bg-orange-500 font-bold text-white shadow-md text-2xl hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <CiSearch />
                  )}
                </button>
              </div>
            </form>
            {/* Thông báo lỗi địa điểm */}
            {locationError && (
              <div className="mt-2 px-4">
                <p className="text-red-500 text-sm font-medium">
                  {locationError}
                </p>
              </div>
            )}
          </div>
          {/* ==================================================================== */}
          {/* KẾT THÚC PHẦN CODE GIAO DIỆN THANH TÌM KIẾM MỚI                 */}
          {/* ==================================================================== */}
        </div>
      </div>

      <DealsSection />
      <HotelSelection />
      <TravelInspiration />
      <WhyBookSection />
      <ChatBubble />
    </>
  );
}









































