import type { NextConfig } from "next";

// Content-Security-Policy — production only (Next's dev/HMR pipeline needs
// eval and inline scripts that a locked-down CSP would break). The app is
// fully self-hosted (next/font, local images, same-origin APIs), so the
// directive set can be tight. 'unsafe-inline' stays for script/style because
// Next hydration + Tailwind/framer-motion emit inline code without a nonce
// pipeline; migrating to nonce-based CSP is a tracked follow-up.
const CSP =
  [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");

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
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({ key: "Content-Security-Policy", value: CSP });
    }
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
