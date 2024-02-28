"use client";

import { useState } from "react";
import PriceView from "./PriceView";
import { ZeroXPriceResponse } from "api/zerox/types";

export default function SwapPage() {
  const [tradeDirection, setTradeDirection] = useState("sell");
  const [finalize, setFinalize] = useState(false);
  const [price, setPrice] = useState<ZeroXPriceResponse | undefined>();
  const [quote, setQuote] = useState();

  return (
    <div>
      <PriceView price={price} setPrice={setPrice} setFinalize={setFinalize} />
    </div>
  );
}
