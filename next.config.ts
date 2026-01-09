import type { NextConfig } from 'next'

const config: NextConfig = {
  // Proxy external APIs (replaces vite.config.ts proxy)
  async rewrites() {
    return [
      {
        source: '/api/polymarket/:path*',
        destination: 'https://gamma-api.polymarket.com/:path*',
      },
      {
        source: '/api/polymarket-clob/:path*',
        destination: 'https://clob.polymarket.com/:path*',
      },
    ]
  },
}

export default config
