"use client"
import { ChevronDownIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Avatar from "components/Avatar";
import { ITokenConf } from "types/tokenTypes";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getTokenIcon } from "utils/getTokenIcon";
import { shortAddress } from "utils/index";
import { erc20Abi, isAddress } from "viem";
import { useChainId, useReadContracts } from "wagmi";
import useTokensData from "hooks/useTokensData";
import { localCustomTokens } from "context/utils";

export default function TokenSelector({
  editDisabled,
  onSelect,
}: {
  editDisabled: boolean;
  onSelect: (_t: ITokenConf | null) => void;
}) {
  const [inited, setInited] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [selectedToken, setSelectedToken] = useState<ITokenConf | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const chainId = useChainId();
  const { tokenOptions } = useTokensData({});

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
        isCustom && !!searchValue && isAddress(searchValue) && !editDisabled,
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
    (_token: ITokenConf) => {
      if (editDisabled) return;
      const target = Object.values(tokenOptions).find(
        (token) =>
          token?.address.toLowerCase() === _token?.address.toLowerCase()
      );
      setSelectedToken(target as ITokenConf);
      if (onSelect) onSelect(target as ITokenConf);
      console.log("handleTokenSelect value", target);
      if (target) {
        setIsCustom(false);
        setSearchValue("");
        (document as any).querySelector("#reward_token_selector_modal").close();
      }
    },
    [tokenOptions, editDisabled, onSelect]
  );

  const handleAddCustomToken = useCallback(
    (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      if (!customTokenRes) return;
      const res: ITokenConf = {
        address: searchValue,
        name: customTokenRes?.name,
        symbol: customTokenRes?.symbol,
        decimals: customTokenRes?.decimals,
        isUserCustom: true,
      };
      if (!localCustomTokens.hasTokenByAddress(chainId, searchValue)) {
        localCustomTokens.addToken(chainId, res);
      }
      setSearchValue("");
    },
    [chainId, customTokenRes, searchValue]
  );

  const handleRemoveCustomToken = useCallback(
    (e: any, _token: ITokenConf) => {
      e.stopPropagation();
      e.preventDefault();
      setSelectedToken((curState) => {
        if (
          curState &&
          _token.address.toLowerCase() === curState?.address.toLowerCase()
        ) {
          return null;
        }
        return curState;
      });
      localCustomTokens.removeToken(chainId, _token.symbol);
    },
    [chainId]
  );

  useEffect(() => {
    if (inited) return;
    const opts = Object.values(tokenOptions);
    if (opts.length > 0 && !selectedToken) {
      handleTokenSelect(opts[0]);
      setInited(true);
    }
  }, [tokenOptions, inited, handleTokenSelect, selectedToken]);

  useEffect(() => {
    if (searchValue) {
      const target = Object.values(tokenOptions).find(
        (token) => token?.address.toLowerCase() === searchValue.toLowerCase()
      );
      if (target) {
        setIsCustom(false);
        setSearchValue("");
        handleTokenSelect(target);
      } else if (isAddress(searchValue)) {
        setIsCustom(true);
      }
    } else {
      setIsCustom(false);
    }
  }, [searchValue, handleTokenSelect, tokenOptions]);

  return (
    <>
      <div
        className="flex items-center p-4 rounded-xl border cursor-pointer hover:bg-slate-100"
        onClick={() => {
          if (editDisabled) return;
          (document as any)
            .querySelector("#reward_token_selector_modal")
            .showModal();
        }}
      >
        <div className="pr-4">
          <Avatar
            url={getTokenIcon(
              selectedToken?.address as string,
              chainId as number
            )}
            address={selectedToken?.address}
          />
        </div>
        {selectedToken ? (
          <div className="flex-1">
            <p className="text-slate-800 font-bold">
              {selectedToken?.name}
              <span className="ml-4 text-slate-600">
                {selectedToken?.symbol}
              </span>
            </p>
            <p className="text-slate-600 hidden md:inline-block text-sm">
              {selectedToken?.address}
            </p>
            <p className="text-slate-600 md:hidden text-sm">
              {shortAddress(selectedToken?.address as string)}
            </p>
          </div>
        ) : (
          <div className="flex-1 text-slate-500">select token</div>
        )}
        <ChevronDownIcon className="w-6 text-slate-500" />
      </div>
      <dialog id="reward_token_selector_modal" className="modal">
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
                disabled={editDisabled}
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
                        chainId as number
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
                      selectedToken &&
                      m.address.toLowerCase() ==
                        selectedToken?.address.toLowerCase()
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
                        <span className="ml-4 text-slate-600">{m?.symbol}</span>
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
                (document as any)
                  .querySelector("#reward_token_selector_modal")
                  .close();
                setSearchValue("");
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
