import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? "https://lms-backend-application.onrender.com/api/:path*"
            : "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },

};

export default nextConfig;
