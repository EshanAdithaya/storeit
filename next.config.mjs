// next.config.mjs
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
      domains: ['localhost'],
    },
    experimental: {
      serverComponentsExternalPackages: [],
    },
  };
  
  // Replace module.exports with this:
  export default nextConfig;