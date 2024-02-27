import { ITokenConf } from "./tokenTypes";

export type IRewardClaimer = {
  address: `0x${string}`;
  claimer: string | `0x${string}`;
  isClaimed: boolean;
  tokenAddress: string | `0x${string}` | null;
  claimedValue: string | number;
  claimedValueParsed: number | null | undefined;
};

export type IRewardItem = {
  allClaimed: boolean;
  claimedNumber: number;
  claimedValueParsed: number | null | undefined;
  claimers: IRewardClaimer[];
  creationTime: string | number;
  creator: `0x${string}`;
  decimals: number;
  expireTimestamp: string | number;
  hashLock: null | string;
  id: string;
  ifRandom: boolean;
  ifrandom: boolean;
  isClaimed: boolean;
  isExpired: boolean;
  isRefunded: boolean;
  isCreator: boolean;
  isClaimable: boolean;
  lock: string;
  message: string;
  name: string;
  number: number;
  refunded: boolean;
  symbol: string;
  token: ITokenConf;
  tokenAddress: string;
  total: bigint;
  totalParsed: number;
};

export type IRewardCreateForm = {
  isValid?: boolean;
  name: string;
  enablePassword: boolean;
  password: string;
  lockBytes: string | null;
  mode: boolean;
  tokenType: number; // 0 | 1
  members: `0x${string}`[];
  merkleRoot: string | null;
  tokenAmount: number | string;
  tokenAmountParsed: bigint;
  duration: number;
  durationUnit: number;
  number: number;
  tokenObj: null | ITokenConf;
};

export type IRewardIPFSData = { [cid: string]: `0x${string}`[] };
