"use client"

import useRedpacket from "hooks/useRedpacket";
import ZKTag from "../../redpacket-icons/zktag";
import RedPacketInfo from "../../redpacket-info";
import { useRouter } from "next/navigation";

export default function RewardClaimedExpiredPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: item, loading: gqlLoading } = useRedpacket({ id });

  return (
    <>
      <div className="modal-box md:min-w-[560px] md:min-h-[50vh] m-auto">
        <h3 className="font-bold text-xl text-center">
          Claimed
          {!!item?.hashLock && <ZKTag />}
        </h3>
        <div className="overflow-y-auto max-h-[30vh] md:max-h-[50vh] mb-4 py-4 pr-2">
          <div className="py-4 min-h-40vh min-w-fit">
            <RedPacketInfo item={item} isLoading={gqlLoading} />
          </div>
        </div>
        <form className="mt-4 modal-action w-full gap-4" method="dialog">
          <button className="btn btn-block">
            Close
          </button>
        </form>
      </div>
    </>
  );
}
