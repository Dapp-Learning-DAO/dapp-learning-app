import { ITokenConf } from "types/tokenTypes";
import { SupportedChainId } from "./chains";
import { ETH_TOKEN_ADDRESS } from "./constants";

export class Token implements ITokenConf {
  chainId: SupportedChainId;
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balanceOf?: BigInt;
  balanceOfParsed?: number;
  isUserCustom?: boolean;

  constructor({
    chainId,
    address,
    symbol,
    name,
    decimals,
    logoURI,
    balanceOf,
    balanceOfParsed,
    isUserCustom,
  }: ITokenConf) {
    this.chainId = chainId;
    this.address = address;
    this.symbol = symbol;
    this.name = name;
    this.decimals = decimals;
    this.logoURI = logoURI;
    this.balanceOf = balanceOf;
    this.balanceOfParsed = balanceOfParsed;
    this.isUserCustom = isUserCustom;
  }

  equals(otherToken: ITokenConf): boolean {
    return (
      this.address.toLowerCase() === otherToken.address.toLowerCase() &&
      this.chainId === otherToken.chainId
    );
  }

  isETH(): boolean {
    return this.address.toLowerCase() === ETH_TOKEN_ADDRESS;
  }
}

export type IChainTokenConfs = { [key: string]: Token };

export type ITokenConfs = {
  [chainId: number | SupportedChainId]: IChainTokenConfs;
};

export let TokenConf: ITokenConfs = {
  [SupportedChainId.OPTIMISM]: {
    ETH: new Token({
      chainId: SupportedChainId.OPTIMISM,
      address: ETH_TOKEN_ADDRESS,
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
    }),
    USDT: new Token({
      chainId: SupportedChainId.OPTIMISM,
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
      symbol: "USDT",
      name: "Tether USD",
    }),
    USDC: new Token({
      chainId: SupportedChainId.OPTIMISM,
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
    }),
    "USDC.e": new Token({
      chainId: SupportedChainId.OPTIMISM,
      address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      decimals: 6,
      symbol: "USDC.e",
      name: "USDC.e",
    }),
    DAI: new Token({
      chainId: SupportedChainId.OPTIMISM,
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      symbol: "DAI",
      name: "Dai stable coin",
    }),
    OP: new Token({
      chainId: SupportedChainId.OPTIMISM,
      address: "0x4200000000000000000000000000000000000042",
      decimals: 18,
      symbol: "OP",
      name: "Optimism",
    }),
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    ETH: new Token({
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: ETH_TOKEN_ADDRESS,
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
    }),
    USDT: new Token({
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      symbol: "USDT",
      name: "Tether USD",
    }),
    USDC: new Token({
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
    }),
    "USDC.e": new Token({
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      decimals: 6,
      symbol: "USDC.e",
      name: "USDC.e",
    }),
    DAI: new Token({
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      symbol: "DAI",
      name: "Dai stable coin",
    }),
    ARB: new Token({
      chainId: SupportedChainId.ARBITRUM_ONE,
      address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
      decimals: 18,
      symbol: "ARB",
      name: "Arbitrum",
    }),
  },
  [SupportedChainId.SCROLL]: {
    ETH: new Token({
      chainId: SupportedChainId.SCROLL,
      address: ETH_TOKEN_ADDRESS,
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
    }),
    USDT: new Token({
      chainId: SupportedChainId.SCROLL,
      address: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
      decimals: 6,
      symbol: "USDT",
      name: "Tether USD",
    }),
    USDC: new Token({
      chainId: SupportedChainId.SCROLL,
      address: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
    }),
    DAI: new Token({
      chainId: SupportedChainId.SCROLL,
      address: "0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97",
      decimals: 18,
      symbol: "DAI",
      name: "Dai stable coin",
    }),
  },
  [SupportedChainId.SEPOLIA]: {
    ETH: new Token({
      chainId: SupportedChainId.SEPOLIA,
      address: ETH_TOKEN_ADDRESS,
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
    }),
    TST: new Token({
      chainId: SupportedChainId.SEPOLIA,
      address: "0xcd789635ed87F6dF5731B89F27EFC838cd5870E3",
      decimals: 18,
      symbol: "TST",
      name: "Test Token",
    }),
    WETH: new Token({
      chainId: SupportedChainId.SEPOLIA,
      address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      decimals: 18,
      symbol: "WETH",
      name: "Wraped ETH",
    }),
    UNI: new Token({
      chainId: SupportedChainId.SEPOLIA,
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      decimals: 18,
      symbol: "UNI",
      name: "Uniswap",
    }),
    // TST2 0xfFEe51237C25303798d098735C25c1F9A91a6e18
  },
};

if (process.env.NEXT_PUBLIC_ENVIRONMENT === "development") {
  TokenConf[SupportedChainId.SCROLL].TestToken = new Token({
    chainId: SupportedChainId.SEPOLIA,
    address: "0xcd789635ed87F6dF5731B89F27EFC838cd5870E3",
    decimals: 18,
    symbol: "DLD",
    name: "DL test token",
  });
}

let _decimals: any = {};
let _symbols: any = {};
for (let _chainid in TokenConf) {
  _decimals[_chainid] = {};
  _symbols[_chainid] = {};
  for (let _token of Object.values(TokenConf[_chainid])) {
    _decimals[_chainid][_token.address.toLowerCase()] = _token.decimals;
    _symbols[_chainid][_token.address.toLowerCase()] = _token.symbol;
  }
}

export const TokensDecimals = _decimals;
export const TokensSymbols = _symbols;
