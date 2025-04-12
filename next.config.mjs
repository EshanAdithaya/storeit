// next.config.mjs
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['localhost'],
    },
    experimental: {
      serverComponentsExternalPackages: [],
    },
  };
  
  // Replace module.exports with this:
  export default nextConfig;