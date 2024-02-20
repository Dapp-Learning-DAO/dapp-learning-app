import { SupportedChainId } from "config/chains";
import { useAccount, useSwitchChain } from "wagmi";

export default function useSwitchNetwork() {
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const isNetworkCorrect = () => {
    if (
      chain?.id &&
      Object.values(SupportedChainId).find((s) => s == chain?.id)
    ) {
      return true;
    }
    return false;
  };

  const switchNetwork = async () => {
    try {
      await switchChainAsync({ chainId: SupportedChainId.OPTIMISM });
      return true;
    } catch (error) {
      console.error("switchChainAsync error: ", error);
      return false;
    }
  };

  return {
    isNetworkCorrect,
    switchNetwork,
  };
}
