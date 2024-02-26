"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import RedPacketInfo from "../../rewardComponents/RedpacketInfo";
import AlertBox, { showAlertMsg } from "components/AlertBox";
import RewardZksnarkProveInput from "../../zksnarkProveInput";
import useSwitchNetwork from "hooks/useSwitchNetwork";
import { formatUnits, isAddress, parseEventLogs, toBytes } from "viem";
import { getMerkleTree, hashToken } from "utils/getMerkleTree";
import useRedpacketContract from "hooks/useRedpacketContract";
import { useRouter } from "next/navigation";
import RedpacketZkTag from "../../rewardComponents/RedpacketIcons/RedpacketZkTag";
import { IRewardItem } from "types/rewardTypes";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function RewardClaimPage({
  item,
  onSuccess,
  isModal,
}: {
  item: IRewardItem;
  onSuccess: () => void;
  isModal?: boolean | undefined;
}) {
  const { address } = useAccount();
  const chainId = useChainId();
  const alertBoxRef = useRef(null);
  const zkInputRef = useRef(null);
  const router = useRouter();

  const [root, setRoot] = useState("");
  const [proof, setProof] = useState<string[]>([]);
  const [merkleVerified, setMerkleVrified] = useState(false);
  const [zkproof, setZkproof] = useState<any | null>(null);

  const { isNetworkCorrect, switchNetwork } = useSwitchNetwork();
  const redPacketContract = useRedpacketContract();

  const isZkRedpacket = !!item && !!item?.hashLock;

  // claim without password
  const {
    data: claimWriteSimRes,
    isLoading: simWriteLoading,
    isError: simIsError,
    error: simErrorMsg,
    refetch: simRefetch,
  } = useSimulateContract({
    chainId: chainId,
    address: redPacketContract?.address as `0x${string}`,
    abi: redPacketContract?.abi,
    functionName: isZkRedpacket
      ? "claimPasswordRedpacket"
      : "claimOrdinaryRedpacket",
    args: isZkRedpacket
      ? [item ? item?.id : null, proof, zkproof?.a, zkproof?.b, zkproof?.c]
      : [item ? item?.id : null, proof],
    query: {
      enabled: !!(
        isNetworkCorrect() &&
        item &&
        item?.id &&
        !item?.isClaimed &&
        !item?.isExpired &&
        ((isZkRedpacket && zkproof) || !isZkRedpacket) &&
        merkleVerified &&
        redPacketContract &&
        isAddress(redPacketContract?.address as string)
      ),
    },
  });

  const {
    data: claimTx,
    writeContractAsync: writeClaimRepacket,
    isPending: writeIsLoading,
    isError: writeIsError,
    // error: writeError,
    reset: writeReset,
  } = useWriteContract();

  useEffect(() => {
    if (address && item?.addressList && item.addressList.length > 0) {
      const merkleTree = getMerkleTree(item.addressList);
      let _proof = merkleTree.getHexProof(hashToken(address as `0x${string}`));
      let _root = merkleTree.getHexRoot();

      if (
        !merkleTree.verify(_proof, hashToken(address as `0x${string}`), _root)
      ) {
        showAlertMsg(alertBoxRef, "MerkleTree verify faild.", "error");
        console.error("MerkleTree verify faild.", _root, _proof);
        setMerkleVrified(false);
        return;
      }
      console.log("MerkleTree verify passed.");
      setRoot(_root);
      setProof(_proof);
      setMerkleVrified(true);
    } else {
      setRoot("");
      setProof([]);
      setMerkleVrified(false);
    }
  }, [address, item?.addressList]);

  useEffect(() => {
    if (simErrorMsg) {
      // showAlertMsg(alertBoxRef, JSON.stringify(simErrorMsg), "error");
      console.error(simErrorMsg?.message);
    }
  }, [simErrorMsg]);

  const {
    data: txRes,
    isError: txIsError,
    isLoading: txIsLoading,
  } = useWaitForTransactionReceipt({
    hash: claimTx as `0x${string}`,
  });

  useEffect(() => {
    let claimed_value_parsed = "";
    if (txRes) {
      console.log("onClaimSuccess", txRes);
      if (redPacketContract && txRes.logs && txRes.logs[1]) {
        const parsedLog = parseEventLogs({
          abi: redPacketContract.abi,
          eventName: ["ClaimSuccess"],
          logs: txRes.logs,
        });
        if (parsedLog[0]) {
          claimed_value_parsed = formatUnits(
            (parsedLog[0].args as any).claimed_value,
            item?.decimals
          );
          console.log("ClaimSuccess decodedLog", parsedLog);

          if (item?.claimers) {
            // update claimers
            item.claimers = item?.claimers?.map((c: any) => {
              if (c.address.toLowerCase() == address?.toLowerCase()) {
                return {
                  ...c,
                  claimedValueParsed: claimed_value_parsed,
                };
              }
              return c;
            });
          }
        }
      }
      showAlertMsg(
        alertBoxRef,
        claimed_value_parsed
          ? `Claimed ${claimed_value_parsed} ${item?.symbol ?? ""}!`
          : `Claim Successfully!`,
        "success",
        0
      );
      if (onSuccess) onSuccess();
    }
  }, [txRes, txIsError, address, redPacketContract]); // eslint-disable-line

  const handleClaim = async () => {
    try {
      if (
        !root ||
        !merkleVerified ||
        !writeClaimRepacket ||
        !claimWriteSimRes ||
        !claimWriteSimRes?.request
      ) {
        return;
      }

      if (!isNetworkCorrect()) {
        if (!(await switchNetwork())) {
          return;
        }
      }

      try {
        await writeClaimRepacket?.(claimWriteSimRes!.request);
        // console.warn("Claim Tx:", hash);
        // setClaimTx(hash);
      } catch (error) {
        showAlertMsg(alertBoxRef, "claim failed", "error");
        console.error("claim failed error:", JSON.stringify(error));
        setTimeout(() => {
          writeReset();
        }, 1000);
      }
    } catch (error) {
      showAlertMsg(alertBoxRef, JSON.stringify(error), "error");
      console.error("claim failed error:", JSON.stringify(error));
      setTimeout(() => {
        writeReset();
      }, 1000);
      throw error;
    }
  };

  const handleProveChange = (prove: any) => {
    console.log("handleProveChange", prove);
    if (!prove) {
      setZkproof(null);
      return;
    }
    const { proof, publicSignals } = prove;
    if (!publicSignals || !proof) {
      setZkproof(null);
      return;
    }
    setZkproof(proof);
  };

  const loading = simWriteLoading || writeIsLoading || txIsLoading;
  const disabled =
    !isNetworkCorrect() ||
    !claimWriteSimRes ||
    !claimWriteSimRes?.request ||
    !writeClaimRepacket ||
    simIsError ||
    writeIsError ||
    !!claimTx;

  return (
    <>
      <div
        className="relative"
        style={{ maxHeight: isModal ? "calc(100vh - 3em)" : "auto" }}
      >
        <h3 className="font-bold text-xl text-center">
          Claim
          {isZkRedpacket && <RedpacketZkTag />}
        </h3>
        {isModal && (
          <button
            className="btn btn-ghost absolute  -top-4 -right-4 hover:bg-transparent disabled:bg-transparent"
            disabled={writeIsLoading || txIsLoading}
            onClick={() => router.back()}
          >
            <XCircleIcon className="w-6" />
          </button>
        )}
        <div className="overflow-y-auto max-h-[30vh] md:max-h-[50vh] mb-4 py-4 pr-2">
          <div className="py-4 min-h-[40vh] min-w-fit">
            <RedPacketInfo item={item} isLoading={loading} />
          </div>
        </div>
        {isZkRedpacket && (
          <div className="">
            <RewardZksnarkProveInput
              ref={zkInputRef}
              hashLock={item?.hashLock}
              onProveSuccess={handleProveChange}
            />
          </div>
        )}
        <AlertBox ref={alertBoxRef} />
        <div className="w-full">
          {!item?.isExpired && (
            <button
              className="btn btn-primary btn-block md:flex-1 md:mr-4"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                handleClaim();
              }}
              disabled={loading || disabled}
            >
              {loading && (
                <div className="loading loading-spinner loading-md inline-block mr-2"></div>
              )}
              {loading ? "Loading" : "Claim"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
