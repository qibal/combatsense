/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.blob.vercel-storage.com',
            },
        ],
    },
};

export default nextConfig;