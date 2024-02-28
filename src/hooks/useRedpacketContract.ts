import { useEffect, useState } from "react";
import { loadContract } from "utils/loadContract";
import { GetContractReturnType } from "viem";
import { useChainId, useClient } from "wagmi";

export default function useRedpacketContract() {
  const chainId = useChainId();
  const signer = useClient();
  const [redpacketContract, setRedpacketContract] =
    useState<GetContractReturnType | null>(null);

  useEffect(() => {
    if (!signer || !chainId) return;
    setRedpacketContract(loadContract("HappyRedPacket", signer, chainId));
  }, [chainId, signer]);

  return redpacketContract;
}
