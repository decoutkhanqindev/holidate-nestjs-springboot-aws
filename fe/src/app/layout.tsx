import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import BootstrapClient from "@/components/BootstrapClient";
import ScriptErrorHandler from "@/components/ScriptErrorHandler";

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
        <ScriptErrorHandler />
        {children}
        <BootstrapClient />
      </body>
    </html>
  );
}