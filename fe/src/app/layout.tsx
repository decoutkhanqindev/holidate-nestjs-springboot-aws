// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from "@/contexts/AuthContext";
import PublicNavbar from "@/components/PublicNavbar";
import AuthModal from "@/components/Auth/AuthModal";
import BootstrapClient from "@/components/BootstrapClient";
import Footer from "@/components/Footer";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Holidate - Đặt phòng khách sạn",
  description: "Đặt phòng khách sạn giá tốt nhất",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>

          <PublicNavbar />

          <main style={{ paddingTop: '64px' }}>
            {children}
          </main>
          <Footer />
          <AuthModal />

        </AuthProvider>

        <BootstrapClient />
      </body>
    </html>
  );
}