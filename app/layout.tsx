import type { Metadata } from "next";
import { bodyFont, headingFont } from "./fonts";
import "./globals.css";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import DevTools from "@/components/DevTools";

// Critical CSS for above-the-fold content - inlined for faster FCP
const criticalStyles = `
  body{margin:0;padding:0;-webkit-font-smoothing:antialiased}
  .hero-section{min-height:100vh;position:relative;overflow:hidden}
  .container{width:100%;margin:0 auto;padding:0 1.5rem}
  @media(min-width:768px){.container{padding:0 3rem}}
  @media(min-width:1024px){.container{padding:0 6rem;max-width:1200px}}
`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://goldenenergy.vn"),
  title: {
    default: "Golden Energy Vietnam - Giải Pháp Điện Mặt Trời & Năng Lượng Tái Tạo Hàng Đầu",
    template: "%s | Golden Energy Vietnam",
  },
  description: "Golden Energy - Giải pháp điện mặt trời, điện gió, IoT thông minh với 500+ dự án, 50+ MW công suất. Tiết kiệm 50-70% chi phí điện. Đối tác Huawei, Growatt, Jinko, LONGi. Hotline: 03333 142 88",
  keywords: [
    "điện mặt trời",
    "năng lượng tái tạo",
    "solar panel",
    "tấm pin mặt trời",
    "biến tần inverter",
    "điện gió",
    "năng lượng xanh",
    "Golden Energy",
    "lắp đặt điện mặt trời",
    "hệ thống điện mặt trời",
    "điện mặt trời hòa lưới",
    "điện mặt trời độc lập",
    "IoT năng lượng",
    "Huawei inverter",
    "Growatt inverter",
    "Jinko solar",
    "LONGi solar",
    "tư vấn điện mặt trời",
    "TP HCM",
    "Việt Nam"
  ],
  authors: [{ name: "Golden Energy Vietnam", url: "https://goldenenergy.vn" }],
  creator: "Golden Energy Vietnam",
  publisher: "Golden Energy Vietnam",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/icon.svg',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: "Golden Energy Vietnam - Giải Pháp Năng Lượng Tái Tạo Hàng Đầu",
    description: "500+ dự án thành công, 50+ MW công suất. Điện mặt trời, điện gió, IoT thông minh. Tiết kiệm 50-70% chi phí điện.",
    url: "https://goldenenergy.vn",
    siteName: "Golden Energy Vietnam",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/images/og-goldenenergy.jpg",
        width: 1200,
        height: 630,
        alt: "Golden Energy - Năng Lượng Tái Tạo Việt Nam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Energy Vietnam - Năng Lượng Tái Tạo",
    description: "Giải pháp điện mặt trời, điện gió chuyên nghiệp. 500+ dự án, 50+ MW. Hotline: 03333 142 88",
    images: ["/images/og-goldenenergy.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://goldenenergy.vn",
    languages: {
      "vi-VN": "https://goldenenergy.vn/vi",
      "en-US": "https://goldenenergy.vn/en",
      "zh-CN": "https://goldenenergy.vn/zh",
    },
  },
  verification: {
    // Add verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  category: "Renewable Energy",
};

// Organization structured data for SEO
const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Golden Energy Vietnam",
  alternateName: "GoldenEnergy",
  url: "https://goldenenergy.vn",
  logo: "https://goldenenergy.vn/images/logo.png",
  description: "Công ty năng lượng tái tạo hàng đầu Việt Nam - Điện mặt trời, điện gió, IoT thông minh",
  address: {
    "@type": "PostalAddress",
    streetAddress: "625 Trần Xuân Soạn",
    addressLocality: "Quận 7",
    addressRegion: "TP. Hồ Chí Minh",
    postalCode: "700000",
    addressCountry: "VN"
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+84-3333-142-88",
      contactType: "sales",
      availableLanguage: ["Vietnamese", "English", "Chinese"]
    },
    {
      "@type": "ContactPoint",
      telephone: "+84-903-117-277",
      contactType: "customer service",
      availableLanguage: ["Vietnamese", "English"]
    }
  ],
  sameAs: [
    "https://www.facebook.com/goldenenergyvn",
    "https://www.linkedin.com/company/goldenenergy-vietnam"
  ],
  areaServed: {
    "@type": "Country",
    name: "Vietnam"
  },
  priceRange: "$$"
};

// LocalBusiness structured data for local SEO
const localBusinessStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Golden Energy Vietnam",
  image: "https://goldenenergy.vn/images/og-goldenenergy.jpg",
  "@id": "https://goldenenergy.vn",
  url: "https://goldenenergy.vn",
  telephone: "+84-3333-142-88",
  address: {
    "@type": "PostalAddress",
    streetAddress: "625 Trần Xuân Soạn, Phường Tân Hưng",
    addressLocality: "Quận 7",
    addressRegion: "TP. Hồ Chí Minh",
    postalCode: "700000",
    addressCountry: "VN"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 10.737992,
    longitude: 106.694178
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "17:30"
    }
  ],
  priceRange: "$$"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://static.doubleclick.net" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* YouTube API - defer loading until needed */}
        <script src="https://www.youtube.com/iframe_api" async defer></script>
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessStructuredData) }}
        />
        
        {/* Inline critical CSS for faster FCP */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS - Above the fold */
            ${criticalStyles}
            .hero{min-height:100vh;display:flex;align-items:center}
            .loading{opacity:0;animation:fadeIn .3s ease-in forwards}
            @keyframes fadeIn{to{opacity:1}}
            .text-gradient{background:linear-gradient(to right,#EEE,#AAA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
            /* Golden Energy brand colors */
            .golden-text{color:#D4AF37}
            .energy-text{color:#22C55E}
          `
        }} />
      </head>
      <body className={`${bodyFont.variable} ${headingFont.variable} loading`}>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
        <DevTools />
      </body>
    </html>
  );
}
