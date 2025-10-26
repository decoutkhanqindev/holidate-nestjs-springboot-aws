'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import 'react-datepicker/dist/react-datepicker.css';

import { LocationSuggestion } from '@/service/locationService';
import DealsSection from '@/components/Deal/DealsSection';
import HotelSelection from '@/components/HotelSection/HotelSelection';
import TravelInspiration from '@/components/TravelInspiration/TravelInspiration';
import WhyBookSection from '@/components/WhyBook/WhyBookSection';
import ChatBubble from "@/components/ChatBot/ChatBubble";
import LocationSearchInput from '@/components/Location/LocationSearchInput';
import GuestPicker from '@/components/DateSupport/GuestPicker';

registerLocale('vi', vi);

// Định dạng ngày tháng để hiển thị trên thanh tìm kiếm
const formatDateForDisplay = (checkin: Date, nights: number): string => {
  try {
    const checkoutDate = new Date(checkin);
    checkoutDate.setDate(checkin.getDate() + nights);
    const format = (date: Date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
    return `${format(checkin)} - ${format(checkoutDate)}, ${nights} đêm`;
  } catch { return 'Chọn ngày'; }
};


export default function HomePage() {
  const router = useRouter();

  // === STATE CHO THANH TÌM KIẾM ===
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentCheckin, setCurrentCheckin] = useState(new Date());
  const [currentNights, setCurrentNights] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  // === STATE CHO UI CỦA CÁC POP-UP ===
  const [activePopup, setActivePopup] = useState<'location' | 'date' | 'guest' | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // === CÁC HÀM XỬ LÝ LOGIC ===
  const handleLocationSelect = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setCurrentQuery(location.name);
    setActivePopup(null); // Đóng pop-up sau khi chọn
  };

  const handleDateChange = (date: Date | null) => {
    if (date) setCurrentCheckin(date);
  };

  const handleGuestChange = (newAdults: number, newChildren: number, newRooms: number) => {
    setAdults(newAdults);
    setChildren(newChildren);
    setRooms(newRooms);
  };

  // ...existing code...
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

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
  };
  // ...existing code...
  // Đóng tất cả pop-up khi click ra ngoài thanh tìm kiếm
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayGuests = `${adults} người lớn, ${children} Trẻ em, ${rooms} phòng`;

  return (
    <>
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

          <div ref={searchBarRef} className="w-full max-w-5xl rounded-lg bg-white p-4 text-black shadow-2xl md:p-2">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2 bg-gray-100 p-2 rounded-lg">

              {/* --- Ô TÌM KIẾM ĐỊA ĐIỂM --- */}
              <div className="relative flex-1 w-full">
                <div className="p-3 bg-white rounded-md cursor-pointer h-full" onClick={() => setActivePopup(activePopup === 'location' ? null : 'location')}>
                  <label className="text-xs text-gray-500">Thành phố, địa điểm</label>
                  <div className="font-semibold">{currentQuery || 'Bạn muốn đi đâu?'}</div>
                </div>
                {activePopup === 'location' && (
                  <div className="absolute top-full mt-2 w-[400px] z-20">
                    <LocationSearchInput
                      initialValue={currentQuery}
                      onQueryChange={setCurrentQuery}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                )}
              </div>

              {/* --- Ô CHỌN NGÀY --- */}
              <div className="relative flex-1 w-full">
                <div className="p-3 bg-white rounded-md cursor-pointer h-full" onClick={() => setActivePopup(activePopup === 'date' ? null : 'date')}>
                  <label className="text-xs text-gray-500">Ngày nhận phòng & Số đêm</label>
                  <div className="font-semibold">{formatDateForDisplay(currentCheckin, currentNights)}</div>
                </div>
                {activePopup === 'date' && (
                  <div className="absolute top-full mt-2 z-20 p-4 bg-white rounded-lg shadow-lg border">
                    <DatePicker
                      selected={currentCheckin}
                      onChange={handleDateChange}
                      inline
                      locale="vi"
                      minDate={new Date()}
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

              {/* --- Ô CHỌN KHÁCH --- */}
              <div className="relative flex-1 w-full">
                <div className="p-3 bg-white rounded-md cursor-pointer h-full" onClick={() => setActivePopup(activePopup === 'guest' ? null : 'guest')}>
                  <label className="text-xs text-gray-500">Khách & phòng</label>
                  <div className="font-semibold">{displayGuests}</div>
                </div>
                {activePopup === 'guest' && (
                  <div className="absolute top-full right-0 mt-2 z-20">
                    <GuestPicker
                      adults={adults}
                      children={children}
                      rooms={rooms}
                      setAdults={setAdults}
                      setChildren={setChildren}
                      setRooms={setRooms}
                      onClose={() => setActivePopup(null)}
                    />
                  </div>
                )}
              </div>

              <div className="w-full md:w-auto">
                <button type="submit" className="flex w-full items-center justify-center rounded-lg bg-orange-500 p-4 font-bold text-white shadow-md h-full">
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </form>
          </div>
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