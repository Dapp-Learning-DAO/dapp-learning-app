"use client";

import { Modal } from "components/Modal";
import RewardClaimPage from "../../../../(tools)/reward/claim/[id]/page";
import { useParams } from "next/navigation";

export default function RewardClaimModalPage() {
  const params = useParams<{ id: string; local: string }>();

  return (
    <Modal>
      <RewardClaimPage params={params} />
    </Modal>
  );
}
