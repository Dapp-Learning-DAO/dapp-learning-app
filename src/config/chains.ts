/**
 * List of all the networks supported by the Uniswap Interface
 */
export enum SupportedChainId {
  MAINNET = 1,
  OPTIMISM = 10,
  ARBITRUM_ONE = 42161,
  SCROLL = 534352,
  SEPOLIA = 11155111,
}

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.MAINNET]: "mainnet",
  [SupportedChainId.OPTIMISM]: "optimism",
  [SupportedChainId.ARBITRUM_ONE]: "arbitrum",
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
  SupportedChainId.MAINNET,
  SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.SCROLL,
  SupportedChainId.SEPOLIA,
];

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.SCROLL,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.OPTIMISM,
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
