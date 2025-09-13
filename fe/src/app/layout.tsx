
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import PublicNavbar from '@/components/PublicNavbar';
import AuthModal from '@/components/Auth/AuthModal';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Traveloka Clone',
  description: 'Hệ thống đặt phòng khách sạn',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <AuthProvider>
        <body>
          <PublicNavbar />
          <AuthModal />

          {children}

          <Footer />

          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossOrigin="anonymous" async></script>
        </body>
      </AuthProvider>
    </html>
  );
}