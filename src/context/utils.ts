import { SupportedChainId } from "config/chains";
import { ITokenConf } from "types/tokenTypes";
import { ITokenConfs, Token } from "config/tokens";
import { emitCustomEvent } from "hooks/useCustomEvent";
export const LOCAL_CUSTOM_TOKENS_KEY = "LOCAL_CUSTOM_TOKENS";
export const LOCAL_CUSTOM_TOKENS_EVENT = "LOCAL_CUSTOM_TOKENS_EVENT";

export const localCustomTokens = {
  get(): string | null {
    return localStorage.getItem(LOCAL_CUSTOM_TOKENS_KEY);
  },
  set(tokens: ITokenConfs) {
    localStorage.setItem(
      LOCAL_CUSTOM_TOKENS_KEY,
      JSON.stringify(tokens, function (key, value) {
        if (typeof value === "bigint") {
          return value.toString();
        } else {
          return value;
        }
      }),
    );
    emitCustomEvent(LOCAL_CUSTOM_TOKENS_EVENT, tokens);
  },
  getTokens(): ITokenConfs | null {
    const value = this.get();
    if (value) {
      try {
        const tokens = JSON.parse(value) as ITokenConfs;

        return tokens;
      } catch (error) {}
    }
    return null;
  },
  addToken(chainId: number | SupportedChainId, _token: Token) {
    let tokens = this.getTokens();
    if (!tokens) tokens = {};
    if (!tokens[chainId]) tokens[chainId] = {};
    tokens[chainId][_token.symbol] = _token;
    this.set(tokens);
  },
  getTokensByChainId(
    chainId: number | SupportedChainId,
  ): { [key: string]: Token } | null {
    let tokens = this.getTokens();
    return tokens ? tokens[chainId] : null;
  },
  getToken(chainId: number | SupportedChainId, symbol: string): Token | null {
    let tokens = this.getTokensByChainId(chainId);
    return tokens && tokens[symbol] ? tokens[symbol] : null;
  },
  hasToken(chainId: number | SupportedChainId, symbol: string): boolean {
    let token = this.getToken(chainId, symbol);
    return !!token;
  },
  getTokenByAddress(
    chainId: number | SupportedChainId,
    address: string | `0x${string}`,
  ): Token | null {
    let tokens = this.getTokensByChainId(chainId);
    if (!tokens) return null;
    let token = Object.values(tokens).find(
      (item) => item.address.toLowerCase() === address.toLowerCase(),
    );
    return token ? token : null;
  },
  hasTokenByAddress(
    chainId: number | SupportedChainId,
    address: string | `0x${string}`,
  ): boolean {
    let token = this.getTokenByAddress(chainId, address);
    return !!token;
  },
  removeToken(chainId: number | SupportedChainId, symbol: string) {
    let tokens = this.getTokens();
    if (
      symbol &&
      tokens &&
      chainId &&
      tokens[chainId] &&
      tokens[chainId][symbol]
    ) {
      delete tokens[chainId][symbol];
      this.set(tokens);
    }
  },
  clear() {
    localStorage.removeItem("LOCAL_CUSTOM_TOKENS");
    emitCustomEvent(LOCAL_CUSTOM_TOKENS_EVENT, null);
  },
};
