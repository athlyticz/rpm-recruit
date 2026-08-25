import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Deliberately not enabling experimental.viewTransition: it only works on
    // the experimental React channel, and this project runs React stable.
    // Route transitions are driven directly from components/app/view-transitions.tsx.
  },
};

export default nextConfig;
