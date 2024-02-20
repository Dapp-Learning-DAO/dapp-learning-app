import {
  TokensDecimals as DefaultTokenDecimals,
  TokensSymbols as DefaultTokenSymbols,
  TokenConf as DefaultTokenConf,
} from "config/tokens";
import { LOCAL_CUSTOM_TOKENS_EVENT, localCustomTokens } from "context/utils";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { erc20Abi, formatUnits, isAddress } from "viem";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { useCustomEvent } from "./useCustomEvent";
import { IChainTokenConfs, ITokenConf } from "types/tokenTypes";

export default function useTokensData({
  watchTokens,
}: {
  watchTokens: Set<`0x${string}`>;
}) {
  const { address } = useAccount();
  const chainId = useChainId();
  const [readArgs, setReadArgs] = useState<any[]>([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [tokenOptions, setTokenOptions] = useState<IChainTokenConfs>({});
  const [tokenData, setTokenData] = useState<{
    [key: `0x${string}`]: ITokenConf;
  }>({});
  const [tokenSymbols, setTokenSymbols] = useState<{
    [key: `0x${string}`]: string;
  }>(DefaultTokenSymbols[chainId]);
  const [tokenDecimals, setTokenDecimals] = useState<{
    [key: `0x${string}`]: number;
  }>(DefaultTokenDecimals[chainId]);

  useCustomEvent({
    customEventName: LOCAL_CUSTOM_TOKENS_EVENT,
    onChange: () => setUpdateCount((currentState) => currentState + 1),
  });

  useDebounce(
    (_data: any) => {
      if (!chainId) return;
      let _tokenOptions: IChainTokenConfs = {};
      let _decimals: { [key: `0x${string}`]: number } = {};
      let _symbols: { [key: `0x${string}`]: string } = {};
      if (DefaultTokenDecimals[chainId] && DefaultTokenDecimals[chainId]) {
        _tokenOptions = { ...DefaultTokenConf[chainId] };
        _symbols = { ...DefaultTokenSymbols[chainId] };
        _decimals = { ...DefaultTokenDecimals[chainId] };
      }

      let _tokenConfs = localCustomTokens.getTokensByChainId(chainId);
      if (_tokenConfs) {
        for (let _token of Object.values(_tokenConfs)) {
          const _key = _token.symbol as `0x${string}`;
          _tokenOptions[_key] = _token;
          _decimals[_key] = _token.decimals;
          _symbols[_key] = _token.symbol;
        }
      }

      setTokenOptions(_tokenOptions);
      setTokenSymbols(_symbols);
      setTokenDecimals(_decimals);
    },
    200,
    [chainId, updateCount]
  );

  const {
    data: readData,
    isError,
    isLoading,
  } = useReadContracts({
    contracts: readArgs,
    allowFailure: true,
    query: {
      enabled: readArgs.length > 0,
    },
  });

  useEffect(() => {
    let args: any[] = [];
    if (!address) return;
    let _tokenData = { ...tokenData };

    for (let _token of watchTokens) {
      if (isAddress(_token)) {
        _tokenData[_token] = {
          address: _token,
          symbol: "",
          decimals: 0,
          name: "",
          balanceOf: 0n,
          balanceOfParsed: 0,
        };
        args.push({
          address: _token,
          abi: erc20Abi,
          functionName: "symbol",
        });
        args.push({
          address: _token,
          abi: erc20Abi,
          functionName: "decimals",
        });
        args.push({
          address: _token,
          abi: erc20Abi,
          functionName: "name",
        });
        args.push({
          address: _token,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address],
        });
      }
    }
    setReadArgs(args);
  }, [watchTokens, address, tokenData]);

  useEffect(() => {
    if (readData) {
      console.log("useTokensData readContracts res", readData);
      let _tokenData = { ...tokenData };
      let _tokenDecimals = { ...tokenDecimals };
      let _tokenSymbols = { ...tokenSymbols };
      let ptr = 0;
      for (let _token of watchTokens) {
        if (isAddress(_token)) {
          const symbol = readData[ptr * 4 + 0]?.result;
          const decimals = Number(readData[ptr * 4 + 1]?.result);
          const name = readData[ptr * 4 + 2]?.result;
          const balanceOf = readData[ptr * 4 + 3]?.result;
          if (!symbol || !decimals || !balanceOf) {
            ptr++;
            continue;
          }
          const _tokenDataRes: ITokenConf = {
            address: _token,
            symbol: symbol as string,
            decimals,
            name: name as string,
            balanceOf: balanceOf as BigInt,
            balanceOfParsed: balanceOf
              ? Number(formatUnits(balanceOf as bigint, decimals).toString())
              : 0,
          };
          _tokenData[_token] = _tokenDataRes;
          _tokenDecimals[_token] = decimals;
          _tokenSymbols[_token] = symbol as string;

          ptr++;
        }
      }
      setTokenData(_tokenData);
      setTokenDecimals(_tokenDecimals);
      setTokenSymbols(_tokenSymbols);
    } else {
      if (isError || isLoading) {
        setTokenData({});
        setTokenDecimals(DefaultTokenDecimals);
        setTokenSymbols(DefaultTokenSymbols);
      }
    }
  }, [readData]); // eslint-disable-line

  return {
    tokenData,
    tokenSymbols,
    tokenDecimals,
    tokenOptions,
  };
}
