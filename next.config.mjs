/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["raw.githubusercontent.com", "static.optimism.io"],
  },
  transpilePackages: ['@lifi/widget', '@lifi/wallet-management'],
};

export default nextConfig;
