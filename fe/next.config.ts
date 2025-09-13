import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Cho phép tải ảnh từ domain này
      },
    ],
  },
}

module.exports = nextConfig