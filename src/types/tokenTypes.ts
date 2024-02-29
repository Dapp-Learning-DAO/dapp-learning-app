import { SupportedChainId } from "config/chains";

export type ITokenConf = {
  chainId: SupportedChainId;
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balanceOf?: BigInt;
  balanceOfParsed?: number;
  isUserCustom?: boolean;
};
