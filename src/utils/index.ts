import { isAddress } from "viem";

export function shortAddress(str: string): string {
  if (!isAddress(str)) return str;
  return str.substring(0, 4) + "..." + str.substring(38);
}

export function isRewardId(str: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(str);
}
export function shortRewardId(str: string): string {
  if (!isRewardId(str)) return str;
  return str.substring(0, 4) + "..." + str.substring(60);
}

export const numAutoToFixed = (num: number, maxDecimalPlaces: number = 4) => {
  const numStr = num.toString();
  const dotIndex = numStr.indexOf(".");
  if (dotIndex === -1) {
    return num;
  }
  const decimalPlaces = numStr.length - dotIndex - 1;
  if (decimalPlaces > maxDecimalPlaces) {
    return num.toFixed(maxDecimalPlaces);
  }
  return num;
};
