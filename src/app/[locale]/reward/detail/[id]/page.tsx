"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useRedpacket from "hooks/useRedpacket";
import ClaimBtn from "./claimBtn";
import RefundBtn from "./refundBtn";
import RedpacketZkTag from "../../rewardComponents/RedpacketIcons/RedpacketZkTag";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import RedPacketInfo from "../../rewardComponents/RedpacketInfo";
import RewardDetailLoading from "./loading";
import { emitCustomEvent } from "hooks/useCustomEvent";
import { REWARD_LIST_REFRESH_EVENT } from "hooks/useRedpacketsLists";

export default function RewardDetailPage({
  params: { id, isModal },
}: {
  params: { id: string; isModal?: boolean | undefined };
}) {
  const router = useRouter();

  const { data: item, loading: gqlLoading, refetch } = useRedpacket({ id });
  const [closeDisabled, setCloseDisabled] = useState(false);

  // trigger refetch graph data, when user interact with contract
  const handleTxSuccess = () => {
    emitCustomEvent(REWARD_LIST_REFRESH_EVENT, 30 * 1000); // refetch during 30s
  };

  return (
    <>
      {!item ? (
        <RewardDetailLoading isModal={isModal} />
      ) : (
        <div
          className={`m-auto ${
            !isModal ? "card border rounded-xl p-12 max-w-xl" : ""
          }`}
          style={{ maxHeight: isModal ? "calc(100vh - 3em)" : "auto" }}
        >
          <div className="relative">
            <h3 className="font-bold text-xl text-center">
              Redpacket Detail
              {!!item?.hashLock && <RedpacketZkTag />}
            </h3>
            {isModal && (
              <button
                className="btn btn-ghost absolute -top-4 -right-4 hover:bg-transparent disabled:bg-transparent"
                disabled={closeDisabled}
                onClick={() => router.back()}
              >
                <XCircleIcon className="w-6" />
              </button>
            )}
            <div className="overflow-y-auto max-h-[30vh] md:max-h-[50vh] mb-4 py-4 pr-2">
              <div className="py-4 min-h-40vh min-w-fit">
                {item && <RedPacketInfo item={item} />}
              </div>
            </div>
          </div>
          {item.isClaimable && (
            <ClaimBtn
              item={item}
              onSuccess={handleTxSuccess}
              setCloseDisabled={setCloseDisabled}
              isModal={isModal}
            />
          )}
          {item.isCreator && (
            <RefundBtn
              item={item}
              onSuccess={handleTxSuccess}
              setCloseDisabled={setCloseDisabled}
              isModal={isModal}
            />
          )}
        </div>
      )}
    </>
  );
}
