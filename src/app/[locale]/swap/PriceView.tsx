"use client";
import useSWR from "swr";
import qs from "qs";
import { ChangeEvent, useMemo, useState } from "react";
import { ZeroXPriceRequestParams, ZeroXPriceResponse } from "api/zerox/types";
import { useAccount, useChainId } from "wagmi";
import { useSwapContext, useSwapStateContext } from "context/swap/SwapContext";
import { useDebounce } from "react-use";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import useTokenUSDPrice from "hooks/useTokenUSDPrice";
import { formatUnits, parseUnits } from "viem";
import GasIcon from "./icon/gas-icon.webp";
import Image from "next/image";

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
    },
  } = useSwapContext();

  const [extend, setExtend] = useState(false);

  const { prices: usdPrices } = useTokenUSDPrice({
    tokenNames: ["ethereum"],
  });

  const estimatedGasUsd = useMemo(() => {
    if (
      usdPrices &&
      usdPrices.ethereum.usd &&
      priceInfo &&
      priceInfo.estimatedGas &&
      priceInfo.gasPrice
    ) {
      const gas = formatUnits(
        BigInt(priceInfo.estimatedGas) * BigInt(priceInfo.gasPrice),
        18,
      );
      const gasUsd = usdPrices.ethereum.usd * Number(gas);
      return gasUsd;
    }
    return 0;
  }, [priceInfo, usdPrices]);

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
      onSuccess: (data) => {
        setPriceInfo(data);
        console.log(`0x /api/price`, data);
        // @todo
      },
    },
  );

  useDebounce(
    () => {
      if (priceInfo) {
        const {
          price,
          buyAmount,
          estimatedGas,
          expectedSlippage,
          estimatedPriceImpact,
        } = priceInfo;
      }
    },
    500,
    [priceInfo],
  );

  return (
    <>
      <div className="bg-base-200 rounded-xl p-4 mb-8">
        <div
          className="flex justify-between cursor-pointer"
          onClick={() => setExtend((prev) => !prev)}
        >
          <div></div>
          <div className="flex">
            <div className="flex items-center mr-2">
              <div className="w-4 mr-2">
                <Image src={GasIcon} width={32} height={32} alt="gas icon" />
              </div>
              <span className="text-sm">
                {estimatedGasUsd > 0
                  ? estimatedGasUsd >= 0.01
                    ? `$${estimatedGasUsd.toFixed(2)}`
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
      {inputError ? (
        <button className="btn btn-disabled btn-block" disabled>
          {inputError}
        </button>
      ) : (
        <button className="btn btn-primary btn-block">Swap</button>
      )}
    </>
  );
}
