import { ITokenConf } from "types/tokenTypes";
import { Field } from "./constants";
import { ReactNode, useMemo } from "react";
import { useAccount } from "wagmi";
import { SwapState, useSwapStateContext } from "./SwapContext";
import useTokenBalanceOf from "hooks/useTokenBalanceOf";
import { formatUnits, parseUnits } from "viem";
import { Token } from "config/tokens";

export enum TradeState {
  LOADING = "loading",
  INVALID = "invalid",
  STALE = "stale",
  NO_ROUTE_FOUND = "no_route_found",
  VALID = "valid",
}

export type SwapInfo = {
  currencies: { [field in Field]?: ITokenConf };
  currencyBalances: { [field in Field]?: bigint };
  outputFeeFiatValue?: number;
  parsedAmount?: bigint;
  inputError?: ReactNode;
  // trade: {
  //   // trade?: InterfaceTrade;
  //   state: TradeState;
  //   estimateETH?: number;
  //   estimateUSD?: number;
  //   error?: any;
  //   swapQuoteLatency?: number;
  // };
  // allowedSlippage: number;
  // autoSlippage: number;
};

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(state: SwapState): SwapInfo {
  const { address, isConnected } = useAccount();

  const {
    currencyState: { inputCurrency, outputCurrency },
  } = useSwapStateContext();
  const { independentField, typedValue } = state;

  const { balanceOf: inputCurrencyBalance } = useTokenBalanceOf({
    tokenAddr: inputCurrency ? inputCurrency.address : undefined,
  });
  const { balanceOf: outputCurrencyBalance } = useTokenBalanceOf({
    tokenAddr: outputCurrency ? outputCurrency.address : undefined,
  });
  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: inputCurrencyBalance,
      [Field.OUTPUT]: outputCurrencyBalance,
    }),
    [inputCurrencyBalance, outputCurrencyBalance],
  );

  const isExactIn: boolean = independentField === Field.INPUT;
  const parsedAmount = useMemo(() => {
    if (typedValue) {
      if (isExactIn && inputCurrency) {
        return parseUnits(typedValue, inputCurrency.decimals);
      } else if (!isExactIn && outputCurrency) {
        return parseUnits(typedValue, outputCurrency.decimals);
      }
    }
    return 0n;
  }, [inputCurrency, isExactIn, outputCurrency, typedValue]);

  const currencies: { [field in Field]?: Token } = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency,
      [Field.OUTPUT]: outputCurrency,
    }),
    [inputCurrency, outputCurrency],
  );

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined;

    if (!address) {
      inputError = isConnected ? "Connect wallet" : "Connecting wallet...";
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? "Select a token";
    }

    if (!parsedAmount) {
      inputError = inputError ?? "Enter an amount";
    }

    // compare input balance to max input based on version

    if (
      currencyBalances[Field.INPUT] &&
      inputCurrencyBalance &&
      currencyBalances[Field.INPUT] > inputCurrencyBalance
    ) {
      inputError = `Insufficient ${inputCurrency ? inputCurrency.symbol : ""} balance`;
    }

    return inputError;
  }, [
    address,
    currencies,
    parsedAmount,
    currencyBalances,
    inputCurrency,
    isConnected,
  ]);

  return useMemo(
    () => ({
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
    }),
    [currencies, currencyBalances, inputError, parsedAmount],
  );
}
