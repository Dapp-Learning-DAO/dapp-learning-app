import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useSwapContext, useSwapStateContext } from "context/swap/SwapContext";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  usePrepareTransactionRequest,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import GasIcon from "./icon/gas-icon.webp";
import { TradeState } from "context/swap/hooks";

export default function QuoteView() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { priceInfo, setPriceInfo, finalize, setFinalize } =
    useSwapStateContext();
  const {
    derivedSwapInfo: {
      isExactIn,
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      trade,
    },
  } = useSwapContext();

  const txParams = useMemo(
    () => ({
      to: (finalize ? finalize?.to : undefined) as `0x${string}` | undefined,
      data: finalize?.data,
      value: finalize ? BigInt(finalize?.value) : 0n,
    }),
    [finalize],
  );

  const {
    data: txRequestData,
    isLoading: txRequestLoading,
    error: txRequestError,
  } = usePrepareTransactionRequest(txParams);
  const {
    data: txHash,
    isPending,
    sendTransactionAsync,
  } = useSendTransaction();

  const handleConfirmSwap = async () => {
    if (!txRequestData || txRequestError) return;
    await sendTransactionAsync(txParams as never);
  };

  const [extend, setExtend] = useState(false);
  const estimatedPrice = useMemo(() => {
    if (finalize && finalize?.price && currencies.INPUT && currencies.OUTPUT) {
      return `1 ${currencies.INPUT.symbol} = ${finalize.price} ${currencies.OUTPUT.symbol}`;
    }
    return ``;
  }, [finalize, currencies]);

  const btnLoading =
    txRequestLoading || isPending || trade.state == TradeState.PENDING;

  return (
    <div>
      <div className="bg-base-200 rounded-xl p-4 mb-8">
        <div
          className="flex justify-between cursor-pointer"
          onClick={() => setExtend((prev) => !prev)}
        >
          <div className="text-sm text-slate-500">{estimatedPrice}</div>
          <div className="flex">
            <div className="flex items-center mr-2">
              <div className="w-4 mr-2">
                <Image src={GasIcon} width={32} height={32} alt="gas icon" />
              </div>
              <span className="text-sm">
                {trade.estimateUSD && trade.estimateUSD > 0
                  ? trade.estimateUSD >= 0.01
                    ? `$${trade.estimateUSD.toFixed(2)}`
                    : "< $0.01"
                  : "--"}
              </span>
            </div>
            <ChevronDownIcon
              className={`w-4 transition-all ${extend ? "rotate-180" : ""}`}
            />
          </div>
        </div>
        {extend ? <div></div> : <></>}
      </div>
      {txRequestError ? (
        <button className="btn btn-primary btn-block mt-8" disabled>
          {txRequestError.message}
        </button>
      ) : (
        <button
          className="btn btn-primary btn-block mt-8"
          onClick={handleConfirmSwap || isPending}
          disabled={btnLoading}
        >
          {btnLoading ? "Loading..." : "Confirm Swap"}
        </button>
      )}
    </div>
  );
}
