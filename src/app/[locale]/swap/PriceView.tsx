"use client";
import useSWR from "swr";
import qs from "qs";
import { ChangeEvent, useState } from "react";
import { Address, formatUnits, parseUnits } from "viem";
import { ZeroXPriceRequestParams, ZeroXPriceResponse } from "api/zerox/types";
import { ITokenConf } from "types/tokenTypes";
import { useAccount, useChainId } from "wagmi";
import SwapForm, { ISwapInputFormData } from "./SwapForm";
import { useSwapContext, useSwapStateContext } from "context/swap/SwapContext";

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
  const { price, setPrice, finalize, setFinalize } = useSwapStateContext();
  const {
    derivedSwapInfo: { isExactIn, currencies, parsedAmount, inputError },
  } = useSwapContext();

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
        setPrice(data);
        console.log(`0x /api/price`, data);
        // @todo
      },
    },
  );

  return (
    <>
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
