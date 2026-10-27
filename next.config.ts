import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `standalone` is only useful for self-hosting (Docker / bare metal).
  // Vercel builds the platform natively, so skip it there.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
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
