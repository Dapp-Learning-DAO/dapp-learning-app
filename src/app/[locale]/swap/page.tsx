"use client";

import { useState } from "react";
import PriceView from "./PriceView";
import {
  SwapContextProvider,
  SwapStateContext,
  SwapStateContextProvider,
} from "context/swap/SwapContext";
import { TokenConf } from "config/tokens";
import { useParams } from "next/navigation";
import QuoteView from "./QuoteView";

export default function SwapPage() {
  const { chainId } = useParams<{ chainId: string }>();

  const initialInputCurrency = chainId
    ? TokenConf[Number(chainId)]["ETH"]
    : undefined;
  const initialOutputCurrency = undefined;

  return (
    <SwapStateContextProvider
      chainId={Number(chainId)}
      initialInputCurrency={initialInputCurrency}
      initialOutputCurrency={initialOutputCurrency}
    >
      <SwapStateContext.Consumer>
        {({ finalize }) => (
          <SwapContextProvider>
            {finalize == 0n ? <PriceView /> : <QuoteView />}
          </SwapContextProvider>
        )}
      </SwapStateContext.Consumer>
    </SwapStateContextProvider>
  );
}
