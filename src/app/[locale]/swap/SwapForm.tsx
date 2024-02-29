"use client";
import TokenSelector from "components/TokenSelector";
import { ElementRef, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDebounce } from "react-use";
import useTokenAmountInput from "hooks/useTokenAmountInput";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { Token } from "config/tokens";
import { useSwapContext, useSwapStateContext } from "context/swap/SwapContext";
import { formatUnits, parseUnits } from "viem";
import { Field } from "context/swap/constants";

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

export interface ISwapFormProps {
  onChange: (_data: ISwapInputFormData) => void;
}

export default function SwapForm({ onChange }: ISwapFormProps) {
  const [sellToken, setSellToken] = useState<Token | undefined>();
  const [buyToken, setBuyToken] = useState<Token | undefined>();
  const [changeCount, setChangeCount] = useState(0);

  const inputTokenRef = useRef<ElementRef<"input">>(null);
  const outputTokenRef = useRef<ElementRef<"input">>(null);

  const {
    swapState,
    setSwapState,
    derivedSwapInfo: { currencies, currencyBalances, inputError },
  } = useSwapContext();

  const { currencyState, setCurrencyState } = useSwapStateContext();

  useEffect(() => {
    setCurrencyState({
      inputCurrency: sellToken,
      outputCurrency: buyToken,
    });
  }, [sellToken, buyToken, setCurrencyState]);

  const maxBalance =
    currencyBalances.INPUT && currencies.INPUT
      ? formatUnits(currencyBalances.INPUT, currencies.INPUT?.decimals)
      : "";
  const disabled = false; // @todo

  return (
    <form>
      <div className="relative">
        <div className={`relative w-full bg-slate-100 rounded-xl`}>
          <div className="flex">
            <div className="text-slate-500 text-sm pt-3 px-4">You pay</div>
            <div
              className="text-right pr-4 pb-2 cursor-pointer text-slate-500"
              style={{ fontSize: 12, height: 46 }}
            >
              Balance:
              <span className="ml-1">{maxBalance}</span>
              <div
                className={`btn btn-sm btn-link pl-1 pr-0 ${
                  currencyBalances.INPUT && currencyBalances.INPUT > 0n
                    ? ""
                    : "hidden"
                }`}
                onClick={() => {
                  setSwapState((prevState) => ({
                    independentField: Field.INPUT,
                    typedValue: maxBalance,
                  }));
                  if ((inputTokenRef as any).current)
                    (inputTokenRef as any).current.value = maxBalance;
                }}
              >
                Max
              </div>
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
                setSwapState((prevState) => ({
                  independentField: Field.INPUT,
                  typedValue: value,
                }));
              }}
            />
            <TokenSelector
              curToken={sellToken}
              setCurToken={setSellToken}
              small
              disabled={disabled}
            />
          </div>
        </div>

        <div
          className="p-2 border border-white bg-slate-100 rounded-xl cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ borderWidth: 4 }}
        >
          <ArrowDownIcon className="w-4" />
        </div>
        <div
          className={`relative w-full bg-slate-100 rounded-xl`}
          style={{ marginTop: 4 }}
        >
          <div className="text-slate-500 text-sm pt-3 px-4">You recieve</div>
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
                setSwapState((prevState) => ({
                  independentField: Field.OUTPUT,
                  typedValue: value,
                }));
              }}
            />
            <TokenSelector
              curToken={buyToken}
              setCurToken={setBuyToken}
              small
              disabled={disabled}
            />
          </div>
          <div style={{ height: 46 }}></div>
        </div>
      </div>
      {inputError}
      {JSON.stringify(swapState)}
      {JSON.stringify(currencies)}
    </form>
  );
}
