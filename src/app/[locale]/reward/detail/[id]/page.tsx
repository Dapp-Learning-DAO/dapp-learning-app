"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useRedpacket from "hooks/useRedpacket";
import RewardClaimPage from "./claimPage";
import ClaimedOrExpiredPage from "./claimedOrExpiredPage";
import RewardCreatorPage from "./creatorPage";
import { useSelectedLayoutSegment } from "next/navigation";

export default function RewardDetailPage({
  params: { id, isModal },
}: {
  params: { id: string; isModal?: boolean | undefined };
}) {
  const { address } = useAccount();

  const { data: item, loading: gqlLoading } = useRedpacket({ id });
  const [showPage, setShowPage] = useState("");

  useEffect(() => {
    if (address && item) {
      if (
        item.isCreator &&
        address.toLowerCase() == item.creator.toLowerCase()
      ) {
        setShowPage("Creator");
      } else if (item.isClaimed || item.isExpired) {
        setShowPage("ClaimedOrExpired");
      } else {
        setShowPage("Claimable");
      }
    }
  }, [address, item]);

  return (
    <>
      {!showPage || !item ? (
        <div className="m-auto max-w-xl md:min-w-[60wh]">
          <p className="mb-2">
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
            !isModal ? "card border rounded-xl p-16 max-w-xl" : ""
          }`}
        >
          {showPage === "Creator" && (
            <RewardCreatorPage
              item={item}
              isModal={isModal}
              onSuccess={() => {}}
            />
          )}
          {showPage === "ClaimedOrExpired" && (
            <ClaimedOrExpiredPage item={item} isModal={isModal} />
          )}
          {showPage === "Claimable" && (
            <RewardClaimPage
              item={item}
              isModal={isModal}
              onSuccess={() => {}}
            />
          )}
        </div>
      )}
    </>
  );
}
