/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  // The proxy is still needed to avoid CORS errors when your frontend
  // calls the backend API.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ]
  },

  // This is needed to fix the HMR WebSocket connection issue in Firebase Studio.
  webpack: (config, { isServer }) => {
    // Enable polling for file changes, which is more reliable in a container
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
