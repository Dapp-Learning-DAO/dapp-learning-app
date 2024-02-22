"use client";

import { Modal } from "components/Modal";
import { useParams } from "next/navigation";
import RewardClaimedExpiredPage from "../../../../(tools)/reward/claimed_expired/[id]/page";

export default function RewardClaimModalPage() {
  const params = useParams<{ id: string; local: string }>();

  return (
    <Modal>
      <RewardClaimedExpiredPage params={params} />
    </Modal>
  );
}
