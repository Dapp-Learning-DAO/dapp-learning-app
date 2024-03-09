"use client";
import { ChevronDownIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Avatar from "components/Avatar";
import { ITokenConf } from "types/tokenTypes";

import {
  ChangeEvent,
  Dispatch,
  ElementRef,
  SetStateAction,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getTokenIcon } from "utils/getTokenIcon";
import { shortAddress } from "utils/index";
import { erc20Abi, isAddress } from "viem";
import { useChainId, useReadContracts } from "wagmi";
import useTokensData from "hooks/useTokensData";
import { localCustomTokens } from "context/utils";
import TokenAvatar from "./TokenAvatar";
import { Token } from "config/tokens";
import { useDebounce } from "react-use";

const TokenSelector = forwardRef(
  (
    {
      curToken,
      setCurToken,
      disabled,
      small,
      autoSelect = false,
      showETH = false,
      ...rest
    }: {
      curToken: Token | undefined;
      setCurToken: Dispatch<SetStateAction<Token | undefined>>;
      disabled: boolean;
      small?: boolean;
      autoSelect?: boolean | undefined;
      showETH?: boolean | undefined;
    },
    ref: any,
  ) => {
    const [isCustom, setIsCustom] = useState(false);
    // const [curToken, setCurToken] = useState<Token | null>(null);
    const [searchValue, setSearchValue] = useState("");

    const chainId = useChainId();
    const modalRef = useRef<ElementRef<"dialog">>(null);
    const { tokenOptions } = useTokensData({ showETH });

    const { data: readRes, isLoading } = useReadContracts({
      allowFailure: false,
      contracts: [
        {
          address: searchValue as `0x${string}`,
          abi: erc20Abi,
          functionName: "name",
        },
        {
          address: searchValue as `0x${string}`,
          abi: erc20Abi,
          functionName: "symbol",
        },
        {
          address: searchValue as `0x${string}`,
          abi: erc20Abi,
          functionName: "decimals",
        },
      ],
      query: {
        enabled:
          isCustom && !!searchValue && isAddress(searchValue) && !disabled,
      },
    });

    const customTokenRes = useMemo(() => {
      if (readRes && readRes.length == 3) {
        const res = {
          address: searchValue,
          name: readRes[0] as string,
          symbol: readRes[1] as string,
          decimals: readRes[2] as number,
        };
        return res;
      }
      return null;
    }, [readRes, searchValue]);

    const handleTokenSelect = useCallback(
      (_token: Token | undefined) => {
        if (disabled) return;
        const targetToken =
          _token && _token?.symbol ? tokenOptions[_token.symbol] : undefined;
        setCurToken(targetToken);
        // if (onSelect) onSelect(targetToken ? targetToken : null);
        // if (onChange) {
        //   onChange({
        //     target: { value: targetToken ? targetToken.address : "" },
        //   } as ChangeEvent<HTMLInputElement>);
        // }
        console.log("handleTokenSelect value", targetToken);
        if (targetToken) {
          setIsCustom(false);
          setSearchValue("");
          if (modalRef.current) modalRef.current.close();
        }
      },
      [tokenOptions, disabled],
    );

    const handleAddCustomToken = useCallback(
      (e: any) => {
        e.stopPropagation();
        e.preventDefault();
        if (!customTokenRes) return;
        const res = new Token({
          chainId: chainId,
          address: searchValue as `0x${string}`,
          name: customTokenRes?.name,
          symbol: customTokenRes?.symbol,
          decimals: customTokenRes?.decimals,
          isUserCustom: true,
        });
        if (!localCustomTokens.hasTokenByAddress(chainId, searchValue)) {
          localCustomTokens.addToken(chainId, res);
        }
        setSearchValue("");
      },
      [chainId, customTokenRes, searchValue],
    );

    const handleRemoveCustomToken = useCallback(
      (e: any, _token: ITokenConf) => {
        e.stopPropagation();
        e.preventDefault();
        setCurToken((curState) => {
          if (
            curState &&
            _token.address.toLowerCase() === curState?.address.toLowerCase()
          ) {
            return undefined;
          }
          return curState;
        });
        localCustomTokens.removeToken(chainId, _token.symbol);
      },
      [chainId],
    );

    useDebounce(
      () => {
        const opts = Object.values(tokenOptions);
        if (!curToken) {
          if (autoSelect) {
            if (opts.length > 0) {
              handleTokenSelect(opts[0]);
              return;
            }
          }
        } else {
          if (curToken.chainId !== chainId) {
            handleTokenSelect(autoSelect ? opts[0] : undefined);
            return;
          }
        }
      },
      500,
      [chainId, tokenOptions],
    ); // eslint-disable-line

    useDebounce(
      () => {
        if (searchValue) {
          const targetToken = Object.values(tokenOptions).find(
            (token) =>
              token?.address.toLowerCase() === searchValue.toLowerCase(),
          );
          if (targetToken) {
            setIsCustom(false);
          } else if (isAddress(searchValue)) {
            setIsCustom(true);
          }
        } else {
          setIsCustom(false);
        }
      },
      500,
      [searchValue],
    ); // eslint-disable-line

    return (
      <>
        <div
          ref={ref}
          {...rest}
          onClick={() => {
            if (disabled) return;
            if (modalRef.current) modalRef.current.showModal();
          }}
        >
          <TokenItem small={small} chainId={chainId} curToken={curToken} />
        </div>
        <dialog ref={modalRef} className="modal">
          <div className="modal-box md:min-w-[540px]">
            <h3 className="font-bold text-xl text-center">Select Token</h3>
            <div className="py-4 min-h-40vh min-w-fit">
              <div className="w-full relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                  disabled={disabled}
                  placeholder="input token address"
                  className="input input-bordered w-full"
                />
                {searchValue && !isLoading && (
                  <div
                    className="absolute right-2 top-[50%] -translate-y-1/2 p-2 cursor-pointer"
                    onClick={() => {
                      setSearchValue("");
                    }}
                  >
                    <XCircleIcon className="w-4" />
                  </div>
                )}
                {isLoading && (
                  <div className="absolute right-2 top-[50%] -translate-y-1/2 p-2 cursor-pointer">
                    <span className="loading loading-sm loading-spin"></span>
                  </div>
                )}
              </div>
              <div className="py-4 max-h-[50vh] overflow-y-auto">
                {isCustom && customTokenRes && (
                  <div className="flex items-center p-2 hover:bg-slate-100">
                    <div className="pr-4">
                      <Avatar
                        url={getTokenIcon(
                          customTokenRes?.address,
                          chainId as number,
                        )}
                        address={customTokenRes?.address}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800 font-bold">
                        {customTokenRes?.name}
                        <span className="ml-4 text-slate-600">
                          {customTokenRes?.symbol}
                        </span>
                      </p>
                      <p className="text-slate-600 text-sm">
                        {customTokenRes?.address}
                      </p>
                    </div>
                    <button
                      className="btn btn-primary btn-outline btn-sm"
                      onClick={handleAddCustomToken}
                    >
                      Add
                    </button>
                  </div>
                )}
                {tokenOptions &&
                  Object.values(tokenOptions).map((m) => (
                    <div
                      key={m.address}
                      className={`flex p-2 cursor-pointer mb-1 rounded-lg ${
                        curToken &&
                        m.address.toLowerCase() ==
                          curToken?.address.toLowerCase()
                          ? "bg-blue-100"
                          : "hover:bg-slate-100"
                      }`}
                      onClick={() => handleTokenSelect(m)}
                    >
                      <div className="pr-4">
                        <Avatar
                          url={getTokenIcon(m?.address, chainId as number)}
                          address={m?.address}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 font-bold">
                          {m?.name}
                          <span className="ml-4 text-slate-600">
                            {m?.symbol}
                          </span>
                        </p>
                        <p className="text-slate-600 hidden md:inline-block text-sm">
                          {m?.address}
                        </p>
                        <p className="text-slate-600 md:hidden text-sm">
                          {shortAddress(m?.address)}
                        </p>
                      </div>
                      {m.isUserCustom && (
                        <button
                          className="btn btn-ghost hover:bg-transparent"
                          onClick={(e) => handleRemoveCustomToken(e, m)}
                        >
                          <XCircleIcon className="w-6 h-6 text-slate-500" />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            <div className="modal-action w-full gap-4">
              <button
                className="btn btn-block btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSearchValue("");
                  if (modalRef.current) modalRef.current.close();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </dialog>
      </>
    );
  },
);

TokenSelector.displayName = "TokenSelector";

export default TokenSelector;

function TokenItem({
  chainId,
  curToken,
  small,
}: {
  chainId: number;
  curToken?: Token;
  small?: boolean;
}) {
  const size = useMemo(() => (small ? 24 : 48), [small]);

  return (
    <>
      {small ? (
        curToken ? (
          <div className="flex items-center p-1 rounded-full border cursor-pointer max-w-28 hover:bg-slate-100">
            <TokenAvatar size={size} chainId={chainId} tokenData={curToken} />
            <div className="flex-1 mx-2">
              <div className="font-bold">{curToken?.symbol}</div>
            </div>
            <ChevronDownIcon className="w-4 text-base stroke-2" />
          </div>
        ) : (
          <div className="flex items-center p-1 rounded-full border cursor-pointer max-w-28 bg-primary">
            <div className="flex-1 text-sm whitespace-nowrap px-1 text-white">
              Select Token
            </div>
            <ChevronDownIcon className="w-4 text-base stroke-2 text-white" />
          </div>
        )
      ) : (
        <div className="flex items-center p-4 rounded-xl border cursor-pointer hover:bg-slate-100">
          <TokenAvatar size={size} chainId={chainId} tokenData={curToken} />
          {curToken ? (
            <div className="flex-1 ml-4">
              <p className="text-slate-800 font-bold">
                {curToken?.name}
                <span className="ml-4 text-slate-600">{curToken?.symbol}</span>
              </p>
              <p className="text-slate-600 hidden md:inline-block text-sm">
                {curToken?.address}
              </p>
              <p className="text-slate-600 md:hidden text-sm">
                {shortAddress(curToken?.address as string)}
              </p>
            </div>
          ) : (
            <div className="flex-1 text-slate-500">select token</div>
          )}
          <ChevronDownIcon className="w-6 text-slate-500" />
        </div>
      )}
    </>
  );
}
