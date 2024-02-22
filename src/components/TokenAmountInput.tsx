"use client"
import { ITokenConf } from "types/tokenTypes";
import { forwardRef, useRef, useState } from "react";
import { useDebounce } from "react-use";
import { formatUnits, parseUnits } from "viem";
import useTokenBalanceOf from "hooks/useTokenBalanceOf";

const TokenAmountInput = forwardRef(
  (
    {
      editDisabled = false,
      onChange,
      tokenObj,
    }: {
      editDisabled: boolean;
      onChange: (_data: {
        amount: string | number;
        amountParsed: bigint;
      }) => void;
      tokenObj: ITokenConf | null;
    },
    ref: any
  ) => {
    const amountInputRef = useRef(null);
    const [inputVal, setInputVal] = useState("");
    const [amountParsed, setAmountParsed] = useState(0n);

    const {
      balanceOf,
      isInsufficient,
      isLoading: isBalanceOfLoading,
    } = useTokenBalanceOf({
      tokenAddr: tokenObj ? (tokenObj.address as `0x${string}`) : undefined,
      exceptedBalance: amountParsed,
    });

    useDebounce(
      () => {
        try {
          const decimals = tokenObj?.decimals;

          if (!isAmountValid(inputVal) || !decimals) {
            setAmountParsed(0n);
            onChange({
              amount: inputVal,
              amountParsed: 0n,
            });
            return;
          }
          let tokenAmountParsed = parseUnits(`${inputVal}`, decimals);

          setAmountParsed(tokenAmountParsed);
          onChange({
            amount: inputVal,
            amountParsed: tokenAmountParsed,
          });
        } catch (error) {
          console.error("Parse tokenAmount error:", error);
          setAmountParsed(0n);
          onChange({
            amount: inputVal,
            amountParsed: 0n,
          });
        }
      },
      300,
      [inputVal]
    );

    const maxBalance = balanceOf
      ? Number(formatUnits(balanceOf, tokenObj?.decimals as number).toString())
      : 0;

    return (
      <div ref={ref}>
        <div className="relative mb-2">
          <input
            ref={amountInputRef}
            type="text"
            disabled={editDisabled}
            placeholder="input amount"
            onChange={(e) => {
              setInputVal(e.target.value);
            }}
            className="input input-bordered w-full"
          />
          {tokenObj ? (
            <div className="absolute right-1 top-[50%] -translate-y-1/2 p-2 cursor-pointer text-slate-500 ">
              Balance:
              <span className="ml-2">{maxBalance}</span>
              <div
                className={`btn btn-link pl-1 pr-0 ${
                  balanceOf && balanceOf > 0n ? "" : "hidden"
                }`}
                onClick={() => {
                  (amountInputRef.current as any).value = maxBalance;
                  setInputVal(`${maxBalance}`);
                }}
              >
                Max
              </div>
            </div>
          ) : null}
        </div>
        {isInsufficient && (
          <div className="text-error font-bold">Insufficient Balance</div>
        )}
      </div>
    );
  }
);

TokenAmountInput.displayName = "TokenAmountInput";

export default TokenAmountInput;

function isAmountValid(amount: string | number) {
  const regex = /^(-)?\d+(\.\d{0,18})?$/;
  return regex.test(`${amount}`);
}
