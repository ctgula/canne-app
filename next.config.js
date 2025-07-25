/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Development-specific settings
  ...(process.env.NODE_ENV === 'development' && {
    // Custom webpack config for development
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Suppress specific warnings in development
        config.stats = {
          ...config.stats,
          warningsFilter: [
            /data-windsurf-page-id/,
            /data-windsurf-extension-id/,
            /Extension ID not available/,
            /BrowserPreview/,
          ],
        };
      }
      return config;
    },
  }),
  
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Additional development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // Period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 25 * 1000,
      // Number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 2,
    },
  }),
}

module.exports = nextConfig
