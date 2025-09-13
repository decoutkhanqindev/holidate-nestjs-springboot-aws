'use client';

import { useState } from 'react';
import Image from 'next/image';
import DealsSection from '@/components/Deal/DealsSection';
import HotelSelection from '@/components/HotelSection/HotelSelection';
import WhyBookSection from '@/components/WhyBook/WhyBookSection';

const CalendarIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

export default function HomePage() {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Chức năng tìm kiếm đang được phát triển!');
  };

  return (
    <>
      <div className="relative h-[calc(100vh-4rem)]">
        {/* banner*/}
        <div className="absolute inset-0 z-0">
          <Image

            src="/image/photo.avif"
            alt="Hotel resort background"
            fill
            style={{
              objectFit: 'cover'

            }}
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* nội dung chính */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-white">
          <h1 className="mb-4 text-center text-4xl font-extrabold drop-shadow-lg md:text-5xl">
            App du lịch hàng đầu, một chạm đi bất cứ đâu
          </h1>

          {/* form search */}
          <div className="w-full max-w-5xl rounded-lg bg-white p-4 text-black shadow-2xl md:p-6">
            <div className="mb-4 flex border-b">
              <button className="flex items-center space-x-2 border-b-2 border-blue-600 px-4 py-3 font-semibold text-blue-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14v1a1 1 0 001 1h1a1 1 0 001-1v-1h6v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM8 10V8a2 2 0 114 0v2H8z"></path></svg>
                <span>Khách sạn</span>
              </button>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-10">
              <div className="lg:col-span-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Thành phố, địa điểm</label>
                <input type="text" id="location" className="mt-1 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="VD: Hà Nội" />
              </div>

              <div className="relative lg:col-span-2">
                <label htmlFor="checkin" className="block text-sm font-medium text-gray-700">Ngày nhận phòng</label>
                <input type="text" id="checkin" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} className="mt-1 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="dd/mm/yyyy" />
                <div className="pointer-events-none absolute bottom-3 right-3"><CalendarIcon /></div>
              </div>

              <div className="relative lg:col-span-2">
                <label htmlFor="checkout" className="block text-sm font-medium text-gray-700">Ngày trả phòng</label>
                <input type="text" id="checkout" onFocus={(e) => (e.target.type = 'date')} onBlur={(e) => (e.target.type = 'text')} className="mt-1 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="dd/mm/yyyy" />
                <div className="pointer-events-none absolute bottom-3 right-3"><CalendarIcon /></div>
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="guests" className="block text-sm font-medium text-gray-700">Khách & phòng</label>
                <input type="text" id="guests" className="mt-1 block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" defaultValue="2 người lớn, 1 phòng" />
              </div>

              <div className="flex items-end lg:col-span-1">
                <button type="submit" className="flex w-full items-center justify-center rounded-lg bg-orange-500 p-3 font-bold text-white shadow-md hover:bg-orange-600">
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* mã ưu đãi*/}
      <DealsSection />

      {/*  LỰA CHỌN KHÁCH SẠN  */}
      <HotelSelection />

      {/*  LÝ DO ĐẶT CHỖ */}
      <WhyBookSection />
    </>
  );
}