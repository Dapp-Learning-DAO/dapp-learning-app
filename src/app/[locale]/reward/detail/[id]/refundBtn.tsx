"use client";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import {
  useAccount,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  formatUnits,
  isAddress,
  keccak256,
  parseEventLogs,
  toBytes,
} from "viem";
import useRedpacketContract from "hooks/useRedpacketContract";
import useSwitchNetwork from "hooks/useSwitchNetwork";
import AlertBox, { showAlertMsg } from "components/AlertBox";
import RedpacketZkTag from "app/reward/rewardComponents/RedpacketIcons/RedpacketZkTag";
import RedPacketInfo from "app/reward/rewardComponents/RedpacketInfo";
import { IRewardItem } from "types/rewardTypes";
import { useRouter } from "next/navigation";
import { XCircleIcon } from "@heroicons/react/24/outline";

const RefundBtn = ({
  item,
  onSuccess,
  setCloseDisabled,
  isModal,
}: {
  item: IRewardItem;
  onSuccess: () => void;
  setCloseDisabled: (_disabled: boolean) => void;
  isModal?: boolean | undefined;
}) => {
  const { address, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const alertBoxRef = useRef(null);
  const router = useRouter();

  const { isNetworkCorrect, switchNetwork } = useSwitchNetwork();
  const redPacketContract = useRedpacketContract();

  const {
    data: refundWriteSimRes,
    isLoading: simWriteLoading,
    isError: simIsError,
    error: simErrorMsg,
    refetch: simRefetch,
  } = useSimulateContract({
    chainId: chain?.id,
    address: redPacketContract?.address as `0x${string}`,
    abi: redPacketContract?.abi,
    functionName: "refund",
    args: [item ? item?.id : null],
    query: {
      enabled:
        isNetworkCorrect() &&
        !!item &&
        !!item?.id &&
        !!(item?.creator.toLowerCase() == address?.toLowerCase()) &&
        !!item?.isExpired &&
        !item?.allClaimed &&
        !item?.isRefunded &&
        !!redPacketContract &&
        isAddress(redPacketContract?.address as string),
    },
  });

  const {
    data: refundTx,
    writeContractAsync: writeRefundRepacket,
    isPending: writeIsLoading,
    isError: writeIsError,
    error: writeError,
    reset: writeReset,
  } = useWriteContract();

  const reset = useCallback(() => {
    simRefetch();
    writeReset();
    // if (unWatchEvent) unWatchEvent();
    if (alertBoxRef.current) {
      (alertBoxRef.current as any).reset();
    }
  }, [simRefetch, writeReset]);

  useEffect(() => {
    if (simErrorMsg) {
      // showAlertMsg(alertBoxRef, JSON.stringify(simErrorMsg), "error");
      console.error(simErrorMsg?.message);
    }
    if (writeError) {
      console.error(writeError);
      reset();
    }
  }, [simErrorMsg, writeError, reset]);

  const {
    data: txRes,
    isError: txIsError,
    isLoading: txIsLoading,
  } = useWaitForTransactionReceipt({
    hash: refundTx,
  });

  useEffect(() => {
    if (txRes) {
      console.log("onRefundSuccess", txRes);
      let refund_value_parsed = "";
      if (redPacketContract && txRes.logs) {
        const parsedLog = parseEventLogs({
          abi: redPacketContract.abi,
          eventName: ["RefundSuccess"],
          logs: txRes.logs,
        });
        if (parsedLog[0]) {
          refund_value_parsed = formatUnits(
            (parsedLog[0].args as any).remaining_balance,
            item?.decimals,
          );
          console.log("RefundSuccess decodedLog", parsedLog[0]);
        }
      }
      showAlertMsg(
        alertBoxRef,
        refund_value_parsed
          ? `Refunded ${refund_value_parsed} ${item?.symbol}!`
          : `Refund Successfully!`,
        "success",
        0,
      );
      if (item) {
        item.isRefunded = true;
      }
      onSuccess();
    }
  }, [txRes, txIsError, redPacketContract]); // eslint-disable-line

  const handleRefund = useCallback(async () => {
    try {
      if (
        !refundWriteSimRes ||
        !refundWriteSimRes?.request ||
        !writeRefundRepacket ||
        !switchChainAsync
      ) {
        return;
      }

      if (!isNetworkCorrect()) {
        if (!(await switchNetwork())) {
          return;
        }
      }

      try {
        await writeRefundRepacket?.(refundWriteSimRes!.request);
        // console.warn("Refund Tx:", hash);
        // setRefundTx(hash);
      } catch (error) {
        showAlertMsg(alertBoxRef, "refund failed", "error");
        console.error("refund failed error:", JSON.stringify(error));
        writeReset();
      }
    } catch (error) {
      showAlertMsg(alertBoxRef, JSON.stringify(error), "error");
      console.error("refund failed error:", JSON.stringify(error));
      writeReset();
      throw error;
    }
  }, [
    isNetworkCorrect,
    refundWriteSimRes,
    switchChainAsync,
    switchNetwork,
    writeRefundRepacket,
    writeReset,
  ]);

  useEffect(() => {
    if (txRes && !item) {
      reset();
    }
  }, [item, txRes, reset]);

  useEffect(() => {
    const dialog = document.querySelector("#redpacket_refund_modal");
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape") {
        event.preventDefault(); // 阻止ESC键默认行为
      }
    };

    if (dialog) {
      dialog.addEventListener("keydown", handleKeyDown);

      // Cleanup
      return () => {
        dialog.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  useEffect(() => {
    setCloseDisabled(writeIsLoading || txIsLoading);
  }, [writeIsLoading, txIsLoading, setCloseDisabled]);

  const loading = simWriteLoading || writeIsLoading || !!txIsLoading;
  const disabled =
    !isNetworkCorrect() ||
    !refundWriteSimRes ||
    !refundWriteSimRes?.request ||
    !writeRefundRepacket ||
    simIsError ||
    writeIsError ||
    !!refundTx;

  return (
    <>
      <AlertBox ref={alertBoxRef} />
      <div className={`mt-4 w-full`}>
        {item?.isExpired && !item?.isRefunded && (
          <button
            className="btn btn-primary w-full"
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              handleRefund();
            }}
            disabled={loading || disabled}
          >
            {loading && (
              <div className="loading loading-spinner loading-md inline-block mr-2"></div>
            )}
            {loading ? "Loading" : "Refund"}
          </button>
        )}
      </div>
    </>
  );
};

export default RefundBtn;
