import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tối ưu hóa build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Bật compression
  compress: true,

  // Ignore ESLint warnings during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Tối ưu images for goldenenergy.vn
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 năm
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'goldenenergy.vn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.goldenenergy.vn',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Experimental features for optimal performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'framer-motion',
      'gsap',
      'lucide-react',
      'react-icons',
      '@radix-ui/react-icons',
      '@heroicons/react',
      'date-fns',
      'lodash',
      'mapbox-gl',
    ],
    // Tăng cường lazy loading
    scrollRestoration: true,
  },
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  generateEtags: true,
  
  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Code splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxAsyncRequests: 30,
        maxInitialRequests: 25,
        cacheGroups: {
          default: false,
          vendors: false,
          // Tách vendor code
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Tách common code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Tách GSAP riêng
          gsap: {
            name: 'gsap',
            test: /[\\/]node_modules[\\/]gsap[\\/]/,
            priority: 25,
          },
          // Tách framer-motion riêng
          framer: {
            name: 'framer',
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            priority: 25,
          },
          // Tách mapbox riêng (nặng)
          mapbox: {
            name: 'mapbox',
            test: /[\\/]node_modules[\\/]mapbox-gl[\\/]/,
            priority: 25,
          },
          // Tách UI components
          ui: {
            name: 'ui',
            test: /[\\/]components[\\/]ui[\\/]/,
            priority: 15,
          },
        },
      };
    }
    
    return config;
  },
  
// Security headers - Enhanced for goldenenergy.vn
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.google-analytics.com https://www.googletagmanager.com https://static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://www.youtube.com https://www.google.com",
              "connect-src 'self' https://www.google-analytics.com https://api.mapbox.com wss:",
              "media-src 'self' https://www.youtube.com",
            ].join('; ')
          }
        ],
      },
      // Cache static assets aggressively
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      // Cache images
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
    ];
  },
  
  // Redirect rules for SEO and CRM->ERP migration
  async redirects() {
    return [
      // CRM to ERP redirects
      {
        source: '/crm',
        destination: '/erp',
        permanent: true,
      },
      {
        source: '/crm/:path*',
        destination: '/erp/:path*',
        permanent: true,
      },
      // Redirect www to non-www (only for production)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.goldenenergy.vn',
          },
        ],
        destination: 'https://goldenenergy.vn/:path*',
        permanent: true,
      },
      // Note: Root "/" redirect is handled by app/page.tsx
    ];
  },
};

export default nextConfig;
