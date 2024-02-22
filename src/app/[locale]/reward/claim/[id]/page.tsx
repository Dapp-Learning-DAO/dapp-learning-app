"use client";

import { useQuery } from "@apollo/client";
import { RedPacketByIdGraph } from "../../../../../../gql/RedpacketGraph";
import { useEffect, useRef, useState } from "react";
import { getExpTime, processRedpacketItem } from "hooks/useRedpacketsLists";
import {
  useAccount,
  useChainId,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import ZKTag from "../../redpacket-icons/zktag";
import RedPacketInfo from "../../rewardComponents/RedpacketInfo";
import AlertBox, { showAlertMsg } from "components/AlertBox";
import RewardZksnarkProveInput from "../../zksnark-prove-input";
import useSwitchNetwork from "hooks/useSwitchNetwork";
import { formatUnits, isAddress, parseEventLogs, toBytes } from "viem";
import { getMerkleTree, hashToken } from "utils/getMerkleTree";
import useRedpacketContract from "hooks/useRedpacketContract";
import useRedpacket from "hooks/useRedpacket";
import { useRouter } from "next/navigation";

export default function RewardClaimPage({
  params: { id },
}: {
  params: { id: string };
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

  const { data: item, loading: gqlLoading } = useRedpacket({ id });

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
      enabled:
        isNetworkCorrect() &&
        !!item &&
        !!item?.id &&
        !item?.isClaimed &&
        !item?.isExpired &&
        ((isZkRedpacket && zkproof) || !isZkRedpacket) &&
        merkleVerified &&
        !!redPacketContract &&
        isAddress(redPacketContract?.address as string),
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
    if (address && item?.addressList.length > 0) {
      const merkleTree = getMerkleTree(item?.addressList);
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
        const logs = parseEventLogs({
          abi: redPacketContract.abi,
          eventName: ["ClaimSuccess"],
          logs: txRes.logs,
        });
        const _event = logs[0];
        // const contractInterface = new Interface(redPacketContract.abi);
        // const _event = txRes.logs.find(
        //   (_log) =>
        //     _log?.topics[0] ==
        //     keccak256(
        //       toBytes("ClaimSuccess(bytes32,address,uint256,address,bytes32)")
        //     )
        // );
        // if (_event) {
        //   // const decodeLog = contractInterface.parseLog(_event);
        //   claimed_value_parsed = formatUnits(
        //     _event.args.claimed_value,
        //     item?.decimals
        //   );
        //   console.log("ClaimSuccess decodedLog", decodeLog);

        //   if (item?.claimers) {
        //     // update claimers
        //     item.claimers = item?.claimers?.map((c: any) => {
        //       if (c.address.toLowerCase() == address?.toLowerCase()) {
        //         return {
        //           ...c,
        //           claimedValueParsed: claimed_value_parsed,
        //         };
        //       }
        //       return c;
        //     });
        //   }
        // }
      }
      showAlertMsg(
        alertBoxRef,
        claimed_value_parsed
          ? `Claimed ${claimed_value_parsed} ${item?.symbol ?? ""}!`
          : `Claim Successfully!`,
        "success",
        0
      );
      // if (onSuccess) onSuccess(); @todo
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

  const loading =
    gqlLoading || simWriteLoading || writeIsLoading || txIsLoading;
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
        className="modal-box md:min-w-[560px] text-base-content"
        style={{ maxHeight: `calc(100vh - 3em)` }}
      >
        <h3 className="font-bold text-xl text-center">
          Claim
          {isZkRedpacket && <ZKTag />}
        </h3>
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
        <div>
          <div
            className={`mt-4 md:modal-action w-full ${
              !item?.isExpired
                ? "grid grid-rows-2 gap-4 md:grid-cols-2 "
                : "flex"
            }`}
          >
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
            <button
              className="btn btn-block md:flex-1"
              disabled={writeIsLoading || txIsLoading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
