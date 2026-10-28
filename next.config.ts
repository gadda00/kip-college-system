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
  reactStrictMode: true,
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
