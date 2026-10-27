import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KIP College — Kitui Institute of Professionals | Technical, Business & KASNEB Courses",
  description:
    "Kitui Institute of Professionals (KIP College) is a leading tertiary institution in Kitui Town, Kenya offering Technical, Business and KASNEB courses (CPA, ATD, ICT, Engineering, Catering & more) across three campuses: Main Campus (Wikililye, Mulango Road), Town Campus (Muli Mall) and Mwingi Campus (Sunrise Building). Training for Excellence — apply online today.",
  keywords: [
    "KIP College",
    "Kitui Institute of Professionals",
    "college in Kitui",
    "KASNEB courses Kitui",
    "CPA Kitui",
    "technical college Kenya",
    "business courses Kitui",
    "TVET college Kitui",
    "Mwingi campus",
  ],
  authors: [{ name: "KIP College" }],
  openGraph: {
    title: "KIP College — Training for Excellence",
    description:
      "Kitui Institute of Professionals — tertiary learning institution in Kitui Town, Kenya. Technical, Business & KASNEB courses across three campuses. Choose a path that matches your ambition.",
    siteName: "KIP College",
    type: "website",
    locale: "en_KE",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a4fd0" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1f3f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
