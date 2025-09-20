/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This is the only setting needed to fix the cross-origin warning.
    allowedDevOrigins: ["https://3000-firebase-fra-samanvaya-1758383690579.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev"],
  },
  
  // The proxy is still needed to avoid CORS errors when your frontend
  // calls the backend API.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
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

  // Adding a hostname helps resolve HMR connection issues in some environments.
  devServer: {
    hostname: '0.0.0.0',
  },
};

export default nextConfig;
