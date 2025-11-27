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
  
  // Tối ưu images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
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
    ],
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'framer-motion',
      'gsap',
      'lucide-react',
      'react-icons',
      '@radix-ui/react-icons',
      'date-fns',
      'lodash',
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
        },
      };
    }
    
    return config;
  },
  
  // Security headers
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
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
