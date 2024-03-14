import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useChainId, useReadContract } from "wagmi";
import { erc20Abi, isAddress, isAddressEqual } from "viem";
import { ETH_TOKEN_ADDRESS } from "config/constants";

export default function useTokenBalanceOf({
  tokenAddr,
}: {
  tokenAddr: `0x${string}` | undefined;
}) {
  const { address } = useAccount();
  const chainId = useChainId();
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
  }, [
    tokenAddr,
    balanceOfRes,
    ethBalanceRes,
    isETH,
    tokenBalanceLoading,
    ethBalanceLoading,
  ]);

  return {
    balanceOf,
    isLoading: tokenBalanceLoading || ethBalanceLoading,
  };
}
