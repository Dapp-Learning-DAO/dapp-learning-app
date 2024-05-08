"use client";

import {
  getDefaultConfig,
  RainbowKitProvider,
  AvatarComponent,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, WagmiProviderProps } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { HttpTransport, http } from "viem";
import Image from "next/image";
import JazziconAvatar from "components/JazziconAvatar";
import GqlProvider from "./gqlProvider";
import { getChainsConfByPathname } from "config/chains";
import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  return ensImage ? (
    <Image
      src={ensImage}
      width={size}
      height={size}
      style={{ borderRadius: 999 }}
      alt="user avatar"
    />
  ) : (
    <div style={{ width: size, height: size }}>
      <JazziconAvatar address={address} diameter={size} />
    </div>
  );
};

export const queryClient = new QueryClient();

/* New RainbowKit API */
export const getWagmiConfig = (pathname: string) => {
  let chains = getChainsConfByPathname(pathname);
  let transports: { [chainId: number]: HttpTransport } = {};
  for (let _chain of chains) {
    transports[_chain.id] = http(_chain.rpcUrls.default.http[0]);
  }

  return getDefaultConfig({
    appName: "Dapp-Learning",
    appIcon: `https://dapplearning.org/images/icon/512x512.png`,
    projectId: `${process.env.NEXT_PUBLIC_WALLET_PROJECTID}`,
    ssr: true,
    // @ts-ignore
    chains,
    transports,
  });
};

type Web3ProviderType = {
  config: WagmiProviderProps["config"];
};

export const Web3ProviderContext = createContext<Web3ProviderType>({
  config: getWagmiConfig("/"),
});

export function useWeb3ProviderContext() {
  return useContext(Web3ProviderContext);
}

export function Web3Providers({ children }: { children: React.ReactNode }) {
  const [wagmiConfig, setWagmiConfig] = useState(getWagmiConfig("/"));

  return (
    <Web3ProviderContext.Provider value={{ config: wagmiConfig }}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            avatar={CustomAvatar}
            showRecentTransactions
            modalSize="compact"
          >
            <GqlProvider>{children}</GqlProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Web3ProviderContext.Provider>
  );
}
