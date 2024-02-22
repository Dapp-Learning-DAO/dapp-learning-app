import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { erc20Abi, isAddress } from "viem";

export default function useTokenBalanceOf({
  tokenAddr,
  exceptedBalance,
}: {
  tokenAddr: `0x${string}` | undefined;
  exceptedBalance?: bigint;
}) {
  const { address, chain } = useAccount();
  const [isInsufficient, setIsInsufficient] = useState(false);
  const [balanceOf, setBalanceOf] = useState<bigint | null>(null);

  const {
    data: balanceOfRes,
    refetch: queryBalanceOf,
    isLoading,
  } = useReadContract({
    chainId: chain?.id,
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: false,
    },
  });

  useEffect(() => {
    if (tokenAddr && isAddress(tokenAddr) && address) {
      queryBalanceOf();
    }
  }, [tokenAddr, address, queryBalanceOf]);

  useEffect(() => {
    if (balanceOfRes) {
      setBalanceOf(balanceOfRes);
    } else {
      setBalanceOf(null);
    }

    if (
      tokenAddr &&
      isAddress(tokenAddr) &&
      !isLoading &&
      typeof balanceOfRes !== "undefined"
    ) {
      try {
        if (
          exceptedBalance &&
          BigInt(exceptedBalance) > 0 &&
          // @ts-ignore
          BigInt(exceptedBalance) > balanceOfRes
        ) {
          setIsInsufficient(true);
        } else {
          setIsInsufficient(false);
        }
      } catch (error) {
        console.error("setIsInsufficient error: ", error);
        setIsInsufficient(false);
      }
    }
  }, [tokenAddr, balanceOfRes, exceptedBalance, isLoading]);

  return {
    balanceOf,
    isInsufficient,
    isLoading,
  };
}
