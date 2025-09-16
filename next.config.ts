import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    remotePatterns: [
      // Local Django dev server
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      // Railway (prod/staging) — adjust domain if yours differs
      {
        protocol: "https",
        hostname: "elvarra.in",
        pathname: "/**",
      },
         {
        protocol: "https",
        hostname: "playkopmedia.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
         {
        protocol: "https",
        hostname: "playkopmedia.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
    // Optional: if your backend serves large images and you want better device coverage
    deviceSizes: [320, 420, 768, 1024, 1200, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;

