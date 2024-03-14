"use client";
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

export const isCidMsgValid = (msg: any): boolean => {
  return (
    typeof msg === "string" && msg !== "null" && /^APP_\d+_[a-z0-9]+$/.test(msg)
  );
};

export const getCidFromMsg = (msg: any): string => {
  if (isCidMsgValid(msg)) {
    return msg.split("_")[2];
  }
  return "";
};

export const formatBalanceParsed = (n: number): string => {
  if (n > 0.01) {
    return n.toFixed(2);
  } else if (n > 0.0001) {
    return n.toFixed(4);
  } else if (n > 0.000001) {
    return n.toFixed(6);
  } else if (n > 0) {
    return `> 1e-6`;
  } else {
    return "0";
  }
};
