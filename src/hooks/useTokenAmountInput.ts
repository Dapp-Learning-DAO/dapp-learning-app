"use client";
import { useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { formatUnits, parseUnits } from "viem";
import useTokenBalanceOf from "hooks/useTokenBalanceOf";
import { Token } from "config/tokens";

interface useTokenAmountInputProps {
  inputVal: string | number;
  tokenObj?: Token;
}

type useTokenAmountInputReturn = {
  amountParsed: bigint;
  balanceOf: bigint;
  maxBalance: number;
  isInsufficient: boolean;
};

const useTokenAmountInput = ({
  inputVal,
  tokenObj,
}: useTokenAmountInputProps): useTokenAmountInputReturn => {
  const [amountParsed, setAmountParsed] = useState(0n);

  const { balanceOf } = useTokenBalanceOf({
    tokenAddr: tokenObj ? (tokenObj.address as `0x${string}`) : undefined,
  });

  const isInsufficient = useMemo(() => {
    if (typeof balanceOf !== "undefined") {
      try {
        if (
          amountParsed &&
          BigInt(amountParsed) > 0n &&
          // @ts-ignore
          BigInt(amountParsed) > amountParsed
        ) {
          return true;
        }
      } catch (error) {
        console.error("setIsInsufficient error: ", error);
      }
    }
    return false;
  }, [amountParsed, balanceOf]);

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

export default useTokenAmountInput;

function isAmountValid(amount: string | number) {
  const regex = /^(-)?\d+(\.\d{0,18})?$/;
  return regex.test(`${amount}`);
}
