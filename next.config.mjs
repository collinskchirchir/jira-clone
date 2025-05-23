/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-8a6f192a05814871953096cc2e9585cf.r2.dev',
      },
    ],
  },
};

export default nextConfig;
