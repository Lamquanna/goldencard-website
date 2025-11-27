import type { Metadata } from "next";
import { bodyFont, headingFont } from "./fonts";
import "./globals.css";
import AnalyticsProvider from "@/components/AnalyticsProvider";

// Critical CSS for above-the-fold content - inlined for faster FCP
const criticalStyles = `
  body{margin:0;padding:0;-webkit-font-smoothing:antialiased}
  .hero-section{min-height:100vh;position:relative;overflow:hidden}
  .container{width:100%;margin:0 auto;padding:0 1.5rem}
  @media(min-width:768px){.container{padding:0 3rem}}
  @media(min-width:1024px){.container{padding:0 6rem;max-width:1200px}}
`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Golden Energy Vietnam - Giải Pháp Điện Mặt Trời Hàng Đầu",
    template: "%s | Golden Energy Vietnam",
  },
  description: "Giải pháp điện mặt trời chuyên nghiệp với hơn 500+ dự án thành công. Tiết kiệm chi phí, bảo vệ môi trường, đầu tư bền vững. Đối tác Huawei & Growatt.",
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
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://static.doubleclick.net" />
        
        {/* YouTube API - defer loading until needed */}
        <script src="https://www.youtube.com/iframe_api" async defer></script>
        
        {/* Inline critical CSS for faster FCP */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS - Above the fold */
            ${criticalStyles}
            .hero{min-height:100vh;display:flex;align-items:center}
            .loading{opacity:0;animation:fadeIn .3s ease-in forwards}
            @keyframes fadeIn{to{opacity:1}}
            .text-gradient{background:linear-gradient(to right,#EEE,#AAA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
          `
        }} />
      </head>
      <body className={`${bodyFont.variable} ${headingFont.variable} loading`}>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
