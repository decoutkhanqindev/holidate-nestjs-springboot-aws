import type { Metadata } from 'next';
import { getCities } from '@/lib/AdminAPI/locationService';
import HomePageClient from './HomePageClient';

// ============================================
// METADATA CHO SEO
// ============================================
export const metadata: Metadata = {
  title: 'Holidate - Đặt phòng khách sạn giá tốt nhất | Kỳ nghỉ tuyệt vời bắt đầu từ đây',
  description: 'Đặt phòng khách sạn giá tốt nhất tại Holidate. Tìm kiếm và đặt phòng khách sạn tại các thành phố du lịch hàng đầu Việt Nam. Ưu đãi đặc biệt, thanh toán an toàn, hủy miễn phí.',
  keywords: [
    'đặt phòng khách sạn',
    'khách sạn giá rẻ',
    'booking khách sạn',
    'đặt phòng online',
    'khách sạn Việt Nam',
    'du lịch',
    'nghỉ dưỡng',
    'Holidate'
  ],
  openGraph: {
    title: 'Holidate - Đặt phòng khách sạn giá tốt nhất',
    description: 'Kỳ nghỉ tuyệt vời, bắt đầu từ đây. Đặt phòng khách sạn giá tốt nhất tại Holidate.',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Holidate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Holidate - Đặt phòng khách sạn giá tốt nhất',
    description: 'Kỳ nghỉ tuyệt vời, bắt đầu từ đây.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ============================================
// ISR CONFIGURATION
// ============================================
// Revalidate mỗi 1 giờ (3600 giây) để đảm bảo data luôn mới
// Có thể tăng lên 24 giờ (86400) nếu data không thay đổi thường xuyên
export const revalidate = 3600; // 1 giờ

// ============================================
// SERVER COMPONENT - FETCH DATA
// ============================================
export default async function HomePage() {
  // Fetch cities từ server để có data sẵn cho SEO
  // Nếu lỗi, trả về mảng rỗng - component client sẽ tự fetch lại
  let cities: any[] = [];
  try {
    cities = await getCities();
  } catch (error) {
    console.error('[HomePage] Error fetching cities:', error);
    // Không throw error - để page vẫn render được
    // Client component sẽ tự fetch lại nếu cần
  }

  return <HomePageClient initialCities={cities} />;
}