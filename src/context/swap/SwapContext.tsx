import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Field } from "./constants";
import { SwapInfo, TradeState, useDerivedSwapInfo } from "./hooks";
import { Token } from "config/tokens";
import { SupportedChainId } from "config/chains";
import { useChainId } from "wagmi";
import { usePrevious } from "react-use";
import { ZeroXPriceResponse } from "api/zerox/types";

export interface SwapState {
  readonly independentField: Field;
  readonly typedValue: string;
}

type SwapContextType = {
  swapState: SwapState;
  derivedSwapInfo: SwapInfo;
  setSwapState: Dispatch<SetStateAction<SwapState>>;
};

export interface CurrencyState {
  inputCurrency?: Token;
  outputCurrency?: Token;
}

type SwapStateContextType = {
  currencyState: CurrencyState;
  prefilledState: {
    inputCurrency?: Token;
    outputCurrency?: Token;
  };
  setCurrencyState: Dispatch<SetStateAction<CurrencyState>>;
  price: ZeroXPriceResponse | undefined;
  setPrice: Dispatch<SetStateAction<ZeroXPriceResponse | undefined>>;
  finalize: bigint;
  setFinalize: Dispatch<SetStateAction<bigint>>;
  // currentTab: SwapTab
  // setCurrentTab: Dispatch<SetStateAction<SwapTab>>

  // The chainId of the page/context - can be different from the connected Chain ID if the
  // page is displaying content for a different chain
  chainId?: SupportedChainId;
};

export const SwapStateContext = createContext<SwapStateContextType>({
  currencyState: {
    inputCurrency: undefined,
    outputCurrency: undefined,
  },
  setCurrencyState: () => undefined,
  prefilledState: {
    inputCurrency: undefined,
    outputCurrency: undefined,
  },
  chainId: SupportedChainId.OPTIMISM,
  price: undefined,
  setPrice: () => undefined,
  finalize: 0n,
  setFinalize: () => undefined,

  // currentTab: SwapTab.Swap,
  // setCurrentTab: () => undefined,
});

const initialSwapState: SwapState = {
  independentField: Field.INPUT,
  typedValue: "",
};

export const EMPTY_DERIVED_SWAP_INFO: SwapInfo = Object.freeze({
  isExactIn: true,
  currencies: {},
  currencyBalances: {},
  autoSlippage: 0,
  allowedSlippage: 0,
  trade: {
    state: TradeState.LOADING,
  },
});

export const SwapContext = createContext<SwapContextType>({
  swapState: initialSwapState,
  derivedSwapInfo: EMPTY_DERIVED_SWAP_INFO,
  setSwapState: () => undefined,
});

export function useSwapContext() {
  return useContext(SwapContext);
}

export function useSwapStateContext() {
  return useContext(SwapStateContext);
}

export function SwapStateContextProvider({
  children,
  chainId,
  initialInputCurrency,
  initialOutputCurrency,
}: PropsWithChildren<{
  chainId?: SupportedChainId;
  initialInputCurrency?: Token;
  initialOutputCurrency?: Token;
}>) {
  const connectedChainId = useChainId();
  // const [currentTab, setCurrentTab] = useState<SwapTab>(SwapTab.Swap)
  const [price, setPrice] = useState<ZeroXPriceResponse | undefined>();
  const [finalize, setFinalize] = useState<bigint>(0n);
  const [currencyState, setCurrencyState] = useState<CurrencyState>({
    inputCurrency: initialInputCurrency,
    outputCurrency: initialOutputCurrency,
  });

  const prefilledState = useMemo(
    () => ({
      inputCurrency: initialInputCurrency,
      outputCurrency: initialOutputCurrency,
    }),
    [initialInputCurrency, initialOutputCurrency],
  );

  const previousConnectedChainId = usePrevious(connectedChainId);
  const previousPrefilledState = usePrevious(prefilledState);

  useEffect(() => {
    const combinedCurrencyState = { ...currencyState, ...prefilledState };
    const chainChanged =
      previousConnectedChainId && previousConnectedChainId !== connectedChainId;
    const prefilledInputChanged = Boolean(
      previousPrefilledState?.inputCurrency
        ? !prefilledState.inputCurrency?.equals(
            previousPrefilledState.inputCurrency,
          )
        : prefilledState.inputCurrency,
    );
    const prefilledOutputChanged = Boolean(
      previousPrefilledState?.outputCurrency
        ? !prefilledState?.outputCurrency?.equals(
            previousPrefilledState.outputCurrency,
          )
        : prefilledState.outputCurrency,
    );

    if (chainChanged || prefilledInputChanged || prefilledOutputChanged) {
      setCurrencyState({
        inputCurrency: combinedCurrencyState.inputCurrency ?? undefined,
        outputCurrency: combinedCurrencyState.outputCurrency ?? undefined,
      });
    }
  }, [
    connectedChainId,
    currencyState,
    prefilledState,
    previousConnectedChainId,
    previousPrefilledState,
  ]);

  return (
    <SwapStateContext.Provider
      value={{
        currencyState,
        setCurrencyState,
        prefilledState,
        chainId,
        price,
        setPrice,
        finalize,
        setFinalize,
      }}
    >
      {children}
    </SwapStateContext.Provider>
  );
}

export function SwapContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [swapState, setSwapState] = useState<SwapState>({
    ...initialSwapState,
  });
  const derivedSwapInfo = useDerivedSwapInfo(swapState);
  return (
    <SwapContext.Provider value={{ swapState, setSwapState, derivedSwapInfo }}>
      {children}
    </SwapContext.Provider>
  );
}
