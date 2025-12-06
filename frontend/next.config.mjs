/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add empty turbopack config to signal we're aware of the change
  turbopack: {},

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
};

export default nextConfig;
