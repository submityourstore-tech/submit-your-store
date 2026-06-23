import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright", "sharp", "firebase-admin"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/api/listings/check": ["./data/businesses.json"],
    "/api/listings/send-verification": ["./data/businesses.json"],
    "/api/listings/verify": ["./data/businesses.json"],
    "/api/listings/resend-verification": ["./data/businesses.json"],
  },
};

export default nextConfig;
