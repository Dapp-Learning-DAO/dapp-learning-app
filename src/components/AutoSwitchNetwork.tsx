import useSwitchNetwork from "hooks/useSwitchNetwork";
import { useState } from "react";
import { useDebounce } from "react-use";
import { useAccount } from "wagmi";

export default function AutoSwitchNetwork({
  forceSwitch = false,
}: {
  forceSwitch: boolean;
}) {
  const { chain } = useAccount();
  const [showNetworkTip, setShowNetworkTip] = useState(false);
  const { isNetworkCorrect, switchNetwork } = useSwitchNetwork();

  // force network
  useDebounce(
    () => {
      if (chain?.id) {
        if (!isNetworkCorrect()) {
          setShowNetworkTip(true);
          if (forceSwitch) {
            switchNetwork();
          }
        } else {
          setShowNetworkTip(false);
        }
      } else {
        setShowNetworkTip(false);
      }
    },
    1000,
    [chain, forceSwitch],
  );

  return (
    <div
      role="alert"
      className={`alert mt-4 max-w-lg mx-auto ${showNetworkTip ? "" : "hidden"}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="stroke-info shrink-0 w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <span>Network is wrong.</span>
      <div>
        <button className="btn btn-sm btn-outline" onClick={switchNetwork}>
          Switch Network
        </button>
        {/* <button className="btn btn-sm" onClick={() => setShowNetworkTip(false)}>
          <XCircleIcon className="w-6" />
        </button> */}
      </div>
    </div>
  );
}
