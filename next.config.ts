import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  //eslint rules off
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "600mb", // Aumentado para soportar videos grandes
    },
  },
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Exclude MinIO from client-side bundle
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Configure aliases for problematic packages
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-pdf/renderer': '@react-pdf/renderer',
    };

    // Add canvas support for react-pdf
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('canvas');
      } else {
        config.externals = [config.externals, 'canvas'];
      }
    }

    return config;
  },
  images: {
    domains: [
      "localhost",
      "tu-dominio.com",
      "bucket-production.up.railway.app",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "bucket-production.up.railway.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
    ],
    // Allow images from our own API routes
    unoptimized: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value: process.env.NODE_ENV === 'development'
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://* http://localhost:9000; media-src 'self' blob: https://*; connect-src 'self' https://* http://localhost:9000 ws://localhost:* wss://*; frame-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://* http://localhost:9000; media-src 'self' blob: https://*; connect-src 'self' https://* http://localhost:9000 ws://localhost:* wss://*; frame-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=self, payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
