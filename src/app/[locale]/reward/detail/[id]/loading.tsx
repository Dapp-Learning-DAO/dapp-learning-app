import RewardDetailSkeleton from "../../rewardComponents/RewardItemSkeleton";

export default function RewardDetailLoading({
  isModal,
}: {
  isModal?: boolean | undefined;
}) {
  return <RewardDetailSkeleton isModal={isModal} />;
}
