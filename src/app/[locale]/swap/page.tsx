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
import SwapForm from "./SwapForm";

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
            <div className="m-auto max-w-md">
              <div className="text-xl py-4 text-center">Swap</div>
              <div className="mb-1">
                <SwapForm />
              </div>
              {finalize == 0n ? <PriceView /> : <QuoteView />}
            </div>
          </SwapContextProvider>
        )}
      </SwapStateContext.Consumer>
    </SwapStateContextProvider>
  );
}
