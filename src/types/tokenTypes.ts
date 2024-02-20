import { SupportedChainId } from "config/chains";

export type ITokenConf = {
  // chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balanceOf?: BigInt;
  balanceOfParsed?: number;
  isUserCustom?: boolean;
};

export type IChainTokenConfs = { [key: string]: ITokenConf };

export type ITokenConfs = {
  [chainId: number | SupportedChainId]: IChainTokenConfs;
};
