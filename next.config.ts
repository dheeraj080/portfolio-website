// next.config.ts
import type { NextConfig } from "next";

const s3PublicUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "";
const s3Url = s3PublicUrl ? new URL(s3PublicUrl) : null;
const s3Hostname = s3Url ? s3Url.hostname : "";
const s3Protocol = s3Url ? (s3Url.protocol.replace(":", "") as "http" | "https") : "https";

console.log('--- NEXT CONFIG DIAGNOSTICS ---');
console.log('s3PublicUrl:', s3PublicUrl);
console.log('s3Hostname:', s3Hostname);
console.log('-------------------------------');

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Fixes the "Private IP" error
    remotePatterns: s3Hostname ? [
      {
        protocol: s3Protocol,
        hostname: s3Hostname,
        pathname: '/**',
      },
    ] : [],
  },
  // If you have other config options (like experimental turbo), add them here
};

export default nextConfig;