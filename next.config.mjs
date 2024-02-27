/** @type {import('next').NextConfig} */

import path from "path";

// tsconfig.json paths
const path_alias = {
  "context/*": ["./src/context/*"],
  "hooks/*": ["./src/hooks/*"],
  "constant/*": ["./src/constant/*"],
  "config/*": ["./src/config/*"],
  "components/*": ["./src/components/*"],
  "utils/*": ["./src/utils/*"],
  "gql/*": ["./src/gql/*"],
  "locales/*": ["./src/locales/*"],
  "provider/*": ["./src/provider/*"],
  "types/*": ["./src/types/*"],
  "src/*": ["./src/*"],
  "app/*": ["./src/app/[locale]/*"],
};

const nextConfig = {
  images: {
    domains: ["raw.githubusercontent.com", "static.optimism.io"],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    let alias = {};
    for (const [key, value] of Object.entries(path_alias)) {
      alias[key.replace("/*", "")] = path.resolve(value[0].replace("/*", ""));
    }
    config.resolve.alias = { ...config.resolve.alias, alias };
    console.log(config.resolve.alias)

    return config;
  },
};

export default nextConfig;
