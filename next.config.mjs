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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://js.stripe.com https://us04web.zoom.us",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http://localhost:5000",
              "connect-src 'self' https://fitzone-backend-vis3.onrender.com wss://fitzone-backend-vis3.onrender.com https://api.razorpay.com https://api.stripe.com",
              "frame-src https://checkout.razorpay.com https://js.stripe.com https://us04web.zoom.us",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://gym-fit-zone.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
