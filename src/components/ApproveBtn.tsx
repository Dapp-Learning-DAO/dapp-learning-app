"use client";
import { forwardRef, useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi, isAddress } from "viem";
import { useDebounce } from "react-use";
import useRedpacketContract from "hooks/useRedpacketContract";

const ApproveBtn = forwardRef(
  (
    {
      tokenAddr,
      exceptedAllowance,
      onApprovalChange,
      onError,
    }: {
      tokenAddr: `0x${string}` | undefined;
      exceptedAllowance: bigint;
      onApprovalChange?: (_v: boolean) => void;
      onError?: (_error: any) => void;
    },
    ref: any,
  ) => {
    const { address, chain } = useAccount();
    const [isApproved, setIsApproved] = useState(false);
    const [queriedTokenAddr, setQueriedTokenAddr] = useState("");
    const [approveIsLoading, setApproveIsLoading] = useState(false);
    const [approveDisabled, setApproveDisabled] = useState(true);

    const redPacketContract = useRedpacketContract();

    const {
      data: allowanceRes,
      refetch: queryAllowance,
      isLoading: isAllowanceLoading,
    } = useReadContract({
      chainId: chain?.id,
      address: tokenAddr,
      abi: erc20Abi,
      functionName: "allowance",
      args: [
        address as `0x${string}`,
        redPacketContract?.address as `0x${string}`,
      ],
      query: {
        enabled: false,
      },
    });

    useDebounce(
      async () => {
        if (tokenAddr && isAddress(tokenAddr)) {
          if (address && redPacketContract && !!redPacketContract?.address) {
            await queryAllowance();
            setQueriedTokenAddr(tokenAddr);
          }
        }
      },
      500,
      [tokenAddr, address, redPacketContract],
    );

    useEffect(() => {
      if (
        tokenAddr &&
        isAddress(tokenAddr) &&
        tokenAddr == queriedTokenAddr &&
        !isAllowanceLoading &&
        typeof allowanceRes !== "undefined"
      ) {
        try {
          if (exceptedAllowance > 0n && exceptedAllowance <= allowanceRes) {
            setIsApproved(true);
            if (onApprovalChange) onApprovalChange(true);
            return;
          }
          // console.log("allowanceRes", allowanceRes);
        } catch (error) {
          console.error("setIsApproved error: ", error);
        }
      }
      setIsApproved(false);
      if (onApprovalChange) onApprovalChange(false);
    }, [
      allowanceRes,
      queriedTokenAddr,
      isAllowanceLoading,
      exceptedAllowance,
      onApprovalChange,
      tokenAddr,
    ]);

    const {
      data: approveWriteSimRes,
      isLoading: simWriteLoading,
      // isError: simIsError,
      // error: simErrorMsg,
    } = useSimulateContract({
      chainId: chain?.id,
      address: tokenAddr,
      abi: erc20Abi,
      functionName: "approve",
      args: [redPacketContract?.address as `0x${string}`, exceptedAllowance],
      query: {
        enabled:
          !!tokenAddr &&
          typeof allowanceRes !== "undefined" &&
          !isApproved &&
          !!redPacketContract &&
          !!redPacketContract?.address &&
          exceptedAllowance > 0n,
      },
    });

    const {
      data: approveTx,
      writeContractAsync: writeApproveToken,
      isPending: writeIsLoading,
      // isError: writeIsError,
      // error: writeError,
      reset: writeReset,
    } = useWriteContract();

    const {
      // data: waitTxRes,
      isError: waitTxIsError,
      isLoading: waitTxIsLoading,
      isSuccess: waitIsSuccess,
    } = useWaitForTransactionReceipt({
      hash: approveTx as `0x${string}`,
    });

    const reset = useCallback(() => {
      writeReset();
    }, [writeReset]);

    useEffect(() => {
      if (waitIsSuccess) {
        queryAllowance();
        reset();
      }
      if (waitTxIsError) {
        reset();
      }
    }, [waitIsSuccess, waitTxIsError, queryAllowance, reset]);

    const handleClick = useCallback(async () => {
      if (
        approveWriteSimRes &&
        approveWriteSimRes?.request &&
        writeApproveToken
      ) {
        try {
          await writeApproveToken(approveWriteSimRes!.request);
          // setApproveTx(hash);
          // console.warn("writeApproveToken tx", hash);
        } catch (error) {
          console.error("writeApproveToken error:", error);
          if (onError) onError(error);
        }
      }
    }, [approveWriteSimRes, writeApproveToken, onError]);

    useEffect(() => {
      if (ref && ref.current) {
        (ref?.current as any).refresh = () => {
          setIsApproved(false);
          if (onApprovalChange) onApprovalChange(false);
          reset();
          queryAllowance();
        };
      }
    }, [ref, onApprovalChange, reset, queryAllowance]);

    useEffect(() => {
      setApproveIsLoading(simWriteLoading || writeIsLoading || waitTxIsLoading);
    }, [simWriteLoading, writeIsLoading, waitTxIsLoading]);

    useEffect(() => {
      setApproveDisabled(
        isAllowanceLoading ||
          approveIsLoading ||
          !approveWriteSimRes ||
          !approveWriteSimRes?.request ||
          !writeApproveToken ||
          exceptedAllowance <= 0n,
      );
    }, [
      isAllowanceLoading,
      approveIsLoading,
      approveWriteSimRes,
      writeApproveToken,
      exceptedAllowance,
    ]);

    return (
      <div className="w-full mb-4" ref={ref}>
        {isApproved ? (
          <button className="btn btn-block md:flex-1" disabled>
            Already Approved
          </button>
        ) : (
          <button
            className="btn btn-primary btn-block md:flex-1"
            disabled={approveDisabled}
            onClick={handleClick}
          >
            {approveIsLoading && (
              <div className="loading loading-spinner loading-md inline-block mr-2"></div>
            )}
            {approveIsLoading ? "Loading" : "Approve"}
          </button>
        )}
      </div>
    );
  },
);

ApproveBtn.displayName = "ApproveBtn";

export default ApproveBtn;
