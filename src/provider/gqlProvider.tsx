import React, { useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { useChainId } from "wagmi";
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  ApolloProvider,
} from "@apollo/client";
import { SupportedChainId } from "config/chains";

let subgraphRedPacketUri: { [key: number]: string } = {
  [SupportedChainId.OPTIMISM]:
    "https://api.studio.thegraph.com/query/64274/optimism/version/latest",
  [SupportedChainId.ARBITRUM_ONE]:
    "https://api.studio.thegraph.com/query/64274/arbitrum/version/latest",
  [SupportedChainId.SCROLL]:
    "https://api.studio.thegraph.com/query/64274/scroll/version/latest",
  [SupportedChainId.SEPOLIA]:
    "https://api.studio.thegraph.com/query/64274/sepolia/version/latest",
};

export const createGQLclient = (_chainId: number) => {
  // console.log("createGQLclient chian id:", _chainId, uri);
  let RedPacketLink = subgraphRedPacketUri[_chainId];

  const defaultLink = new HttpLink({
    uri: RedPacketLink,
  })

  const customLink = new ApolloLink((operation, forward) => {
    const clientName = operation.getContext().clientName;
    if (clientName == "Redpacket") {
      operation.setContext({
        uri: RedPacketLink,
      });
    }

    return forward(operation);
  });

  return new ApolloClient({
    link: ApolloLink.from([customLink, defaultLink]),
    cache: new InMemoryCache(),
  });
};


const GqlChainIds = [
  SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.SCROLL,
  SupportedChainId.SEPOLIA,
];
const GqlClientMap: { [key: number]: any } = {
  [SupportedChainId.OPTIMISM]: createGQLclient(SupportedChainId.OPTIMISM),
  [SupportedChainId.ARBITRUM_ONE]: createGQLclient(
    SupportedChainId.ARBITRUM_ONE
  ),
  [SupportedChainId.SCROLL]: createGQLclient(SupportedChainId.SCROLL),
  [SupportedChainId.SEPOLIA]: createGQLclient(SupportedChainId.SEPOLIA),
};

export default function GqlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const chainId = useChainId();
  const lastChainId = useMemo(
    () =>
      chainId && chainId in GqlClientMap ? chainId : SupportedChainId.OPTIMISM,
    [chainId]
  );
  const [gqlClient, setGqlClient] = useState(GqlClientMap[lastChainId]);

  useDebounce(
    () => {
      if (!!GqlChainIds.find((item) => Number(item) == lastChainId)) {
        setGqlClient(null);
        setGqlClient(GqlClientMap[lastChainId]);
        console.log("Switch GqlClient url", lastChainId);
      }
    },
    1000,
    [chainId, lastChainId]
  );

  return <ApolloProvider client={gqlClient}>{children}</ApolloProvider>;
}
