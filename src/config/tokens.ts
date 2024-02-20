import { ITokenConfs } from "types/tokenTypes";
import { SupportedChainId } from "./chains";

export let TokenConf: ITokenConfs = {
  [SupportedChainId.OPTIMISM]: {
    USDT: {
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
      symbol: "USDT",
      name: "Tether USD",
    },
    USDC: {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
    },
    "USDC.e": {
      address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      decimals: 6,
      symbol: "USDC.e",
      name: "USDC.e",
    },
    DAI: {
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      symbol: "DAI",
      name: "Dai stable coin",
    },
    OP: {
      address: "0x4200000000000000000000000000000000000042",
      decimals: 18,
      symbol: "OP",
      name: "Optimism",
    },
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    USDT: {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      symbol: "USDT",
      name: "Tether USD",
    },
    USDC: {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
    },
    "USDC.e": {
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      decimals: 6,
      symbol: "USDC.e",
      name: "USDC.e",
    },
    DAI: {
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      symbol: "DAI",
      name: "Dai stable coin",
    },
    ARB: {
      address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
      decimals: 18,
      symbol: "ARB",
      name: "Arbitrum",
    },
  },
  [SupportedChainId.SCROLL]: {
    USDT: {
      address: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
      decimals: 6,
      symbol: "USDT",
      name: "Tether USD",
    },
    USDC: {
      address: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
    },
    DAI: {
      address: "0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97",
      decimals: 18,
      symbol: "DAI",
      name: "Dai stable coin",
    },
  },
  [SupportedChainId.SEPOLIA]: {
    TestToken: {
      address: "0xcd789635ed87F6dF5731B89F27EFC838cd5870E3",
      decimals: 18,
      symbol: "TST",
      name: "Test Token",
    },
    // TST2 0xfFEe51237C25303798d098735C25c1F9A91a6e18
  },
};

if (process.env.NEXT_PUBLIC_ENVIRONMENT === "development") {
  TokenConf[SupportedChainId.SCROLL].TestToken = {
    address: "0xcd789635ed87F6dF5731B89F27EFC838cd5870E3",
    decimals: 18,
    symbol: "DLD",
    name: "DL test token",
  };
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
