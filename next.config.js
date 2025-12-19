const pkg = require('./package.json');
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_APP_VERSION: pkg.version,
    },
    experimental: {
        serverComponentsExternalPackages: ['@distube/ytdl-core'],
    },
};

module.exports = nextConfig;
