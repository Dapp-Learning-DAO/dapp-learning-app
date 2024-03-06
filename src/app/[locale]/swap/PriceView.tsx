"use client";
import useSWR from "swr";
import qs from "qs";
import { ChangeEvent, useMemo, useState } from "react";
import { ZeroXPriceRequestParams, ZeroXPriceResponse } from "api/zerox/types";
import { useAccount, useChainId } from "wagmi";
import { useSwapContext, useSwapStateContext } from "context/swap/SwapContext";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import GasIcon from "./icon/gas-icon.webp";
import Image from "next/image";
import ApproveBtn from "components/ApproveBtn";
import { ETH_TOKEN_ADDRESS } from "config/constants";

// @todo
const AFFILIATE_FEE = 0.0; // Percentage of the buyAmount that should be attributed to feeRecipient as affiliate fees
// const FEE_RECIPIENT = ""; // The ETH address that should receive affiliate fees

export const fetcher = ([endpoint, params]: [
  string,
  ZeroXPriceRequestParams,
]) => {
  if (!endpoint) return;
  let { chainId, takerAddress, sellToken, sellAmount, buyToken, buyAmount } =
    params;
  if (!chainId || !takerAddress || !sellToken || !buyToken) return;
  if (!sellAmount && !buyAmount) return;
  if (sellAmount == "0" || buyAmount == "0") return;

  const query = qs.stringify(params);

  return fetch(`${endpoint}?${query}`).then((res) => res.json());
};

export default function PriceView() {
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

  const [extend, setExtend] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [qouting, setQouting] = useState(false);

  const allowanceTarget = useMemo(
    () => priceInfo?.allowanceTarget as `0x${string}` | undefined,
    [priceInfo],
  );

  const estimatedPrice = useMemo(() => {
    if (priceInfo?.price && currencies.INPUT && currencies.OUTPUT) {
      return `1 ${currencies.INPUT.symbol} = ${priceInfo.price} ${currencies.OUTPUT.symbol}`;
    }
    return ``;
  }, [priceInfo, currencies]);

  // fetch price here
  const { isLoading: isLoadingPrice } = useSWR(
    [
      "/api/zerox/price",
      {
        chainId,
        sellToken: currencies.INPUT ? currencies.INPUT.address : "",
        buyToken: currencies.OUTPUT ? currencies.OUTPUT.address : "",
        sellAmount: isExactIn && parsedAmount ? parsedAmount.toString() : "",
        buyAmount: !isExactIn && parsedAmount ? parsedAmount.toString() : "",
        takerAddress: address,
        // feeRecipient: FEE_RECIPIENT,
        buyTokenPercentageFee: AFFILIATE_FEE,
      },
    ],
    fetcher,
    {
      // revalidateIfStale: false,
      // revalidateOnFocus: false,
      // revalidateOnReconnect: false,
      onSuccess: (data) => {
        if (data) setPriceInfo(data);
        console.log(`0x /api/price`, data);
      },
    },
  );

  const handleQuote = async () => {
    if (!priceInfo || qouting) return;
    setQouting(true);
    const query = qs.stringify({
      chainId,
      sellToken: priceInfo?.sellTokenAddress,
      buyToken: priceInfo?.buyTokenAddress,
      sellAmount: priceInfo?.sellAmount,
      takerAddress: address,
      // feeRecipient: FEE_RECIPIENT,
      buyTokenPercentageFee: AFFILIATE_FEE,
    });
    const data = await fetch(`/api/zerox/quote?${query}`)
      .then((res) => res.json())
      .catch((err) => {
        console.error(`handleQuote error: `, err);
        setQouting(false);
        return;
      });

    console.log(`handleQuote data`, data);
    if (data) {
      setFinalize(data);
    }

    setQouting(false);
  };

  const isETHin = useMemo(
    () => currencies.INPUT?.address === ETH_TOKEN_ADDRESS,
    [currencies.INPUT],
  );

  const isLoading = isLoadingPrice || qouting;

  return (
    <>
      <div className="bg-base-200 rounded-xl p-4 mb-8">
        <div
          className="flex justify-between cursor-pointer"
          onClick={() => setExtend((prev) => !prev)}
        >
          {isLoadingPrice ? (
            <div className="skeleton h-2 w-30"></div>
          ) : (
            <div className="text-sm text-slate-500">{estimatedPrice}</div>
          )}
          <div className="flex">
            <div className="flex items-center mr-2">
              {isLoadingPrice ? (
                <span className="skeleton h-2 w-20"></span>
              ) : (
                <>
                  <div className="w-4 mr-2">
                    <Image
                      src={GasIcon}
                      width={32}
                      height={32}
                      alt="gas icon"
                    />
                  </div>
                  <span className="text-sm">
                    {trade.estimateUSD && trade.estimateUSD > 0
                      ? trade.estimateUSD >= 0.01
                        ? `$${trade.estimateUSD.toFixed(2)}`
                        : "< $0.01"
                      : "--"}
                  </span>
                </>
              )}
            </div>
            <ChevronDownIcon
              className={`w-4 transition-all ${extend ? "rotate-180" : ""}`}
            />
          </div>
        </div>
        {extend ? <div></div> : <></>}
      </div>
      {inputError ? (
        <button className="btn btn-disabled btn-block" disabled>
          {inputError}
        </button>
      ) : (
        <>
          {!isETHin && (
            <ApproveBtn
              tokenAddr={currencies.INPUT && currencies.INPUT.address}
              targetAddr={allowanceTarget}
              exceptedAllowance={priceInfo ? BigInt(priceInfo?.sellAmount) : 0n}
              onApprovalChange={setIsApproved}
            />
          )}
          <button
            className="btn btn-primary btn-block"
            disabled={(!isETHin && !isApproved) || isLoading}
            onClick={handleQuote}
          >
            {isLoading && (
              <div className="loading loading-spinner loading-md inline-block mr-2"></div>
            )}
            {isLoading ? "Loading..." : "Swap"}
          </button>
        </>
      )}
    </>
  );
}
