import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: "build",
  transpilePackages: [],
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/admin/dashboard",
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
