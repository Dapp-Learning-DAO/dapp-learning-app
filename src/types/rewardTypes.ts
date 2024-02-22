import { ITokenConf } from "./tokenTypes";

export type IRewardClaimer = {
  address: string;
  claimer: string;
  isClaimed: boolean;
  tokenAddress: string;
  claimedValue: string | number;
  claimedValueParsed: number | null;
}

export type IRewardCreateForm = {
  name: string;
  enablePassword: boolean;
  password: string;
  mode: boolean;
  tokenType: number; // 0 | 1
  members: `0x${string}`[];
  tokenAmount: number | string;
  tokenAmountParsed: bigint;
  duration: number;
  durationUnit: number;
  number: number;
  tokenObj: null | ITokenConf;
}
