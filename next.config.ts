import type { NextConfig } from "next";
import { blogRedirects } from "./src/lib/blog-redirects";

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
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
    ],
  },
  async redirects() {
    return blogRedirects();
  },
  outputFileTracingIncludes: {
    "/api/listings/check": ["./data/businesses.json"],
    "/api/listings/send-verification": ["./data/businesses.json"],
    "/api/listings/verify": ["./data/businesses.json"],
    "/api/listings/resend-verification": ["./data/businesses.json"],
  },
};

export default nextConfig;
