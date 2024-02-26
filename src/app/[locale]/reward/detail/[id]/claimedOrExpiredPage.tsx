"use client";
import { useRouter } from "next/navigation";
import RedpacketZkTag from "../../rewardComponents/RedpacketIcons/RedpacketZkTag";
import RedPacketInfo from "../../rewardComponents/RedpacketInfo";
import { IRewardItem } from "types/rewardTypes";
import { XCircleIcon } from "@heroicons/react/24/outline";

const ClaimedOrExpiredPage = ({
  item,
  isModal,
}: {
  item: IRewardItem;
  isModal?: boolean | undefined;
}) => {
  const router = useRouter();
  return (
    <div className="relative">
      <h3 className="font-bold text-xl text-center">
        Redpacket Detail
        {!!item?.hashLock && <RedpacketZkTag />}
      </h3>
      {isModal && (
        <button
          className="btn btn-ghost absolute -top-4 -right-4 hover:bg-transparent disabled:bg-transparent"
          onClick={() => router.back()}
        >
          <XCircleIcon className="w-6" />
        </button>
      )}
      <div className="overflow-y-auto max-h-[30vh] md:max-h-[50vh] mb-4 py-4 pr-2">
        <div className="py-4 min-h-40vh">
          {item && <RedPacketInfo item={item} />}
        </div>
      </div>
    </div>
  );
};

export default ClaimedOrExpiredPage;
