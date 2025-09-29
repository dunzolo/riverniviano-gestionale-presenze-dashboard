import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //distDir: "build",
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
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`
      }
    ];
  }
};

export default nextConfig;
