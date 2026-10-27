import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  // Ensure the seeded SQLite demo database is bundled with serverless
  // functions (Vercel / Netlify demo mode — see DEPLOYMENT.md).
  outputFileTracingIncludes: {
    "/**": ["./db/**"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
