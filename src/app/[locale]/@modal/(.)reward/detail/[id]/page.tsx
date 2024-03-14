"use client";

import { useParams } from "next/navigation";
import { Modal } from "components/Modal";
import RewardClaimPage from "app/reward/detail/[id]/page";

export default function RewardClaimModalPage() {
  const params = useParams<{ id: string; local: string }>();

  return (
    <Modal>
      <div className="modal-box md:min-w-[560px] md:min-h-[50vh] overflow-x-hidden px-4">
        <RewardClaimPage params={{ ...params, isModal: true }} />
      </div>
    </Modal>
  );
}
