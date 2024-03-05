"use client";
import useSWR from "swr";
import qs from "qs";
import { useState } from "react";
import { TokenUSDPricesResponse } from "api/coingecko/types";

const COINGECKO_API_DOMAIN = `https://api.coingecko.com/api/v3/simple/price`;

export const fetcher = ([endpoint, params]: [
  string,
  { tokens: string[]; vs_currencies: string },
]) => {
  if (!endpoint) return;
  let { tokens, vs_currencies } = params;
  if (!tokens || !vs_currencies || tokens.length === 0) return;

  const query = qs.stringify({
    ids: tokens.join(","),
    vs_currencies,
  });

  return fetch(`${endpoint}?${query}`).then((res) => res.json());
};

export default function useTokenUSDPrice({
  tokenNames,
}: {
  tokenNames: string[];
}) {
  const [prices, setPrices] = useState<TokenUSDPricesResponse | undefined>();

  const { isLoading } = useSWR(
    [
      !prices ? COINGECKO_API_DOMAIN : null,
      {
        tokens: tokenNames,
        vs_currencies: "usd",
      },
    ],
    fetcher,
    {
      onSuccess: (data: TokenUSDPricesResponse) => {
        if (data) {
          setPrices(data);
        }
        console.log(`/api/coingecko/price`, data);
      },
    },
  );

  return {
    prices,
    isLoading,
  };
}
