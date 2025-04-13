const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  // Modify experimental section
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Add middleware config to use Node.js runtime
  middleware: {
    unstable_allowDynamicGlob: ['**/*.js'],
    runtime: 'nodejs',
  },
};

export default nextConfig;