"use client";
import TokenSelector from "components/TokenSelector";
import {
  ElementRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { Token } from "config/tokens";
import { useSwapContext, useSwapStateContext } from "context/swap/SwapContext";
import { formatUnits, isAddressEqual } from "viem";
import { Field } from "context/swap/constants";
import { ETH_TOKEN_ADDRESS } from "config/constants";
import useRouteParams from "hooks/useRouteParams";
import { useDebounce } from "react-use";
import { useChainId } from "wagmi";

export interface ISwapForm {
  tokenAmountIn: string | number;
  tokenAmountOut: string | number;
}

export type ISwapInputFormData = {
  sellAmount: bigint;
  buyAmount: bigint;
  tradeDirection: string;
  sellToken: undefined | Token;
  buyToken: undefined | Token;
};

export default function SwapForm() {
  const [sellToken, setSellToken] = useState<Token | undefined>();
  const [buyToken, setBuyToken] = useState<Token | undefined>();
  const { setRouteParams, removeRouteParam } = useRouteParams();
  const chainId = useChainId();

  const inputTokenRef = useRef<ElementRef<"input">>(null);
  const outputTokenRef = useRef<ElementRef<"input">>(null);

  const {
    swapState,
    setSwapState,
    derivedSwapInfo: { currencies, currencyBalances, inputError },
  } = useSwapContext();

  const { currencyState, setCurrencyState, priceInfo } = useSwapStateContext();

  useEffect(() => {
    if (sellToken && buyToken) {
      if (
        currencyState.inputCurrency &&
        isAddressEqual(currencyState.inputCurrency?.address, sellToken.address)
      ) {
        if (isAddressEqual(sellToken.address, buyToken.address)) {
          setSellToken(undefined);
          removeRouteParam("inputCurrency");
        }
      }
      if (
        currencyState.outputCurrency &&
        isAddressEqual(currencyState.outputCurrency?.address, buyToken.address)
      ) {
        if (isAddressEqual(sellToken.address, buyToken.address)) {
          setBuyToken(undefined);
          removeRouteParam("outputCurrency");
        }
      }
    }

    setCurrencyState({
      inputCurrency: sellToken,
      outputCurrency: buyToken,
    });
    let _params: any = {};
    if (sellToken) {
      _params.inputCurrency =
        sellToken.address === ETH_TOKEN_ADDRESS ? "ETH" : sellToken.address;
    }
    if (buyToken) {
      _params.outputCurrency =
        buyToken.address === ETH_TOKEN_ADDRESS ? "ETH" : buyToken.address;
    }
    setRouteParams(_params, false, "");
  }, [sellToken, buyToken, setCurrencyState]);

  useDebounce(
    () => {
      if (priceInfo) {
        const { buyAmount } = priceInfo;
        if (currencies.OUTPUT) {
          const parsedAmount = formatUnits(
            BigInt(buyAmount),
            currencies.OUTPUT?.decimals,
          );
          if (outputTokenRef.current) {
            outputTokenRef.current.value = parsedAmount;
          }
        }
      }
    },
    500,
    [priceInfo, currencies.OUTPUT],
  );

  const reset = useCallback(() => {
    if (inputTokenRef.current) {
      inputTokenRef.current.value = "";
    }
    if (outputTokenRef.current) {
      outputTokenRef.current.value = "";
    }
    setSwapState({
      independentField: Field.INPUT,
      typedValue: "",
    });
  }, [setSwapState]);

  useEffect(() => {
    reset();
  }, [chainId, reset]);

  // const handleSwitchCurrencies = () => {
  //   // @todo
  //   setCurrencyState((prev) => ({
  //     inputCurrency: prev.outputCurrency,
  //     outputCurrency: prev.inputCurrency,
  //   }));
  // };

  const inputMaxBalance = useMemo(
    () =>
      typeof currencyBalances.INPUT !== "undefined" && currencies.INPUT
        ? formatUnits(currencyBalances.INPUT, currencies.INPUT?.decimals)
        : "",
    [currencyBalances, currencies],
  );

  const outputMaxBalance = useMemo(
    () =>
      typeof currencyBalances.OUTPUT !== "undefined" && currencies.OUTPUT
        ? formatUnits(currencyBalances.OUTPUT, currencies.OUTPUT?.decimals)
        : "",
    [currencyBalances, currencies],
  );

  const disabled = false; // @todo

  return (
    <div>
      <div className="relative">
        <div className={`relative w-full bg-slate-100 pb-4 rounded-xl`}>
          <div
            className="flex justify-between"
            style={{ fontSize: 12, height: 46, lineHeight: 2 }}
          >
            <div className="text-slate-500 pt-3 px-4">You pay</div>
            <div>
              {currencies.INPUT &&
              typeof currencyBalances.INPUT !== "undefined" ? (
                <div
                  className={`text-right pr-4 pb-2 cursor-pointer text-slate-500`}
                  style={{ paddingTop: 14 }}
                >
                  Balance:
                  <span className="ml-1">{inputMaxBalance}</span>
                  <button
                    className={`px-1 py-0 bg-[#d6e4fb] text-[#2f8af5] rounded-md ml-2 uppercase`}
                    style={{ lineHeight: 1.5 }}
                    onClick={() => {
                      setSwapState((prevState) => ({
                        independentField: Field.INPUT,
                        typedValue: inputMaxBalance,
                      }));
                      if ((inputTokenRef as any).current)
                        (inputTokenRef as any).current.value = inputMaxBalance;
                    }}
                  >
                    Max
                  </button>
                </div>
              ) : (
                <div
                  className={`skeleton w-[100px] h-3 mt-5 mr-3 ${currencies.INPUT ? "" : "hidden"}`}
                ></div>
              )}
            </div>
          </div>
          <div className="flex items-center px-4">
            <input
              ref={inputTokenRef}
              className="w-full h-full bg-transparent text-3xl"
              style={{
                height: `70px`,
                lineHeight: `70px`,
                outline: "none",
              }}
              type="text"
              disabled={disabled}
              placeholder="0"
              onChange={(e) => {
                const value = e.target.value;
                setSwapState({
                  independentField: Field.INPUT,
                  typedValue: value,
                });
              }}
            />
            <TokenSelector
              small
              autoSelect
              showETH
              curToken={sellToken}
              setCurToken={setSellToken}
              disabled={disabled}
            />
          </div>
        </div>

        {/* <div
          className="p-2 border border-white bg-slate-100 rounded-xl cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ borderWidth: 4 }}
          onClick={handleSwitchCurrencies}
        >
          <ArrowDownIcon className="w-4 hover:rotate-180 transition-all" />
        </div> */}
        <div
          className={`relative w-full bg-slate-100 pb-4 rounded-xl`}
          style={{ marginTop: 4 }}
        >
          <div
            className="flex justify-between"
            style={{ fontSize: 12, height: 46, lineHeight: 2 }}
          >
            <div className="text-slate-500 pt-3 px-4">You recieve</div>
            <div>
              {currencies.OUTPUT &&
              typeof currencyBalances.OUTPUT !== "undefined" ? (
                <div
                  className={`text-right pr-4 pb-2 cursor-pointer text-slate-500`}
                  style={{ paddingTop: 14 }}
                >
                  Balance:
                  <span className="ml-1">{outputMaxBalance}</span>
                  <button
                    className={`px-1 py-0 bg-[#d6e4fb] text-[#2f8af5] rounded-md ml-2 uppercase`}
                    style={{ lineHeight: 1.5 }}
                    onClick={() => {
                      setSwapState((prevState) => ({
                        independentField: Field.OUTPUT,
                        typedValue: outputMaxBalance,
                      }));
                      if ((inputTokenRef as any).current)
                        (inputTokenRef as any).current.value = outputMaxBalance;
                    }}
                  >
                    Max
                  </button>
                </div>
              ) : (
                <div
                  className={`skeleton w-[100px] h-3 my-4 mr-3 ${currencies.OUTPUT ? "" : "hidden"}`}
                ></div>
              )}
            </div>
          </div>
          <div className="flex items-center px-4">
            <input
              ref={outputTokenRef}
              className="w-full h-full bg-transparent text-3xl"
              style={{
                height: `70px`,
                lineHeight: `70px`,
                outline: "none",
              }}
              type="text"
              disabled={disabled}
              placeholder="0"
              onChange={(e) => {
                const value = e.target.value;
                setSwapState({
                  independentField: Field.OUTPUT,
                  typedValue: value,
                });
              }}
            />
            <TokenSelector
              autoSelect={false}
              small
              showETH
              curToken={buyToken}
              setCurToken={setBuyToken}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
