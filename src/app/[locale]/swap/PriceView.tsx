"use client";
import useSWR from "swr";
import qs from "qs";
import { ChangeEvent, useState } from "react";
import { Address, formatUnits, parseUnits } from "viem";
import { ZeroXPriceRequestParams, ZeroXPriceResponse } from "api/zerox/types";
import { ITokenConf } from "types/tokenTypes";
import { useAccount } from "wagmi";
import SwapForm, { ISwapInputFormData } from "./SwapForm";

// @todo
const AFFILIATE_FEE = 0.0; // Percentage of the buyAmount that should be attributed to feeRecipient as affiliate fees
// const FEE_RECIPIENT = ""; // The ETH address that should receive affiliate fees

export const fetcher = ([endpoint, params]: [
  string,
  ZeroXPriceRequestParams,
]) => {
  if (!endpoint) return;
  let { sellToken, sellAmount, buyToken, buyAmount } = params;
  if (!sellToken || !buyToken) return;
  if (!sellAmount && !buyAmount) return;
  if (sellAmount == "0" || buyAmount == "0") return;

  const query = qs.stringify(params);

  return fetch(`${endpoint}?${query}`).then((res) => res.json());
};

export default function PriceView({
  price,
  setPrice,
  setFinalize,
}: {
  price: ZeroXPriceResponse | undefined;
  setPrice: (_price: ZeroXPriceResponse) => void;
  setFinalize: (_finalize: boolean) => void;
}) {
  const { address } = useAccount();
  const [formData, setFormData] = useState<ISwapInputFormData>({
    sellAmount: 0n,
    buyAmount: 0n,
    tradeDirection: "sell",
    sellToken: null,
    buyToken: null,
  });
  const { sellAmount, buyAmount, tradeDirection, sellToken, buyToken } =
    formData;

  // fetch price here

  const sellTokenDecimals = sellToken && sellToken.decimals;
  const buyTokenDecimals = buyToken && buyToken.decimals;

  const { isLoading: isLoadingPrice } = useSWR(
    [
      "/api/zerox/price",
      {
        sellToken: sellToken ? sellToken.address : "",
        buyToken: buyToken ? buyToken.address : "",
        sellAmount: sellAmount.toString(),
        buyAmount: buyAmount.toString(),
        takerAddress: address,
        // feeRecipient: FEE_RECIPIENT,
        buyTokenPercentageFee: AFFILIATE_FEE,
      },
    ],
    fetcher,
    {
      onSuccess: (data) => {
        setPrice(data);
        console.log(`0x /api/price`, data);
        // @todo
        if (tradeDirection === "sell") {
          if (buyTokenDecimals) {
            // setBuyAmount(formatUnits(data.buyAmount, buyTokenDecimals));
          }
        } else {
          if (sellTokenDecimals) {
            // setSellAmount(formatUnits(data.sellAmount, sellTokenDecimals));
          }
        }
      },
    },
  );

  return (
    <div className="m-auto max-w-md">
      <div className="text-xl py-4 text-center">Swap</div>
      <SwapForm onChange={setFormData} />
    </div>
  );
}
