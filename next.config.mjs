/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from any domain — needed for Render backend + Cloudinary + Unsplash
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
    // Fallback: allow all domains (less secure but needed for dynamic backends)
    domains: [],
    unoptimized: false,
  },
  // Ensure env vars are available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://fitzone-backend-vis3.onrender.com/api",
  },
};

export default nextConfig;
