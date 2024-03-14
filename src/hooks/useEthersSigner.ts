"use client";
import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { useEffect, useMemo, useState } from "react";

export function walletClientToSigner(ethereum?: ExternalProvider | null) {
  if (ethereum) {
    const provider = new Web3Provider(ethereum, "any");
    const signer = provider.getSigner();
    return signer;
  } else {
    throw Error("WalletClient not found");
  }
}

export function useEthersSigner() {
  const [ethereum, setEthereum] = useState<ExternalProvider | undefined>();

  useEffect(() => {
    if (window?.ethereum) {
      setEthereum(window.ethereum);
    }
  }, []);

  return useMemo(
    () => (ethereum ? walletClientToSigner(ethereum) : undefined),
    [ethereum],
  );
}
