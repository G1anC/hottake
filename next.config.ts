import type { NextConfig } from 'next'

const nextConfig = {
    serverExternalPackages: ['@prisma/client'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'lastfm.freetls.fastly.net',
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'platform-lookaside.fbsbx.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn-images.dzcdn.net',
            },
        ],
    },
} as NextConfig

export default nextConfig as NextConfig