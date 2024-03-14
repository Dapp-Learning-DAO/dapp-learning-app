import {
  optimism,
  arbitrum,
  zkSync,
  scroll,
  sepolia,
  mainnet,
  polygon,
  polygonZkEvm,
  base,
  avalanche,
  linea,
  gnosis,
  fantom,
  moonriver,
  moonbeam,
  fuse,
  boba,
  aurora,
  metis,
  Chain,
} from "wagmi/chains";

/**
 * List of all the networks supported by the Uniswap Interface
 */
export enum SupportedChainId {
  OPTIMISM = 10,
  ARBITRUM_ONE = 42161,
  ZKSYNC = 324,
  SCROLL = 534352,
  SEPOLIA = 11155111,
}

export const CHAIN_IDS_TO_NAMES: { [chainId: number]: string } = {
  [SupportedChainId.OPTIMISM]: "optimism",
  [SupportedChainId.ARBITRUM_ONE]: "arbitrum",
  [SupportedChainId.ZKSYNC]: "zksync",
  [SupportedChainId.SCROLL]: "scroll",
  [SupportedChainId.SEPOLIA]: "sepolia",
};

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(
  SupportedChainId,
).filter((id) => typeof id === "number") as SupportedChainId[];

export function isSupportedChain(
  chainId: number | undefined,
): chainId is SupportedChainId {
  return !!chainId && !!SupportedChainId[chainId];
}

export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [
  SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ZKSYNC,
  SupportedChainId.SCROLL,
  SupportedChainId.SEPOLIA,
];

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [
  SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.SCROLL,
  SupportedChainId.ZKSYNC,
  SupportedChainId.SEPOLIA,
] as const;

export type SupportedL1ChainId = (typeof L1_CHAIN_IDS)[number];

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS = [
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.OPTIMISM,
  SupportedChainId.SCROLL,
] as const;

export type SupportedL2ChainId = (typeof L2_CHAIN_IDS)[number];

export const defaultChainsConf = [
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

export const chainsConfByPathname: { [pathname: string]: Chain[] } = {
  "/bridge": [
    mainnet,
    arbitrum,
    optimism,
    polygon,
    zkSync,
    polygonZkEvm,
    base,
    avalanche,
    linea,
    gnosis,
    fantom,
    moonriver,
    moonbeam,
    fuse,
    boba,
    aurora,
    metis,
  ],
};

export const getChainsConfByPathname = (pathname: string) => {
  pathname = pathname.replace(/^\/(\w+)/, "");
  if (chainsConfByPathname[pathname]) return chainsConfByPathname[pathname];
  return defaultChainsConf;
};
