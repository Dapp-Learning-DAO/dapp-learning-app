
export interface IclaimerItem {
  address: string;
  claimer: string;
  isClaimed: boolean;
  tokenAddress: string;
  claimedValue: string | number;
  claimedValueParsed: number | null;
}
