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
    // for (const [key, value] of Object.entries(path_alias)) {
    //   alias[key.replace("/*", "")] = path.resolve(value[0].replace("/*", ""));
    // }
    alias["context"] = path.resolve("./src/context");
    alias["hooks"] = path.resolve("./src/hooks/*");
    alias["constant"] = path.resolve("./src/constant/*");
    alias["config"] = path.resolve("./src/config/*");
    alias["components"] = path.resolve("./src/components/*");
    alias["utils"] = path.resolve("./src/utils/*");
    alias["gql"] = path.resolve("./src/gql/*");
    alias["locales"] = path.resolve("./src/locales/*");
    alias["provider"] = path.resolve("./src/provider/*");
    alias["types"] = path.resolve("./src/types/*");
    alias["src"] = path.resolve("./src/*");
    alias["app"] = path.resolve("./src/app/[locale]/*");

    config.resolve.alias = { ...config.resolve.alias, ...alias };
    console.log(config.resolve.alias);

    return config;
  },
};

export default nextConfig;
