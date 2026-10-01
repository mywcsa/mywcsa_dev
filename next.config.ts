import type { NextConfig } from "next";

const previewOrigin = process.env.BASE44_PUBLIC_HOST_SUFFIX
  ? ["3000-" + process.env.BASE44_PUBLIC_HOST_SUFFIX]
  : [];

const nextConfig: NextConfig = {
  allowedDevOrigins: previewOrigin,
  experimental: {
    serverActions: {
      allowedOrigins: previewOrigin,
    },
  },
};

export default nextConfig;
