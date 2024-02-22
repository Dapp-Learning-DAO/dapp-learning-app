import { CHAIN_IDS_TO_NAMES, SupportedChainId } from "config/chains";
import { TokenConf } from "config/tokens";

export function getTokenIcon(address: `0x${string}` | string, chainId: number) {
  if (!address || !chainId) return "";
  if (chainId == Number(SupportedChainId.SEPOLIA)) return "";
  if (
    (chainId == Number(SupportedChainId.OPTIMISM) &&
      address == TokenConf[SupportedChainId.OPTIMISM]["USDC"]["address"]) ||
    (chainId == Number(SupportedChainId.ARBITRUM_ONE) &&
      address == TokenConf[SupportedChainId.ARBITRUM_ONE]["USDC"]["address"])
  )
    return `https://static.optimism.io/data/USDC/logo.png`;

  if (chainId == Number(SupportedChainId.SCROLL)) {
    return `https://cdn.sushi.com/image/upload/f_auto,c_limit,w_64,q_auto/tokens/534352/${address}.jpg`;
  }

  const chainName = CHAIN_IDS_TO_NAMES[chainId as SupportedChainId];
  if (!chainName) return "";
  return `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/${chainName}/assets/${address}/logo.png`;
}
