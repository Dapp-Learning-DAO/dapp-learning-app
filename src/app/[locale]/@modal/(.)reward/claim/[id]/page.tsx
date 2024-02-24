"use client";

import { Modal } from "components/Modal";

import { useParams } from "next/navigation";
import RewardClaimPage from "app/reward/claim/[id]/page";

export default function RewardClaimModalPage() {
  const params = useParams<{ id: string; local: string }>();

  return (
    <Modal>
      <RewardClaimPage params={params} />
    </Modal>
  );
}
