"use client";

import {
  getDefaultConfig,
  RainbowKitProvider,
  AvatarComponent,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { optimism, arbitrum, zkSync, scroll, sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { http } from "viem";
import Image from "next/image";
import JazziconAvatar from "components/JazziconAvatar";
import GqlProvider from "./gqlProvider";

export const queryClient = new QueryClient();

export const chainsConf = [
  {
    ...optimism,
    hasIcon: true,
    iconBackground: "#ff5a57",
    iconUrl: "/images/chainIcons/optimism.svg",
  },
  {
    ...arbitrum,
    hasIcon: true,
    iconBackground: "#96bedc",
    iconUrl: "/images/chainIcons/arbitrum.svg",
  },
  {
    ...zkSync,
    hasIcon: true,
    iconBackground: "#F9F7EC",
    iconUrl: "/images/chainIcons/zkSync.svg",
  },
  {
    ...scroll,
    hasIcon: true,
    iconBackground: "#edcca2",
    iconUrl: "/images/chainIcons/scroll.svg",
  },
  {
    ...sepolia,
    hasIcon: true,
    iconBackground: "#484c50",
    iconUrl: "/images/chainIcons/ethereum.svg",
  },
];

/* New RainbowKit API */
export const wagmiConfig = getDefaultConfig({
  appName: "Dapp-Learning",
  appIcon: `https://dapplearning.org/images/icon/512x512.png`,
  projectId: `${process.env.NEXT_PUBLIC_WALLET_PROJECTID}`,
  ssr: true,
  // @ts-ignore
  chains: chainsConf,
  transports: {
    [optimism.id]: http(
      `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    ),
    [arbitrum.id]: http(
      `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    ),
    [zkSync.id]: http(`https://mainnet.era.zksync.io`),
    [scroll.id]: http(`https://rpc.scroll.io`),
    [sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    ),
  },
});

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

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
