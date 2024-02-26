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

export default function RewardDetailPage({
  params: { id, isModal },
}: {
  params: { id: string; isModal?: boolean | undefined };
}) {
  const { address } = useAccount();
  const router = useRouter();

  const { data: item, loading: gqlLoading } = useRedpacket({ id });
  const [closeDisabled, setCloseDisabled] = useState(false);

  return (
    <>
      {!item ? (
        <div
          className={`m-auto ${
            !isModal ? "card border rounded-xl p-16 max-w-xl" : ""
          }`}
          style={{ maxHeight: isModal ? "calc(100vh - 3em)" : "auto" }}
        >
          <h3 className="h-4 skeleton"></h3>
          <p className="my-2">
            <span className="skeleton w-8 h-4 mr-2"></span>
            <span className="skeleton w-8 h-4"></span>
          </p>
          <p className="skeleton h-4 w-full my-4"></p>
          <p className="skeleton h-4 w-full my-4"></p>
          <p className="skeleton h-4 w-full my-4"></p>
          <p className="skeleton h-4 w-full my-4"></p>
          <p className="skeleton h-4 w-full my-4"></p>

          <div className="text-bas leading-8 py-4">
            <br />
            <div className="w-full md:max-h-[30vh]">
              <div className="skeleton h-4 w-full my-4"></div>
              <div className="skeleton h-4 w-full my-4"></div>
              <div className="skeleton h-4 w-full my-4"></div>
            </div>
          </div>
        </div>
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
              onSuccess={() => {}}
              setCloseDisabled={setCloseDisabled}
              isModal={isModal}
            />
          )}
          {item.isCreator && (
            <RefundBtn
              item={item}
              onSuccess={() => {}}
              setCloseDisabled={setCloseDisabled}
              isModal={isModal}
            />
          )}
        </div>
      )}
    </>
  );
}
