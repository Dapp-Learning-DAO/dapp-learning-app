"use client";
import TokenSelector from "components/TokenSelector";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDebounce } from "react-use";
import { ITokenConf } from "types/tokenTypes";
import useTokenAmountInput from "hooks/useTokenAmountInput";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

export interface ISwapForm {
  tokenAmountIn: string | number;
  tokenAmountOut: string | number;
}

export type ISwapInputFormData = {
  sellAmount: bigint;
  buyAmount: bigint;
  tradeDirection: string;
  sellToken: null | ITokenConf;
  buyToken: null | ITokenConf;
};

export interface ISwapFormProps {
  onChange: (_data: ISwapInputFormData) => void;
}

export default function SwapForm({ onChange }: ISwapFormProps) {
  const [buyAmount, setBuyAmount] = useState(0n);
  const [sellAmount, setSellAmount] = useState(0n);
  const [tradeDirection, setTradeDirection] = useState("sell");
  const [sellToken, setSellToken] = useState<ITokenConf | null>(null);
  const [buyToken, setBuyToken] = useState<ITokenConf | null>(null);
  const [changeCount, setChangeCount] = useState(0);

  const {
    register,
    getValues,
    watch,
    control,
    reset,
    resetField,
    trigger,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    unregister,
    formState: { errors, isValid, isValidating, dirtyFields, touchedFields },
  } = useForm<ISwapForm>({
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      tokenAmountIn: "",
      tokenAmountOut: "",
    },
  });

  const { balanceOf, maxBalance, isInsufficient, amountParsed } =
    useTokenAmountInput({
      inputVal:
        tradeDirection == "sell"
          ? getValues("tokenAmountIn")
          : getValues("tokenAmountOut"),
      tokenObj: tradeDirection == "sell" ? sellToken : buyToken,
    });

  useEffect(() => {
    if (tradeDirection == "sell") {
      setBuyAmount(amountParsed);
    } else {
      setSellAmount(amountParsed);
    }
  }, [amountParsed]);

  useDebounce(
    () => {
      onChange({
        sellAmount,
        buyAmount,
        tradeDirection,
        sellToken,
        buyToken,
      });
    },
    500,
    [changeCount],
  );

  const disabled = false; // @todo

  return (
    <form>
      <div className="relative">
        <Controller
          name="tokenAmountIn"
          control={control}
          rules={{
            required: true,
            validate: (value, formValues) => {
              return true;
            },
          }}
          render={({ field, fieldState, formState }) => (
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
                      balanceOf && balanceOf > 0n ? "" : "hidden"
                    }`}
                    onClick={() => {
                      setValue("tokenAmountIn", maxBalance);
                      if ((field.ref as any).current)
                        (field.ref as any).current.value = maxBalance;
                      trigger("tokenAmountIn").then(() => {
                        setChangeCount((prev) => prev + 1); // need trigger when click max btn
                      });
                    }}
                  >
                    Max
                  </div>
                </div>
              </div>
              <div className="flex items-center px-4">
                <input
                  {...field}
                  className="w-full h-full bg-transparent text-3xl"
                  style={{
                    height: `70px`,
                    lineHeight: `70px`,
                    outline: "none",
                  }}
                  type="text"
                  disabled={disabled}
                  placeholder="0"
                />
                <TokenSelector
                  curToken={sellToken}
                  setCurToken={setSellToken}
                  small
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        />
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
              className="w-full h-full bg-transparent text-3xl"
              style={{
                height: `70px`,
                lineHeight: `70px`,
                outline: "none",
              }}
              type="text"
              disabled={disabled}
              placeholder="0"
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
      {isInsufficient && (
        <div className="text-error font-bold">Insufficient Balance</div>
      )}
    </form>
  );
}
