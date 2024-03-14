"use client";
import { Web3Provider } from "@ethersproject/providers";
import { getWalletClient } from "@wagmi/core";
import { wagmiConfig } from "provider/Web3Providers";
import { useMemo } from "react";
import { WalletClient } from "viem";
import { useChainId, useWalletClient } from "wagmi";

export function walletClientToSigner(walletClient?: WalletClient | null) {
  if (walletClient) {
    const provider = new Web3Provider(walletClient.transport, "any");
    const signer = provider.getSigner();
    return signer;
  } else {
    throw Error("WalletClient not found");
  }
}

export async function walletClientToSignerAsync(chainId?: number) {
  const walletClient = await getWalletClient(wagmiConfig);
  return walletClientToSigner(walletClient);
}

export function useEthersSigner() {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });

  return useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient],
  );
}
