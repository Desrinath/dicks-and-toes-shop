/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost', port: '8001' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8001' },
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'ibb.co' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;

