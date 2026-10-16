/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '11mb' } },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
