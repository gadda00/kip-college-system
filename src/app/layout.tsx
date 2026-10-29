import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

/** Editorial display serif — headlines, page titles, brand wordmark. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

/** Clean humanist sans — body copy, UI, data. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://kipskitui.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "KIP College — Kitui Institute of Professionals | Technical, Business & KASNEB Courses",
    template: "%s | KIP College",
  },
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
  alternates: { canonical: "/" },
  openGraph: {
    title: "KIP College — Training for Excellence",
    description:
      "Kitui Institute of Professionals — tertiary learning institution in Kitui Town, Kenya. Technical, Business & KASNEB courses across three campuses. Choose a path that matches your ambition.",
    url: SITE_URL,
    siteName: "KIP College",
    type: "website",
    locale: "en_KE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KIP College — Kitui Institute of Professionals. Training for Excellence.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KIP College — Training for Excellence",
    description:
      "Technical, Business & KASNEB courses across three campuses in Kitui County, Kenya. Apply online today.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e3a8a" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
};

/** Structured data — helps Google rich results for the institution. */
const collegeJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Kitui Institute of Professionals (KIP College)",
  alternateName: "KIP College",
  slogan: "Training for Excellence",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "Tertiary learning institution in Kitui Town, Kenya offering Technical, Business and KASNEB courses across three campuses.",
  telephone: "+254 703 710 879",
  email: "info@kipskitui.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Wikililye, Mulango Road",
    addressLocality: "Kitui",
    addressRegion: "Kitui County",
    addressCountry: "KE",
  },
  location: [
    {
      "@type": "Place",
      name: "Main Campus",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Wikililye, Mulango Road",
        addressLocality: "Kitui",
        addressCountry: "KE",
      },
    },
    {
      "@type": "Place",
      name: "Town Campus",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Muli Mall Building, Kitui Town",
        addressLocality: "Kitui",
        addressCountry: "KE",
      },
    },
    {
      "@type": "Place",
      name: "Mwingi Campus",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Sunrise Building, Mwingi",
        addressLocality: "Mwingi",
        addressCountry: "KE",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body className="antialiased bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collegeJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
