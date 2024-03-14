"use client";
import { LiFiWidget, WidgetConfig } from "@lifi/widget";
import { useEffect, useMemo, useState } from "react";
import { useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useEthersSigner } from "hooks/useEthersSigner";
import { chainsConf } from "provider/Web3Providers";

export const Widget = () => {
  const { switchChainAsync } = useSwitchChain();

  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const signer = useEthersSigner();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const widgetConfig = useMemo((): WidgetConfig => {
    return {
      integrator: "DappLearning",
      walletManagement: {
        signer: signer ? signer : undefined,
        connect: async () => {
          const signer = await connectAsync({
            connector: connectors[0],
          }).catch((err) => {
            console.error(err);
          });
          return signer as never;
        },
        disconnect: async () => {
          await disconnectAsync().catch((err) => {
            console.error(err);
          });
        },
        switchChain: async (chainId: number) => {
          await switchChainAsync({ chainId }).catch((err) => {
            console.error(err);
          });
          if (signer) {
            return signer as never;
          } else {
            throw Error("No signer object is found after the chain switch.");
          }
        },
      },
      // disable BSC from being shown in the chains list
      chains: {
        allow: chainsConf.map((_c) => _c.id),
      },
      // It can be either default, expandable, or drawer
      variant: "expandable",
    };
  }, [signer, connectAsync, disconnectAsync, switchChainAsync, connectors]);

  return (
    <>
      {mounted && (
        <LiFiWidget config={widgetConfig} integrator="nextjs-example" />
      )}
    </>
  );
};

export default Widget;
