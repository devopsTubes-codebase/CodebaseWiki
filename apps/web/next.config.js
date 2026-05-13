/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Transpile api package
  transpilePackages: ['@codebase-wiki/api'],
}

module.exports = nextConfig
