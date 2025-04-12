const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
      domains: ['localhost'],
    },
    experimental: {
      serverComponentsExternalPackages: [],
      runtime: 'nodejs', // Added to ensure API routes run in Node.js runtime
    },
  };
  
  // Replace module.exports with this:
  export default nextConfig;