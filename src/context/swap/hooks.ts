import { ITokenConf } from "types/tokenTypes";
import { Field } from "./constants";
import { ReactNode, useEffect, useMemo } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { SwapState, useSwapStateContext } from "./SwapContext";
import useTokenBalanceOf from "hooks/useTokenBalanceOf";
import { formatUnits, parseUnits } from "viem";
import { Token } from "config/tokens";
import useTokenUSDPrice from "hooks/useTokenUSDPrice";

export enum TradeState {
  LOADING = "loading", // quering price
  PRICED = "priced", // get price result
  QUOTED = "quoted", // get quote result
  PENDING = "pending", // pending swap
  COMPLETE = "complete", // complete swap
  INVALID = "invalid",
  STALE = "stale",
  VALID = "valid",
}

export type SwapInfo = {
  isExactIn: boolean;
  currencies: { [field in Field]?: Token };
  currencyBalances: { [field in Field]?: bigint };
  outputFeeFiatValue?: number;
  parsedAmount?: bigint;
  inputError?: ReactNode;
  trade: {
    state: TradeState;
    estimateETH?: number;
    estimateUSD?: number;
    error?: any;
    swapQuoteLatency?: number;
  };
  // allowedSlippage: number;
  // autoSlippage: number;
};

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo({
  independentField,
  typedValue,
}: SwapState): SwapInfo {
  const { address, isConnected } = useAccount();

  const {
    priceInfo,
    setPriceInfo,
    finalize,
    setFinalize,
    txHash,
    setTxHash,
    currencyState: { inputCurrency, outputCurrency },
  } = useSwapStateContext();

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
      typeof currencyBalances[Field.INPUT] === "bigint" &&
      currencyBalances[Field.INPUT] < parsedAmount
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

  const { prices: usdPrices } = useTokenUSDPrice({
    tokenNames: ["ethereum"],
  });

  const {
    data: txRes,
    isError: txIsError,
    isLoading: txIsLoading,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 5,
  });

  const trade = useMemo(() => {
    let _trade = {
      state: TradeState.LOADING,
      estimateETH: 0,
      estimateUSD: 0,
      error: undefined,
      swapQuoteLatency: 0,
    };
    if (priceInfo) {
      _trade.state = TradeState.PRICED;
      if (finalize) {
        _trade.state = TradeState.QUOTED;
      }
    } else {
      _trade.state = TradeState.LOADING;
    }

    if (txHash) {
      _trade.state = TradeState.PENDING;
      if (txRes) {
        _trade.state = TradeState.COMPLETE;
      }
    }

    if (priceInfo && priceInfo.estimatedGas && priceInfo.gasPrice) {
      _trade.estimateETH = Number(
        formatUnits(
          BigInt(priceInfo.estimatedGas) * BigInt(priceInfo.gasPrice),
          18,
        ),
      );
    }

    if (usdPrices && usdPrices.ethereum.usd) {
      _trade.estimateUSD = usdPrices.ethereum.usd * Number(_trade.estimateETH);
    }

    return _trade;
  }, [priceInfo, usdPrices, finalize, txHash, txRes]);

  return useMemo(
    () => ({
      isExactIn,
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      trade,
    }),
    [isExactIn, currencies, currencyBalances, inputError, parsedAmount, trade],
  );
}
