'use client';

import { useState } from 'react'; // Bỏ `useRef` vì không cần nữa
import DealsSection from '@/components/Deal/DealsSection';
import HotelSelection from '@/components/HotelSection/HotelSelection';
import TravelInspiration from '@/components/TravelInspiration/TravelInspiration';
import WhyBookSection from '@/components/WhyBook/WhyBookSection';
import ChatBubble from "@/components/ChatBot/ChatBubble";

const CalendarIcon = () => (
  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

export default function HomePage() {
  const [checkinDate, setCheckinDate] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');

  // Không cần useRef và handleDateDivClick nữa. Code gọn hơn!

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Chức năng tìm kiếm đang được phát triển!');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div className="relative h-screen">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: 'url(/images/banner.webp)' }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-start gap-8 px-4 pt-24 text-white md:justify-center md:pt-0">
          <div className="text-center">
            <h1 className="mb-2 text-center text-4xl font-extrabold drop-shadow-lg md:text-5xl">
              Kỳ nghỉ tuyệt vời, bắt đầu từ đây.
            </h1>
            <p className="text-lg text-gray-200 drop-shadow-md">
              Đặt phòng khách sạn giá tốt nhất cùng Holidate
            </p>
          </div>

          <div className="w-full max-w-5xl rounded-lg bg-white p-4 text-black shadow-2xl md:p-6">
            <div className="mb-4 flex border-b">
              <button className="flex items-center space-x-2 border-b-2 border-blue-600 px-4 py-3 font-semibold text-blue-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14v1a1 1 0 001 1h1a1 1 0 001-1v-1h6v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM8 10V8a2 2 0 114 0v2H8z"></path></svg>
                <span>Khách sạn</span>
              </button>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-2 gap-4 lg:grid-cols-10">
              <div className="col-span-2 lg:col-span-3">
                <div className="block text-sm font-medium text-gray-700">Thành phố, địa điểm</div>
                <input type="text" id="location" className="mt-1 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="VD: Hà Nội" />
              </div>

              {/* Check-in Date */}
              <div className="col-span-1 lg:col-span-2">
                <div className="block text-sm font-medium text-gray-700">Nhận phòng</div>
                {/* Dùng <label> thay cho <div>, thêm `htmlFor` */}
                <label
                  htmlFor="checkin-date-input"
                  className="relative mt-1 flex w-full cursor-pointer items-center rounded-md border border-gray-300 bg-white p-3 shadow-sm"
                >
                  <span className="flex-grow text-gray-500">
                    {checkinDate ? formatDate(checkinDate) : 'dd/mm/yyyy'}
                  </span>
                  <CalendarIcon />
                </label>
                {/* Thêm `id` tương ứng cho thẻ input */}
                <input
                  id="checkin-date-input"
                  type="date"
                  value={checkinDate}
                  onChange={(e) => setCheckinDate(e.target.value)}
                  className="sr-only" // Giấu input đi
                />
              </div>

              {/* Check-out Date */}
              <div className="col-span-1 lg:col-span-2">
                <div className="block text-sm font-medium text-gray-700">Trả phòng</div>
                {/* Dùng <label> thay cho <div>, thêm `htmlFor` */}
                <label
                  htmlFor="checkout-date-input"
                  className="relative mt-1 flex w-full cursor-pointer items-center rounded-md border border-gray-300 bg-white p-3 shadow-sm"
                >
                  <span className="flex-grow text-gray-500">
                    {checkoutDate ? formatDate(checkoutDate) : 'dd/mm/yyyy'}
                  </span>
                  <CalendarIcon />
                </label>
                {/* Thêm `id` tương ứng cho thẻ input */}
                <input
                  id="checkout-date-input"
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  className="sr-only" // Giấu input đi
                />
              </div>

              <div className="col-span-2 lg:col-span-2">
                <div className="block text-sm font-medium text-gray-700">Khách & phòng</div>
                <input type="text" id="guests" className="mt-1 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue="2 người lớn, 1 phòng" />
              </div>

              <div className="flex items-end col-span-2 lg:col-span-1">
                <button type="submit" className="flex w-full items-center justify-center rounded-lg bg-orange-500 p-3 font-bold text-white shadow-md hover:bg-orange-600">
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