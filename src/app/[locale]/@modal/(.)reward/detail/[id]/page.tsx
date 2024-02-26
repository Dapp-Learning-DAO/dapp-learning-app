"use client";

import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { Modal } from "components/Modal";
import RewardClaimPage from "app/reward/detail/[id]/page";

export default function RewardClaimModalPage() {
  const params = useParams<{ id: string; local: string }>();
  const segment = useSelectedLayoutSegment()
  console.warn(segment)

  return (
    <Modal>
      <div className="modal-box md:min-w-[560px] md:min-h-[50vh]">
        <RewardClaimPage params={{ ...params, isModal: true }} />
      </div>
    </Modal>
  );
}
