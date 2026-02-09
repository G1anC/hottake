import type { NextConfig } from 'next'

const nextConfig = {
    serverExternalPackages: ['@prisma/client'],
    images: {
        domains: [
            'picsum.photos', 
            'lastfm.freetls.fastly.net', 
            'i.scdn.co', 
            'lh3.googleusercontent.com', 
            'platform-lookaside.fbsbx.com',
            'cdn-images.dzcdn.net', // Deezer images
        ],
    },
} as NextConfig

export default nextConfig as NextConfig