"use client";
import { forwardRef, useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi, isAddress } from "viem";
import { useDebounce } from "react-use";
import useRedpacketContract from "hooks/useRedpacketContract";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
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
      chainId: chainId,
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
          } else if (exceptedAllowance == 0n && allowanceRes > 0n) {
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
      chainId: chainId,
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
        {isConnected ? (
          isApproved ? (
            <button className="btn btn-block" disabled>
              Already Approved
            </button>
          ) : (
            <button
              className="btn btn-primary btn-block"
              disabled={approveDisabled}
              onClick={handleClick}
            >
              {approveIsLoading && (
                <div className="loading loading-spinner loading-md inline-block mr-2"></div>
              )}
              {approveIsLoading ? "Loading" : "Approve"}
            </button>
          )
        ) : (
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              // Note: If your app doesn't use authentication, you
              // can remove all 'authenticationStatus' checks
              const ready = mounted && authenticationStatus !== "loading";
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === "authenticated");

              if (!connected) {
                return (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              } else {
                return null;
              }
            }}
          </ConnectButton.Custom>
        )}
      </div>
    );
  },
);

ApproveBtn.displayName = "ApproveBtn";

export default ApproveBtn;
