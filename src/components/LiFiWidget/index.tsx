"use client";
import { LiFiWidget, WidgetConfig } from "@lifi/widget";
import { useEffect, useMemo, useState } from "react";
// import { useConnect, useDisconnect, useSwitchChain } from "wagmi";
// import { useEthersSigner } from "hooks/useEthersSigner";
import useTheme from "hooks/useTheme";

const chainsIds = [
  1, // mainnet
  10, // Optimism
  42161, // Arbitrum
  137, // polygon
  324, // zksync Era
  1101, // Polygon zkEvm
  8453, // Base
  59144, // Linea
  100, // Gnosis
  43114, // Avalanche
  56, // BSC
  250, // Fantom
  106, // Velas
  122, // Fuse
  288, // Boba
  1284, // Moonbean
  1666600000, // Harmony
];

export const Widget = () => {
  const theme = useTheme();
  // const { switchChainAsync } = useSwitchChain();
  // const { connectAsync, connectors } = useConnect();
  // const { disconnectAsync } = useDisconnect();
  // const signer = useEthersSigner();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const widgetConfig = useMemo((): WidgetConfig => {
    return {
      integrator: "DappLearning",
      chains: {
        // deny: [56],
        allow: chainsIds,
      },
      appearance: theme ? (theme as "light" | "dark") : "auto",
      // It can be either default, expandable, or drawer
      variant: "expandable",
      // It can be either default, split, or nft
      subvariant: "split",
      // walletManagement: {
      //   signer: signer ? signer : undefined,
      //   connect: async () => {
      //     const connectedSigner = await connectAsync({
      //       connector: connectors[0],
      //     }).catch((err) => {
      //       console.error(err);
      //     });
      //     return connectedSigner as never;
      //   },
      //   disconnect: async () => {
      //     await disconnectAsync().catch((err) => {
      //       console.error(err);
      //     });
      //   },
      //   switchChain: async (chainId: number) => {
      //     await switchChainAsync({ chainId }).catch((err) => {
      //       console.error(err);
      //     });
      //     if (signer) {
      //       return signer as never;
      //     } else {
      //       throw Error("No signer object is found after the chain switch.");
      //     }
      //   },
      // },
      // disable BSC from being shown in the chains list
    };
  }, [
    // signer,
    // connectAsync,
    // disconnectAsync,
    // switchChainAsync,
    // connectors,
    theme,
  ]);

  return (
    <>
      {mounted && (
        <LiFiWidget config={widgetConfig} integrator="DappLearning" />
      )}
    </>
  );
};

export default Widget;
