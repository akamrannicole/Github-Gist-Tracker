/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // Suppress TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Suppress ESLint errors
  },
  productionBrowserSourceMaps: false, // Speed up production build
  poweredByHeader: false, // Remove X-Powered-By header for security
  images: {
    disableStaticImages: true, // Avoid image optimization issues
  },
  experimental: {
    typedRoutes: false, // Disable typed routes (avoid type checking)
    serverExternalPackages: [], // Corrected version of `serverComponentsExternalPackages`
  },
  webpack: (config: { optimization: { minimize: boolean } }) => {
    config.optimization.minimize = false // Keep debugging easier
    return config
  },
}

module.exports = nextConfig
