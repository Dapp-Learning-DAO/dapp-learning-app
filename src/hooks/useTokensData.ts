import {
  TokensOptions as DefaultTokenOptions,
  TokensDecimals as DefaultTokenDecimals,
  TokensSymbols as DefaultTokenSymbols,
  TokenConf as DefaultTokenConf,
  Token,
  IChainTokenConfs,
} from "config/tokens";
import { LOCAL_CUSTOM_TOKENS_EVENT, localCustomTokens } from "context/utils";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { erc20Abi, formatUnits, isAddress } from "viem";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { useCustomEvent } from "./useCustomEvent";
import { ETH_TOKEN_ADDRESS } from "config/constants";

export type IuseTokensDataProps = {
  watchTokens?: boolean;
  showETH?: boolean;
};

export default function useTokensData({
  watchTokens,
  showETH,
}: IuseTokensDataProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const [readArgs, setReadArgs] = useState<any[]>([]);
  const [updateCount, setUpdateCount] = useState(0);
  const [tokenOptions, setTokenOptions] = useState<IChainTokenConfs>({});
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
      let _decimals: { [key: string]: number } = {};
      let _symbols: { [key: string]: string } = {};
      if (DefaultTokenDecimals[chainId] && DefaultTokenDecimals[chainId]) {
        _tokenOptions = { ...DefaultTokenOptions[chainId] };
        _symbols = { ...DefaultTokenSymbols[chainId] };
        _decimals = { ...DefaultTokenDecimals[chainId] };
      }

      let _tokenConfs = localCustomTokens.getTokensByChainId(chainId);
      if (_tokenConfs) {
        for (let _token of Object.values(_tokenConfs)) {
          const _key = _token.address.toLowerCase() as string;
          _tokenOptions[_key] = new Token({ ..._token });
          _decimals[_key] = _token.decimals;
          _symbols[_key] = _token.symbol;
        }
      }

      if (!showETH) {
        const _eth_address = ETH_TOKEN_ADDRESS.toLowerCase();
        delete _tokenOptions[_eth_address];
        delete _decimals[_eth_address];
        delete _symbols[_eth_address];
      }

      setTokenOptions(_tokenOptions);
      setTokenSymbols(_symbols);
      setTokenDecimals(_decimals);
    },
    200,
    [chainId, updateCount],
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

  const watchAddresses = useMemo(() => {
    return Object.values(tokenOptions)
      .filter((_t) => _t.needUpdate())
      .map((_t) => _t.address.toLowerCase());
  }, [tokenOptions]);

  useEffect(() => {
    if (!address || !watchTokens) return;

    let args: any[] = [];

    for (let _token of watchAddresses) {
      if (isAddress(_token)) {
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
  }, [watchTokens, watchAddresses, address, tokenOptions]);

  useEffect(() => {
    if (readData && watchTokens) {
      console.log("useTokensData readContracts res", readData);
      let _tokenData = { ...tokenOptions };
      let _tokenDecimals = { ...tokenDecimals };
      let _tokenSymbols = { ...tokenSymbols };
      let ptr = 0;
      for (let _token of watchAddresses) {
        if (isAddress(_token)) {
          const symbol = readData[ptr * 4 + 0]?.result;
          const decimals = Number(readData[ptr * 4 + 1]?.result);
          const name = readData[ptr * 4 + 2]?.result;
          const balanceOf = readData[ptr * 4 + 3]?.result;
          if (!symbol || !decimals || !balanceOf) {
            ptr++;
            continue;
          }
          let _tokenDataRes: Token = tokenOptions[_token];
          if (!_tokenDataRes) {
            _tokenDataRes = new Token({
              chainId,
              address: _token,
              symbol: symbol as string,
              decimals,
              name: name as string,
            });
          }
          _tokenDataRes.setBalanceOf(balanceOf as bigint);

          _tokenData[_token] = _tokenDataRes;
          _tokenDecimals[_token] = decimals;
          _tokenSymbols[_token] = symbol as string;

          ptr++;
        }
      }
      setTokenOptions(_tokenData);
      setTokenDecimals(_tokenDecimals);
      setTokenSymbols(_tokenSymbols);
    } else {
      if (isError || isLoading) {
        setTokenOptions({ ...DefaultTokenOptions[chainId] });
        setTokenDecimals({ ...DefaultTokenDecimals[chainId] });
        setTokenSymbols({ ...DefaultTokenSymbols[chainId] });
      }
    }
    setReadArgs([]);
  }, [readData]); // eslint-disable-line

  return {
    tokenSymbols,
    tokenDecimals,
    tokenOptions,
  };
}
