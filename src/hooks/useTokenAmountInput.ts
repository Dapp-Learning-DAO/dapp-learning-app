"use client";
import { ITokenConf } from "types/tokenTypes";
import { useState } from "react";
import { useDebounce } from "react-use";
import { formatUnits, parseUnits } from "viem";
import useTokenBalanceOf from "hooks/useTokenBalanceOf";

interface useTokenAmountInputProps {
  inputVal: string | number;
  tokenObj: ITokenConf | null;
}

type useTokenAmountInputReturn = {
  amountParsed: bigint;
  balanceOf: bigint;
  maxBalance: number;
  isInsufficient: boolean;
};

const TokenAmountInput = ({
  inputVal,
  tokenObj,
}: useTokenAmountInputProps): useTokenAmountInputReturn => {
  const [amountParsed, setAmountParsed] = useState(0n);

  const { balanceOf, isInsufficient } = useTokenBalanceOf({
    tokenAddr: tokenObj ? (tokenObj.address as `0x${string}`) : undefined,
    exceptedBalance: amountParsed,
  });

  useDebounce(
    () => {
      try {
        const decimals = tokenObj?.decimals;

        if (!isAmountValid(inputVal) || !decimals) {
          setAmountParsed(0n);
          return;
        }
        if (inputVal == maxBalance) {
          setAmountParsed(balanceOf!);
          return;
        }
        setAmountParsed(parseUnits(`${inputVal}`, decimals));
      } catch (error) {
        console.error("Parse tokenAmount error:", error);
        setAmountParsed(0n);
      }
    },
    300,
    [inputVal],
  );

  const maxBalance = balanceOf
    ? Number(formatUnits(balanceOf, tokenObj?.decimals as number).toString())
    : 0;

  return {
    amountParsed,
    balanceOf: balanceOf ? balanceOf : 0n,
    maxBalance,
    isInsufficient,
  };
};

export default TokenAmountInput;

function isAmountValid(amount: string | number) {
  const regex = /^(-)?\d+(\.\d{0,18})?$/;
  return regex.test(`${amount}`);
}
