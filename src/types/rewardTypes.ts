import { ITokenConf } from "./tokenTypes";

export type IRewardClaimer = {
  address: string;
  claimer: string;
  isClaimed: boolean;
  tokenAddress: string | `0x${string}` | null;
  claimedValue: string | number;
  claimedValueParsed: number | null;
}

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
}
