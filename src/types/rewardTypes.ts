import { ITokenConf } from "./tokenTypes";

export type IRewardClaimer = {
  address: string;
  claimer: string;
  isClaimed: boolean;
  tokenAddress: string | `0x${string}` | null;
  claimedValue: string | number;
  claimedValueParsed: number | null;
};

export type IRewardItem = {
  allClaimed: boolean;
  claimedNumber: number;
  claimedValueParsed: number;
  claimers: IRewardClaimer[];
  addressList?: `0x${string}`[];
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
  lock: string;
  message: string;
  name: string;
  number: number;
  refunded: boolean;
  symbol: string;
  token: ITokenConf;
  tokenAddress: string;
  total: string;
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
