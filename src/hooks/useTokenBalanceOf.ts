import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import { erc20Abi, isAddress, isAddressEqual } from "viem";
import { ETH_TOKEN_ADDRESS } from "config/constants";

export default function useTokenBalanceOf({
  tokenAddr,
  exceptedBalance,
}: {
  tokenAddr: `0x${string}` | undefined;
  exceptedBalance?: bigint;
}) {
  const { address } = useAccount();
  const chainId = useChainId();
  const [isInsufficient, setIsInsufficient] = useState(false);
  const [balanceOf, setBalanceOf] = useState<bigint | undefined>();

  const isETH = useMemo(
    () => tokenAddr && isAddressEqual(tokenAddr, ETH_TOKEN_ADDRESS),
    [tokenAddr],
  );

  const {
    data: balanceOfRes,
    refetch: queryBalanceOf,
    isLoading: tokenBalanceLoading,
  } = useReadContract({
    chainId: chainId,
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: false,
    },
  });

  const {
    data: ethBalanceRes,
    refetch: queryEthBalance,
    isLoading: ethBalanceLoading,
  } = useBalance({
    address,
    query: { enabled: false },
  });

  useEffect(() => {
    if (!address) return;
    if (isETH) {
      queryEthBalance();
    } else {
      if (tokenAddr && isAddress(tokenAddr)) {
        queryBalanceOf();
      }
    }
  }, [tokenAddr, address, isETH, queryBalanceOf, queryEthBalance]);

  useEffect(() => {
    if (tokenBalanceLoading || ethBalanceLoading) return;
    let _balance: bigint | undefined = undefined;
    if (isETH && ethBalanceRes) {
      _balance = ethBalanceRes.value;
    } else if (!isETH && typeof balanceOfRes !== "undefined") {
      _balance = balanceOfRes;
    }
    setBalanceOf(_balance);
    if (typeof _balance !== "undefined") {
      try {
        if (
          exceptedBalance &&
          BigInt(exceptedBalance) > 0n &&
          // @ts-ignore
          BigInt(exceptedBalance) > _balance
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
  }, [
    tokenAddr,
    balanceOfRes,
    ethBalanceRes,
    isETH,
    exceptedBalance,
    tokenBalanceLoading,
    ethBalanceLoading,
  ]);

  return {
    balanceOf,
    isInsufficient,
    isLoading: tokenBalanceLoading || ethBalanceLoading,
  };
}
